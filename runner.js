const exe = require("child_process").execSync;
const path = require("path");
const fs = require("fs");
const defaults = {
	module: {
		default: __dirname + "/module/default",
	},
};

const repo_list = {
	"1) waw Angular": "https://github.com/WebArtWork/ngx-default.git",
	"2) waw Vue": "https://github.com/WebArtWork/vue-default.git",
	"3) waw React": "https://github.com/WebArtWork/react-default.git",
	"4) waw Wjst": "https://github.com/WebArtWork/wjst-default.git",
	"5) waw Server": "https://github.com/WebArtWork/waw-default.git",
	"6) waw Unity": "https://github.com/WebArtWork/unity-default.git",
	"7) waw Server + Angular + Wjst":
		"https://github.com/WebArtWork/ngx-platform.git",
	"8) waw Server + Vue + Wjst":
		"https://github.com/WebArtWork/vue-platform.git",
	"9) waw Server + React + Wjst":
		"https://github.com/WebArtWork/react-platform.git",
	"10) IT Kamianets": "itkp",
	// "10) waw Startup": "startup",
};

const itkp = {
	"1) Angular":
		"git@github.com:IT-Kamianets/ngx-default.git",
};

const repo_startup_list = {
	"1) Real Estate": "git@github.com:WebArtWork/startup-realestate.git",
	"2) Car": "git@github.com:WebArtWork/startup-car.git",
	"3) Medicine": "git@github.com:WebArtWork/startup-medicine.git",
	"4) Food": "git@github.com:WebArtWork/startup-food.git",
	"5) Body": "git@github.com:WebArtWork/startup-body.git",
	"6) Clothes": "git@github.com:WebArtWork/startup-clothes.git",
	"7) Electronics": "git@github.com:WebArtWork/startup-electronics.git",
	"8) City": "git@github.com:WebArtWork/startup-city.git",
	"9) Agro": "git@github.com:WebArtWork/startup-agro.git",
	"10) Cybersport": "git@github.com:WebArtWork/startup-cybersport.git",
	// "3) Animals": "git@github.com:WebArtWork/startup-animals.git",
	// "12) Content": "git@github.com:WebArtWork/startup-content.git",
};

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

const isAngular = fs.existsSync(path.join(process.cwd(), "angular.json"));
const isReact = fs.existsSync(path.join(process.cwd(), "react.json"));
const isVue = fs.existsSync(path.join(process.cwd(), "vue.json"));
const isWjst =
	fs.existsSync(path.join(process.cwd(), "template.json")) ||
	fs.existsSync(path.join(process.cwd(), "wjst.json"));

if (
	fs.existsSync(path.join(process.cwd(), "template.json")) &&
	!fs.existsSync(path.join(process.cwd(), "wjst.json"))
) {
	fs.copyFileSync(
		path.join(process.cwd(), "template.json"),
		path.join(process.cwd(), "wjst.json")
	);
}

module.exports.love = function (waw) {
	console.log("waw Loves you :) ");

	process.exit();
};
/*
 *	Create new project
 */
