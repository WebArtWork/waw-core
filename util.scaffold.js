const fs = require("node:fs");
const path = require("node:path");
const terminal = require('./util.terminal');
const git = require('./util.git');

/**
 * Repo lists (moved from runner)
 */
const repo_list = {
	"waw Server": "https://github.com/WebArtWork/waw-default.git",
	"waw Angular": "https://github.com/WebArtWork/ngx-default.git",
	"waw React": "https://github.com/WebArtWork/react-default.git",
	"waw Vue": "https://github.com/WebArtWork/vue-default.git",
	"waw Unity": "https://github.com/WebArtWork/unity-default.git",
	"waw Server + Angular": "https://github.com/WebArtWork/ngx-platform.git",
	"waw Server + React": "https://github.com/WebArtWork/react-platform.git",
	"waw Server + Vue": "https://github.com/WebArtWork/vue-platform.git",
	"IT Kamianets": "itkp",
};

const itkp = {
	"Angular": "git@github.com:IT-Kamianets/ngx-default.git",
};

/**
 * Create new project (moved from runner)
 */
const newProject = async function (waw) {
	// Keep original behavior: allow running via `waw new ...`
	if (waw.argv[0] === "new") {
		waw.argv.shift();
	}

	if (!waw.newProject) {
		waw.newProject = {};
	}

	// 1) name (terminal-based, no readline callbacks)
	if (!waw.newProject.name) {
		const t = terminal();

		// argv wins if present
		if (waw.argv.length) {
			const proposed = String(waw.argv[0]).trim();

			waw.newProject.name = proposed;

			t.close();
		} else {
			const name = await t.ask("Provide name for the project you want to create:", {
				required: true,
			});

			waw.newProject.name = name;
			t.close();
		}
	}

	if (fs.existsSync(path.join(process.cwd(), waw.newProject.name))) {
		console.log("This project already exists in current directory");
		process.exit(1);
	}

	// 2) repo
	if (!waw.newProject.repo) {
		const t = terminal();
		// explicit repo passed as 2nd arg (non-number) like: waw new myapp <repoUrl>
		if (waw.argv.length > 1 && waw.argv[1] != Number(waw.argv[1])) {
			waw.newProject.repo = waw.argv[1];
			t.close();
		} else {
			let text = "Which project you want to start with?",
				counter = 0,
				repos = {};

			for (let key in repo_list) {
				repos[++counter] = repo_list[key];
				text += "\n" + key;
			}

			// numeric selection passed as 2nd arg like: waw new myapp 3
			if (
				waw.argv.length > 1 &&
				waw.argv[1] == Number(waw.argv[1]) &&
				Object.keys(repos).length >= Number(waw.argv[1])
			) {
				waw.newProject.repo = repos[parseInt(waw.argv[1])];
			} else {
				// build menu in order
				const mainLabels = Object.keys(repo_list);
				const mainValues = Object.values(repo_list);

				// numeric selection passed as 2nd arg like: waw new myapp 3
				if (
					waw.argv.length > 1 &&
					waw.argv[1] == Number(waw.argv[1]) &&
					mainValues.length >= Number(waw.argv[1])
				) {
					waw.newProject.repo = mainValues[Number(waw.argv[1]) - 1];
					t.close();
				} else {
					let selected = await t.choose("Which project you want to start with?", mainLabels, {
						prompt: "Choose number:",
					});

					// map selected label -> repo value
					selected = mainValues[mainLabels.indexOf(selected)];

					// nested selection: IT Kamianets
					if (selected === "itkp") {
						const labels = Object.keys(itkp);
						const values = Object.values(itkp);

						const picked = await t.choose("Which project you want to start with?", labels, {
							prompt: "Choose number:",
						});

						waw.newProject.repo = values[labels.indexOf(picked)];
						t.close();
					} else {
						// plain selection
						waw.newProject.repo = selected;
						t.close();
					}
				}
			}
		}
	}

	// 3) fetch into folder (git-based)
	const branch = waw.argv.length > 2 ? waw.argv[2] : "master";
	const folder = path.join(process.cwd(), waw.newProject.name);

	fs.mkdirSync(folder, { recursive: true });

	try {
		const t = terminal();
		t.spinnerStart("Downloading template...");

		// clone/sync repo into target folder (silent)
		git.forceSync(folder, { repo: waw.newProject.repo, branch, silent: true });

		// keep generated project clean
		git.remove(folder);

		// also drop github workflows from templates
		const gh = path.join(folder, ".github");
		if (fs.existsSync(gh)) fs.rmSync(gh, { recursive: true, force: true });

		t.close();
		console.log("Your project has been generated successfully");
		process.exit();
	} catch (e) {
		console.error("Failed to generate project");
		process.exit(1);
	}

};

module.exports.newProject = newProject;


/*
 *	Modules Management (waw add / waw a)
 */
const defaults = {
	module: {
		default: path.join(__dirname, "module", "default"),
	},
};

