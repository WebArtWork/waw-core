const fs = require('fs');
/*
*	Create new project
*/
	const new_project = function(params) {
		console.log('Create new project', params[0]);
		process.exit(1);
	};
	module.exports.new = new_project;
	module.exports.n = new_project;
/*
*	Create new part
*/
	const add = function(params) {
		console.log('Create new part', params);
		process.exit(1);
	};
	module.exports.add = add;
	module.exports.a = add;
/*
*	Version Management
*/
	const version = function(params){
		if (fs.existsSync(params.waw_root+'/package.json')) {
			let config = JSON.parse(fs.readFileSync(params.waw_root+'/package.json'));
			console.log('waw: ' + config.version);
		}
		process.exit(1);
	}
	module.exports['--version'] = version;
	module.exports['-v'] = version;
	module.exports.version = version;
	module.exports.v = version;
/*
*	End of Core Runners
*/