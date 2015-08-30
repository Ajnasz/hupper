/*jshint esnext:true*/
/*global define, require, chrome*/
(function () {
	'use strict';

	let defaultPrefs = [
		{
			'name': 'replacenewcommenttext',
			'title': 'Replace the \"új\" text of new comments to a better searchable one',
			'type': 'bool',
			'value': true
		},

		{
			'name': 'newcommenttext',
			'title': 'The text to show instead of \"új\"',
			'type': 'string',
			'value': '[new]'
		},

		{
			'name': 'filtertrolls',
			'title': 'Enable trollfilter',
			'type': 'bool',
			'value': true
		},

		{
			'name': 'edittrolls',
			'title': 'Edit trolls',
			'label': 'Click to edit trolls',
			'type': 'control'
		},

		{
			'name': 'trolls',
			'title': 'List of trolls',
			'type': 'string',
			'value': '',
			'hidden': true
		},

		{
			'name': 'huppercolor',
			'title': 'Default highlighted user\'s comment header color',
			'type': 'color',
			'value': '#B5D7BE'
		},

		{
			'name': 'edithighlightusers',
			'title': 'Edit highlighted users',
			'label': 'Click to edit highlighted users',
			'type': 'control'
		},

		{
			'name': 'highlightusers',
			'title': 'Highlight comments of the users',
			'type': 'string',
			'value': 'username:#fff999,username2:#999fff',
			'hidden': true
		},

		{
			'name': 'hidetaxonomy',
			'title': 'Hidable article types',
			'type': 'string',
			'value': ''
		},

		{
			'name': 'blocks',
			'title': 'Block settings',
			'type': 'string',
			'value': '{}',
			'hidden': true
		},
		{
			'name': 'parseblocks',
			'title': 'Parse blocks',
			'type': 'bool',
			'value': true
		},

		{
			'name': 'style_accessibility',
			'title': 'Load accessibility styles',
			'type': 'bool',
			'value': true
		},
		{
			'name': 'style_wider_sidebar',
			'title': 'Width of sidebars',
			'type': 'integer',
			'value': 0
		},
		{
			'name': 'style_min_fontsize',
			'title': 'Minimum font size',
			'type': 'integer',
			'value': 0
		},
		{
			'name': 'style_hide_left_sidebar',
			'title': 'Hide left sidebar',
			'type': 'bool',
			'value': false
		},
		{
			'name': 'style_hide_right_sidebar',
			'title': 'Hide right sidebar',
			'type': 'bool',
			'value': false
		},

		{
			'name': 'hideboringcomments',
			'title': 'Hide boring comments',
			'type': 'bool',
			'value': true
		},

		{
			'name': 'boringcommentcontents',
			'title': 'Regular expression to identify boring comments',
			'type': 'string',
			'value': '^([-_]|-1|\\\\+1)$'
		},
		{
			'name': 'setunlimitedlinks',
			'title': 'Show as many comments as possible on a page',
			'type': 'bool',
			'value': true
		}
	];

	function createDefaultPrefs() {
		if (!localStorage.getItem('prefs')) {
			localStorage.setItem('prefs', JSON.stringify(defaultPrefs));
		}
		/* use chrome.storage
		 */
		return Promise.all(defaultPrefs.map((pref) => {
			return new Promise(function (resolve) {
				chrome.storage.sync.get(pref.name, function (result) {
					if (typeof result[pref.name] === 'undefined') {
						// chrome.storage.sync.set(value);
						resolve([pref.name, pref.value]);
					} else {
						resolve(null);
					}
				});
			});
		})).then(function (values) {
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

			return new Promise(function (resolve) {
				chrome.storage.sync.set(saveObj, function () {
					resolve();
				});
			});
		});
		/* */
	}

	let events = (function () {
		let listeners = new Map();
		return {
			on(name, cb) {
				if (!listeners.has(name)) {
					listeners.set(name, []);
				}

				listeners.get(name).push(cb);
			},

			off(name, cb) {
				if (listeners.get(name)) {
					for (let i = 0, ll = listeners.get(name).length; i < ll; i++) {
						if (listeners.get(name)[i] === cb) {
							listeners.get(name)[i] = null;
						}
					}

					listeners.set(name, listeners[name].filter((listener) => listener !== null));
				}
			},

			emit(name, args) {
				if (listeners.get(name)) {
					listeners.get(name).forEach((cb) => {
						cb(args);
					});
				}
			}
		};
	}());

	function validateType(prefType, value) {
		let isValid = false;

		switch (prefType) {
			case 'string':
				isValid = typeof value === 'string';
			break;
			case 'bool':
				isValid = typeof value === 'boolean';
			break;
			case 'integer':
				isValid = typeof value === 'number';
			break;
			default:
				isValid = true;
				console.info('Unknown type %s', prefType);
			break;
		}

		return isValid;
	}

	function findPref(pref) {
		return new Promise(function (resolve) {
			chrome.storage.sync.get(pref, function (results) {
				if (typeof results[pref] !== 'undefined') {
					resolve(results[pref]);
				} else {
					resolve(null);
				}
			});
		});
	}

	function savePref(pref, value) {
		return new Promise(function (resolve) {
			let item = require('./core/func').first(defaultPrefs, (item) => {
				return item.name === pref;
			});

			if (item) {
				if (validateType(item.type, value)) {
					let newValue = Object.create(null);
					newValue[pref] = value;
					chrome.storage.sync.set(newValue);
					resolve();
				} else {
					throw new Error('Pref: ' + pref + ' value is not valid type for: ' + item.type);
				}
			} else {
				throw new Error('Pref: ' + pref + ' not found');
			}
		});
	}


	define('./pref', function (exports) {
		let prefs = require('./core/prefs').prefs;
		var chromePrefs = Object.create(prefs, {
			setPref: {
				value: function (pref, value) {
					savePref(pref, value).catch((err) => {
						throw err;
					});
				}
			},

			getPref: {
				value: function (pref) {
					return findPref(pref).catch((err) => {
						throw err;
					});
				}
			}
		});

		chromePrefs.on = events.on;

		exports.pref = chromePrefs;
	});
}());
