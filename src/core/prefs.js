/* global chrome */

import { prefs } from './pref';
import * as func from '../core/func';
import { log } from './log';

const defaultPrefs = Object.freeze([

	{
		'name': 'setunlimitedlinks',
		// 'title': 'Show as many comments as possible on a page',
		'title': 'A lehető legtöbb hozzászólás mutatása',
		'type': 'bool',
		'value': true,
		'group': 'comments'
	},

	{
		'name': 'replacenewcommenttext',
		// 'title': 'Replace the "új" text of new comments to a better searchable one',
		'title': 'Olvasatlan hozzászólásoknál az "új" szöveg lecserélése valami jobban kereshetőre',
		'type': 'bool',
		'value': true,
		'group': 'comments'
	},

	{
		'name': 'newcommenttext',
		// 'title': 'The text to show instead of \"új\"',
		'title': 'Szöveg az új hozzászólásokban "új" helyett',
		'type': 'string',
		'value': '[new]',
		'group': 'comments'
	},

	{
		'name': 'filtertrolls',
		// 'title': 'Enable trollfilter',
		'title': 'Trollszűrő engedélyezése',
		'type': 'bool',
		'value': true,
		'group': 'comments'
	},

	{
		'name': 'edittrolls',
		// 'title': 'Edit trolls',
		'title': 'Trollok szerkesztése',
		'label': 'Click to edit trolls',
		'type': 'control',
		'group': 'comments'
	},

	{
		'name': 'trolls',
		// 'title': 'List of trolls',
		'title': 'Trollok listája',
		'type': 'array',
		'value': [],
		'hidden': true,
		'group': 'comments'
	},

	{
		'name': 'huppercolor',
		// 'title': 'Default color of highlighted user\'s comment header',
		'title': 'Kiemelt felhasználók alapértelmezett színe',
		'type': 'color',
		'value': '#B5D7BE',
		'group': 'comments'
	},

	{
		'name': 'edithighlightusers',
		// 'title': 'Edit highlighted users',
		'title': 'Kiemelt felhasználók szerkesztése',
		'label': 'Click to edit highlighted users',
		'type': 'control',
		'group': 'comments'
	},

	{
		'name': 'highlightusers',
		// 'title': 'Highlight comments of the users',
		'title': 'Kiemelt felhasználók listája',
		'type': 'array',
		'value': [
			{name: 'username', color: '#fff999'},
			{name: 'username2', color: '#999fff'}
		],
		'hidden': true,
		'group': 'comments'
	},

	{
		'name': 'hidetaxonomy',
		// 'title': 'Hidden article types',
		'title': 'Rejtett sikkek listája',
		'type': 'array',
		'value': [],
		'hidden': true,
		'group': 'articles'
	},

	{
		'name': 'edithidetaxonomy',
		// 'title': 'Edit hidden article types',
		'title': 'Rejtett cikkek szerkesztése',
		'type': 'control',
		'group': 'articles'
	},

	{
		'name': 'blocks',
		// 'title': 'Block settings',
		'title': 'Block beállítások',
		'type': 'array',
		'value': [],
		'hidden': true,
		'group': 'blocks'
	},
	{
		'name': 'parseblocks',
		// 'title': 'Parse blocks',
		'title': 'Blokkok funkciók engedélyezése',
		'type': 'bool',
		'value': true,
		'group': 'blocks'

	},

	{
		'name': 'style_wider_sidebar',
		// 'title': 'Width of sidebars',
		'title': 'Oldalsó oszlopok szélessége',
		'type': 'integer',
		'value': 0,
		'group': 'styles'
	},

	{
		'name': 'style_min_fontsize',
		// 'title': 'Minimum font size',
		'title': 'Minimum betűméret',
		'type': 'integer',
		'value': 0,
		'group': 'styles'
	},

	{
		'name': 'style_accessibility',
		// 'title': 'Load accessibility styles',
		'title': 'Használatot segítő stílusok betöltése',
		'type': 'bool',
		'value': true,
		'group': 'styles'
	},

	{
		'name': 'style_hide_left_sidebar',
		// 'title': 'Hide left sidebar',
		'title': 'Bal oldali oszlop elrejtése',
		'type': 'bool',
		'value': false,
		'group': 'styles'
	},

	{
		'name': 'style_hide_right_sidebar',
		// 'title': 'Hide right sidebar',
		'title': 'Jobb oldali oszlop elrejtése',
		'type': 'bool',
		'value': false,
		'group': 'styles'
	},

	{
		'name': 'hideboringcomments',
		// 'title': 'Hide boring comments',
		'title': 'Unalmas hozzászólások elrejtése',
		'type': 'bool',
		'value': true,
		'group': 'comments'
	},

	{
		'name': 'boringcommentcontents',
		// 'title': 'Regular expression to identify boring comments',
		'title': 'Reguláris kifejezés az unalmas hozzászólások megtalálásához',
		'type': 'string',
		'value': '^([-_.]|[-+]1|sub|subscribe)$',
		'group': 'comments'
	}
]);

