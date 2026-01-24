const path = require("path");
const fs = require("fs");

/**
 * Repo lists (moved from runner)
 */
const repo_list = {
	"1) waw Angular": "https://github.com/WebArtWork/ngx-default.git",
	"2) waw Vue": "https://github.com/WebArtWork/vue-default.git",
	"3) waw React": "https://github.com/WebArtWork/react-default.git",
	"4) waw Wjst": "https://github.com/WebArtWork/wjst-default.git",
	"5) waw Server": "https://github.com/WebArtWork/waw-default.git",
	"6) waw Unity": "https://github.com/WebArtWork/unity-default.git",
	"7) waw Server + Angular + Wjst": "https://github.com/WebArtWork/ngx-platform.git",
	"8) waw Server + Vue + Wjst": "https://github.com/WebArtWork/vue-platform.git",
	"9) waw Server + React + Wjst": "https://github.com/WebArtWork/react-platform.git",
	"10) IT Kamianets": "itkp",
	// "10) waw Startup": "startup",
};

const itkp = {
	"1) Angular": "git@github.com:IT-Kamianets/ngx-default.git",
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

/**
 * Create new project (moved from runner)
 */
const new_project = function (waw) {
	// Keep original behavior: allow running via `waw new ...`
	if (waw.argv[0] === "new") {
		waw.argv.shift();
	}

	if (!waw.new_project) {
		waw.new_project = {};
	}

	// 1) name
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
							console.log("This project already exists in current directory");
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

	// 2) repo
	if (!waw.new_project.repo) {
		// explicit repo passed as 2nd arg (non-number) like: waw new myapp <repoUrl>
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

			// numeric selection passed as 2nd arg like: waw new myapp 3
			if (
				waw.argv.length > 1 &&
				waw.argv[1] == Number(waw.argv[1]) &&
				Object.keys(repos).length >= Number(waw.argv[1])
			) {
				waw.new_project.repo = repos[parseInt(waw.argv[1])];
			} else {
				text += "\nChoose number: ";
				return waw.readline.question(text, function (answer) {
					if (!answer || !repos[parseInt(answer)]) return new_project(waw);

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
							if (!answer || !repos[parseInt(answer)]) return new_project(waw);
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
							if (!answer || !repos[parseInt(answer)]) return new_project(waw);
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

	// 3) fetch into folder
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

module.exports = new_project;
