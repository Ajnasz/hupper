import * as func from './func';


const plusOneRex = new RegExp('(?:^|\\s)\\+1(?:$|\\s|\\.|,)'),
	minusOneRex = new RegExp('(?:^|\\s)-1(?:$|\\s|\\.|,)'),
	signatureRex = /^[- ]+$/;

function setPrevNextLinks (newComments) {
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

function getParagraphs (comment) {
	return comment.content.split('\n').map(p => p.trim()).filter(p => p !== '');
}

function isBorinComment (boringRegexp, comment) {
	let paragraphs = getParagraphs(comment);

	let signatureIndex = func.index(paragraphs, p => signatureRex.test(p));

	if (signatureIndex > -1) {
		paragraphs.splice(signatureIndex);
	}

	return paragraphs.length === 1 && boringRegexp.test(paragraphs[0].trim());
}

function isTrollComment (trolls, comment) {
	return func.inArray(trolls, comment.author);
}

function markTrollComments (comments, trolls, isParentTroll) {
	comments.forEach(function (comment) {
		let isTroll = isTrollComment(trolls, comment);

		comment.troll = isTroll;
		comment.isParentTroll = isParentTroll;

		markTrollComments(comment.children, trolls, isParentTroll || isTroll);
	});
}

function updateHiddenState (comments, isParentHidden = false) {
	comments.forEach(comment => {
		let isHidden = comment.troll || (comment.boring && !comment.hasInterestingChild);

		comment.hide = isHidden || isParentHidden;
		comment.isParentHidden = isParentHidden;

		updateHiddenState(comment.children, isParentHidden || isHidden);
	});
}

function markBoringComments (comments, boringRegexp) {
	comments.forEach(comment => {
		let isBoring = isBorinComment(boringRegexp, comment);

		comment.boring = isBoring;

		markBoringComments(comment.children, boringRegexp);
	});
}

function markHasInterestingChild (comments) {
	comments.forEach(comment => {
		if (!comment.boring) {

			let c = comment;

			while (c.parent) {
				c = c.parent;
				if (c.hasInterestingChild) {
					break;
				}

				c.hasInterestingChild = true;
			}
		}

		markHasInterestingChild(comment.children);
	});
}

function flatComments (comments) {
	let output = [];

	comments.forEach(function (comment) {
		output.push(comment);

		if (comment.children.length > 0) {
			output = output.concat(flatComments(comment.children));
		}
	});

	return output;
}

function setHighlightedComments (comments, users) {
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

function isPlusOne (comment) {
	return plusOneRex.test(getParagraphs(comment)[0]);
}

function isMinusOne (comment) {
	return minusOneRex.test(getParagraphs(comment)[0]);
}

function setScores (comments) {
	comments.forEach(function (comment) {
		comment.votes = comment.children.reduce((accu, child) => {
			if (isPlusOne(child)) {
				accu.plusone += 1;
			} else if (isMinusOne(child)) {
				accu.minusone += 1;
			}

			return accu;
		}, { score: null, plusone: 0, minusone: 0 });

		comment.votes.score = comment.votes.plusone - comment.votes.minusone;

		setScores(comment.children);
	});
}

export {
	setScores,
	setPrevNextLinks,
	setHighlightedComments,
	markBoringComments,
	markTrollComments,
	flatComments,
	markHasInterestingChild,
	updateHiddenState
};
