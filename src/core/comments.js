import * as func from './func';


const plusOneRex = new RegExp('(?:^|\\s)\\+1(?:$|\\s|\\.|,)'),
	minusOneRex = new RegExp('(?:^|\\s)-1(?:$|\\s|\\.|,)'),
	signatureRex = /^[- ]+$/;

function recurse (comments, callback, parent) {
	return comments.map((comment) => {
		let output = Object.create(null);
		Object.assign(output, comment);

		output = callback(output, parent);

		output.children = recurse(comment.children, callback, output);

		return output;
	});
}

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
	return comment.content ? comment.content.split('\n').map(p => p.trim()).filter(p => p !== '') : [];
}

function isBoringComment (comment, boringRegexp) {
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

function markTrollComments (comments, trolls) {
	let output = recurse(comments, function (comment, parent) {
		let output = {
			troll: isTrollComment(trolls, comment),
			isParentTroll: Boolean(parent && (parent.troll || parent.isParentTroll))
		};

		Object.assign(output, comment);

		return output;
	});


	return output;
}

function markBoringComments (comments, boringRegexp) {
	return recurse(comments, (comment) => {
		let output = {boring: isBoringComment(comment, boringRegexp)};

		Object.assign(output, comment);

		return output;
	});
}

function setParent (comments, parent) {
	return comments.map(c => {
		let output = Object.assign({parent}, c);
		output.children = setParent(c.children, output);
		return output;
	});
}

function setHighlightedComments (comments, users) {
	let undef;

	return recurse(comments, (comment) => {
		let highlightData = func.first(users, (user) => {
			return user.name === comment.author;
		});

		let output = {userColor: highlightData ? highlightData.color : undef};

		Object.assign(output, comment);

		return output;
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

/**
 * @method markHasInterestingChild
 * @mutates
 */
function markHasInterestingChild (boringMarkedComments) {
	boringMarkedComments.forEach(comment => {
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

	return boringMarkedComments;
}

function flatComments (comments) {
	return comments.reduce((acc, comment) => {
		let clone = {};
		Object.assign(clone, comment);
		acc.push(clone);

		if (comment.children.length > 0) {
			acc = acc.concat(flatComments(comment.children));
		}

		delete clone.children;

		return acc;
	}, []);
}

function updateHiddenState (comments) {
	return recurse(comments, (comment, parent) => {
		let output = {
			hide: (parent && parent.hide) || comment.troll || (comment.boring && !comment.hasInterestingChild),
			isParentHidden: parent && parent.hide
		};

		Object.assign(output, comment);
		return output;
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
	updateHiddenState,
	setParent
};
