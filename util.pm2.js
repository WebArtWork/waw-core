// server/core/util.pm2.js

const pm2 = require("pm2");

const start = (waw) => {
	pm2.connect((err) => {
		if (err) {
			console.error("PM2 connect error:", err);
			process.exit(2);
		}

		waw.config.pm2 = waw.config.pm2 || {};

		pm2.start(
			{
				name: waw.config.name || process.cwd(),
				script: waw.waw_root + "/app.js",
				exec_mode: waw.config.pm2.exec_mode || "fork", // default fork
				instances: waw.config.pm2.instances || 1,
				max_memory_restart: waw.config.pm2.memory || "800M",
			},
			(err) => {
				pm2.disconnect();

				if (err) {
					console.error("PM2 start error:", err);
					process.exit(2);
				}
			}
		);

		setTimeout(() => {
			process.exit();
		}, 1000);
	});
};

const stop = (waw) => {
	pm2.connect((err) => {
		if (err) {
			console.error("PM2 connect error:", err);
			process.exit(2);
		}

		pm2.delete(waw.config.name || process.cwd(), (err) => {
			pm2.disconnect();

			if (err) {
				console.error("PM2 stop error:", err);
				process.exit(2);
			}
		});

		setTimeout(() => {
			process.exit();
		}, 1000);
	});
};

const restart = (waw) => {
	pm2.connect((err) => {
		if (err) {
			console.error("PM2 connect error:", err);
			process.exit(2);
		}

		pm2.restart(waw.config.name || process.cwd(), (err) => {
			pm2.disconnect();

			if (err) {
				console.error("PM2 restart error:", err);
				process.exit(2);
			}
		});

		setTimeout(() => {
			process.exit();
		}, 1000);
	});
};

module.exports = {
	start,
	stop,
	restart,
};
