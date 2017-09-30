function prefToSync (storage, prefName, prefValue) {
	return new Promise(resolve => {
		storage.sync.get(prefName, (result) => {
			if (!(prefName in result)) {
				const obj = {};
				obj[prefName] = prefValue;
				storage.sync.set(obj, resolve);
			} else {
				resolve();
			}
		});
	}).then(() => storage.local.remove(prefName));
}

function migratePrefsToSync (storage) {
	if (storage.sync) {
		return new Promise((resolve) => {
			storage.local.get(resolve);
		}).then(result => {
			return Promise.all(Object.keys(result).map((name) => {
				return prefToSync(storage, name, result[name]);
			}));
		});
	}

	return Promise.resolve(null);
}


function updater (storage) {
	return migratePrefsToSync(storage);
}

export default updater;
