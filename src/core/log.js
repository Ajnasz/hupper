function nullFunction () {}

function createLogger () {
	return new Proxy({enabled: false, logger: console}, {
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
}

const log = createLogger();

export { log, createLogger };
