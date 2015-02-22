/*jshint moz:true*/
/*global require, exports*/

let pref = require('./pref');
let func = require('./func');

// let { partial } = require('sdk/lang/functional');

function setPrevNextLinks(newComments, worker) {
	'use strict';
	let newCommentsLength = newComments.length;

	if (newCommentsLength > 1) {
		newComments.forEach(function (comment, index) {
			let nextPrev = {
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

/*
function updateTrolls(comments, worker) {
	'use strict';
	let trolls = pref.getPref('trolls').split(',');

	let trollComments = comments.filter(function (comment) {
		return trolls.indexOf(comment.author) > -1;
	});

	worker.port.emit('comment.setTrolls', trollComments);
}

function updateHighlightedUsers(comments, worker) {
	'use strict';

	let users = pref.getCleanHighlightedUsers();

	let highlightedComments = comments.map(function (comment) {
		let output = {
			id: comment.id,
			author: comment.author
		};
		let userColor = users.filter(function (user) {
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
*/

function getParagraphs(comment) {
	'use strict';
	return comment.content.split('\n');
}

function isBorinComment(boringRegexp, comment) {
	'use strict';
	let paragraphs = getParagraphs(comment).filter(function (p) {
		return p.trim() !== '';
	});

	return paragraphs.length <= 1 && boringRegexp.test(paragraphs[0].trim());
}

function isTrollComment(trolls, comment) {
	'use strict';
	return trolls.indexOf(comment.author) > -1;
}

function markTrollComments(comments, trolls) {
	'use strict';

	comments.forEach(function (comment) {
		if (isTrollComment(trolls, comment)) {
			comment.hide = true;
			comment.troll = true;
		}
		markTrollComments(comment.children, trolls);
	});

}

function markBoringComments(comments, boringRegexp) {
	'use strict';
	comments.forEach(function (comment) {
		if (isBorinComment(boringRegexp, comment)) {
			comment.hide = true;
			comment.boring = true;
		}

		markBoringComments(comment.children, boringRegexp);
	});
}

function findNewComments(comments) {
	'use strict';
	let output = [];

	comments.forEach(function (comment) {
		if (comment.isNew && !comment.hide) {
			output.push(comment);
		}

		if (!comment.hide && comment.children.length) {
			output = output.concat(findNewComments(comment.children));
		}
	});
	return output;
}

function flatComments(comments) {
	'use strict';
	let output = [];

	comments.forEach(function (comment) {
		output.push(comment);

		if (comment.children.length > 0) {
			output = output.concat(flatComments(comment.children));
		}
	});

	return output;
}

function setHighlightedComments(users, comments) {
	'use strict';
	comments.forEach(function (comment) {
		let highlightData = func.first(users, function (user) {
			return user.name === comment.author;
		});

		if (highlightData) {
			comment.userColor = highlightData.color;
		}

		setHighlightedComments(users, comment.children);
	});
}

function parseComments(worker, comments) {
	'use strict';

	let newComments, childComments;

	if (pref.getPref('hideboringcomments')) {
		let boringRex = new RegExp(pref.getPref('boringcommentcontents'));
		markBoringComments(comments, boringRex);
	}

	if (pref.getPref('hidetrollanswers')) {
		let trolls = pref.getCleanTrolls();
		markTrollComments(comments, trolls);
	}


	let highlightedUsers = pref.getCleanHighlightedUsers();
	if (highlightedUsers.length) {
		setHighlightedComments(highlightedUsers, comments);
	}

	// updateHighlightedUsers(comments, worker);

	console.log('our updated comments', comments.length, comments);

	worker.port.emit('comments.update', flatComments(comments));

	newComments = findNewComments(comments);

	worker.port.emit('comment.setNew', {
		comments: newComments,
		text: pref.getPref('newcommenttext')
	});

	if (pref.getPref('prevnextlinks')) {
		setPrevNextLinks(newComments, worker);
	}

	/*
	require('sdk/simple-prefs').on('highlightusers', function () {
		updateHighlightedUsers(comments, worker);
	});
	*/

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
