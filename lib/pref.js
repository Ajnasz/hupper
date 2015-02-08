/*jshint moz:true*/
/*global require, exports*/
function getPref(pref) {
	'use strict';
	return require('sdk/simple-prefs').prefs[pref];
}

function setPref(pref, value) {
	'use strict';
	require('sdk/simple-prefs').prefs[pref] = value;
}

exports.getPref = getPref;
exports.setPref = setPref;
