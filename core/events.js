function createEmitter () {
	let events;

	function createEvents () {
		events = new Map();
	}

	createEvents();

	return {
		off (name, cb) {
			const argLen = arguments.length;
			let listeners;

			switch (argLen) {
				case 0:
					createEvents();
					break;
				case 1:
					events.delete(name);
					break;
				case 2:
					listeners = events.get(name);
					if (!listeners) {
						return;
					}

					for (var i = 0, el = listeners.length; i < el; i++) {
						if (listeners[i] === cb) {
							listeners[i] = null;
						}
					}

					events.set(name, listeners.filter(l => typeof l === 'function'));
					break;
				default:
					throw new Error('Invalid number of arguments');
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
			if (events.has('*')) {
				events.get('*').forEach((cb) => cb.call(null, args, name));
			}

			if (events.has(name)) {
				events.get(name).forEach((cb) => cb.call(null, args, name));
			}
		},

		once (name, cb) {
			const that = this;

			this.on(name, function callback (...args) {
				cb(...args);
				that.off(name, callback);
			});
		}
	};
}

export { createEmitter };