function storage () {
	return chrome.storage.sync || chrome.storage.local;
}

function prefToSync (prefName, prefValue) {
	return new Promise(resolve => {
		chrome.storage.sync.get(prefName, (result) => {
			if (!(prefName in result)) {
				let obj = {};
				obj[prefName] = prefValue;
				chrome.storage.sync.set(obj, resolve);
			} else {
				resolve();
			}
		});
	}).then(() => chrome.storage.local.remove(prefName));
}

function migratePrefsToSync () {
	if (chrome.storage.sync) {
		return new Promise((resolve) => {
			chrome.storage.local.get(resolve);
		}).then(result => {
			return Promise.all(Object.keys(result).map((name) => {
				return prefToSync(name, result[name]);
			}));
		});
	}

	return Promise.resolve(null);
}

function createDefaultPrefs () {
	return Promise.all(defaultPrefs.map((pref) => {
		return new Promise(resolve => {
			storage().get(pref.name, result => {
				if (pref.name in result) {
					resolve(null);
				} else {
					// storage().set(value);
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

		return new Promise(resolve => storage().set(saveObj, () => resolve()));
	});
	/* */
}

let events = (function () {
	let listeners = new Map();

	return {
		on (name, cb) {
			if (!listeners.has(name)) {
				listeners.set(name, []);
			}

			listeners.get(name).push(cb);
		},

		off (name, cb) {
			if (listeners.get(name)) {
				for (let i = 0, ll = listeners.get(name).length; i < ll; i++) {
					if (listeners.get(name)[i] === cb) {
						listeners.get(name)[i] = null;
					}
				}

				listeners.set(name, listeners[name].filter((listener) => listener !== null));
			}
		},

		emit (name, args) {
			if (listeners.get(name)) {
				listeners.get(name).forEach((cb) => {
					cb(args);
				});
			}
		}
	};
}());

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
		storage().get(pref, function (results) {
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
				storage().set(newValue);
				resolve(newValue);
			} else {
				reject(new Error(`Pref: ${pref} value is not valid type for: ${item.type}`));
			}
		} else {
			reject(new Error(`Pref: ${pref} not found`));
		}
	});
}

var chromePrefs = Object.assign(prefs, {
	clear () {
		storage().clear(createDefaultPrefs);
	},

	setPref (pref, value) {
		return savePref(pref, value).catch((err) => {
			throw err;
		});
	},

	getPref (pref) {
		return findPref(pref).catch((err) => {
			throw err;
		});
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

chrome.storage.onChanged.addListener(function (changes) {
	Object.keys(changes).forEach(name => {
		chromePrefs.getPref(name).then((value) => {
			events.emit(name, value);
		});
	});
});

migratePrefsToSync().then(createDefaultPrefs);
export { chromePrefs as prefs };
