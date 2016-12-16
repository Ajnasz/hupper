function createEmitter () {
	var events = new Map();

	return {
		off (name, cb) {
			if (!events.has(name) || events.get(name).length === 0) {
				return;
			}

			let argLen = arguments.length;

			if (argLen === 1) {
				events.delete(name);
			} else if (argLen > 1) {
				let listeners = events.get(name);

				for (var i = 0, el = listeners.length; i < el; i++) {
					if (listeners[i] === cb) {
						listeners[i] = null;
					}
				}

				events.set(name, listeners.filter(l => typeof l === 'function'));
			}
		},

		on (name, cb) {
			if (typeof cb !== 'function') {
				return;
			}

			if (!events.has(name)) {
				events.set(name, []);
			}

			events.get(name).push(cb);
		},

		emit (name, args) {
			if (events.has(name)) {
				events.get(name).forEach((cb) => cb.call(null, args));
			}
		}
	};
}

export { createEmitter };
