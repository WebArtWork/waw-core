const fs = require("fs");

/*
 *	Version Management
 */
const version = function (waw) {
	let logs = "";

	if (fs.existsSync(waw.waw_root + "/package.json")) {
		try {
			let config = JSON.parse(fs.readFileSync(waw.waw_root + "/package.json"));
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

	if (waw.modules && waw.modules.length) {
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

module.exports = version;
