let log = new Proxy({}, {
	get: function (target, name) {
		return function () {};
		if (console[name]) {
			return console[name].bind(console);
		}

		return;
	}
});

export {log};