module.exports.newModule = async function newModule(waw) {
	const t = terminal();

	let name = null;
	if (waw.argv && (waw.argv[0] === "add" || waw.argv[0] === "a"))
		name = waw.argv[1];
	else name = waw.argv && waw.argv[0];

	if (!name) name = await t.ask("Module name:", { required: true });

	name = name.toLowerCase();

	const base = path.join(waw.modulesPath, name);
	if (waw.isDir(base)) {
		console.log("Module already exists");
		t.close();
		process.exit(1);
	}

	// TODO implement custom template
	let templatePath = defaults.module.default;

	const scaffoldPath = path.join(templatePath, "scaffold.js");
	if (!waw.isFile(scaffoldPath)) {
		console.log(`Missing scaffold.js in template: ${templatePath}`);
		t.close();
		process.exit(1);
	}

	const scaffold = require(scaffoldPath);
	if (typeof scaffold !== "function") {
		console.log(`Template scaffold.js must export a function: ${scaffoldPath}`);
		t.close();
		process.exit(1);
	}

	const ctx = {
		...waw,
		git,
		// template inputs
		name,
		Name: name.charAt(0).toUpperCase() + name.slice(1),

		// paths
		base, // target module folder
		template: templatePath, // template root folder
		projectPath: waw.projectPath,
	};

	try {
		await scaffold(ctx);
		console.log("Module has been created");
		t.close();
		process.exit();
	} catch (e) {
		console.log("Failed to create module");
		t.close();
		process.exit(1);
	}
};


/*
 *	Update css folder
 */
const css_ngx_list = {
	"1) Basic": "https://github.com/WebArtWork/ngx-css.git",
	"2) Bootstrap": "https://github.com/WebArtWork/ngx-cssBootstrap.git",
	"3) Tailwind": "https://github.com/WebArtWork/ngx-cssTailwind.git",
	"4) Foundation": "https://github.com/WebArtWork/ngx-cssFoundation.git",
	"5) Bulma": "https://github.com/WebArtWork/ngx-cssBulma.git",
	"6) Skeleton": "https://github.com/WebArtWork/ngx-cssSkeleton.git",
};

const css_react_list = {
	"1) Basic": "https://github.com/WebArtWork/react-css.git",
	"2) Bootstrap": "https://github.com/WebArtWork/react-cssBootstrap.git",
	"3) Tailwind": "https://github.com/WebArtWork/react-cssTailwind.git",
	"4) Foundation": "https://github.com/WebArtWork/react-cssFoundation.git",
	"5) Bulma": "https://github.com/WebArtWork/react-cssBulma.git",
	"6) Skeleton": "https://github.com/WebArtWork/react-cssSkeleton.git",
};

const css_vue_list = {
	"1) Basic": "https://github.com/WebArtWork/vue-css.git",
	"2) Bootstrap": "https://github.com/WebArtWork/vue-cssBootstrap.git",
	"3) Tailwind": "https://github.com/WebArtWork/vue-cssTailwind.git",
	"4) Foundation": "https://github.com/WebArtWork/vue-cssFoundation.git",
	"5) Bulma": "https://github.com/WebArtWork/vue-cssBulma.git",
	"6) Skeleton": "https://github.com/WebArtWork/vue-cssSkeleton.git",
};

const css_wjst_list = {
	"1) Basic": "https://github.com/WebArtWork/wjst-css.git",
	"2) Bootstrap": "https://github.com/WebArtWork/wjst-cssBootstrap.git",
	"3) Tailwind": "https://github.com/WebArtWork/wjst-cssTailwind.git",
	"4) Foundation": "https://github.com/WebArtWork/wjst-cssFoundation.git",
	"5) Bulma": "https://github.com/WebArtWork/wjst-cssBulma.git",
	"6) Skeleton": "https://github.com/WebArtWork/wjst-cssSkeleton.git",
};

const ensureWjstConfig = () => {
	// Keep original behavior: if template.json exists but wjst.json missing -> copy
	const templateJson = path.join(process.cwd(), "template.json");
	const wjstJson = path.join(process.cwd(), "wjst.json");

	if (fs.existsSync(templateJson) && !fs.existsSync(wjstJson)) {
		fs.copyFileSync(templateJson, wjstJson);
	}
};

const detectProjectType = () => {
	const cwd = process.cwd();
	return {
		isAngular: fs.existsSync(path.join(cwd, "angular.json")),
		isReact: fs.existsSync(path.join(cwd, "react.json")),
		isVue: fs.existsSync(path.join(cwd, "vue.json")),
		isWjst:
			fs.existsSync(path.join(cwd, "template.json")) ||
			fs.existsSync(path.join(cwd, "wjst.json")),
	};
};

const changeCss = function (waw) {
	ensureWjstConfig();
	const { isAngular, isReact, isVue, isWjst } = detectProjectType();

	if (!isAngular && !isReact && !isVue && !isWjst) {
		console.log("This is not an project with waw css");
		process.exit();
	}

	if (!waw.changeCss) {
		waw.changeCss = {};
	}

	if (!waw.changeCss.repo) {
		const list = isAngular
			? css_ngx_list
			: isReact
				? css_react_list
				: isVue
					? css_vue_list
					: css_wjst_list;

		let text = "Which framework you want to use?",
			counter = 0,
			repos = {};

		for (let key in list) {
			repos[++counter] = list[key];
			text += "\n" + key;
		}

		text += "\nChoose number: ";

		return waw.readline.question(text, function (answer) {
			if (!answer || !repos[parseInt(answer)]) return changeCss(waw);
			waw.changeCss.repo = repos[parseInt(answer)];
			changeCss(waw);
		});
	}

	const folder = path.join(
		process.cwd(),
		isAngular || isReact || isVue ? "src" : "css",
		"scss"
	);

	fs.rmSync(folder, { recursive: true, force: true });
	fs.mkdirSync(folder, { recursive: true });

	waw.fetch(
		folder,
		waw.changeCss.repo,
		() => {
			if (fs.existsSync(folder + "/.git")) {
				fs.rmSync(folder + "/.git", { recursive: true });
			}
			console.log("css Framework changed successfully");
			process.exit(1);
		},
		waw.argv.length > 1 ? waw.argv[1] : "master"
	);
};

module.exports.changeCss = changeCss;
