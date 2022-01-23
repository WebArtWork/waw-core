const fs = require('fs');
const readline = require('readline').createInterface({
	input: process.stdin,
	output: process.stdout
});
/*
*	Create new project
*/
	const list = {
		'1) waw Angular': 'https://github.com/WebArtWork/wawNgx.git',
		'2) waw Template': 'https://github.com/WebArtWork/wawTemplate.git',
		'3) waw Server': 'https://github.com/WebArtWork/wawServer.git',
		'4) waw Server + Angular + Template': 'https://github.com/WebArtWork/wawNgxPlatform.git',
	};
	const new_project = function(waw) {
		if(!waw.new_project) waw.new_project={};
		if(!waw.new_project.name){
			if(waw.argv.length){
				if (fs.existsSync(process.cwd()+'/'+waw.argv[0])) {
					console.log('This project already exists in current directory');
					process.exit(0);
				}else{
					waw.new_project.name = waw.argv[0];
				}
			}else{
				return readline.question('Provide name for the project you want to create: ', function(answer){
					if(answer){
						if (fs.existsSync(process.cwd()+'/'+answer)) {
							console.log('This project already exists in current directory');
						}else{
							waw.new_project.name = answer;
						}
					}else{
						console.log('Please type your project name');
					}
					new_project(waw);
				});
			}
		}
		if(!waw.new_project.repo){
			if(waw.argv.length>1){
				waw.new_project.repo = waw.argv[1];
			}else{
				let text = 'Which project you want to start with?', counter=0, repos={};
				for(let key in list){
					repos[++counter] = list[key];
					text += '\n'+key;
				}
				text += '\nChoose number: ';
				return readline.question(text, function(answer){
					if(!answer||!repos[parseInt(answer)]) return new_project();
					waw.new_project.repo = repos[parseInt(answer)];
					new_project(waw);
				});
			}
		}
		let folder = process.cwd()+'/'+waw.new_project.name;
		fs.mkdirSync(folder, { recursive: true });
		let repo = waw.git(folder);
		repo.init(function(){
			repo.addRemote('origin', waw.new_project.repo, function(err){
				repo.fetch('--all', function(err){
					let branch = 'master';
					if(waw.argv.length>2){
						branch = waw.argv[2];
					}
					repo.reset('origin/'+branch, err=>{
						fs.rmdirSync(folder+'/.git', { recursive: true });
						console.log('Your project has been generated successfully');
						process.exit(1);
					});
				});
			});
		});
	};
	module.exports.new = new_project;
	module.exports.n = new_project;
/*
*	Create new module
*/
	const new_module = function(waw) {
		if (!fs.existsSync(process.cwd()+'/config.json')) {
			console.log('You are located not in waw project');
			process.exit(0);
		}
		if(!waw.new_module) waw.new_module={};
		if(!waw.new_module.name){
			if(waw.argv.length){
				if (fs.existsSync(process.cwd()+'/server/'+waw.argv[0].toLowerCase())) {
					console.log('This module already exists in current project');
					process.exit(0);
				}else{
					waw.new_module.name = waw.argv[0];
				}
			}else{
				return readline.question('Provide name for the module you want to create: ', function(answer){
					if(answer){
						if (fs.existsSync(process.cwd()+'/'+answer.toLowerCase())) {
							console.log('This module already exists in current project');
						}else{
							waw.new_module.name = answer;
						}
					}else{
						console.log('Please type your project name');
					}
					new_module(waw);
				});
			}
		}
		let folder = process.cwd()+'/server/'+waw.new_project.name;
		if(waw.argv.length > 1){
			fs.mkdirSync(folder, { recursive: true });
			waw.fetch(folder, waw.argv[1], () => {
				console.log('Module has been created');
				process.exit(1);
			}, waw.argv.length > 2 ? waw.argv[2] : 'master');
		}else{
			fs.mkdirSync(folder, { recursive: true });
			fs.writeFileSync(folder+'/index.js', `module.exports = function(waw) {\n\t// add your router code\n};`, 'utf8');
			let data = `{\n\t"name": "CNAME",\n\t"router": "index.js",\n\t"dependencies": {}\n}`;
			data = data.split('CNAME').join(waw.new_module.name.toString().charAt(0).toUpperCase() + waw.new_module.name.toString().substr(1).toLowerCase());
			data = data.split('NAME').join(waw.new_module.name.toLowerCase());
			fs.writeFileSync(folder+'/part.json', data, 'utf8');
			console.log('Module has been created');
			process.exit(1);
		}
	};
	module.exports.add = new_module;
	module.exports.a = new_module;
