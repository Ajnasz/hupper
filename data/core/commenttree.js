import * as func from '../../core/func';
import * as dom from '../../core/dom';

const COMMENT_CLASS = 'comment';
const COMMENT_PARENT_CLASS = 'indented';

function findComments (parent) {
	var output = [];
	if (!parent) {
		return output;
	}

	var child = parent.firstChild;

	while (child) {
		if (child.nodeType === Node.ELEMENT_NODE && dom.hasClass(COMMENT_CLASS, child)) {
			output.push(child);
		}

		child = child.nextElementSibling;
	}

	return output;
}

function findID (comment) {
	return comment.previousElementSibling.id;
}

function createObj (comments) {
	return comments.map(function (c) {
		return {
			id: findID(c),
			node: c,
			children: null
		};
	});
}

function recObj (comments) {
	comments.forEach(function (comment) {
		var children = findComments(comment.node.nextElementSibling);

		comment.children = createObj(children);
		recObj(comment.children);
	});

	return comments;
}

const commentTreeItemStruct = Object.create(null);
commentTreeItemStruct.id = '';
commentTreeItemStruct.children = '';

function noramlizeCommentTreeItem (item) {
	const output = Object.create(null);
	output.id = item.id;

	return output;
}

function normalizeCommentTree (tree) {
	return tree.map(function (item) {
		const normalized = noramlizeCommentTreeItem(item);
		normalized.children = normalizeCommentTree(item.children);
		return normalized;
	});
}

/**
 * A comment has parent comment if it's inside an indented div
 * If the previous node of the indented div is not a .comment div we should
 * consider it as a root node because the HTML has been scrwed up, and can't
 * find what is the parent comment
 */
function hasParentComment (comment) {
	const parentNode = comment.parentNode;
	return dom.hasClass(COMMENT_PARENT_CLASS, parentNode) &&
		dom.hasClass(COMMENT_CLASS, comment.parentNode.previousElementSibling);
}

function getCommentTree () {
	const rootComments = func.toArray(document.querySelectorAll(`.${COMMENT_CLASS}`))
		.filter(func.negate(hasParentComment));
	const tree = normalizeCommentTree(recObj(createObj(rootComments)));

	return tree;
}

export {
	getCommentTree

};
