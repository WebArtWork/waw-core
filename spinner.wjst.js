class Spinner {
	ids = [];

	show(name = 'spinner', obj = {}) {
		const id = 'spinner_' + Date.now();

		this.ids.push(id);

		const template = Dom.template(name, obj);

		if (template) {
			const childElement = document.createElement("div");

			childElement.innerHTML = childHtml;

			childElement.id = id;

			parentElement.appendChild();

			Dom.addToBody(childElement);
		} else {
			Dom.addToBody(`<div id="${id}" style="position: fixed; width: 100%; height: 100%; background: white; left:0; top:0"></div>`);
		}

		return {
			close: ()=>{
				Dom.remove(id);
			},
			id
		};
	}

	close() {
		for (const id of this.ids) {
			Dom.remove(id);
		}

		this.ids = [];
	}
}
