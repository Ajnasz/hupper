/*jshint esnext: true*/
/*global require, exports*/
/*eslint-disable new-cap*/
var pref = require('./pref').pref;

var cm = require('sdk/context-menu');

function setContextMenu () {
	'use strict';
	var contexts = [
		cm.URLContext(['*.hup.hu', '*.hup.lh']),
		cm.SelectorContext('.comment .submitted > a')
	];

	var script = 'self.on("click", function (node, data) {' +
		'self.postMessage(node.textContent);' +
	'})';

	pref.getPref('filtertrolls').then((results) => {
		let [filtertrolls] = results;

		if (filtertrolls) {
			var markAsTroll = cm.Item({
				label: 'Mark as troll',
				context: contexts,
				contentScript: script,
				onMessage: function (username) {
					pref.getCleanTrolls().then((trolls) => {

						if (trolls.indexOf(username) === -1) {
							trolls.push(username);
						}

						pref.setPref('trolls', trolls.join(','));
					});
				}
			});
			markAsTroll
				.context
				.add(cm.SelectorContext('.submitted:not(.trollHeader) > a'));

			markAsTroll
				.context
				.add(cm.SelectorContext('.comment:not(.highlighted) .submitted > a'));

			var unmarkTroll = cm.Item({
				label: 'Unmark troll',
				context: contexts,
				contentScript: script,
				onMessage: function (username) {
					username = username.trim();
					pref.getCleanTrolls().then((trolls) => {
						let filteredTrolls = trolls.filter(function (troll) {
							return troll.trim() !== username;
						});

						pref.setPref('trolls', filteredTrolls.join(','));
					});
				}
			});
			unmarkTroll.context.add(cm.SelectorContext('.submitted.trollHeader > a'));
			unmarkTroll.context.add(cm.SelectorContext('.comment:not(.highlighted) .submitted > a'));
		}

	});

	var highlightUser = cm.Item({
		label: 'Highlight user',
		context: contexts,
		contentScript: script,
		onMessage: function (username) {
			Promise.all([
				pref.getCleanHighlightedUsers(),
				pref.getPref('huppercolor')
			]).then((results) => {
				let [users, color] = results;
				if (!users.some(function (user) {
					return user.name === username;
				})) {
					users.push({
						name: username,
						color: color
					});
				}

				pref.setPref('highlightusers', users.map((user) => {
					return user.name + ':' + user.color;
				}).join(','));
			});
		}
	});
	highlightUser.context.add(cm.SelectorContext('.comment:not(.highlighted) .submitted > a'));
	highlightUser.context.add(cm.SelectorContext('.comment:not(.trollComment) .submitted > a'));

	var unhighlightUser = cm.Item({
		label: 'Unhighlight user',
		context: contexts,
		contentScript: script,
		onMessage: (username) => {
			pref.getCleanHighlightedUsers().then((users) => {
				let filteredUsers = users.filter((user) => {
					return user.name !== username;
				});

				pref.setPref('highlightusers', filteredUsers.map((user) => {
					return user.name + ':' + user.color;
				}).join(','));
			});
		}
	});

	unhighlightUser.context.add(cm.SelectorContext('.comment.highlighted .submitted > a'));
	unhighlightUser.context.add(cm.SelectorContext('.comment:not(.trollComment) .submitted > a'));
}

exports.setContextMenu = setContextMenu;
