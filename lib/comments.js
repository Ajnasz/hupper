/*jshint moz:true*/
/*global require, exports*/

var pref = require('./pref');

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
	var trolls = pref.getPref('trolls').split(',');

	var trollComments = comments.filter(function (comment) {
		return trolls.indexOf(comment.author) > -1;
	});

	worker.port.emit('comment.setTrolls', trollComments);
}

function updateHighlightedUsers(comments, worker) {
	'use strict';

	var users = pref.getCleanHighlightedUsers();

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

	worker.port.emit('comment.highlightComments', highlightedComments);
}
function isBorinComment(boringRegexp, comment) {
	'use strict';
	var paragraphs = comment.content.split('\n');

	return paragraphs.length === 1 && boringRegexp.test(paragraphs[0].trim());
}
function parseComments(worker, comments) {
	'use strict';

	var newComments, childComments, boringComments;

	newComments = comments.filter(function (comment) {
		return comment.isNew;
	});

	if (pref.getPref('hideboringcomments')) {
		boringComments = comments.filter(isBorinComment.bind(null, new RegExp(pref.getPref('boringcommentcontents'))));

		if (boringComments.length > 0) {
			worker.port.emit('comment.hideBoringComments', boringComments);
		}
	}

	worker.port.emit('comment.setNew', {
		comments: newComments,
		text: pref.getPref('newcommenttext')
	});

	if (pref.getPref('prevnextlinks')) {
		setNewComments(newComments, worker);
	}

	if (pref.getPref('filtertrolls')) {
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
	worker.port.emit('comment.addExpandLink', childComments.filter(function (comment) {
		return comment.indentLevel > 1;
	}));

	if (newComments.length > 0) {
		worker.port.emit('hupper-block.add-menu', {
			href: '#new',
			text: 'First new comment'
		});
	}
}

exports.parseComments = parseComments;
