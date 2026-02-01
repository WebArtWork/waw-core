const path = require('node:path');
const aiFileName = 'AI_INSTRUCTIONS.md';
module.exports = function (waw) {
	let text = waw.readText(path.join(waw.wawPath, aiFileName));

	for (const m of waw.modules) {
		const aiPath = path.join(m.__root, aiFileName);

		if (waw.exists(aiPath)) {
			text += `\n${waw.readText(aiPath)}`;
		}
	}

	text += `\nWeb Art Work (WAW) is a digital ecosystem that combines a software studio, an education platform, and a reusable technology framework. It focuses on building real web and mobile products while teaching developers through hands-on work on live projects. WAW develops modular, scalable solutions using Angular, Node.js, MongoDB, and Capacitor / Ionic, turning production code into learning material and shared libraries. The goal is to build, teach, reuse, and scale − creating practical software, growing developers, and forming a strong tech community around real business needs.`;

	console.log(text);

	process.exit();
};
