function nullFunction () {}

let log = new Proxy({enabled: false, logger: console}, {
	get (target, name) {
		if (target.logger && target.logger[name]) {
			if (target.enabled) {
				return target.logger && target.logger[name].bind(target);
			}

			return nullFunction;
		}

		return;
	}
});

export { log };
