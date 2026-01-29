/*
 *	Sync Management
 */
const fs = require("node:fs");
const path = require("node:path");
const git = require("./util.git");

const j = (p) => {
	try {
		return JSON.parse(fs.readFileSync(p, "utf8"));
	} catch {
		return null;
	}
};

const ignored = new Set([
	"node_modules",
	".git",
	".github",
	"dist",
	"build",
	"coverage",
]);

const findModules = (startDir) => {
	const found = [];
	const seen = new Set();

	const walk = (dir) => {
		let real;
		try {
			real = fs.realpathSync(dir);
		} catch {
			return;
		}
		if (seen.has(real)) return;
		seen.add(real);

		const moduleJson = path.join(dir, "module.json");
		if (fs.existsSync(moduleJson)) {
			const cfg = j(moduleJson);
			if (cfg && cfg.repo) {
				found.push({
					root: dir,
					name: cfg.name || path.basename(dir),
					repo: cfg.repo,
				});
				return; // don't go deeper into a module by default
			}
		}

		let entries;
		try {
			entries = fs.readdirSync(dir, { withFileTypes: true });
		} catch {
			return;
		}
		for (const e of entries) {
			if (!e.isDirectory()) continue;
			if (ignored.has(e.name)) continue;
			walk(path.join(dir, e.name));
		}
	};

	walk(startDir);
	return found;
};

module.exports.sync = function sync(waw) {
	// if called as `waw sync ...`, remove "sync" token if present
	if (waw.argv[0] === "sync") waw.argv.shift();

	if (!git.hasGit()) {
		console.log("Git is not installed or not available in PATH");
		process.exit(1);
	}

	const modules = findModules(process.cwd());
	if (!modules.length) {
		console.log("There was no modules to synchronize");
		process.exit(1);
	}

	const message = waw.argv[0] && waw.argv[0] !== Number(waw.argv[0]) ? waw.argv[0] : null;
	const branch = (message ? waw.argv[1] : waw.argv[0]) || "master";

	// mode A: waw sync  -> destructive sync (force)
	if (!message) {
		for (const m of modules) {
			try {
				git.forceSync(m.root, { repo: m.repo, branch });
				// keep modules clean
				git.remove(m.root);
				console.log(`Module ${m.name} has been synchronized`);
			} catch (e) {
				console.log(`Module ${m.name} failed to synchronize`);
			}
		}
		console.log("All modules were synchronized");
		process.exit();
	}

	// mode B: waw sync "MESSAGE" [branch] -> publish current folder state
	for (const m of modules) {
		try {
			git.ensureHygiene(m.root);
			git.publish(m.root, { repo: m.repo, branch, message });
			console.log(`Module ${m.name} has been updated`);
		} catch (e) {
			console.log(`Module ${m.name} failed to update`);
		}
	}
	console.log("All modules were updated and synchronized");
	process.exit();
};


/*
 *	Version Management
 */
const version = function (waw) {
	let logs = "";

	if (waw.exists(waw.wawPath + "/package.json")) {
		logs = "waw: " + waw.readJson(waw.wawPath + "/package.json").version;
	}

	if (waw.modules && waw.modules.length) {
		logs += "\nAccessible Modules: ";
		for (var i = 0; i < waw.modules.length; i++) {
			if (i) {
				logs += ", " + waw.modules[i].name;
			} else {
				logs += waw.modules[i].name;
			}
		}
	}

	console.log(logs);
	process.exit();
};

module.exports.version = version;
