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
				const changes = createStorageChange(oldValues, values);
				if (typeof callback === 'function') {
					callback(...args);
				}


				if (Object.keys(changes).length > 0) {
					events.dispatch(changes, ns);
				}
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

function createVirtualStorage (storages) {
	const virtualStorage = Object.create(null);
	virtualStorage.onChanged = chromeEvents.create();

	storages.forEach(ns => {
		const localStorageArea = new StorageArea();

		virtualStorage[ns] = localStorageArea;
		attachEventHandler(virtualStorage.local, virtualStorage.onChanged, ns);
	});

	return virtualStorage;
}

function create () {
	return createVirtualStorage(['local']);
}

function createWithSync () {
	return createVirtualStorage(['local', 'sync']);
}

export { create, createWithSync };
