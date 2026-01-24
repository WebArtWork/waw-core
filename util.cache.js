) => {
		delete data[query];
	};

	waw.clearBag = (bag) => {
		for (const query of bags[bag]) {
			waw.clearCache(query);
		}
	};

	// Keep old commented cache implementation here if you want:
	// waw.cache = async (query, exe, bag) => { ... }
};
