const { exec } = require("child_process");

module.exports = function (waw) {
	waw.exe = function (command, cb = () => {}) {
		if (!command) return cb();
		exec(command, (err, stdout, stderr) => {
			cb({ err, stdout, stderr });
		});
	};
};
