import * as func from './func';


const plusOneRex = new RegExp('(?:^|\\s)\\+1(?:$|\\s|\\.|,)'),
	minusOneRex = new RegExp('(?:^|\\s)-1(?:$|\\s|\\.|,)'),
	signatureRex = /^[- ]+$/;

function setPrevNextLinks (flatComments) {
	let lastNew = null;

	return flatComments.reduce((output, comment, index) => {
		if (!comment.isNew || comment.hide) {
			output[index] = comment;
			return output;
		}

		if (lastNew !== null) {
			output[lastNew] = Object.assign({}, output[lastNew], { nextId: comment.id });
			output[index] = Object.assign({}, comment, {prevId: output[lastNew].id});
		} else {
			output[index] = comment;
		}

		lastNew = index;

		return output;
	}, []);
}

const getParagraphs = comment => (comment.content ? comment.content.split('\n').map(p => p.trim()).filter(p => p !== '') : []);

function isBoringComment (comment, boringRegexp) {
	let paragraphs = getParagraphs(comment);

	if (paragraphs.length > 1) {
		const signatureIndex = func.index(paragraphs, p => signatureRex.test(p));

		if (signatureIndex > -1) {
			paragraphs.splice(signatureIndex);
		}
	}

	return paragraphs.length === 1 && boringRegexp.test(paragraphs[0].trim());
}

const isTrollComment = (trolls, comment) => func.inArray(trolls, comment.author);

const markTrollComments = (comments, trolls) => func.recurse(comments, (comment, parent) => Object.assign({}, comment, {
	troll: isTrollComment(trolls, comment),
	isParentTroll: Boolean(parent && (parent.troll || parent.isParentTroll))
}));

const markBoringComments = (comments, boringRegexp) => func.recurse(comments, (comment) => Object.assign({}, comment, {
	boring: isBoringComment(comment, boringRegexp)
}));

const setParent = (comments) => func.recurse(comments, (comment, parent) => Object.assign({}, comment, { parent }));

function setHighlightedComments (comments, users) {
	let undef;

	return func.recurse(comments, (comment) => {
		const highlightData = func.first(users, (user) => {
			return user.name === comment.author;
		});

		return Object.assign({}, comment, {userColor: highlightData ? highlightData.color : undef});
	});
}

const isPlusOne = comment => plusOneRex.test(getParagraphs(comment)[0]);
const isMinusOne = comment => minusOneRex.test(getParagraphs(comment)[0]);

function setScores (comments) {
	return comments.map((comment) => {
		const votes = comment.children.reduce((accu, child) => {
			if (isPlusOne(child)) {
				return Object.assign({}, accu, { plusone: accu.plusone + 1 });
			} else if (isMinusOne(child)) {
				return Object.assign({}, accu, { minusone: accu.minusone + 1 });
			}

			return accu;
		}, { score: null, plusone: 0, minusone: 0 });

		return Object.assign({}, comment, {
			children: setScores(comment.children),
			votes: Object.assign({}, votes, { score: votes.plusone - votes.minusone })
		});
	});
}

function hasInterestingChild (comment) {
	if (comment.children.some(c => !c.boring)) {
		return true;
	}

	return comment.children.some(hasInterestingChild);
}

/**
 * @method markHasInterestingChild
 * @mutates
 */
function markHasInterestingChild (comments) {
	return comments.reduce((accu, comment, index) => {
		accu[index] = Object.assign({}, comment, {
			hasInterestingChild: hasInterestingChild(comment),
			children: markHasInterestingChild(comment.children)
		});

		return accu;
	}, new Array(comments.length));
}

const flatComments = comments => comments.reduce((acc, comment) => {
	const clone = Object.assign({}, comment);
	acc.push(clone);

	if (comment.children.length > 0) {
		acc = acc.concat(flatComments(comment.children));
	}

	delete clone.children;

	return acc;
}, []);

const isHidableComment = comment => (comment.troll || (comment.boring && !comment.hasInterestingChild));

const updateHiddenState = comments => func.recurse(comments, (comment, parent) => Object.assign(comment, {
	hide: (parent && parent.hide) || isHidableComment(comment),
	isParentHidden: parent && parent.hide
}));

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
