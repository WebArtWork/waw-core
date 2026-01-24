module.exports = async function (waw) {
	require("./util.exe")(waw);

	require("./util.wait")(waw);

	require("./util.http")(waw);

	require("./util.cache")(waw);
};
