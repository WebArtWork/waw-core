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
*	Git Management
*/
	const part = function(params){
		if(!params.argv.length){
			console.log('Please provide git command');
			process.exit(1);
		}
		let command = params.argv.shift();
		if(!params.argv.length){
			console.log('Please provide part name');
			process.exit(1);
		}
		let part = params.argv.shift();
		if(!params._parts[part]){
			console.log("There is no such part");
			process.exit(1);
		}
		if(!params._parts[part].git || !params._parts[part].git.repo){
			console.log("Part don't have git config");
			process.exit(1);
		}
		switch(command){
			case 'fetch':
				let repo = params.git(params._parts[part].__root);
				repo.init(function(){
					repo.addRemote('origin', params._parts[part].git.repo, function(err){
						repo.fetch('--all', function(err){
							repo.reset('origin/'+(params._parts[part].git.branch||'master'), ()=>{
								console.log('Part has been fetched');
								process.exit(1);
							});
						});
					});
				});
				return false;
			default:
				console.log('Please provide correct git command. Type `waw part help`');
				process.exit(1);
		}
	}
	module.exports.part = part;
/*
*	End of Core Runners
*/