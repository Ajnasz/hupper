/*jshint esnext:true*/
/*global require, exports*/

let prefs = require('./core/pref').prefs;

var firefoxPrefs = Object.create(prefs, {
	setPref: {
		value: function (pref, value) {
			'use strict';
			require('sdk/simple-prefs').prefs[pref] = value;
		}
	},

	getPref: {
		value: function (pref) {
			'use strict';
			return new Promise((resolve) => {
				resolve(require('sdk/simple-prefs').prefs[pref]);
			});
		}
	}

});

firefoxPrefs.on = (name, cb) => {
	'use strict';
	require('sdk/simple-prefs').on(name, cb);
};
exports.pref = firefoxPrefs;
