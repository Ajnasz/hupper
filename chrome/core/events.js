function createEmitter () {
	var events = new Map();

	return {
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
};

export { createEmitter };