const new_project = function (waw) {
	if (waw.argv[0] === "new") {
		waw.argv.shift();
	}
	if (!waw.new_project) {
		waw.new_project = {};
	}
	if (!waw.new_project.name) {
		if (waw.argv.length) {
			if (fs.existsSync(process.cwd() + "/" + waw.argv[0])) {
				console.log("This project already exists in current directory");
				process.exit(0);
			} else {
				waw.new_project.name = waw.argv[0];
			}
		} else {
			return waw.readline.question(
				"Provide name for the project you want to create: ",
				function (answer) {
					if (answer) {
						if (fs.existsSync(process.cwd() + "/" + answer)) {
							console.log(
								"This project already exists in current directory"
							);
						} else {
							waw.new_project.name = answer;
						}
					} else {
						console.log("Please type your project name");
					}
					new_project(waw);
				}
			);
		}
	}
	if (!waw.new_project.repo) {
		if (waw.argv.length > 1 && waw.argv[1] != Number(waw.argv[1])) {
			waw.new_project.repo = waw.argv[1];
		} else {
			let text = "Which project you want to start with?",
				counter = 0,
				repos = {};
			for (let key in repo_list) {
				repos[++counter] = repo_list[key];
				text += "\n" + key;
			}
			if (
				waw.argv.length > 1 &&
				waw.argv[1] == Number(waw.argv[1]) &&
				Object.keys(repos).length >= Number(waw.argv[1])
			) {
				waw.new_project.repo = repos[parseInt(waw.argv[1])];
			} else {
				text += "\nChoose number: ";
				return waw.readline.question(text, function (answer) {
					if (!answer || !repos[parseInt(answer)])
						return new_project(waw);

					if (repos[parseInt(answer)] === "startup") {
						(text = "Which startup theme you want to start with?"),
							(counter = 0),
							(repos = {});
						for (let key in repo_startup_list) {
							repos[++counter] = repo_startup_list[key];
							text += "\n" + key;
						}
						text += "\nChoose number: ";

						return waw.readline.question(text, function (answer) {
							if (!answer || !repos[parseInt(answer)])
								return new_project(waw);
							waw.new_project.repo = repos[parseInt(answer)];
							new_project(waw);
						});
					} else if (repos[parseInt(answer)] === "itkp") {
						(text = "Which project you want to start with?"),
							(counter = 0),
							(repos = {});
						for (let key in itkp) {
							repos[++counter] = itkp[key];
							text += "\n" + key;
						}
						text += "\nChoose number: ";

						return waw.readline.question(text, function (answer) {
							if (!answer || !repos[parseInt(answer)])
								return new_project(waw);
							waw.new_project.repo = repos[parseInt(answer)];
							new_project(waw);
						});
					} else {
						waw.new_project.repo = repos[parseInt(answer)];
						new_project(waw);
					}
				});
			}
		}
	}
	let folder = process.cwd() + "/" + waw.new_project.name;
	fs.mkdirSync(folder, { recursive: true });
	waw.fetch(
		folder,
		waw.new_project.repo,
		() => {
			if (fs.existsSync(folder + "/.git")) {
				fs.rmSync(folder + "/.git", { recursive: true });
			}

			if (fs.existsSync(folder + "/.github")) {
				fs.rmSync(folder + "/.github", { recursive: true });
			}

			console.log("Your project has been generated successfully");

			process.exit();
		},
		waw.argv.length > 2 ? waw.argv[2] : "master"
	);
};
module.exports.new = new_project;
module.exports.n = new_project;

/*
 *	Update css folder
 */
const change_css = function (waw) {
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

	fs.rmSync(folder, { recursive: true });

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
module.exports.css = change_css;

/*
 *	Version Management
 */
const version = function (waw) {
	let logs = "";
	if (fs.existsSync(waw.waw_root + "/package.json")) {
		try {
			let config = JSON.parse(
				fs.readFileSync(waw.waw_root + "/package.json")
			);
			if (config.version) {
				logs = "waw: " + config.version;
			} else {
				console.log("Missing files, try to reinstall waw framework.");
				process.exit(1);
			}
		} catch (err) {
			console.log("Missing files, try to reinstall waw framework.");
			process.exit(1);
		}
	}
	if (waw.modules.length) {
		logs += "\nAccesible Modules: ";
		for (var i = 0; i < waw.modules.length; i++) {
			if (i) {
				logs += ", " + waw.modules[i].name;
			} else {
				logs += waw.modules[i].name;
			}
		}
	}
	console.log(logs);
	process.exit(1);
};
module.exports["--version"] = version;
module.exports["-v"] = version;
module.exports.version = version;
module.exports.v = version;

/*
 *	Modules Management
 */
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
		)
			return;
	}
	if (!waw.template) {
		return waw.read_customization(defaults, "module", () =>
			new_module(waw)
		);
	}
	require(waw.template + "/cli.js")(waw);
};
module.exports.add = new_module;
module.exports.a = new_module;

/*
 *	Sync management
 */
module.exports.sync = require('./util.sync');

/*
 *	GIT management
 */

module.exports.git = require("./util.git");

/*
 *	PM2 management
 */
const pm2util = require("./util.pm2");

module.exports.start = pm2util.start;
module.exports.stop = pm2util.stop;
module.exports.restart = pm2util.restart;

/*
 *	End of Core Runners
 */
