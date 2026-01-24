module.exports.love = function (waw) {
	console.log("waw Loves you :) ");

	process.exit();
};

/*
 *	Create new project
 */
const new_project = require("./util.project");

module.exports.new = new_project;
module.exports.n = new_project;


/*
 *	Update css folder
 */
module.exports.css = require("./util.css");

/*
 *	Version Management
 */
const version = require("./util.version");

module.exports["--version"] = version;
module.exports["-v"] = version;
module.exports.version = version;
module.exports.v = version;

/*
 *	Modules Management
 */
const new_module = require("./util.module");

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
