const path = require("path");
const fs = require("fs");

const css_ngx_list = {
	"1) Basic": "https://github.com/WebArtWork/ngx-css.git",
	"2) Bootstrap": "https://github.com/WebArtWork/ngx-cssBootstrap.git",
	"3) Tailwind": "https://github.com/WebArtWork/ngx-cssTailwind.git",
	"4) Foundation": "https://github.com/WebArtWork/ngx-cssFoundation.git",
	"5) Bulma": "https://github.com/WebArtWork/ngx-cssBulma.git",
	"6) Skeleton": "https://github.com/WebArtWork/ngx-cssSkeleton.git",
};

const css_react_list = {
	"1) Basic": "https://github.com/WebArtWork/react-css.git",
	"2) Bootstrap": "https://github.com/WebArtWork/react-cssBootstrap.git",
	"3) Tailwind": "https://github.com/WebArtWork/react-cssTailwind.git",
	"4) Foundation": "https://github.com/WebArtWork/react-cssFoundation.git",
	"5) Bulma": "https://github.com/WebArtWork/react-cssBulma.git",
	"6) Skeleton": "https://github.com/WebArtWork/react-cssSkeleton.git",
};

const css_vue_list = {
	"1) Basic": "https://github.com/WebArtWork/vue-css.git",
	"2) Bootstrap": "https://github.com/WebArtWork/vue-cssBootstrap.git",
	"3) Tailwind": "https://github.com/WebArtWork/vue-cssTailwind.git",
	"4) Foundation": "https://github.com/WebArtWork/vue-cssFoundation.git",
	"5) Bulma": "https://github.com/WebArtWork/vue-cssBulma.git",
	"6) Skeleton": "https://github.com/WebArtWork/vue-cssSkeleton.git",
};

const css_wjst_list = {
	"1) Basic": "https://github.com/WebArtWork/wjst-css.git",
	"2) Bootstrap": "https://github.com/WebArtWork/wjst-cssBootstrap.git",
	"3) Tailwind": "https://github.com/WebArtWork/wjst-cssTailwind.git",
	"4) Foundation": "https://github.com/WebArtWork/wjst-cssFoundation.git",
	"5) Bulma": "https://github.com/WebArtWork/wjst-cssBulma.git",
	"6) Skeleton": "https://github.com/WebArtWork/wjst-cssSkeleton.git",
};

const ensureWjstConfig = () => {
	// Keep original behavior: if template.json exists but wjst.json missing -> copy
	const templateJson = path.join(process.cwd(), "template.json");
	const wjstJson = path.join(process.cwd(), "wjst.json");

	if (fs.existsSync(templateJson) && !fs.existsSync(wjstJson)) {
		fs.copyFileSync(templateJson, wjstJson);
	}
};

const detectProjectType = () => {
	const cwd = process.cwd();
	return {
		isAngular: fs.existsSync(path.join(cwd, "angular.json")),
		isReact: fs.existsSync(path.join(cwd, "react.json")),
		isVue: fs.existsSync(path.join(cwd, "vue.json")),
		isWjst:
			fs.existsSync(path.join(cwd, "template.json")) ||
			fs.existsSync(path.join(cwd, "wjst.json")),
	};
};

/*
 *	Update css folder
 */
const change_css = function (waw) {
	ensureWjstConfig();
	const { isAngular, isReact, isVue, isWjst } = detectProjectType();

	if (!isAngular && !isReact && !isVue && !isWjst) {
		console.log("This is not an project with waw css");
		process.exit();
	}

	if (!waw.change_css) {
		waw.change_css = {};
	}

	if (!waw.change_css.repo) {
		const list = isAngular
			? css_ngx_list
			: isReact
			? css_react_list
			: isVue
			? css_vue_list
			: css_wjst_list;

		let text = "Which framework you want to use?",
			counter = 0,
			repos = {};

		for (let key in list) {
			repos[++counter] = list[key];
			text += "\n" + key;
		}

		text += "\nChoose number: ";

		return waw.readline.question(text, function (answer) {
			if (!answer || !repos[parseInt(answer)]) return change_css(waw);
			waw.change_css.repo = repos[parseInt(answer)];
			change_css(waw);
		});
	}

	const folder = path.join(
		process.cwd(),
		isAngular || isReact || isVue ? "src" : "css",
		"scss"
	);

	fs.rmSync(folder, { recursive: true, force: true });
	fs.mkdirSync(folder, { recursive: true });

	waw.fetch(
		folder,
		waw.change_css.repo,
		() => {
			if (fs.existsSync(folder + "/.git")) {
				fs.rmSync(folder + "/.git", { recursive: true });
			}
			console.log("css Framework changed successfully");
			process.exit(1);
		},
		waw.argv.length > 1 ? waw.argv[1] : "master"
	);
};

module.exports = change_css;
