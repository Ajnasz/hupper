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
