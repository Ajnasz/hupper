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

function getCleanHighlightedUsers() {
	'use strict';
	return getPref('highlightusers').split(',')
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
	'use strict';
	return getPref('trolls').split(',').filter(function (troll) {
		return troll.trim() !== '';
	});

}
exports.getPref = getPref;
exports.setPref = setPref;
exports.getCleanHighlightedUsers = getCleanHighlightedUsers;
exports.getCleanTrolls = getCleanTrolls;
