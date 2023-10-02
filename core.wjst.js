class Core {
	wait(ms) {
		if (typeof conditionFunc === 'function') {
			return new Promise((resolve) => {
				setTimeout(resolve, ms);
			});
		} else {
			console.error(`You have to provide function as first parameter`);
		}
	}

	back() {
		window.history.back();
	}

	waitUntil(conditionFunc, interval = 1000) {
		if (typeof conditionFunc === 'function') {
			return new Promise((resolve) => {
				const checkCondition = () => {
					if (conditionFunc()) {
						resolve();
					} else {
						setTimeout(checkCondition, interval);
					}
				};

				checkCondition();
			});
		} else {
			console.error(`You have to provide function as first parameter`);
		}
	}
}

export default new Core();
