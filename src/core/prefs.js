import * as func from '../core/func';
import { log } from './log';
import { createEmitter } from './events';

import pref from './pref';
import storage from './storage';
import defaultPrefs from './defaultPrefs';

function getStorageArea () {
	return storage.sync || storage.local;
}

function createDefaultPrefs () {
	return Promise.all(defaultPrefs.map((pref) => {
		return new Promise(resolve => {
			getStorageArea().get(pref.name, result => {
				if (pref.name in result) {
					resolve(null);
				} else {
					// getStorageArea().set(value);
					resolve([pref.name, pref.value]);
				}
			});
		});
	})).then(values => {
		let saveObj = values.reduce((prev, curr) => {
			if (curr !== null) {
				let [name, value] = curr;
				if (typeof value === 'undefined') {
					value = ':noSuchValue';
				}
				prev[name] = value;
			}
			return prev;
		}, {});

		return new Promise(resolve => getStorageArea().set(saveObj, () => resolve()));
	});
	/* */
}

let events = createEmitter();

function validateType (prefType, value) {
	let isValid = false;
	let actualType = Object.prototype.toString.call(value);

	switch (prefType) {

		case 'array':
			isValid = actualType === '[object Array]';
			break;

		case 'string':
			isValid = actualType === '[object String]';
			break;

		case 'bool':
			isValid = actualType === '[object Boolean]';
			break;

		case 'integer':
			isValid = actualType === '[object Number]';
			break;

		case 'color':
			isValid = typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
			break;

		default:
			isValid = true;
			log.info('Unknown type %s', prefType);
			break;

	}

	return isValid;
}

function findPref (pref) {
	return new Promise(function (resolve) {
		getStorageArea().get(pref, function (results) {
			if (typeof results[pref] !== 'undefined') {
				resolve(results[pref]);
			} else {
				resolve(null);
			}
		});
	});
}

function savePref (pref, value) {
	return new Promise(function (resolve, reject) {
		let item = func.first(defaultPrefs, (item) => {
			return item.name === pref;
		});

		if (item) {
			if (validateType(item.type, value)) {
				let newValue = Object.create(null);
				newValue[pref] = value;
				getStorageArea().set(newValue);
				resolve(newValue);
			} else {
				reject(new Error(`Pref: ${pref} value is not valid type for: ${item.type}`));
			}
		} else {
			reject(new Error(`Pref: ${pref} not found`));
		}
	});
}

var chromePrefs = Object.assign(pref, {
	getStorage () {
		return storage;
	},

	clear () {
		return new Promise((resolve, reject) => {
			getStorageArea().clear(() => createDefaultPrefs().then(resolve).catch(reject));
		});
	},

	setPref (pref, value) {
		return savePref(pref, value);
	},

	getPref (pref) {
		return findPref(pref);
	},

	getAllPrefs () {
		return Promise.all(defaultPrefs.map((pref) => {
			return findPref(pref.name).then((value) => {
				let output = Object.create(null);

				output.name = pref.name;
				output.title = pref.title;
				output.type = pref.type;
				output.hidden = pref.hidden;
				output.group = pref.group;
				output.value = value;

				return Promise.resolve(output);
			});
		}));
	},
	on: events.on,
	events
});

storage.onChanged.addListener(function (changes) {
	Object.keys(changes).forEach(name => {
		chromePrefs.getPref(name).then((value) => {
			events.emit(name, value);
		});
	});
});

chromePrefs.on('logenabled', enabled => {
	log.enabled = enabled;
});

export { chromePrefs as prefs, createDefaultPrefs };
