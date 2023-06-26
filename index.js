const { exec } = require('child_process');
const https = require('https');
const fs = require('fs');
const { Server } = require('http');
module.exports = async function(waw){
	/* General use */
		waw.exe = function(command, cb=()=>{}){
			if(!command) return cb();
			exec(command, (err, stdout, stderr) => {
				cb({err, stdout, stderr});
			});
		}
		waw.wait = async (time) => {
			return await new Promise((resolve) => setTimeout(resolve, time));
		};
	/* Cache Management */
		const data = {};
		const bags = {};
		waw.clearCache = (query) => {
			delete data[query];
		}
		waw.clearBag = (bag) => {
			for (const query of bags[bag]) {
				waw.clearCache(query);
			}
		}
		waw.cache = async (query, exe, bag) => {
			if (!data[query]) {
				data[query] = await exe();
			}
			if (bag) {
				if (!bags[bag]) {
					bags[bag] = [];
				}
				if (bags[bag].indexOf(query) === -1) {
					bags[bag].push(query);
				}
			}
			return data[query];
		}
	/* Http Management */
		waw.http = function(hostname, port = 443){
			const post = function(method){
				return function (path, body, callback) {
					const data = new TextEncoder().encode(JSON.stringify(body));
					const req = https.request({
						hostname, port, path, method, headers: {
							'Content-Type': 'application/json',
							'Content-Length': data.length
						}
					}, res => {
						res.on('data', callback);
					});
					req.on('error', error => {});
					req.write(data);
					req.end();
				}
			}
			return {
				get: function(path, callback){
					const req = https.request({
						hostname, port, path, method: 'GET'
					}, res => {
						res.on('data', callback);
					});
					req.on('error', error => {});
					req.end();
				},
				post: post('POST'),
				put: post('PUT'),
				patch: post('PATCH'),
				delete: post('DELETE')
			};
		}
	/* End Of Core */
}
