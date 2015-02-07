/*jshint moz:true*/
/*global require*/
var pageMod = require("sdk/page-mod");
var self = require("sdk/self");
var cm = require('sdk/context-menu');

function getPref(pref) {
	'use strict';
	return require('sdk/simple-prefs').prefs[pref];
}

function setPref(pref, value) {
	'use strict';
	require('sdk/simple-prefs').prefs[pref] = value;
}

function getCleanTrolls() {
	'use strict';
	return getPref('trolls').split(',').filter(function (troll) {
		return troll.trim() !== '';
	});

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

(function () {
	'use strict';
	var contexts = [
		cm.URLContext(['*.hup.hu', '*.hup.lh']),
		cm.SelectorContext('.comment .submitted > a')
	];

	var script = 'self.on("click", function (node, data) {' +
		'self.postMessage(node.textContent);' +
	'})';

	if (getPref('filtertrolls')) {
		var markAsTroll = cm.Item({
			label: 'Mark as troll',
			context: contexts,
			contentScript: script,
			onMessage: function (username) {
				var trolls = getCleanTrolls();

				if (trolls.indexOf(username) === -1) {
					trolls.push(username);
				}

				setPref('trolls', trolls.join(','));
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

				setPref('trolls', trolls.join(','));
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
					color: getPref('huppercolor')
				});
			}

			setPref('highlightusers', users.map(function (user) {
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

			setPref('highlightusers', users.map(function (user) {
				return user.name + ':' + user.color;
			}).join(','));
		}
	});

	unhighlightUser.context.add(cm.SelectorContext('.comment.highlighted'));
	unhighlightUser.context.add(cm.SelectorContext('.comment:not(.trollComment)'));
}());

function createStyle(elements, rules) {
	'use strict';
	return elements.join(',') + '{' + rules.map(function (rule) {
		return rule.name + ':' + rule.value + ' !important;';
	}).join('') + '}';
}

/**
 * @return string
 */
function getPageStyle() {
	'use strict';
	var output = [];
	var minFontSize = getPref('style_min_fontsize');
	var minWidth = getPref('style_wider_sidebar');

	if (minFontSize > 0) {
		output.push(createStyle([
			'body',
			'#all',
			'#top-nav',
			'#top-nav a',
			'.sidebar .block .content',
			'#footer',
			'.node .links'
		], [{name: 'font-size', value: minFontSize + 'px'}]));
	}

	if (minWidth > 0) {
		output.push(createStyle(['.sidebar'], [{name: 'width', value: minWidth + 'px'}]));
	}

	if (getPref('filtertrolls')) {
		if (getPref('trollfiltermethod') === 'hilight') {
			output.push(createStyle(['.trollHeader'], [{name: 'background-color', value: getPref('trollcolor')}]));
		} else if (getPref('trollfiltermethod') === 'hide') {
			output.push(createStyle(['.trollComment'], [{name: 'display', value: 'none'}]));
			output.push(createStyle(['.trollCommentAnswer'], [{name: 'display', value: 'none'}]));
		}
	}

	return output;
}

/**
 * @return Array
 */
function getPageStyleFiles() {
	'use strict';
	var output = [
		self.data.url('indentstyles.css'),
		self.data.url('hupper.css')
	];

	if (getPref('style_accessibility')) {
		output.push(self.data.url('accesibilitystyles.css'));
	}

	return output;
}

function setNewComments(newComments, worker) {
	'use strict';
	var newCommentsLength = newComments.length;

	if (newCommentsLength > 1) {
		newComments.forEach(function (comment, index) {
			var nextPrev = {
				id: comment.id
			};
			if (index + 1 < newCommentsLength) {
				nextPrev.nextId = newComments[index + 1].id;
			}

			if (index > 0) {
				nextPrev.prevId = newComments[index - 1].id;
			}

			worker.port.emit('comment.addNextPrev', nextPrev);
		});
	}
}

function updateTrolls(comments, worker) {
	'use strict';
	var trolls = getPref('trolls').split(',');

	var trollComments = comments.filter(function (comment) {
		return trolls.indexOf(comment.author) > -1;
	});

	worker.port.emit('comment.setTrolls', trollComments);
}

function updateHighlightedUsers(comments, worker) {
	'use strict';

	var users = getCleanHighlightedUsers();

	var highlightedComments = comments.map(function (comment) {
		var output = {
			id: comment.id,
			author: comment.author
		};
		var userColor = users.filter(function (user) {
			return comment.author === user.name;
		});
		if (userColor.length) {
			output.userColor = userColor[0].color;
		}

		return output;
	}).filter(function (comment) {
		return typeof comment.userColor !== 'undefined';
	});

	if (highlightedComments.length > 0) {
		worker.port.emit('comment.highlightComments', highlightedComments);
	}
}

function isBorinComment(boringRegexp, comment) {
	'use strict';
	var paragraphs = comment.content.split('\n');

	return paragraphs.length === 1 && boringRegexp.test(paragraphs[0].trim());
}

pageMod.PageMod({
	include: ['*.hup.lh', '*.hup.hu'],
	onAttach: function (worker) {
		'use strict';
		console.log('on attach');

		worker.port.emit('getComments', {
			// get content only if filtering boring comments
			content: getPref('hideboringcomments')
		});
		worker.port.on('gotComments', function (comments) {
			var newComments, childComments, boringComments;

			newComments = comments.filter(function (comment) {
				return comment.isNew;
			});

			if (getPref('hideboringcomments')) {
				boringComments = comments.filter(isBorinComment.bind(null, new RegExp(getPref('boringcommentcontents'))));

				if (boringComments.length > 0) {
					worker.port.emit('comment.hideBoringComments', boringComments);
				}
			}

			worker.port.emit('comment.setNew', {
				comments: newComments,
				text: getPref('newcommenttext')
			});

			if (getPref('prevnextlinks')) {
				setNewComments(newComments, worker);
			}

			if (getPref('filtertrolls')) {
				updateTrolls(comments, worker);
				require('sdk/simple-prefs').on('trolls', function () {
					updateTrolls(comments, worker);
				});
			}

			updateHighlightedUsers(comments, worker);
			require('sdk/simple-prefs').on('highlightusers', function () {
				updateHighlightedUsers(comments, worker);
			});

			childComments = comments.filter(function (comment) {
				return comment.parent !== '';
			});

			worker.port.emit('comment.addParentLink', childComments);
		});
	},
	contentStyle: getPageStyle(),
	contentStyleFile: getPageStyleFiles(),
	contentScriptFile: [
		self.data.url('rq.js'),
		self.data.url('dom.js'),
		self.data.url('comments.js'),
		self.data.url('hupper.js')
	]
});
