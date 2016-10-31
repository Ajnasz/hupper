function createEmitter () {
	var events = new Map();

	return {
		off: function (name, cb) {
			if (!events.has(name) || events.get(name).length === 0) {
				return;
			}

			if (arguments.length === 2) {
				let listeners = events.get(name);

				for (var i = 0, el = listeners.length; i < el; i++) {
					if (listeners[i] === cb) {
						listeners[i] = null;
					}
				}

				events.set(listeners.filter(l => typeof l === 'function'));
			} else {
				events.delete(name);
			}
		},
		on: function (name, cb) {
			if (!events.has(name)) {
				events.set(name, []);
			}

			events.get(name).push(cb);
		},

		emit: function (name, args) {
			if (events.has(name)) {
				events.get(name).forEach((cb) => {
					cb.call(null, args);
				});
			}
		}
	};
}

export { createEmitter };
