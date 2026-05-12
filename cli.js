module.exports.love = function (waw) {
	console.log("waw Loves you :) ");

	process.exit();
};

module.exports.wipe = function (waw) {
	waw.rm(waw.wawPath, 'server');

	process.exit();
};

module.exports.update = function (waw) {
	waw.rm(waw.wawPath, 'server');

	waw.git.forceSync(waw.wawPath, {
		repo: 'https://github.com/WebArtWork/waw.git'
	})

	process.exit();
};

const scaffold = require("./util.scaffold");
const maintain = require("./util.maintain");

/*
 *	Create new project
 */

module.exports.new = scaffold.newProject;
module.exports.n = scaffold.newProject;

/*
 *	Modules management
 */
module.exports.add = scaffold.newModule;
module.exports.a = scaffold.newModule;

/*
 *	Update css folder
 */
module.exports.css = scaffold.changeCss;

/*
 *	Version management
 */
module.exports["--version"] = maintain.version;
module.exports["-version"] = maintain.version;
module.exports["--v"] = maintain.version;
module.exports["-v"] = maintain.version;
module.exports.version = maintain.version;
module.exports.ver = maintain.version;
module.exports.v = maintain.version;


/*
 *	Sync management
 */
module.exports.sync = maintain.sync;


/*
 *	PM2 management
 */
const pm2util = require("./util.pm2");

module.exports.start = pm2util.start;
module.exports.stop = pm2util.stop;
module.exports.restart = pm2util.restart;

/*
 *	AI
 */
module.exports.ai = require('./util.ai');

/*
 *	Asset
 */
module.exports.asset = require('./util.asset');
