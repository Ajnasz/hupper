import * as chromeEvents from './chromeEvents';
import { StorageArea } from './StorageArea';

function createStorageChange (oldValues, newValues) {
	return Object.keys(newValues).reduce((acc, prop) => {
		if (oldValues[prop] !== newValues[prop]) {
			acc[prop] = {
				newValue: newValues[prop]
			};

			if (prop in oldValues) {
				acc[prop].oldValue = oldValues[prop];
			}
		}
		return acc;
	}, {});
}

function createRemoveStorageChange (oldValues, keys) {
	return keys.reduce((acc, key) => {
		acc[key] = {
			oldValue: void(0)
		};

		if (key in oldValues) {
			acc[key].oldValue = oldValues[key];
		}

		return acc;
	}, {});
}

function attachEventHandler (storageArea, events, ns) {
	const { set, get, clear, remove } = storageArea;

	storageArea.set = function (values, callback) {
		get(Object.keys(values), (oldValues) => {
			set(values, (...args) => {
				if (typeof callback === 'function') {
					callback(...args);
				}
				events.dispatch(createStorageChange(oldValues, values), ns);
			});
		});
	};

	storageArea.remove = function (keys, callback) {
		get(keys, (oldValues) => {
			remove(keys, (...args) => {
				if (typeof callback === 'function') {
					callback(...args);
				}

				if (typeof keys === 'string') {
					keys = [keys];
				}

				events.dispatch(createRemoveStorageChange(oldValues, keys), ns);
			});
		});
	};

	storageArea.clear = function (callback) {
		get((oldValues) => {
			clear((...args) => {
				if (typeof callback === 'function') {
					callback(...args);
				}
				events.dispatch(createRemoveStorageChange(oldValues, Object.keys(oldValues)), ns);
			});
		});
	};
}

function create () {
	let virtualStorage = Object.create(null);
	virtualStorage.onChanged = chromeEvents.create();

	['local'].forEach(ns => {
		let localStorageArea = new StorageArea();

		virtualStorage.local = localStorageArea;
		attachEventHandler(virtualStorage.local, virtualStorage.onChanged, ns);
	});

	return virtualStorage;
}

export { create };
