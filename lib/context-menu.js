/*global require, exports*/
var pref = require('./pref');

var cm = require('sdk/context-menu');

function getCleanTrolls() {
	'use strict';
	return pref.getPref('trolls').split(',').filter(function (troll) {
		return troll.trim() !== '';
	});

}
function getCleanHighlightedUsers() {
	'use strict';
	return pref.getPref('highlightusers').split(',')
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


function setContextMenu () {
	'use strict';
	var contexts = [
		cm.URLContext(['*.hup.hu', '*.hup.lh']),
		cm.SelectorContext('.comment .submitted > a')
	];

	var script = 'self.on("click", function (node, data) {' +
		'self.postMessage(node.textContent);' +
	'})';

	if (pref.getPref('filtertrolls')) {
		var markAsTroll = cm.Item({
			label: 'Mark as troll',
			context: contexts,
			contentScript: script,
			onMessage: function (username) {
				var trolls = getCleanTrolls();

				if (trolls.indexOf(username) === -1) {
					trolls.push(username);
				}

				pref.setPref('trolls', trolls.join(','));
			}
		});
		markAsTroll.context.add(cm.SelectorContext('.submitted:not(.trollHeader)'));
		markAsTroll.context.add(cm.SelectorContext('.comment:not(.highlighted)'));

		var unmarkTroll = cm.Item({
			label: 'Unmark troll',
			context: contexts,
			contentScript: script,
			onMessage: function (username) {
				username = username.trim();
				var trolls = getCleanTrolls().filter(function (troll) {
					return troll.trim() !== username;
				});

				pref.setPref('trolls', trolls.join(','));
			}
		});
		unmarkTroll.context.add(cm.SelectorContext('.submitted.trollHeader'));
		unmarkTroll.context.add(cm.SelectorContext('.comment:not(.highlighted)'));
	}

	var highlightUser = cm.Item({
		label: 'Highlight user',
		context: contexts,
		contentScript: script,
		onMessage: function (username) {
			var users = getCleanHighlightedUsers();

			if (!users.some(function (user) {
				return user.name === username;
			})) {
				users.push({
					name: username,
					color: pref.getPref('huppercolor')
				});
			}

			pref.setPref('highlightusers', users.map(function (user) {
				return user.name + ':' + user.color;
			}).join(','));
		}
	});
	highlightUser.context.add(cm.SelectorContext('.comment:not(.highlighted)'));
	highlightUser.context.add(cm.SelectorContext('.comment:not(.trollComment)'));

	var unhighlightUser = cm.Item({
		label: 'Unhighlight user',
		context: contexts,
		contentScript: script,
		onMessage: function (username) {
			var users = getCleanHighlightedUsers().filter(function (user) {
				return user.name !== username;
			});

			pref.setPref('highlightusers', users.map(function (user) {
				return user.name + ':' + user.color;
			}).join(','));
		}
	});

	unhighlightUser.context.add(cm.SelectorContext('.comment.highlighted'));
	unhighlightUser.context.add(cm.SelectorContext('.comment:not(.trollComment)'));
}

exports.setContextMenu = setContextMenu;
