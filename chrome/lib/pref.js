/*jshint esnext:true*/
/*global define*/
(function () {
	'use strict';

	function createDefaultPrefs() {
		if (!localStorage.getItem('prefs')) {
			console.log('CREATE LOCALSTORAGE ITEMS');

			localStorage.setItem('prefs', JSON.stringify([
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
			]));
		}
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
		let prefs;

		createDefaultPrefs();

		try {
			prefs = JSON.parse(localStorage.getItem('prefs'));
		} catch (er) {
			prefs = [];
		}

		for (let i = 0, pl = prefs.length; i < pl; i++) {
			if (prefs[i].name === pref) {
				return prefs[i];
			}
		}

		return null;
	}

	function savePref(pref, value) {
		let prefs;

		try {
			prefs = JSON.parse(localStorage.getItem('prefs'));
		} catch (er) {
			prefs = [];
		}

		let prefObj = null;

		for (let i = 0, pl = prefs.length; i < pl; i++) {
			let name = prefs[i].name;
			if (name === pref) {
				prefObj = prefs[i];
				break;
			}
		}

		if (prefObj) {
			if (validateType(prefObj.type, value)) {
				if (prefObj.value !== value) {
					prefObj.value = value;
					localStorage.prefs = JSON.stringify(prefs);
					events.emit(pref);
				}
				return;
			} else {
				throw new Error('Pref: ' + pref + ' value is not valid type for: ' + pref.type);
			}
		}

		throw new Error('Pref: ' + pref + ' not found');
	}

	function getPref(pref) {
		let prefObj = findPref(pref);

		if (prefObj) {
			return prefObj.value;
		}

		return null;
	}

	function setPref(pref, value) {
		savePref(pref, value);
	}

	function getCleanHighlightedUsers() {
		let highlightusers = getPref('highlightusers');

		if (highlightusers === null) {
			return [];
		}

		return highlightusers.split(',')
				.filter(function (user) {
					return user.trim() !== '';
				}).map(function (user) {
					return user.split(':');
				}).filter(function (user) {
					return user.length === 2 && Boolean(user[0]) && Boolean(user[1]);
				}).map(function (user) {
					return {
						name: user[0],
						color: user[1]
					};
				});
	}

	function getCleanTrolls() {
		let trolls = getPref('trolls');

		if (trolls === null) {
			return [];
		}

		return trolls.split(',').filter(function (troll) {
			return troll.trim() !== '';
		});

	}

	function getCleanTaxonomies() {
		let taxonomies = getPref('hidetaxonomy');

		if (taxonomies === null) {
			return [];
		}

		return taxonomies.split(',').filter(function (taxonomy) {
			return taxonomy.trim() !== '';
		});
	}

	define('./pref', function (exports) {
		exports.getPref = getPref;
		exports.setPref = setPref;
		exports.getCleanHighlightedUsers = getCleanHighlightedUsers;
		exports.getCleanTrolls = getCleanTrolls;
		exports.getCleanTaxonomies = getCleanTaxonomies;
		exports.on = events.on;
		exports.off = events.off;
	});
}());
