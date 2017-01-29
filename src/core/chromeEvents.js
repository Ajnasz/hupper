function create () {
	let listeners = [];

	function hasListener (listener) {
		return listeners.some(l => l === listener);
	}

	function removeListener (listener) {
		listeners = listeners.filter(l => l !== listener);
	}

	function addListener (callback) {
		if (typeof callback !== 'function') {
			throw new Error(`Invalid listener for ${this.name}`);
		}

		listeners.push(callback);
	}
	function dispatch (...args) {
		listeners.forEach(listener => listener(...args));
	}

	return {
		name: 'Chrome Events',
		addListener,
		removeListener,
		hasListener,
		dispatch
	};
}

export { create };
