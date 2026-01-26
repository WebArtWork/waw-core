// Generic git utility for waw (cross-platform, explicit, safe-by-default)

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { execSync } = require("node:child_process");

const rmOpts = { recursive: true, force: true };

// ---------- helpers ----------
const exec = (dir, cmd, silent = false) => {
	return execSync(cmd, {
		cwd: dir,
		stdio: silent ? "ignore" : "inherit",
	});
};

const ensureDir = (p) => fs.mkdirSync(p, { recursive: true });

const exists = (p) => fs.existsSync(p);

const hasGit = () => {
	try {
		execSync("git --version", { stdio: "ignore" });
		return true;
	} catch {
		return false;
	}
};

// ---------- low-level ----------
const hasRepo = (dir) => exists(path.join(dir, ".git"));

const remove = (dir) => {
	const g = path.join(dir, ".git");
	if (exists(g)) fs.rmSync(g, rmOpts);
};

const init = (dir) => {
	if (!exists(dir)) ensureDir(dir);
	if (!hasRepo(dir)) exec(dir, "git init");
};

const setOrigin = (dir, repo) => {
	try {
		exec(dir, "git remote remove origin", true);
	} catch {}
	exec(dir, `git remote add origin ${repo}`);
};

const fetch = (dir) => exec(dir, "git fetch --all --prune");

const checkout = (dir, branch, force = false) => {
	if (force) {
		exec(dir, `git checkout -B ${branch} origin/${branch}`);
		exec(dir, `git reset --hard origin/${branch}`);
	} else {
		exec(dir, `git checkout ${branch}`);
	}
};

const commit = (dir, message) => {
	exec(dir, "git add -A");
	try {
		exec(dir, `git commit -m ${JSON.stringify(message)}`, true);
	} catch {
		// nothing to commit is OK
	}
};

const push = (dir, branch) => {
	exec(dir, `git push origin ${branch}`);
};

const pull = (dir, branch) => {
	exec(dir, `git pull origin ${branch}`);
};

// ---------- high-level workflows ----------

/**
 * FORCE sync (destructive)
 * rm -rf *, fetch repo, hard reset to origin/branch
 */
const forceSync = (dir, { repo, branch = "master" }) => {
	if (!repo) throw new Error("repo is required for forceSync");

	if (exists(dir)) {
		for (const n of fs.readdirSync(dir)) {
			if (n === ".git") continue;
			fs.rmSync(path.join(dir, n), rmOpts);
		}
	} else {
		ensureDir(dir);
	}

	init(dir);
	setOrigin(dir, repo);
	fetch(dir);
	checkout(dir, branch, true);
};

/**
 * Attach git history WITHOUT touching working tree
 * Uses temp folder and moves .git
 */
const attach = (dir, { repo, branch = "master" }) => {
	if (!repo) throw new Error("repo is required for attach");
	if (!exists(dir)) throw new Error("target directory does not exist");

	if (hasRepo(dir)) return; // already attached

	const tempRoot = path.join(os.homedir(), ".waw", "git-temp");
	const temp = path.join(
		tempRoot,
		`${path.basename(dir)}-${Date.now()}`
	);

	ensureDir(tempRoot);
	ensureDir(temp);

	// build git history in temp
	exec(temp, "git init");
	exec(temp, `git remote add origin ${repo}`);
	exec(temp, "git fetch --all");
	exec(temp, `git checkout -B ${branch} origin/${branch}`);

	// move .git only
	const from = path.join(temp, ".git");
	const to = path.join(dir, ".git");

	if (exists(to)) fs.rmSync(to, rmOpts);
	fs.renameSync(from, to);

	fs.rmSync(temp, rmOpts);
};

/**
 * Publish current folder as-is
 * attach -> commit -> push -> remove .git
 */
const publish = (dir, { repo, branch = "master", message }) => {
	if (!message) throw new Error("commit message is required for publish");

	attach(dir, { repo, branch });
	commit(dir, message);
	push(dir, branch);
	remove(dir);
};

// ---------- hygiene ----------
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

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
`;

const ensureHygiene = function(moduleRoot) {
	const name = path.basename(moduleRoot);

	const gi = path.join(moduleRoot, ".gitignore");
	if (!fs.existsSync(gi)) fs.writeFileSync(gi, gitignore, "utf8");

	const readme = path.join(moduleRoot, "README.md");
	if (!fs.existsSync(readme)) {
		fs.writeFileSync(readme, `# waw module ${name}`, "utf8");
	}

	const lic = path.join(moduleRoot, "LICENSE");
	if (!fs.existsSync(lic)) {
		fs.writeFileSync(lic, LICENSE.replace("YEAR", YEAR), "utf8");
	} else {
		const content = fs.readFileSync(lic, "utf8");
		if (
			content.startsWith("The MIT License (MIT)") &&
			!content.includes(String(YEAR))
		) {
			fs.writeFileSync(lic, LICENSE.replace("YEAR", YEAR), "utf8");
		}
	}
};

// ---------- exports ----------
module.exports = {
	// checks
	hasGit,
	hasRepo,

	// low-level
	init,
	setOrigin,
	fetch,
	checkout,
	commit,
	push,
	pull,
	remove,

	// workflows
	forceSync,
	attach,
	publish,

	ensureHygiene,
};
