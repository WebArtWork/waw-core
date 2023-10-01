const exe = require('child_process').execSync;
const path = require('path');
const fs = require('fs');
const defaults = {
	module: {
		default: __dirname + '/module/default'
	}
}

const repo_list = {
	'1) waw Angular': 'https://github.com/WebArtWork/ngx-default.git',
	'2) waw Template': 'https://github.com/WebArtWork/wjst-default.git',
	'3) waw Server': 'https://github.com/WebArtWork/waw-default.git',
	'4) waw Server + Angular + Template': 'https://github.com/WebArtWork/ngx-platform.git',
	'5) Neryxomka Template': 'https://github.com/WebArtWork/Neryxomka.git',
	'6) Wawify Template': 'https://github.com/WebArtWork/Wawify.git'
};

const css_ngx_list = {
	'1) Basic': 'https://github.com/WebArtWork/ngx-css.git',
	'2) Bootstrap': 'https://github.com/WebArtWork/ngx-cssBootstrap.git',
	'3) Tailwind': 'https://github.com/WebArtWork/ngx-cssTailwind.git',
	'4) Foundation': 'https://github.com/WebArtWork/ngx-cssFoundation.git',
	'5) Bulma': 'https://github.com/WebArtWork/ngx-cssBulma.git',
	'6) Skeleton': 'https://github.com/WebArtWork/ngx-cssSkeleton.git'
};

const css_wjst_list = {
	'1) Basic': 'https://github.com/WebArtWork/wjst-css.git',
	'2) Bootstrap': 'https://github.com/WebArtWork/wjst-cssBootstrap.git',
	'3) Tailwind': 'https://github.com/WebArtWork/wjst-cssTailwind.git',
	'4) Foundation': 'https://github.com/WebArtWork/wjst-cssFoundation.git',
	'5) Bulma': 'https://github.com/WebArtWork/wjst-cssBulma.git',
	'6) Skeleton': 'https://github.com/WebArtWork/wjst-cssSkeleton.git'
};

const rmSyncOptions = {
	recursive: true,
	force: true
};

