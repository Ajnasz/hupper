import * as func from './func';


let plusOneRex = new RegExp('(?:^|\\s)\\+1(?:$|\\s|\\.|,)'),
	minusOneRex = new RegExp('(?:^|\\s)-1(?:$|\\s|\\.|,)');

function setPrevNextLinks(newComments) {
	let newCommentsLength = newComments.length;

	newComments.forEach(function (comment, index, array) {
		if (index + 1 < newCommentsLength) {
			comment.nextId = array[index + 1].id;
		}

		if (index > 0) {
			comment.prevId = array[index - 1].id;
		}
	});

	return newComments;
}

function updateTrolls(trolls, comments) {
	comments.forEach(function (comment) {
		let isTroll = trolls.indexOf(comment.author) > -1;

		comment.troll = isTroll;
		comment.hide = Boolean(isTroll || comment.boring);

		updateTrolls(trolls, comment.children);
	});
}

function getParagraphs(comment) {
	return comment.content.split('\n');
}

function isBorinComment(boringRegexp, comment) {
	let paragraphs = getParagraphs(comment).filter(function (p) {
		return p.trim() !== '';
	});

	return paragraphs.length === 1 && boringRegexp.test(paragraphs[0].trim());
}

function isTrollComment(trolls, comment) {
	return trolls.indexOf(comment.author) > -1;
}

function markTrollComments(comments, trolls) {

	comments.forEach(function (comment) {
		comment.troll = isTrollComment(trolls, comment)

		markTrollComments(comment.children, trolls);
	});

}

function updateHiddenState(comments) {
	comments.forEach(comment => {
		comment.hide = Boolean(comment.troll || comment.boring);
		updateHiddenState(comment.children);
	});
}

function markBoringComments(comments, boringRegexp) {
	comments.forEach(function (comment) {
		comment.boring = isBorinComment(boringRegexp, comment);
		markBoringComments(comment.children, boringRegexp);
	});
}

function getNewComments(comments) {
	let output = [];

	comments.forEach(function (comment) {
		if (comment.isNew && !comment.hide) {
			output.push(comment);
		}

		if (!comment.hide && comment.children.length) {
			output = output.concat(getNewComments(comment.children));
		}
	});
	return output;
}

function flatComments(comments) {
	let output = [];

	comments.forEach(function (comment) {
		output.push(comment);

		if (comment.children.length > 0) {
			output = output.concat(flatComments(comment.children));
		}
	});

	return output;
}

function setHighlightedComments(comments, users) {
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

		setHighlightedComments(comment.children, users);
	});
}

function isPlusOne(comment) {
	return plusOneRex.test(getParagraphs(comment)[0]);
}

function isMinusOne(comment) {
	return minusOneRex.test(getParagraphs(comment)[0]);
}

function setScores(comments) {
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

function convertComments(comments, opts) {
	return comments.map(function (opts, comment) {
		let output = parseComment(getCommentFromId(comment.id), {
			content: opts && opts.content
		});

		output.children = convertComments(comment.children, opts);

		return output;
	}.bind(null, opts));
}

export {
	setScores,
	getNewComments,
	setPrevNextLinks,
	updateTrolls,
	setHighlightedComments,
	markBoringComments,
	markTrollComments,
	flatComments,
	updateHiddenState
};
