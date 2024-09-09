const { exec } = require('child_process');
const fetch = require("node-fetch");
module.exports = async function (waw) {
	/* General use */
	waw.exe = function (command, cb = () => { }) {
		if (!command) return cb();
		exec(command, (err, stdout, stderr) => {
			cb({ err, stdout, stderr });
		});
	}
	waw.wait = async (time) => {
		return await new Promise((resolve) => setTimeout(resolve, time));
	};

	/* Http Management */
	waw.http = function (hostname, port = 443) {
		const post = (method) => {
			return async function (path, body, callback) {
				try {
					const response = await fetch(
						hostname + ':' + port + path,
						{
							method,
							headers: {
								...this.headers,
								'Content-Type': 'application/json',
							},
							body: JSON.stringify(body)
						}
					);
					if (!response.ok) {
						callback(false);
						return false;
					} else {
						const resp = await response.json();
						callback(resp);
						return resp;
					}
				} catch (error) {
					callback(false);
					return false;
				}
			}
		}
		return {
			headers: {},
			get: async function (path, callback = (resp) => { }) {
				try {
					const response = await fetch(hostname + ':' + port + path, {
						method: 'GET',
						headers: this.headers
					});
					if (!response.ok) {
						callback(false);
						return false;
					} else {
						const contentType = response.headers.get('content-type');
						if (contentType && contentType.includes('application/json')) {
							const resp = await response.json();
							callback(resp);
							return resp;
						} else {
							const resp = await response.text();
							callback(resp);
							return resp;
						}
					}
				} catch (error) {
					callback(false);
					return false;
				}
			},
			post: post('POST'),
			put: post('PUT'),
			patch: post('PATCH'),
			delete: post('DELETE')
		};
	}

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
	//	waw.cache = async (query, exe, bag) => {
	//	if (!data[query]) {
	//		data[query] = await exe();
	//	}
	//	if (bag) {
	//		if (!bags[bag]) {
	//		bags[bag] = [];
	//		}
	//		if (bags[bag].indexOf(query) === -1) {
	//			bags[bag].push(query);
	//		}
	//	}
	//	return data[query];
	// }

	/* End Of Core */
}
