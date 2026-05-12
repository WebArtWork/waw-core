const { execSync } = require('node:child_process');
const { mkdir } = require('node:fs/promises');
const path = require('node:path');

const MAX_IMAGE_SIZE = 512;

module.exports = function asset(waw) {
	run(waw).catch((error) => {
		console.error(error.message);
		process.exitCode = 1;
	});
};

async function run(waw) {
	const [, imageUrl, destination] = waw.argv;

	if (!imageUrl || !destination) {
		throw new Error('Usage: waw asset <image-url> <output-path>');
	}

	const url = new URL(imageUrl);
	const sharp = loadSharp();
	const outputPath = resolveOutputPath(waw.projectPath, destination);
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Image download failed with status ${response.status} ${response.statusText}.`);
	}

	const sourceBuffer = Buffer.from(await response.arrayBuffer());

	await mkdir(path.dirname(outputPath), { recursive: true });
	await sharp(sourceBuffer)
		.resize({
			width: MAX_IMAGE_SIZE,
			height: MAX_IMAGE_SIZE,
			fit: 'inside',
			withoutEnlargement: true,
		})
		.webp()
		.toFile(outputPath);

	console.log(`Saved ${outputPath}`);
}

function resolveOutputPath(projectPath, destination) {
	const requestedPath = path.resolve(projectPath, destination);
	return requestedPath.toLowerCase().endsWith('.webp')
		? requestedPath
		: `${requestedPath}.webp`;
}

function loadSharp() {
	try {
		return require('sharp');
	} catch (localError) {
		try {
			const globalModulesPath = execSync('npm root -g', {
				encoding: 'utf8',
				stdio: ['ignore', 'pipe', 'ignore'],
			}).trim();

			return require(path.join(globalModulesPath, 'sharp'));
		} catch (globalError) {
			throw new Error(
				'Unable to load sharp. Install it locally or globally before running this command.',
				{ cause: globalError },
			);
		}
	}
}
