// server/core/util.git.js
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const rmSyncOptions = { recursive: true, force: true };

const gitDefault = () => {
	process.exit();
};

const prepareReposFolder = (waw) => {
	const reposFolder = path.join(waw.waw_root, ".git", ".repos");

	if (!fs.existsSync(reposFolder)) {
		fs.mkdirSync(reposFolder, { recursive: true });
	}

	return reposFolder;
};

// Cross-platform recursive copy with fallback to cp -rf (keeps old behavior if needed)
const copyFolder = (from, to) => {
	// Ensure destination parent exists
	fs.mkdirSync(path.dirname(to), { recursive: true });

	// Prefer native Node copy (works on Windows/macOS/Linux)
	if (typeof fs.cpSync === "function") {
		// Remove destination first to mimic "cp -rf" overwrite semantics
		try {
			if (fs.existsSync(to)) fs.rmSync(to, rmSyncOptions);
		} catch (_) {}

		fs.cpSync(from, to, { recursive: true, force: true });
		return;
	}

	// Fallback (older Node): use shell cp -rf (Linux/macOS)
	// Quote paths to support spaces.
	const q = (p) => `"${String(p).replace(/"/g, '\\"')}"`;
	execSync(`cp -rf ${q(from)} ${q(to)}`);
};

const gitStore = async (waw) => {
	const reposFolder = prepareReposFolder(waw);

	const key = waw.argv.shift();
	if (!key) return gitDefault(waw);

	const globalFolder = path.join(reposFolder, key);
	const gitFolder = path.join(process.cwd(), ".git");

	if (!fs.existsSync(gitFolder)) {
		console.log("No .git folder found in current directory");
		process.exit(1);
	}

	try {
		copyFolder(gitFolder, globalFolder);
		console.log("Git folder stored");
		process.exit();
	} catch (e) {
		console.error("Git store error:", e && e.message ? e.message : e);
		process.exit(2);
	}
};

const gitRestore = async (waw) => {
	const reposFolder = prepareReposFolder(waw);

	const key = waw.argv.shift();
	if (!key) return gitDefault(waw);

	const globalFolder = path.join(reposFolder, key);
	const gitFolder = path.join(process.cwd(), ".git");

	if (!fs.existsSync(globalFolder)) {
		console.log("Stored git folder not found");
		process.exit(1);
	}

	try {
		copyFolder(globalFolder, gitFolder);
		console.log("Git folder restored");
		process.exit();
	} catch (e) {
		console.error("Git restore error:", e && e.message ? e.message : e);
		process.exit(2);
	}
};

const git = (waw) => {
	// runner does: module.exports.git(waw)
	// old behavior: shift "git" command off argv
	waw.argv.shift();

	if (waw.argv.length) {
		const command = waw.argv.shift();

		switch (command) {
			case "store":
				waw.argv.length ? gitStore(waw) : gitDefault(waw);
				break;

			case "restore":
				waw.argv.length ? gitRestore(waw) : gitDefault(waw);
				break;

			default:
				gitDefault(waw);
				break;
		}
	} else {
		gitDefault(waw);
	}
};

module.exports = git;
