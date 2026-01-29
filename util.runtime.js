module.exports = function (waw) {
	// wait
	waw.wait = async (time) => {
		return await new Promise((resolve) => setTimeout(resolve, time));
	};

	// http
	waw.http = function (hostname, port = 443) {
		const post = (method) => {
			return async function (path, body, callback) {
				try {
					const response = await fetch(hostname + ":" + port + path, {
						method,
						headers: {
							...this.headers,
							"Content-Type": "application/json",
						},
						body: JSON.stringify(body),
					});

					if (!response.ok) {
						callback(false);
						return false;
					}

					const resp = await response.json();
					callback(resp);
					return resp;
				} catch (error) {
					callback(false);
					return false;
				}
			};
		};

		return {
			headers: {},
			get: async function (path, callback = (resp) => {}) {
				try {
					const response = await fetch(hostname + ":" + port + path, {
						method: "GET",
						headers: this.headers,
					});

					if (!response.ok) {
						callback(false);
						return false;
					}

					const contentType = response.headers.get("content-type");
					if (contentType && contentType.includes("application/json")) {
						const resp = await response.json();
						callback(resp);
						return resp;
					} else {
						const resp = await response.text();
						callback(resp);
						return resp;
					}
				} catch (error) {
					callback(false);
					return false;
				}
			},
			post: post("POST"),
			put: post("PUT"),
			patch: post("PATCH"),
			delete: post("DELETE"),
		};
	};
};
