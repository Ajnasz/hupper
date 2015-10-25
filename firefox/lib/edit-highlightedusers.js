/*jshint esnext:true*/
/*global require, exports*/
function start() {
	'use strict';
	let self = require('sdk/self');
	let pref = require('./pref').pref;
	let panel = require('sdk/panel').Panel({
		contentURL: self.data.url('panels/edit-highlightedusers.html'),
		contentStyleFile: [
			self.data.url('panels/css/panels.css'),
			self.data.url('panels/css/edit-highlightedusers.css')
		],
		contentScriptFile: [
			self.data.url('core/rq.js'),
			self.data.url('core/dom.js'),
			self.data.url('core/func.js'),
			self.data.url('panels/edit-highlightedusers.js')
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
		return pref.getCleanHighlightedUsers().then((users) => {
			let filteredUsers = users.filter(function (user) {
				return user.name !== userName;
			});

			pref.setPref('highlightusers', getUsersString(filteredUsers));

			panel.port.emit('showHighlightedUsers', filteredUsers);

			return Promise.resolve(filteredUsers);
		});

	}

	function addHighlightedUser(user) {
		return pref.getCleanHighlightedUsers().then((users) => {
			users.push(user);
			pref.setPref('highlightusers', getUsersString(users));

			return Promise.resolve(users);
		});
	}

	panel.port.on('getHighlightedUsers', function () {
		pref.getCleanHighlightedUsers().then((users) => {
			panel.port.emit('showHighlightedUsers', users);
		});
		pref.getPref('huppercolor').then((color) => {
			panel.port.emit('setDefaultColor', color);
		});
	});

	panel.port.on('unhighlight', removeHighlightedUser);

	panel.port.on('addHighlightedUser', function (user) {
		pref.getCleanHighlightedUsers().then((users) => {
			if (!user || !user.name || !user.name.trim() || !user.color || !user.color.trim()) {
				panel.port.emit('addHighlightedUserError', 'User name and color required');
			} else if (users.some(function (u) {
				return u.name === user.name;
			})) {
				panel.port.emit('addHighlightedUserError', 'User already exists');
			} else {
				addHighlightedUser(user).then((users) => {
					panel.port.emit('addHighlightedUserSuccess');
					panel.port.emit('showHighlightedUsers', users);
				});
			}
		});
	});

	panel.show();
}

exports.start = start;
