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
	"4) waw Template": "https://github.com/WebArtWork/wjst-default.git",
	"5) waw Server": "https://github.com/WebArtWork/waw-default.git",
	"6) waw Unity": "https://github.com/WebArtWork/unity-default.git",
	"7) waw Server + Angular + Template":
		"https://github.com/WebArtWork/ngx-platform.git",
	"8) waw Server + Vue + Template":
		"https://github.com/WebArtWork/vue-platform.git",
	"9) waw Server + React + Template":
		"https://github.com/WebArtWork/react-platform.git",
	"10) waw Startup": "startup",
	"11) IT Kamianets": "itkp",
};

const itkp = {
	"1) Template, Server Side Render (usually profile or shops websites)":
		"git@github.com:IT-Kamianets/wjst-default.git",
	"2) Angular, Client Side Render (usually CRM, mobile, games or desktop apps)":
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

const css_wjst_list = {
	"1) Basic": "https://github.com/WebArtWork/wjst-css.git",
	"2) Bootstrap": "https://github.com/WebArtWork/wjst-cssBootstrap.git",
	"3) Tailwind": "https://github.com/WebArtWork/wjst-cssTailwind.git",
	"4) Foundation": "https://github.com/WebArtWork/wjst-cssFoundation.git",
	"5) Bulma": "https://github.com/WebArtWork/wjst-cssBulma.git",
	"6) Skeleton": "https://github.com/WebArtWork/wjst-cssSkeleton.git",
};

const rmSyncOptions = {
	recursive: true,
	force: true,
};

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

module.exports.love = function (waw) {
	console.log("waw Loves you :) ");
	process.exit(1);
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
	const isAngular = fs.existsSync(path.join(process.cwd(), "angular.json"));

	if (
		!isAngular &&
		!fs.existsSync(path.join(process.cwd(), "template.json"))
	) {
		console.log("This is not an project with waw css");
		process.exit();
	}

	if (!waw.change_css) {
		waw.change_css = {};
	}

	if (!waw.change_css.repo) {
		const list = isAngular ? css_ngx_list : css_wjst_list;
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

	const folder = path.join(process.cwd(), isAngular ? "src" : "css", "scss");

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

const fetch_module = (waw, location, callback) => {
	location = path.normalize(location);
	if (!fs.existsSync(location + "/module.json")) {
		return callback(false);
	}
	let json = waw.readJson(location + "/module.json");
	if (!json.repo) {
		return callback(false);
	}
	waw.fetch(location, json.repo, (err) => {
		callback();
		// waw.install(waw, location, callback);
	});
};

const update_module = async (waw, module, callback) => {
	const branch = waw.argv.length > 2 ? waw.argv[2] : "master";

	const location = module.__root;

	const temp = path.join(location, "node_modules", ".temp");

	const name = path.basename(location);

	fs.rmSync(path.join(location, ".temp"), rmSyncOptions);

	if (!fs.existsSync(path.join(location, ".gitignore"))) {
		fs.writeFileSync(path.join(location, ".gitignore"), gitignore, "utf8");
	}

	if (!fs.existsSync(path.join(location, "README.md"))) {
		fs.writeFileSync(
			path.join(location, "README.md"),
			`# waw module ${name}`,
			"utf8"
		);
	}

	if (!fs.existsSync(path.join(location, "LICENSE"))) {
		fs.writeFileSync(
			path.join(location, "LICENSE"),
			LICENSE.replace("YEAR", YEAR),
			"utf8"
		);
	}
	const license = fs.readFileSync(path.join(location, "LICENSE"), "utf8");
	if (
		license.startsWith("The MIT License (MIT)") &&
		!license.includes(YEAR)
	) {
		fs.writeFileSync(
			path.join(location, "LICENSE"),
			LICENSE.replace("YEAR", YEAR),
			"utf8"
		);
	}

	waw.fetch(
		temp,
		module.config.repo,
		(err) => {
			if (fs.existsSync(path.join(location, ".git"))) {
				fs.rmSync(path.join(location, ".git"), rmSyncOptions);
			}

			if (!path.join(temp, ".git")) {
				if (fs.existsSync(temp)) {
					fs.rmSync(temp, rmSyncOptions);
				}

				return callback();
			}

			fs.renameSync(path.join(temp, ".git"), path.join(location, ".git"));

			fs.rmSync(temp, rmSyncOptions);

			if (fs.existsSync(path.join(location, ".git"))) {
				const command = `cd ${location} && `;

				exe(command + "git add --all .");

				try {
					exe(command + 'git commit -m "' + waw.argv[1] + '"');

					exe(command + 'git push origin "' + branch + '"');
				} catch (error) {}

				fs.rmSync(path.join(location, ".git"), rmSyncOptions);
			}

			callback();
		},
		branch,
		false
	);
};

module.exports.sync = async (waw) => {
	for (let i = waw.modules.length - 1; i >= 0; i--) {
		waw.modules[i].config = waw.readJson(
			path.join(waw.modules[i].__root, "module.json")
		);
		if (!waw.modules[i].config.repo) {
			waw.modules.splice(i, 1);
		}
	}

	let countdown = waw.modules.length;

	if (!countdown) {
		console.log("There was no modules to synchronize");
		process.exit(1);
	}

	if (waw.argv.length === 1) {
		const update = (_module) => {
			if (_module.config.repo) {
				console.log(`Module ${_module.name} has been synchronized`);
			}
			if (--countdown === 0) {
				console.log("All modules were synchronized");
				process.exit(1);
			}
		};
		for (const _module of waw.modules) {
			fetch_module(waw, _module.__root, () => {
				update(_module);
			});
		}
	} else if (waw.argv.length > 1) {
		const update = (_module) => {
			if (_module.config.repo) {
				console.log(`Module ${_module.name} has been updated`);
			}
			if (--countdown === 0) {
				console.log("All modules were updated and synchronized");
				process.exit(1);
			}
		};
		for (const _module of waw.modules) {
			update_module(waw, _module, () => {
				update(_module);
			});
		}
	}
};
/*
 *	GIT management
 */

const gitDefault = (waw) => {
	process.exit();
};

const prepareReposFolder = (waw) => {
	const reposFolder = path.join(waw.waw_root, ".git", ".repos");

	if (!fs.existsSync(reposFolder)) {
		fs.mkdirSync(reposFolder, { recursive: true });
	}

	return reposFolder;
};

const gitStore = async (waw) => {
	const reposFolder = prepareReposFolder(waw);

	const globalFolder = path.join(reposFolder, waw.argv.shift());

	const gitFolder = path.join(process.cwd(), ".git");

	await exe(`cp -rf ${gitFolder} ${globalFolder}`);

	console.log("Git folder stored");

	process.exit();
};
const gitRestore = async (waw) => {
	const reposFolder = prepareReposFolder(waw);

	const globalFolder = path.join(reposFolder, waw.argv.shift());

	const gitFolder = path.join(process.cwd(), ".git");

	await exe(`cp -rf ${globalFolder} ${gitFolder}`);

	console.log("Git folder restored");

	process.exit();
};

module.exports.git = (waw) => {
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

/*
 *	PM2 management
 */
const pm2 = require("pm2");

const start = (waw) => {
	pm2.connect((err) => {
		if (err) {
			console.error("PM2 connect error:", err);

			process.exit(2);
		}

		waw.config.pm2 = waw.config.pm2 || {};

		pm2.start(
			{
				name: waw.config.name || process.cwd(),
				script: waw.waw_root + "/app.js",
				exec_mode: waw.config.pm2.exec_mode || "fork", // default fork
				instances: waw.config.pm2.instances || 1,
				max_memory_restart: waw.config.pm2.memory || "800M",
			},
			(err) => {
				pm2.disconnect();

				if (err) {
					console.error("PM2 start error:", err);

					process.exit(2);
				}
			}
		);

		setTimeout(() => {
			process.exit();
		}, 1000);
	});
};
module.exports.start = start;

const stop = (waw) => {
	pm2.connect((err) => {
		if (err) {
			console.error("PM2 connect error:", err);

			process.exit(2);
		}

		pm2.delete(waw.config.name || process.cwd(), (err, apps) => {
			pm2.disconnect();

			if (err) {
				console.error("PM2 stop error:", err);

				process.exit(2);
			}
		});

		setTimeout(() => {
			process.exit();
		}, 1000);
	});
};
module.exports.stop = stop;

const restart = (waw) => {
	pm2.connect((err) => {
		if (err) {
			console.error("PM2 connect error:", err);

			process.exit(2);
		}

		pm2.restart(waw.config.name || process.cwd(), (err, proc) => {
			pm2.disconnect();

			if (err) {
				console.error("PM2 restart error:", err);

				process.exit(2);
			}
		});

		setTimeout(() => {
			process.exit();
		}, 1000);
	});
};
module.exports.restart = restart;

/*
 *	End of Core Runners
 */
