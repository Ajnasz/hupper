/*jshint moz:true*/
/*global require, exports*/
function start() {
	'use strict';
	let self = require('sdk/self');
	let pref = require('./pref');
	let panel = require('sdk/panel').Panel({
		contentURL: self.data.url('panels/edit-highlightedusers.html'),
		contentStyleFile: [
			self.data.url('panels/panels.css'),
			self.data.url('panels/edit-highlightedusers.css'),
		],
		contentScriptFile: [
			self.data.url('rq.js'),
			self.data.url('dom.js'),
			self.data.url('func.js'),
			self.data.url('panels/edit-highlightedusers.js'),
		]
	});

	function getUsersString(users) {
		return users.filter(function (user) {
			return user && user.name && user.color;
		}).map(function (user) {
			return user.name + ':' + user.color;
		}).join(',');
	}

	function removeHighlightedUser(userName) {
		let users = pref.getCleanHighlightedUsers();

		pref.setPref('highlightusers', getUsersString(users.filter(function (user) {
			return user.name !== userName;
		})));

		panel.port.emit('showHighlightedUsers', pref.getCleanHighlightedUsers());
	}

	function addHighlightedUser(user) {
		let users = pref.getCleanHighlightedUsers();
		users.push(user);
		pref.setPref('highlightusers', getUsersString(users));
	}

	panel.port.on('getHighlightedUsers', function () {
		panel.port.emit('showHighlightedUsers', pref.getCleanHighlightedUsers());
		panel.port.emit('setDefaultColor', pref.getPref('huppercolor'));
	});

	panel.port.on('unhighlight', removeHighlightedUser);

	panel.port.on('addHighlightedUser', function (user) {
		let users = pref.getCleanHighlightedUsers();

		if (!user || !user.name || !user.name.trim() || !user.color || !user.color.trim()) {
			panel.port.emit('addHighlightedUserError', 'User name and color required');
		} else if (users.some(function (u) {
			return u.name === user.name;
		})) {
			panel.port.emit('addHighlightedUserError', 'User already exists');
		} else {
			addHighlightedUser(user);
			panel.port.emit('addHighlightedUserSuccess');
			panel.port.emit('showHighlightedUsers', pref.getCleanHighlightedUsers());
		}
	});

	panel.show();
}

exports.start = start;
