/*jshint moz:true*/
/*global require, exports*/

let pref = require('./pref');
let func = require('./func');

let plusOneRex = new RegExp('(?:^|\\s)\\+1(?:$|\\s|\\.|,)'),
    minusOneRex = new RegExp('(?:^|\\s)-1(?:$|\\s|\\.|,)');

const TEXT_FIRST_NEW_COMMENT = 'Első olvasatlan hozzászólás';

function setPrevNextLinks(newComments, events) {
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

			events.emit('comment.addNextPrev', nextPrev);
		});
	}
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

function parseComments(events, comments) {
	'use strict';

	let newComments, childComments;

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

	console.log('our updated comments', comments.length, comments);

	let flatCommentList = flatComments(comments);

	events.emit('comments.update', flatCommentList);

	newComments = findNewComments(comments);

	if (pref.getPref('replacenewcommenttext')) {
		events.emit('comment.setNew', {
			comments: newComments,
			text: pref.getPref('newcommenttext')
		});
	}

	setPrevNextLinks(newComments, events);

	require('sdk/simple-prefs').on('highlightusers', function () {
		let highlightedUsers = pref.getCleanHighlightedUsers();
		setHighlightedComments(highlightedUsers, comments);
		events.emit('comments.update', flatCommentList);
	});
	require('sdk/simple-prefs').on('trolls', function () {
		let trolls = pref.getCleanTrolls();
		updateTrolls(trolls, comments);
		events.emit('comments.update', flatCommentList);
	});

	childComments = flatCommentList.filter(function (comment) {
		return comment.parent !== '';
	});

	events.emit('comment.addParentLink', childComments);
	events.emit('comment.addExpandLink', childComments.filter(function (comment) {
		return comment.indentLevel > 1;
	}));

	if (newComments.length > 0) {
		events.emit('hupper-block.add-menu', {
			href: '#new',
			text: TEXT_FIRST_NEW_COMMENT
		});
	}
}

exports.parseComments = parseComments;
