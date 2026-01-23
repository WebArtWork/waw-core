const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// match your previous behavior
const rmSyncOptions = { recursive: true, force: true };

const gitignore = `node_modules
package-lock.json
`;

const YEAR = new Date().getFullYear();
const LICENSE = `The MIT License (MIT)

Copyright (c) YEAR

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

function safeReadJson(filePath) {
	try {
		const raw = fs.readFileSync(filePath, "utf8");
		const json = JSON.parse(raw);
		return json && typeof json === "object" ? json : null;
	} catch (_) {
		return null;
	}
}

function ensureHygieneFiles(moduleRoot) {
	const name = path.basename(moduleRoot);

	const gi = path.join(moduleRoot, ".gitignore");
	if (!fs.existsSync(gi)) fs.writeFileSync(gi, gitignore, "utf8");

	const readme = path.join(moduleRoot, "README.md");
	if (!fs.existsSync(readme))
		fs.writeFileSync(readme, `# waw module ${name}`, "utf8");

	const lic = path.join(moduleRoot, "LICENSE");
	if (!fs.existsSync(lic)) {
		fs.writeFileSync(lic, LICENSE.replace("YEAR", YEAR), "utf8");
	} else {
		const license = fs.readFileSync(lic, "utf8");
		if (
			license.startsWith("The MIT License (MIT)") &&
			!license.includes(String(YEAR))
		) {
			fs.writeFileSync(lic, LICENSE.replace("YEAR", YEAR), "utf8");
		}
	}
}

function isIgnoredDir(dirName) {
	// keep this conservative; add more if needed
	return (
		dirName === "node_modules" ||
		dirName === ".git" ||
		dirName === ".github" ||
		dirName === "dist" ||
		dirName === "build" ||
		dirName === "coverage"
	);
}

/**
 * Find every folder under startDir that contains module.json with valid json + repo.
 * Returns array of { root, name, config }.
 */
function findModulesWithRepo(startDir, waw) {
	const found = [];
	const visited = new Set();

	const walk = (dir) => {
		let real;
		try {
			real = fs.realpathSync(dir);
		} catch (_) {
			return;
		}
		if (visited.has(real)) return;
		visited.add(real);

		let entries;
		try {
			entries = fs.readdirSync(dir, { withFileTypes: true });
		} catch (_) {
			return;
		}

		// if this folder has module.json, evaluate it
		const moduleJsonPath = path.join(dir, "module.json");
		if (fs.existsSync(moduleJsonPath)) {
			const config =
				(typeof waw?.readJson === "function"
					? (() => {
							try {
								return waw.readJson(moduleJsonPath);
							} catch (_) {
								return null;
							}
					  })()
					: null) || safeReadJson(moduleJsonPath);

			if (config && config.repo) {
				found.push({
					root: dir,
					name: config.name || path.basename(dir),
					config,
				});

				// IMPORTANT: don't walk deeper into a module folder by default.
				// This prevents nested modules from being accidentally treated as separate,
				// but if you WANT nested, remove this return.
				return;
			}
		}

		for (const e of entries) {
			if (!e.isDirectory()) continue;
			if (isIgnoredDir(e.name)) continue;
			walk(path.join(dir, e.name));
		}
	};

	walk(startDir);
	return found;
}

/**
 * Action 1: "sync" (fetch/update module folder contents from repo)
 */
function fetchModule(waw, moduleRoot, repo, branch, cb) {
	waw.fetch(moduleRoot, repo, (err) => cb(!err), branch);
}

/**
 * Action 2: "sync <message>" (update to temp, attach git, commit+push, remove git)
 */
function updateModule(waw, moduleInfo, commitMessage, branch, cb) {
	const location = moduleInfo.root;
	const repo = moduleInfo.config.repo;

	const temp = path.join(location, "node_modules", ".temp");

	try {
		fs.rmSync(temp, rmSyncOptions);
	} catch (_) {}

	ensureHygieneFiles(location);

	waw.fetch(
		temp,
		repo,
		(err) => {
			try {
				// must have temp/.git to proceed with commit/push flow
				if (err || !fs.existsSync(path.join(temp, ".git"))) {
					if (fs.existsSync(temp)) fs.rmSync(temp, rmSyncOptions);
					return cb(false);
				}

				// replace .git with the fetched one
				if (fs.existsSync(path.join(location, ".git"))) {
					fs.rmSync(path.join(location, ".git"), rmSyncOptions);
				}

				fs.renameSync(path.join(temp, ".git"), path.join(location, ".git"));
				fs.rmSync(temp, rmSyncOptions);

				// commit & push (ignore failures for "nothing to commit")
				try {
					execSync("git add --all .", { cwd: location, stdio: "ignore" });
					execSync(`git commit -m ${JSON.stringify(commitMessage)}`, {
						cwd: location,
						stdio: "ignore",
					});
				} catch (_) {}

				try {
					execSync(`git push origin ${JSON.stringify(branch)}`, {
						cwd: location,
						stdio: "inherit",
					});
				} catch (_) {
					// keep going to cleanup .git regardless
				}

				// remove .git so modules stay "clean"
				if (fs.existsSync(path.join(location, ".git"))) {
					fs.rmSync(path.join(location, ".git"), rmSyncOptions);
				}

				cb(true);
			} catch (e) {
				try {
					if (fs.existsSync(temp)) fs.rmSync(temp, rmSyncOptions);
				} catch (_) {}
				try {
					if (fs.existsSync(path.join(location, ".git"))) {
						fs.rmSync(path.join(location, ".git"), rmSyncOptions);
					}
				} catch (_) {}
				cb(false);
			}
		},
		branch,
		false
	);
}

module.exports = async (waw) => {
	const startDir = process.cwd();

	const modules = findModulesWithRepo(startDir, waw);

	if (!modules.length) {
		console.log("There was no modules to synchronize");
		process.exit(1);
	}

	// behavior: `waw sync` -> fetch only
	// behavior: `waw sync "msg" [branch]` -> update+commit+push
	const hasCommit = waw.argv.length > 1;
	const commitMessage = hasCommit ? waw.argv[1] : null;
	const branch = waw.argv.length > 2 ? waw.argv[2] : "master";

	let countdown = modules.length;

	const done = (finalMsg) => {
		if (--countdown === 0) {
			console.log(finalMsg);
			process.exit(0);
		}
	};

	if (!hasCommit) {
		for (const m of modules) {
			fetchModule(waw, m.root, m.config.repo, branch, (ok) => {
				console.log(
					ok
						? `Module ${m.name} has been synchronized`
						: `Module ${m.name} failed to synchronize`
				);
				done("All modules were synchronized");
			});
		}
	} else {
		for (const m of modules) {
			updateModule(waw, m, commitMessage, branch, (ok) => {
				console.log(
					ok
						? `Module ${m.name} has been updated`
						: `Module ${m.name} failed to update`
				);
				done("All modules were updated and synchronized");
			});
		}
	}
};
