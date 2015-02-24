/*jshint moz:true*/
/*global require, exports*/

let pref = require('./pref');
let func = require('./core/func');

let plusOneRex = new RegExp('(?:^|\\s)\\+1(?:$|\\s|\\.|,)'),
    minusOneRex = new RegExp('(?:^|\\s)-1(?:$|\\s|\\.|,)');

function setPrevNextLinks(newComments) {
	'use strict';
	let newCommentsLength = newComments.length;

	return newComments.map(function (comment, index) {
		let nextPrev = {
			id: comment.id
		};
		if (index + 1 < newCommentsLength) {
			nextPrev.nextId = newComments[index + 1].id;
		}

		if (index > 0) {
			nextPrev.prevId = newComments[index - 1].id;
		}

		return nextPrev;
	});
}

function updateTrolls(trolls, comments) {
	'use strict';
	comments.forEach(function (comment) {
		if (trolls.indexOf(comment.author) > -1) {
			comment.hide = true;
			comment.troll = true;
		} else {
			comment.hide = comment.boring ? true : false;
			comment.troll = false;
		}

		updateTrolls(trolls, comment.children);
	});
}

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
	let undef;
	comments.forEach(function (comment) {
		let highlightData = func.first(users, function (user) {
			return user.name === comment.author;
		});

		if (highlightData) {
			comment.userColor = highlightData.color;
		} else {
			comment.userColor = undef;
		}

		setHighlightedComments(users, comment.children);
	});
}

function isPlusOne(comment) {
	'use strict';
	return plusOneRex.test(getParagraphs(comment)[0]);
}

function isMinusOne(comment) {
	'use strict';
	return minusOneRex.test(getParagraphs(comment)[0]);
}

function setScores(comments) {
	'use strict';
	comments.forEach(function (comment) {
		comment.score = 0;

		comment.children.forEach(function (child) {
			if (isPlusOne(child)) {
				comment.score += 1;
			} else if (isMinusOne(child)) {
				comment.score -= 1;
			}
		});

		setScores(comment.children);
	});
}

function parseComments(comments) {
	'use strict';

	if (pref.getPref('hideboringcomments')) {
		let boringRex = new RegExp(pref.getPref('boringcommentcontents'));
		markBoringComments(comments, boringRex);
	}

	if (pref.getPref('filtertrolls')) {
		let trolls = pref.getCleanTrolls();
		markTrollComments(comments, trolls);
	}

	setScores(comments);

	let highlightedUsers = pref.getCleanHighlightedUsers();

	if (highlightedUsers.length) {
		setHighlightedComments(highlightedUsers, comments);
	}

	let flatCommentList = flatComments(comments);

	return flatCommentList;

}

exports.parseComments = parseComments;
exports.getFlatCommentList = flatComments;
exports.getNewComments = findNewComments;
exports.setPrevNextLinks = setPrevNextLinks;
exports.updateTrolls = updateTrolls;
exports.setHighlightedComments = setHighlightedComments;
