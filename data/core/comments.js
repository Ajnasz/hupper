import * as dom from '../../core/dom';
import * as func from '../../core/func';
import { getCommentId } from './comment-data';
import { getCommentObj } from './comment-obj';
import { addHNav } from './element';
import getCommentFromId from './get-comment-from-id';
import viewComment from './view-comment';

const TROLL_COMMENT_CLASS = 'trollComment';
const TROLL_COMMENT_HEADER_CLASS = 'trollHeader';
const TROLL_COMMENT_REPLY_CLASS = 'trollCommentAnswer';
const INDENTED_CLASS = 'indented';
const HIGHLIGHTED_COMMENT_CLASS = 'highlighted';
const BORING_COMMENT_CLASS = 'hup-boring';
const COMMENT_FOOTER_LINKS_CLASS = 'links';
const COMMENT_HNAV_CLASS = 'hnav';
const NEW_COMMENT_CLASS = 'comment-new';
const EXPAND_COMMENT_CLASS = 'expand-comment';
const WIDEN_COMMENT_CLASS = 'widen-comment';
const COMMENT_CLASS = 'comment';
const ARTICLE_AUTHOR_CLASS = 'article-author';
const COMMENT_NEW_MARKER_CLASS = 'new';
const ANONYM_COMMENT_AUTHOR_REGEXP = /[^(]+\( ([^ ]+).*/;
const COMMENT_DATE_REGEXP = /[\s|]+([0-9]+)\.\s([a-zúőűáéóüöí]+)\s+([0-9]+)\.,\s+([a-zűáéúőóüöí]+)\s+-\s+(\d+):(\d+).*/;
const COMMENT_MONTH_NAMES = {
	'január': 0,
	'február': 1,
	'március': 2,
	'április': 3,
	'május': 4,
	'június': 5,
	'július': 6,
	'augusztus': 7,
	'szeptember': 8,
	'október': 9,
	'november': 10,
	'december': 11
};

const TEXT_WIDEN = 'szélesítés';
const TEXT_PARENT = 'szülő';
const TEXT_NEXT = 'következő';
const TEXT_PREV = 'előző';


/**
 * @type commentDataStruct
 *   isNew Boolean
 *   author String
 *   created Timestamp
 *   id string comment id
 *   parent string parent id
 */
const commentDataStruct = {
	isNew: false,
	author: '',
	created: 0,
	id: '',
	parentID: '',
	content: null
};

/**
 * @param commentStruct comment
 * @return string
 */
function getCommentAuthor (comment) {
	let output = '';

	const nameLink = dom.selectOne('a', comment.header);

	if (nameLink) {
		output = nameLink.textContent.trim();
	}

	if (output === '') {
		output = comment.header.textContent.replace(ANONYM_COMMENT_AUTHOR_REGEXP, '$1');
	}

	return output;
}

/**
 * @param commentStruct comment
 * @return Timestamp
 */
function getCommentCreateDate (comment) {
	const dateMatch = comment.header.textContent.match(COMMENT_DATE_REGEXP);
	const date = new Date(dateMatch[1], COMMENT_MONTH_NAMES[dateMatch[2]], dateMatch[3], dateMatch[5], dateMatch[6]);
	return date.getTime();
}

function getCommentContent (comment) {
	return dom.selectOne('.content', comment.node).textContent;
}

const findIndentedParent = func.curry(dom.closest, `.${INDENTED_CLASS}`);
const findParentComment = func.curry(dom.prev, `.${COMMENT_CLASS}`);

/**
 * @param HTMLDOMElement elem
 * @return string
 */
function findParentId (elem) {
	const indented = findIndentedParent(elem);

	if (indented) {
		const parentComment = findParentComment(indented);

		if (parentComment) {
			return getCommentId(getCommentObj(parentComment));
		}
	}

	return '';
}

/**
 * @param commentStruct comment
 * @return integer
 */
function findIndentLevel (elem, level = 0) {
	const parent = findIndentedParent(elem);

	return parent ?
		findIndentLevel(parent, level + 1) :
		level;
}

/**
 * @param HTMLCommentNode node
 * @param Object options
 *   @param options.content boolean // get comment content too
 * @return commentDataStruct
 */
function parseComment (node, options={ content: false }) {
	const commentObj = getCommentObj(node);

	return Object.assign({}, commentDataStruct, {
		isNew: dom.hasClass(NEW_COMMENT_CLASS, commentObj.node),
		author: getCommentAuthor(commentObj),
		created: getCommentCreateDate(commentObj),
		id: getCommentId(commentObj),
		parentID: findParentId(commentObj.node),
		indentLevel: findIndentLevel(commentObj.node),
		content: options.content ? getCommentContent(commentObj) : commentDataStruct.content,
	});
}

/**
 *
 * @param commentStruct comment
 */
function getNewMarkerElement (comment) {
	return dom.selectOne(`.${COMMENT_NEW_MARKER_CLASS}`, comment.node);
}

const selectHNav = func.curry(dom.selectOne, `.${COMMENT_HNAV_CLASS}`);
const selectHNew = func.curry(dom.selectOne, '.hnew');

const hasHNew = header => !!selectHNew(header);

/**
 * @param commentStruct comment
 * @param string text
 */
function setNew (comment, text) {
	addHNav(comment);
	const original = getNewMarkerElement(comment);

	if (original) {
		original.remove(original);
	}

	if (hasHNew(comment.header)) {
		return;
	}

	const hnav = selectHNav(comment.header);
	const span = dom.createElem('span', null, ['hnew'], text);
	hnav.appendChild(span);
}

function insertIntoHnav (comment, item) {
	var header = comment.header,
		hnew = selectHNew(header),
		hnav = selectHNav(header);

	if (hnew) {
		hnav.insertBefore(item, hnew);
	} else {
		hnav.appendChild(item);
	}
}

function commentLink (text, commentToLinkID, comment) {
	let link = dom.selectOne(`a[href="#${commentToLinkID}"]`, comment.header);

	if (link) {
		link.parentNode.removeChild(link);
	}

	link = dom.createElem('a', [{ name: 'href', value: '#' + commentToLinkID }], null, text);

	addHNav(comment);
	insertIntoHnav(comment, link);
}

/**
 * @param string id Comment id
 * @param string nextCommentId
 */
const addLinkToPrevComment = func.curry(commentLink, TEXT_PREV);

/**
 * @param string id Comment id
 * @param string nextCommentId
 */
const addLinkToNextComment = func.curry(commentLink, TEXT_NEXT);

/**
 * @param commentDataStruct comment
 * @return commentStruct
 */
function commentDataStructToObj (comment) {
	return func.compose(func.always(comment.id), getCommentFromId, getCommentObj);
}

/**
 * @param commentStruct comment
 */
function setTroll (comment) {
	dom.addClass(TROLL_COMMENT_CLASS, comment.node);
	dom.addClass(TROLL_COMMENT_HEADER_CLASS, comment.header);

	const replies = dom.next(`.${INDENTED_CLASS}`, comment.node);

	if (replies) {
		dom.addClass(TROLL_COMMENT_REPLY_CLASS, replies);
	}
}

/**
 * @param commentStruct comment
 */
function unsetTroll (comment) {
	dom.removeClass(TROLL_COMMENT_CLASS, comment.node);
	dom.removeClass(TROLL_COMMENT_HEADER_CLASS, comment.header);

	const replies = dom.next(`.${INDENTED_CLASS}`, comment.node);

	if (replies) {
		dom.removeClass(TROLL_COMMENT_REPLY_CLASS, replies);
	}
}

/**
 * @return {commentDataStruct[]}
 */
function getTrollComments () {
	return func.toArray(document.querySelectorAll('.' + TROLL_COMMENT_CLASS)).map(parseComment);
}

/**
 * @param {commentDataStruct[]} trollComments
 */
function setTrolls (trollComments) {
	getTrollComments()
		.filter(function (comment) {
			return trollComments.indexOf(comment.author) === -1;
		})
		.map(function (comment) {
			return getCommentObj(getCommentFromId(comment.id));
		})
		.forEach(unsetTroll);

	trollComments.map(function (comment) {
		return getCommentObj(getCommentFromId(comment.id));
	}).forEach(setTroll);
}

function unsetTrolls () {
	const classNames = [
		TROLL_COMMENT_CLASS,
		TROLL_COMMENT_HEADER_CLASS,
		TROLL_COMMENT_REPLY_CLASS
	];

	const trolled = func.toArray(document.querySelectorAll(classNames.map(c => `.${c}`).join(',')));
	const removeClassNames = classNames.map(className => func.curry(dom.removeClass, className));

	trolled.forEach(element => removeClassNames.forEach(f => f(element)));
}

/**
 * @param commentStruct comment
 */
function unhighlightComment (comment) {
	var commentObj = commentDataStructToObj(comment);
	dom.removeClass(HIGHLIGHTED_COMMENT_CLASS, commentObj.node);

	commentObj.header.style.backgroundColor = '';
	commentObj.header.style.color = '';

	func.toArray(commentObj.header.querySelectorAll('a')).forEach(l => l.style.color = '');
}

/**
 * @param commentStruct comment
 */
function highlightComment (comment) {
	var commentObj = commentDataStructToObj(comment);
	dom.addClass(HIGHLIGHTED_COMMENT_CLASS, commentObj.node);

	commentObj.header.style.backgroundColor = comment.userColor;
	commentObj.header.style.color = comment.userContrastColor;

	func.toArray(commentObj.header.querySelectorAll('a')).forEach(l => l.style.color = comment.userContrastColor);
}

/**
 * @param commentStruct comment
 */
function markBoring (comment) {
	dom.addClass(BORING_COMMENT_CLASS, comment.node);
}

/**
 * @param {commentDataStruct[]} comments
 */
function hideBoringComments (comments) {
	comments.map(commentDataStructToObj).forEach(markBoring);
}

function hasFooter (comment) {
	return comment && comment.footer && comment.footer.nodeType === Node.ELEMENT_NODE;
}

function addFooterLink (comment, link) {
	const commentObj = commentDataStructToObj(comment);
	if (!hasFooter(commentObj)) {
		return;
	}

	const footer = dom.selectOne(`.${COMMENT_FOOTER_LINKS_CLASS}`, commentObj.footer);
	const { href, className } = dom.selectOne('a', link);

	func.toArray(footer.querySelectorAll('a'))
		.filter(a => a.href === href && a.className === className)
		.forEach(a => footer.removeChild(a.parentNode));

	footer.appendChild(link);
}

/**
 * @param string text
 * @param href text
 * @param {string[]} classes
 */
function createFooterLink (content, href, classes) {
	const listItem = dom.createElem('li');
	let link;

	if (content && content.nodeType === Node.ELEMENT_NODE) {
		link = dom.createElem('a', [{ name: 'href', value: href }], classes);
		link.appendChild(content);
	} else {
		link = dom.createElem('a', [{ name: 'href', value: href }], classes, content);
	}

	listItem.appendChild(link);

	return listItem;
}

/**
 * @param commentDataStruct comment
 */
function addParentLinkToComment (comment) {
	addFooterLink(comment, createFooterLink(TEXT_PARENT, '#' + comment.parentID));
}

/**
 * @param commentDataStruct comment
 */
function addExpandLinkToComment (comment) {
	addFooterLink(comment, createFooterLink(TEXT_WIDEN, '#', [EXPAND_COMMENT_CLASS]));
}

/**
 * @param {commentDataStruct[]} comments
 */
function addParentLinkToComments (comments) {
	comments.forEach(addParentLinkToComment);
}

/**
 * @param {commentDataStruct[]} comments
 */
function addExpandLinkToComments (comments) {
	comments.forEach(addExpandLinkToComment);
}

/**
 * @param string commentId
 */
function widenComment (commentId) {
	var comment = getCommentFromId(commentId);
	var indentedClass = `.${INDENTED_CLASS}`;
	var indented;
	var skippedOne = false;

	indented = dom.closest(indentedClass, comment);

	while (indented) {
		if (skippedOne) {
			dom.addClass(WIDEN_COMMENT_CLASS, indented);
		}

		skippedOne = true;

		indented = dom.closest(indentedClass, indented);
	}
}

function unwideComments () {
	func.toArray(document.querySelectorAll('.' + WIDEN_COMMENT_CLASS))
		.forEach(function (elem) {
			dom.removeClass(WIDEN_COMMENT_CLASS, elem);
		});
}

/**
 * @return {HTMLDOMElement[]}
 */
function getComments () {
	return func.toArray(document.querySelectorAll('.' + COMMENT_CLASS));
}

function filterNewComments (comments) {
	return comments.filter(c => c.isNew && !c.hide);
}

function hide (comment) {
	dom.addClass('hup-hidden', getCommentFromId(comment.id));
}

function show (comment) {
	dom.removeClass('hup-hidden', getCommentFromId(comment.id));
}

function getScoreTitle (votes) {
	if (votes.plusone > 0 && votes.minusone > 0) {
		return `${votes.plusone} hupper adott +1 pontot\n${votes.minusone} hupper adott -1 pontot`;
	} else if (votes.plusone) {
		return `${votes.plusone} hupper adott +1 pontot`;
	} else if (votes.minusone) {
		return `${votes.minusone} hupper adott -1 pontot`;
	}

	return null;
}

function showScore (comment) {
	const elem = commentDataStructToObj(comment);
	const content = dom.selectOne('.content', elem.node);

	const scores = dom.selectOne('.scores', elem.node);

	if (!scores) {
		const scores = dom.createElem('div', [
			{
				name: 'title',
				value: getScoreTitle(comment.votes)
			}
		], ['scores'], comment.votes.score);
		elem.node.insertBefore(scores, content);
	} else {
		scores.textContent = comment.votes.score;
		dom.attr('title', getScoreTitle(comment.votes), scores);
	}
}

function hasScore (comment) {
	return typeof comment.votes.score !== 'undefined' && comment.votes.score !== 0;
}

function setAuthorComment (comment) {
	const elem = commentDataStructToObj(comment);
	elem.node.classList.add(ARTICLE_AUTHOR_CLASS);
}

function createIcon (name) {
	const icon = dom.createElem('span', null, [`hupper-icon-${name}`]);
	return icon;
}

function addViewCommentButton (comment) {
	const icon = createIcon('bubbles2');
	const footerLink = createFooterLink(icon, `#${comment.parentID}`, ['show-parent', 'hupper-button', 'hupper-icon-button', 'hupper-icon-button--inverse']);
	dom.data('parent', comment.parentID, footerLink);
	addFooterLink(comment, footerLink);
}

function onCommentUpdate (comments) {
	comments.forEach((comment) => {
		if (comment.hide) {
			hide(comment);
		} else {
			show(comment);

			(comment.userColor) ?
				highlightComment(comment) :
				unhighlightComment(comment);

			if (hasScore(comment)) {
				showScore(comment);
			}

			if (comment.authorComment) {
				setAuthorComment(comment);
			}

			if (comment.parentID) {
				addViewCommentButton(comment);
			}
		}
	});
}

function onCommentSetNew (newComments) {
	const obj = newComments.map(commentDataStructToObj);
	obj.forEach((comment, index) => {
		const commentObj = newComments[index];

		setNew(comment, commentObj.newCommentText || 'új');

		if (commentObj.prevId) {
			addLinkToPrevComment(commentObj.prevId, comment);
		}

		if (commentObj.nextId) {
			addLinkToNextComment(commentObj.nextId, comment);
		}
	});
}

function onCommentsContainerClick (e) {
	const commentLink = dom.prev('a', dom.closest(`.${COMMENT_CLASS}`, e.target));
	if (!commentLink) {
		return;
	}

	const commentID = commentLink.getAttribute('id');

	if (dom.is('.expand-comment', e.target)) {
		e.preventDefault();
		unwideComments();

		widenComment(commentID);
	} else {
		const showParent = dom.elemOrClosest('.show-parent', e.target);

		if (showParent) {
			e.preventDefault();
			viewComment(dom.closest('li', showParent).dataset.parent);
		}
	}
}

function onBodyClick (e) {
	if (dom.is('a', e.tearget)) {
		return;
	}

	if (dom.closest(`.${COMMENT_CLASS}`, e.target)) {
		return;
	}

	unwideComments();
}

function convertComments (comments, opts) {
	return comments.filter(comment => comment.id !== '').map(function (opts, comment) {
		const output = parseComment(getCommentFromId(comment.id), {
			content: opts && opts.content
		});

		output.children = convertComments(comment.children, opts);

		return output;
	}.bind(null, opts));
}

export {
	getComments,
	filterNewComments,
	parseComment,
	setNew,
	commentDataStructToObj,
	setTrolls,
	unsetTrolls,
	highlightComment,
	unhighlightComment,
	hideBoringComments,
	addParentLinkToComments,
	addExpandLinkToComments,
	widenComment,
	unwideComments,
	hide,
	show,
	getCommentFromId,
	showScore,
	onCommentUpdate,
	onCommentSetNew,
	onCommentsContainerClick,
	onBodyClick,
	convertComments
};
