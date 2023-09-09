class Dom {
	template(elementId, variables = {}) {
		const sourceElement = document.getElementById('template-'+ elementId);

		if (sourceElement) {
			let code = sourceElement.innerHTML;

			for (const variable in variables) {
				code = code.split('{' + variable + '}').join(variables[variable]);
			}

			return code;
		} else {
			console.error(`Element with ID '${elementId}' not found.`);
		}
	}

	replace(elementId, childHtml) {
		const parentElement = document.getElementById(elementId);

		if (parentElement) {
			parentElement.innerHTML = childHtml;
		} else {
			console.error(`Element with ID '${elementId}' not found.`);
		}
	}

	add(elementId, childHtml) {
		const parentElement = document.getElementById(elementId);

		if (parentElement) {
			const childElement = document.createElement('div');
			childElement.innerHTML = childHtml;
			parentElement.appendChild(childElement);
		} else {
			console.error(`Element with ID '${elementId}' not found.`);
		}
	}

	clear(elementId) {
		const element = document.getElementById(elementId);

		if (element) {
			element.innerHTML = '';
		} else {
			console.error(`Element with ID ${elementId} not found.`);
		}
	}

	remove(elementId) {
		const element = document.getElementById(elementId);

		if (element) {
			element.remove();
		} else {
			console.error(`Element with ID ${elementId} not found.`);
		}
	}

		click(elementId, callback) {
		const element = document.getElementById(elementId);

		if (!element) {
			console.error(`Element with ID '${elementId}' not found.`);
			return;
		}

		// Attach the click event listener
		element.addEventListener('click', callback);
	}

		value(elementId) {
		const element = document.getElementById(elementId);

		if (element) {
			return element.value;
		} else {
			console.error(`Element with ID '${elementId}' not found.`);
			return '';
		}
	}
		enter(elementId, callback) {
		const inputElement = document.getElementById(elementId);

		if (!inputElement) {
			console.error(`Element with ID '${elementId}' not found.`);
			return;
		}

		inputElement.addEventListener('keypress', (event) => {
			if (event.key === 'Enter') {
				callback(event);
			}
		});
	}
	exists(elementId) {
		return !!document.getElementById(elementId);
	}
}

export default new Dom();
