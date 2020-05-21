const fs = require('fs');
const isDirectory = source => fs.lstatSync(source).isDirectory();
const getDirectories = source => {
	if (!fs.existsSync(source)) {
		return []; 
	}
	return fs.readdirSync(source).map(name => require('path').join(source, name)).filter(isDirectory);
}
const git_fetch = function(git, location, repo, branch='master', cb = ()=>{}){
	let git_repo = git(location);
	git_repo.init(function(){
		git_repo.addRemote('origin', repo, function(err){
			git_repo.fetch('--all', function(err){
				git_repo.reset('origin/'+branch, cb);
			});
		});
	});
}
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
			try{
				let config = JSON.parse(fs.readFileSync(params.waw_root+'/package.json'));
				if(config.version){
					console.log('waw: ' + config.version);
				}else{
					console.log('Missing files, try to reinstall waw framework.');
				}
			}catch(err){
				console.log('Missing files, try to reinstall waw framework.');
			}
		}
	}
	module.exports['--version'] = version;
	module.exports['-v'] = version;
	module.exports.version = version;
	module.exports.v = version;
/*
*	Git Management
*/
	const generate = function(params){
		if(!params.argv.length){
			console.log('Please provide part name');
			process.exit(1);
		}
		let name = params.argv.shift();
		if(params._parts[name.toLowerCase()]){
			console.log('This part already exists.');
			process.exit(1);
		}
		const global_part = params.origin_argv[1].toLowerCase() == 'global' || params.origin_argv[1].toLowerCase() == 'pg';
		if(global_part && !params.argv.length){
			console.log('To install global part you has to provide repo link.');
			process.exit(1);
		}
		let repo_link;
		if(params.argv.length){
			repo_link = params.argv.shift();
		}
		let folder = (global_part&&params.waw_root||process.cwd())+'/server/'+name;
		fs.mkdirSync(folder, { recursive: true });
		if(repo_link){
			let repo = params.git(folder);
			repo.init(function(){
				repo.addRemote('origin', repo_link, function(err){
					repo.fetch('--all', function(err){
						let branch = 'master';
						if(params.argv.length){
							branch = params.argv.shift();
						}
						repo.reset('origin/'+branch, err=>{
							console.log('Part has been created');
							process.exit(1);
						});
					});
				});
			});
		}else{
			fs.writeFileSync(folder+'/router.js', `module.exports = function(waw) {\n\t// add your router code\n};`, 'utf8');
			let data = `{\n\t"name": "CNAME",\n\t"router": "router.js",\n\t"dependencies": {}\n}`;
			data = data.split('CNAME').join(name.toString().charAt(0).toUpperCase() + name.toString().substr(1).toLowerCase());
			data = data.split('NAME').join(name.toLowerCase());
			fs.writeFileSync(folder+'/part.json', data, 'utf8');
			console.log('Part has been created');
			process.exit(1);
		}
	}
	const parts_renew = function(params){
		let parts = getDirectories(params.waw_root+'/server');
		let counter = 0;
		for (var i = 0; i < parts.length; i++) {
			if (fs.existsSync(parts[i]+'/part.json')) {
				let config = JSON.parse(fs.readFileSync(parts[i]+'/part.json'));
				if(config.git && config.git.repo){
					counter++;
					git_fetch(params.git, parts[i], config.git.repo, config.git.branch||'master', ()=>{
						if(--counter === 0){
							console.log('All global parts has been updated');
							process.exit(1);
						}
					});
				}
			}
		}
		if(!counter){
			console.log('All global parts has been updated');
			process.exit(1);
		}
	}
	const part = function(params){
		if(!params.argv.length){
			console.log('Please provide git command');
			process.exit(1);
		}
		let command = params.argv.shift().toLowerCase();
		if(command == 'new' || command == 'global'){
			return generate(params);
		}
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
			case 'renew':
				return parts_renew(params);
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
	module.exports.pr = parts_renew;
	module.exports.pn = generate;
	module.exports.pg = generate;

	module.exports.renew = function(params){
		git_fetch(params.git, params.waw_root, 'https://github.com/WebArtWork/waw.git', 'dev', ()=>{
			console.log('Framework has been updated');
			process.exit(1);
		});
	};
/*
*	PM2 management
*/
	let pm2;
	const start = function(params){
		if (!fs.existsSync(__dirname+'/node_modules/pm2')) {
			return params.npmi({
				name: 'pm2',
				version: 'latest',
				path: __dirname,
				forceInstall: true,
				npmLoad: {
					loglevel: 'silent'
				}
			}, function(){
				start(params);
			});
		}
		if(!pm2) pm2 = require('pm2');
		pm2.connect(function(err) {
			if (err) {
				console.error(err);
				process.exit(2);
			}
			pm2.start({
				name: params.config.name||process.cwd(),
				script: params.waw_root+'/app.js',
				exec_mode: 'cluster',
				instances: 1,
				max_memory_restart: '800M'
			}, function(err, apps) {
				pm2.disconnect();
				process.exit(2);
			});
		});
	}
	const stop = function(){}
	const restart = function(){}
	module.exports.server = function(params){
		if(!params.argv.length){
			start(params);
			return;
		}
		
	};
/*
*	End of Core Runners
*/