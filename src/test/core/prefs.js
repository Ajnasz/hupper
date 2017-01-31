import { prefs } from '../../core/prefs';
import defaultPrefs from '../../core/defaultPrefs';

let test = require('tape');

test('core/prefs default prefs inserted', function (t) {
	Promise.all(defaultPrefs.map((pref) => {
		return prefs.getPref(pref.name).then(value => {
			switch (pref.type) {
				case 'bool':
				case 'string':
				case 'integer':
				case 'color':
					t.equal(value, pref.value);
					break;
				case 'array':
					t.deepEqual(value, pref.value);
					break;
				case 'control':
					t.equal(value, ':noSuchValue');
					break;
				default:
					t.fail('Unknown type ' + pref.type);
			}

			return true;
		});
	})).then(() => t.end());

});

test('core/prefs getPref', function (t) {
	prefs.getPref('huppercolor')
		.then((color) => {
			t.equal(color, '#B5D7BE', 'Returns a preference value');
		})
		.then(() => prefs.getPref('non such property'))
		.then(value => t.equal(value, null, 'Non existing property value should be null'))
		.then(() => t.end());
});

test('core/prefs setPref', function (t) {
	prefs.setPref('newcommenttext', 'foobar')
		.then(value => t.deepEqual(value, {newcommenttext: 'foobar'}, 'New value returned in promise resolve as an object'))
		.then(() => prefs.getPref('newcommenttext'))
		.then((color) => t.equal(color, 'foobar', 'Newcomment text updated'))
		.then(() => {
			return prefs.setPref('newcommenttext', 1234)
				.then(() => {
					t.fail('should not allow to set different type');
				})
				.catch(() => {
					t.pass('Error for not allowed type');
				});
		})
		.then(() => {
			return prefs.setPref('no such property', 1234)
				.then(() => {
					t.fail('should not allow to set non existing property');
				})
				.catch(() => {
					t.pass('Error for non existent property');
				});
		})
		.then(() => t.end());
});

test('core/prefs getAllPrefs', function (t) {
	prefs.getAllPrefs()
		.then(results => {
			t.equal(results.length, defaultPrefs.length, 'all prefs returned an array with a length of the defaultPrefs');
			return results;
		})
		.then(results => results.every(pref => defaultPrefs.some(defaultPref => defaultPref.name === pref.name)))
		.then(result => t.ok(result, 'Should find all value in defaultPrefs'))
		.catch((e) => t.fail('should not fail', e))
		.then(() => t.end());
});
