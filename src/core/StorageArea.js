// Based on
// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/storage/StorageArea

function IncorrectArgumentTypeError () {
	this.name = 'IncorrectArgumentTypeError';
	this.message = 'Incorrect argument types';
	this.stack = (new Error()).stack;
}

IncorrectArgumentTypeError.prototype = Object.create(Error.prototype);
IncorrectArgumentTypeError.constructor = IncorrectArgumentTypeError;

function clearSetValues (values) {
	return JSON.parse(JSON.stringify(values));
}

function StorageArea () {
	var storage = new Map();

	function mapToObject (map) {
		let output = {};

		map.forEach((value, key) => output[key] = value);

		return output;
	}

	return {
		get (keys, callback) {
			if (arguments.length === 1) {
				callback = keys;
				callback(mapToObject(storage));
				return;
			}

			if (typeof keys === 'string') {
				keys = [keys];
			}

			if (Array.isArray(keys)) {
				if (keys.length === 0) {
					callback({});
					return;
				}

				let result = keys.reduce((acc, key) => {
					if (storage.has(key)) {
						acc[key] = storage.get(key);
					}

					return acc;
				}, {});

				callback(result);
			}
		},

		getBytesInUse () {
		},

		set (values, callback) {
			if (typeof values !== 'object' || values === null) {
				throw new IncorrectArgumentTypeError();
			}

			let clearValues = clearSetValues(values);

			Object.keys(clearValues).forEach(key => storage.set(key, clearValues[key]));

			if (typeof callback === 'function') {
				callback();
			}
		},

		remove (keys, callback) {
			if (typeof keys === 'string') {
				keys = [keys];
			}

			keys
				.filter(key => storage.has(key))
				.forEach(key => storage.delete(key));

			if (typeof callback === 'function') {
				callback();
			}
		},

		clear (callback) {
			storage.clear();

			if (typeof callback === 'function') {
				callback();
			}
		}
	};
}

export { StorageArea };
