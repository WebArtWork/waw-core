const fs = require("node:fs");
const path = require("node:path");

/**
 * Repo lists (moved from runner)
 */
const projectRepoList = {
	"waw Server": "https://github.com/WebArtWork/waw-default.git",
	"waw Angular": "https://github.com/WebArtWork/ngx-default.git",
	"waw React": "https://github.com/WebArtWork/react-default.git",
	"waw Vue": "https://github.com/WebArtWork/vue-default.git",
	"waw Unity": "https://github.com/WebArtWork/unity-default.git",
	"IT Kamianets": "space.itkp",
	"Ternopil Space": "space.ternopil",
	"Uman IT Space": "space.uman",
	"Volyn IT Space": "space.volyn",
	"Vinnytsia Space": "space.vinnytsia",
	"Frankivsk Space": "space.frankivsk",
	"Chernivtsi Space": "space.chernivtsi",
	"London IT Space": "space.london",
};

const space = {
	itkp: {
		"Angular default project": "https://github.com/IT-Kamianets/ngx-default.git",
		"Angular horeca project": "https://github.com/IT-Kamianets/ngx-horeca.git",
		"Tailwind theme": "https://github.com/IT-Kamianets/theme-tailwind.git",
		"Bootstrap theme": "https://github.com/IT-Kamianets/theme-bootstrap.git",
		"Bulma theme": "https://github.com/IT-Kamianets/theme-bulma.git",
	},
	ternopil: {
		"Angular default project": "https://github.com/ternopil-space/ngx-default.git",
		"Angular horeca project": "https://github.com/ternopil-space/ngx-horeca.git",
	},
	uman: {
		"Angular default project": "https://github.com/uman-it-space/ngx-default.git",
		"Angular horeca project": "https://github.com/uman-it-space/ngx-horeca.git",
	},
	volyn: {
		"Angular default project": "https://github.com/volyn-it-space/ngx-default.git",
		"Angular horeca project": "https://github.com/volyn-it-space/ngx-horeca.git",
	},
	vinnytsia: {
		"Angular default project": "https://github.com/vinnytsia-space/ngx-default.git",
		"Angular horeca project": "https://github.com/vinnytsia-space/ngx-horeca.git",
	},
	frankivsk: {
		"Angular default project": "https://github.com/frankivsk-space/ngx-default.git",
		"Angular horeca project": "https://github.com/frankivsk-space/ngx-horeca.git",
	},
	chernivtsi: {
		"Angular default project": "https://github.com/chernivtsi-space/ngx-default.git",
		"Angular horeca project": "https://github.com/chernivtsi-space/ngx-horeca.git",
	},
	london: {
		"Angular default project": "https://github.com/london-it-space/ngx-default.git",
		"Angular horeca project": "https://github.com/london-it-space/ngx-horeca.git",
	},
}

/**
 * Create new project (moved from runner)
 */

module.exports.newProject = async function (waw) {
	if (waw.argv[0] === "new") {
		waw.argv.shift();
	}

	waw.newProject ||= {};

	// 1) name (terminal-based, no readline callbacks)
	if (!waw.newProject.name) {
		const t = waw.terminal();

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
		const t = waw.terminal();
		// explicit repo passed as 2nd arg (non-number) like: waw new myapp <repoUrl>
		if (waw.argv.length > 1 && waw.argv[1] != Number(waw.argv[1])) {
			waw.newProject.repo = waw.argv[1];
			t.close();
		} else {
			let text = "Which project you want to start with?",
				counter = 0,
				repos = {};

			for (let key in projectRepoList) {
				repos[++counter] = projectRepoList[key];
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
				const mainLabels = Object.keys(projectRepoList);
				const mainValues = Object.values(projectRepoList);

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

					if (selected.startsWith('space.')) {
						const labels = Object.keys(space[selected.replace('space.', '')]);
						const values = Object.values(space[selected.replace('space.', '')]);

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
		const t = waw.terminal();
		t.spinnerStart("Downloading template...");

		// clone/sync repo into target folder (silent)
		waw.git.forceSync(folder, { repo: waw.newProject.repo, branch, silent: true });

		// keep generated project clean
		waw.git.remove(folder);

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


/*
 *	Modules Management (waw add / waw a)
 */
const defaults = {
	module: {
		default: path.join(__dirname, "module", "default"),
	},
};

module.exports.newModule = async function newModule(waw) {
	const t = waw.terminal();

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
const cssRepoList = {
	angular: {
		"Basic": "https://github.com/WebArtWork/ngx-css.git",
		"Bootstrap": "https://github.com/WebArtWork/ngx-cssBootstrap.git",
		"Tailwind": "https://github.com/WebArtWork/ngx-cssTailwind.git",
		"Foundation": "https://github.com/WebArtWork/ngx-cssFoundation.git",
		"Bulma": "https://github.com/WebArtWork/ngx-cssBulma.git",
		"Material": "https://github.com/WebArtWork/ngx-cssMaterial.git",
	},
	react: {
		"Basic": "https://github.com/WebArtWork/react-css.git",
		"Bootstrap": "https://github.com/WebArtWork/react-cssBootstrap.git",
		"Tailwind": "https://github.com/WebArtWork/react-cssTailwind.git",
		"Foundation": "https://github.com/WebArtWork/react-cssFoundation.git",
		"Bulma": "https://github.com/WebArtWork/react-cssBulma.git",
	},
	vue: {
		"Basic": "https://github.com/WebArtWork/vue-css.git",
		"Bootstrap": "https://github.com/WebArtWork/vue-cssBootstrap.git",
		"Tailwind": "https://github.com/WebArtWork/vue-cssTailwind.git",
		"Foundation": "https://github.com/WebArtWork/vue-cssFoundation.git",
		"Bulma": "https://github.com/WebArtWork/vue-cssBulma.git",
	},
	wjst: {
		"Basic": "https://github.com/WebArtWork/wjst-css.git",
		"Bootstrap": "https://github.com/WebArtWork/wjst-cssBootstrap.git",
		"Tailwind": "https://github.com/WebArtWork/wjst-cssTailwind.git",
		"Foundation": "https://github.com/WebArtWork/wjst-cssFoundation.git",
		"Bulma": "https://github.com/WebArtWork/wjst-cssBulma.git",
	}
};

module.exports.changeCss = async function (waw) {
	if (!waw.projectType || waw.projectType === 'waw') {
		console.log("This is not an front-end project");
		process.exit();
	}

	const t = waw.terminal();

	const repoList = cssRepoList[waw.projectType];

	const mainLabels = Object.keys(repoList);
	const mainValues = Object.values(repoList);

	let repoLink = '';
	do {
		const selected = await t.choose("Which css framework you want to use?", mainLabels, {
			prompt: "Choose number:",
		});

		repoLink = mainValues[mainLabels.indexOf(selected)];
	} while (!repoLink);

	t.close();

	const folder = path.join(
		process.cwd(),
		waw.projectType === 'wjst' ? 'scss' : 'src/scss'
	);

	waw.rm(folder);
	waw.ensureDir(folder);
	waw.git.forceSync(folder, {
		repo: repoLink,
		branch: 'master',
		silent: true
	});

	console.log("css framework changed successfully");
	process.exit();
};
