/*jshint node:true*/

var json = require(__dirname + '/../package.json');

function mustBeString(pref, prop) {
	'use strict';
	var type = typeof pref[prop];
	if (type !== 'string') {
		throw new Error('Expected to ' + prop + ' to be a string, it is ' + type);
	}
}

function checkDefaultValue(pref) {
	'use strict';
	var valueType = typeof pref.value;
	switch (pref.type) {
		case 'bool': 
			if (valueType !== 'boolean') {
				throw new Error('Expected the default value of ' + pref.name + ' to be a boolean, but it is a ' + valueType);
			}
			break;

		case 'string':
			if (valueType !== 'string') {
				throw new Error('Expected the default value of ' + pref.name + ' to be a string, but it is a ' + valueType);
			}
			break;

		case 'integer':
			if (valueType !== 'number') {
				throw new Error('Expected the default value of ' + pref.name + ' to be a number, but it is a ' + valueType);
			}
			break;

		case 'radio':
			if (pref.options.filter(function (pr) {
				return pr.value === pref.value;
			}).length !== 1) {
				throw new Error('Wrong default value ' + pref.value + ' for ' + pref.name + ', no such value in options');
			}
			break;
	}
}

json.preferences.forEach(function (pref) {
	'use strict';
	mustBeString(pref, 'name');
	mustBeString(pref, 'title');
	mustBeString(pref, 'type');

	checkDefaultValue(pref);
});