/*
*	Version Management
*/
	const version = function(waw){
		let logs = '';
		if (fs.existsSync(waw.waw_root+'/package.json')) {
			try{
				let config = JSON.parse(fs.readFileSync(waw.waw_root+'/package.json'));
				if(config.version){
					logs = 'waw: ' + config.version;
				}else{
					console.log('Missing files, try to reinstall waw framework.');
					process.exit(1);
				}
			}catch(err){
				console.log('Missing files, try to reinstall waw framework.');
				process.exit(1);
			}
		}
		if(waw.modules.length){
			logs += '\nAccesible Modules: ';
			for (var i = 0; i < waw.modules.length; i++) {
				if(i){
					logs += ', '+waw.modules[i].name;
				}else{
					logs += waw.modules[i].name;
				}
			}

		}
		console.log(logs);
		process.exit(1);
	}
	module.exports['--version'] = version;
	module.exports['-v'] = version;
	module.exports.version = version;
	module.exports.v = version;
/*
*	Git Management
*/
	const generate = function(waw){
		if(!waw.argv.length){
			console.log('Please provide module name');
			process.exit(1);
		}
		let name = waw.argv.shift();
		if(waw._modules[name.toLowerCase()]){
			console.log('This module already exists.');
			process.exit(1);
		}
		const global_module = waw.origin_argv[1].toLowerCase() == 'global' || waw.origin_argv[1].toLowerCase() == 'pg';
		if(global_module && !waw.argv.length){
			console.log('To install global module you has to provide repo link.');
			process.exit(1);
		}
		let repo_link;
		if(waw.argv.length){
			repo_link = waw.argv.shift();
		}
		let folder = (global_module&&waw.waw_root||process.cwd())+'/server/'+name;
		fs.mkdirSync(folder, { recursive: true });
		if(repo_link){
			let repo = waw.git(folder);
			repo.init(function(){
				repo.addRemote('origin', repo_link, function(err){
					repo.fetch('--all', function(err){
						let branch = 'master';
						if(waw.argv.length){
							branch = waw.argv.shift();
						}
						repo.reset('origin/'+branch, err=>{
							console.log('Module has been created');
							process.exit(1);
						});
					});
				});
			});
		}else{
			fs.writeFileSync(folder+'/index.js', `module.exports = function(waw) {\n\t// add your router code\n};`, 'utf8');
			let data = `{\n\t"name": "CNAME",\n\t"router": "index.js",\n\t"dependencies": {}\n}`;
			data = data.split('CNAME').join(name.toString().charAt(0).toUpperCase() + name.toString().substr(1).toLowerCase());
			data = data.split('NAME').join(name.toLowerCase());
			fs.writeFileSync(folder+'/part.json', data, 'utf8');
			console.log('Part has been created');
			process.exit(1);
		}
	}
	const modules_renew = function(waw){
		let counter = 0;
		for (var i = 0; i < waw.modules.length; i++) {
			if(!waw.modules[i].git || !waw.modules[i].git.repo) continue;
			counter++;
			waw.fetch(waw.modules[i], waw.modules[i].git.repo, ()=>{
				if (--counter === 0) {
					console.log('All global modules has been updated');
					process.exit(1);
				}
			}, waw.modules[i].git.branch || 'master');
		}
		if(!counter){
			console.log('All global modules has been updated');
			process.exit(1);
		}
	}
	module.exports.renew = modules_renew;
	module.exports.add = generate;
	module.exports.a = generate;
/*
*	PM2 management
*/
	let pm2;
	const install_pm2 = function(waw, callback){
		if(pm2) return callback();
		if (!fs.existsSync(waw.waw_root+'/node_modules/pm2')) {
			return waw.npmi({
				name: 'pm2',
				version: 'latest',
				path: waw.waw_root,
				forceInstall: true,
				npmLoad: {
					loglevel: 'silent'
				}
			}, function(){
				start(waw);
			});
		}
		if(!pm2) pm2 = require(waw.waw_root+'/node_modules/pm2');
		pm2.connect(function(err) {
			if (err) {
				console.error(err);
				process.exit(2);
			}
			if(!waw.config.pm2) waw.config.pm2={};
			callback();
		});
	}
	const start = function(waw){
		install_pm2(waw, function(){
			pm2.start({
				name: waw.config.name||process.cwd(),
				script: waw.waw_root+'/app.js',
				exec_mode: waw.config.pm2.exec_mode||'fork', //default fork
				instances: waw.config.pm2.instances||1,
				max_memory_restart: waw.config.pm2.memory||'800M'
			}, function(err, apps) {
				pm2.disconnect();
				process.exit(2);
			});
		});
	}
	module.exports.start = start;
	const stop = function(waw){
		install_pm2(waw, function(){
			pm2.delete(waw.config.name||process.cwd(), function(err, apps) {
				pm2.disconnect();
				process.exit(2);
			});
		});
	}
	module.exports.stop = stop;
	const restart = function(waw){
		install_pm2(waw, function(){
			pm2.restart(waw.config.name||process.cwd());
		});
	}
	module.exports.restart = restart;
/*
*	End of Core Runners
*/
