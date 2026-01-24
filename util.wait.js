module.exports = function (waw) {
	waw.wait = async (time) => {
		return await new Promise((resolve) => setTimeout(resolve, time));
	};
};
