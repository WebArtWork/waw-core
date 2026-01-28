const path = require("node:path");
const fs = require("node:fs");
const terminal = require('./util.terminal');
const git = require('./util.git');

/**
 * Repo lists (moved from runner)
 */
const repo_list = {
	"waw Server": "https://github.com/WebArtWork/waw-default.git",
	"waw Angular": "https://github.com/WebArtWork/ngx-default.git",
	"waw Vue": "https://github.com/WebArtWork/vue-default.git",
	"waw React": "https://github.com/WebArtWork/react-default.git",
	"waw Unity": "https://github.com/WebArtWork/unity-default.git",
	"waw Server + Angular": "https://github.com/WebArtWork/ngx-platform.git",
	"waw Server + Vue": "https://github.com/WebArtWork/vue-platform.git",
	"waw Server + React": "https://github.com/WebArtWork/react-platform.git",
	"IT Kamianets": "itkp",
};

const itkp = {
	"1) Angular": "git@github.com:IT-Kamianets/ngx-default.git",
};

/**
 * Create new project (moved from runner)
 */
const new_project = async function (waw) {
	// Keep original behavior: allow running via `waw new ...`
	if (waw.argv[0] === "new") {
		waw.argv.shift();
	}

	if (!waw.new_project) {
		waw.new_project = {};
	}

	// 1) name (terminal-based, no readline callbacks)
	if (!waw.new_project.name) {
		const t = terminal();

		// argv wins if present
		if (waw.argv.length) {
			const proposed = String(waw.argv[0]).trim();

			waw.new_project.name = proposed;

			t.close();
		} else {
			const name = await t.ask("Provide name for the project you want to create:", {
				required: true,
			});

			waw.new_project.name = name;
			t.close();
		}
	}

	if (fs.existsSync(path.join(process.cwd(), waw.new_project.name))) {
		console.log("This project already exists in current directory");
		process.exit(0);
	}

	// 2) repo
	if (!waw.new_project.repo) {
		const t = terminal();
		// explicit repo passed as 2nd arg (non-number) like: waw new myapp <repoUrl>
		if (waw.argv.length > 1 && waw.argv[1] != Number(waw.argv[1])) {
			waw.new_project.repo = waw.argv[1];
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
				waw.new_project.repo = repos[parseInt(waw.argv[1])];
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
					waw.new_project.repo = mainValues[Number(waw.argv[1]) - 1];
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

						waw.new_project.repo = values[labels.indexOf(picked)];
						t.close();
					} else {
						// plain selection
						waw.new_project.repo = selected;
						t.close();
					}
				}
			}
		}
	}

	// 3) fetch into folder (git-based)
	const branch = waw.argv.length > 2 ? waw.argv[2] : "master";
	const folder = path.join(process.cwd(), waw.new_project.name);

	fs.mkdirSync(folder, { recursive: true });

	try {
		const t = terminal();
		t.spinnerStart("Downloading template...");

		// clone/sync repo into target folder (silent)
		git.forceSync(folder, { repo: waw.new_project.repo, branch, silent: true });

		// keep generated project clean
		git.remove(folder);

		// also drop github workflows from templates
		const gh = path.join(folder, ".github");
		if (fs.existsSync(gh)) fs.rmSync(gh, { recursive: true, force: true });

		t.close();
		console.log("Your project has been generated successfully");
		process.exit(0);
	} catch (e) {
		console.error("Failed to generate project");
		process.exit(1);
	}

};

module.exports.new_project = new_project;


/*
 *	Modules Management (waw add / waw a)
 */
const defaults = {
	module: {
		default: __dirname + "/module/default",
	},
};

const new_module = function (waw) {
	waw.server = typeof waw.server === "string" ? waw.server : "server";

	if (!waw.path) {
		if (
			waw.ensure(
				process.cwd() + (waw.server ? "/" : ""),
				waw.server,
				"Module already exists",
				false
			)
		) {
			return;
		}
	}

	if (!waw.template) {
		return waw.read_customization(defaults, "module", () => new_module(waw));
	}

	require(waw.template + "/scaffold.js")(waw);
};

module.exports.new_module = new_module;


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

const change_css = function (waw) {
	ensureWjstConfig();
	const { isAngular, isReact, isVue, isWjst } = detectProjectType();

	if (!isAngular && !isReact && !isVue && !isWjst) {
		console.log("This is not an project with waw css");
		process.exit();
	}

	if (!waw.change_css) {
		waw.change_css = {};
	}

	if (!waw.change_css.repo) {
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
			if (!answer || !repos[parseInt(answer)]) return change_css(waw);
			waw.change_css.repo = repos[parseInt(answer)];
			change_css(waw);
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
		waw.change_css.repo,
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

module.exports.change_css = change_css;