const gitignore = `node_modules
package-lock.json`;
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
SOFTWARE.`;

module.exports.love = function (waw) {
	console.log('waw Loves you :) ');
	process.exit(1);
};
/*
*	Create new project
*/
	const new_project = function(waw) {
		if (waw.argv[0] === 'new') {
			waw.argv.shift();
		}
		if (!waw.new_project) {
			waw.new_project = {};
		}
		if (!waw.new_project.name) {
			if (waw.argv.length) {
				if (fs.existsSync(process.cwd()+'/'+waw.argv[0])) {
					console.log('This project already exists in current directory');
					process.exit(0);
				}else{
					waw.new_project.name = waw.argv[0];
				}
			} else {
				return waw.readline.question('Provide name for the project you want to create: ', function(answer){
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
		if (!waw.new_project.repo) {
			if (
				waw.argv.length > 1 &&
				waw.argv[1] != Number(waw.argv[1])
			) {
				waw.new_project.repo = waw.argv[1];
			} else {
				let text = 'Which project you want to start with?', counter=0, repos={};
				for(let key in repo_list){
					repos[++counter] = repo_list[key];
					text += '\n'+key;
				}
				if (
					waw.argv.length > 1 &&
					waw.argv[1] == Number(waw.argv[1]) &&
					Object.keys(repos).length >= Number(waw.argv[1])
				) {
					waw.new_project.repo = repos[parseInt(waw.argv[1])];
				} else {
					text += '\nChoose number: ';
					return waw.readline.question(text, function(answer){
						if(!answer||!repos[parseInt(answer)]) return new_project(waw);
						waw.new_project.repo = repos[parseInt(answer)];
						new_project(waw);
					});
				}
			}
		}
		let folder = process.cwd()+'/'+waw.new_project.name;
		fs.mkdirSync(folder, { recursive: true });
		waw.fetch(folder, waw.new_project.repo, () => {
			if (fs.existsSync(folder + '/.git')) {
				fs.rmSync(folder + '/.git', { recursive: true });
			}
			console.log('Your project has been generated successfully');
			process.exit(1);
		}, waw.argv.length > 2 ? waw.argv[2] : 'master');
	};
	module.exports.new = new_project;
	module.exports.n = new_project;

/*
*	Create new project
*/
	const change_css = function(waw) {
		const isAngular = fs.existsSync(
			path.join(
				process.cwd(),
				'angular.json'
			)
		);

		if (
			!isAngular &&
			!fs.existsSync(
				path.join(
					process.cwd(),
					'template.json'
				)
			)
		) {
			console.log('This is not an project with waw css');
			process.exit();
		}

		if (!waw.change_css) {
			waw.change_css = {};
		}

		if (!waw.change_css.repo) {
			const list = isAngular ? css_ngx_list : css_wjst_list;
			let text = 'Which framework you want to use?', counter = 0, repos = {};
			for (let key in list) {
				repos[++counter] = list[key];
				text += '\n' + key;
			}
			text += '\nChoose number: ';
			return waw.readline.question(text, function (answer) {
				if (!answer || !repos[parseInt(answer)]) return change_css(waw);
				waw.change_css.repo = repos[parseInt(answer)];
				change_css(waw);
			});
		}

		const folder = path.join(
			process.cwd(),
			isAngular ? 'src' : 'css',
			'scss'
		);

		fs.rmSync(folder, { recursive: true });
		fs.mkdirSync(folder, { recursive: true });
		waw.fetch(folder, waw.change_css.repo, () => {
			if (fs.existsSync(folder + '/.git')) {
				fs.rmSync(folder + '/.git', { recursive: true });
			}
			console.log('css Framework changed successfully');
			process.exit(1);
		}, waw.argv.length > 1 ? waw.argv[1] : 'master');
	};
	module.exports.css = change_css;
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
*	Modules Management
*/
	const new_module = function (waw) {
		waw.server = typeof waw.server === 'string' ? waw.server : 'server';
		if (!waw.path) {
			if (waw.ensure(process.cwd() + (waw.server ? '/' : ''), waw.server, 'Module already exists', false)) return;
		}
		if (!waw.template) {
			return waw.read_customization(defaults, 'module', () => new_module(waw));
		}
		require(waw.template + '/cli.js')(waw);
	}
	module.exports.add = new_module;
	module.exports.a = new_module;
/*
*	Sync management
*/

const fetch_module = (waw, location, callback) => {
	location = path.normalize(location);
	if (!fs.existsSync(location + '/module.json')) {
		return callback(false);
	}
	let json = waw.readJson(location + '/module.json');
	if (!json.repo) {
		return callback(false);
	}
	waw.fetch(location, json.repo, err => {
		callback();
		// waw.install(waw, location, callback);
	});
};

const update_module = async (waw, module, callback) => {
	const branch = waw.argv.length > 2 ? waw.argv[2] : 'master';

	const location = module.__root;

	const temp = path.join(location, 'node_modules', '.temp');

	const name = path.basename(location);

	fs.rmSync(path.join(location, '.temp'), rmSyncOptions);

	if (!fs.existsSync(path.join(location, '.gitignore'))) {
		fs.writeFileSync(path.join(location, '.gitignore'), gitignore, 'utf8');
	}

	if (!fs.existsSync(path.join(location, 'README.md'))) {
		fs.writeFileSync(path.join(location, 'README.md'), `# waw module ${name}`, 'utf8');
	}

	if (
		!fs.existsSync(path.join(location, 'LICENSE'))
	) {
		fs.writeFileSync(path.join(location, 'LICENSE'), LICENSE.replace('YEAR', YEAR), 'utf8');
	}
	const license = fs.readFileSync(path.join(location, 'LICENSE'), 'utf8');
	if (
		license.startsWith('The MIT License (MIT)') &&
		!license.includes(YEAR)
	) {
		fs.writeFileSync(path.join(location, 'LICENSE'), LICENSE.replace('YEAR', YEAR), 'utf8');
	}

	waw.fetch(temp, module.config.repo, err => {
		if (fs.existsSync(path.join(location, '.git'))) {
			fs.rmSync(path.join(location, '.git'), rmSyncOptions);
		}

		if (!path.join(temp, '.git')) {
			if (fs.existsSync(temp)) {
				fs.rmSync(temp, rmSyncOptions);
			}

			return callback();
		}

		fs.renameSync(
			path.join(temp, '.git'),
			path.join(location, '.git')
		);

		fs.rmSync(temp, rmSyncOptions);

		if (fs.existsSync(path.join(location, '.git'))) {
			const command = `cd ${location} && `;

			exe(command + 'git add --all .');

			try {
				exe(command + 'git commit -m "' + waw.argv[1] + '"');

				exe(command + 'git push origin "' + branch + '"');
			} catch (error) { }

			fs.rmSync(path.join(location, '.git'), rmSyncOptions);
		}

		callback();
	}, branch, false);
}

module.exports.sync = async waw => {
	for (let i = waw.modules.length - 1; i >= 0; i--) {
		waw.modules[i].config = waw.readJson(path.join(waw.modules[i].__root, 'module.json'))
		if (!waw.modules[i].config.repo) {
			waw.modules.splice(i, 1);
		}
	}

	let countdown = waw.modules.length;

     if (!countdown) {
	    console.log('There was no modules to synchronize');
	    process.exit(1);
}

	if (waw.argv.length === 1) {
		for (const module of waw.modules) {
			fetch_module(waw, module.__root, () => {
				if (--countdown === 0) {
					console.log('All modules were synchronized');
					process.exit(1);
				}
			});
		}
	} else if (waw.argv.length > 1) {
		for (const module of waw.modules) {
			update_module(waw, module, () => {
				if (--countdown === 0) {
					console.log('All modules were updated and synchronized');
					process.exit(1);
				}
			});
		}
	}
};
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
