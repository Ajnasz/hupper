import * as dom from '../../core/dom';
import * as func from '../../core/func';
import { addHNav } from './element';

const TROLL_COMMENT_CLASS = 'trollComment';
const TROLL_COMMENT_HEADER_CLASS = 'trollHeader';
const TROLL_COMMENT_REPLY_CLASS = 'trollCommentAnswer';
const INDENTED_CLASS = 'indented';
const HIGHLIGHTED_COMMENT_CLASS = 'highlighted';
const BORING_COMMENT_CLASS = 'hup-boring';
const COMMENT_HEADER_CLASS = 'submitted';
const COMMENT_FOOTER_CLASS = 'link';
const COMMENT_FOOTER_LINKS_CLASS = 'links';
const COMMENT_HNAV_CLASS = 'hnav';
const NEW_COMMENT_CLASS = 'comment-new';
const EXPAND_COMMENT_CLASS = 'expand-comment';
const WIDEN_COMMENT_CLASS = 'widen-comment';
const COMMENT_CLASS = 'comment';
const COMMENT_NEW_MARKER_CLASS = 'new';
const ANONYM_COMMENT_AUTHOR_REGEXP = /[^\(]+\( ([^ ]+).*/;
const COMMENT_DATE_REGEXP = /[\s\|]+([0-9]+)\.\s([a-zúőűáéóüöí]+)\s+([0-9]+)\.,\s+([a-zűáéúőóüöí]+)\s+-\s+(\d+):(\d+).*/;
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
var commentDataStruct = {
	isNew: false,
	author: '',
	created: 0,
	id: '',
	parentID: '',
	content: null
};

/**
 * @type commentStruct
 *   node: HTMLCommentNode
 *   header: HTMLDOMElement
 *   footer: HTMLDOMElement
 */
var commentStruct = {
	node: null,
	header: null,
	footer: null
};

/**
 * @param commentStruct comment
 * @return string
 */
function getCommentAuthor (comment) {
	var output = '',
		nameLink;

	nameLink = dom.selectOne('a', comment.header);

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
	var date, dateMatch;
	dateMatch = comment.header.textContent.match(COMMENT_DATE_REGEXP);
	date = new Date();
	date.setYear(dateMatch[1]);
	date.setMonth(COMMENT_MONTH_NAMES[dateMatch[2]]);
	date.setDate(dateMatch[3]);
	date.setHours(dateMatch[5]);
	date.setMinutes(dateMatch[6]);
	return date.getTime();
}

/**
 * @param commentStruct comment
 * @return String
 */
function getCommentId (comment) {
	var element = dom.prev('a', comment.node);

	if (element) {
		return element.getAttribute('id');
	}

	return '';
}

/**
 * @param HTMLCommentNode node
 * @return Object
 *   node: HTMLCommentNode
 *   header: HTMLDOMElement
 *   footer: HTMLDOMElement
 */
function getCommentObj (node) {
	var commentObj = Object.create(commentStruct);

	commentObj.node = node;
	commentObj.header = dom.selectOne(`.${COMMENT_HEADER_CLASS}`, node);
	commentObj.footer = dom.selectOne(`.${COMMENT_FOOTER_CLASS}`, node);

	if (!commentObj.footer && node.nextElementSibling && dom.hasClass(COMMENT_FOOTER_CLASS, node.nextElementSibling)) {
		commentObj.footer = node.nextElementSibling;
		node.appendChild(commentObj.footer);
	}

	return commentObj;
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
	let indented = findIndentedParent(elem);

	if (indented) {
		let parentComment = findParentComment(indented);

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
function findIndentLevel (comment) {
	var level = 0,
		elem;

	// elem = dom.closest(indented, comment.node);
	elem = findIndentedParent(comment.node);

	while (elem) {
		++level;

		elem = findIndentedParent(elem);
	}

	return level;
}

/**
 * @param HTMLCommentNode node
 * @param Object options
 *   @param options.content boolean // get comment content too
 * @return commentDataStruct
 */
function parseComment (node, options={content: false}) {
	var output = Object.create(commentDataStruct);
	var commentObj = getCommentObj(node);

	output.isNew = dom.hasClass(NEW_COMMENT_CLASS, commentObj.node);
	output.author = getCommentAuthor(commentObj);
	output.created = getCommentCreateDate(commentObj);
	output.id = getCommentId(commentObj);
	output.parentID = findParentId(commentObj.node);
	output.indentLevel = findIndentLevel(commentObj);

	if (options.content) {
		output.content = getCommentContent(commentObj);
	}

	return output;
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

/**
 * @param commentStruct comment
 * @param string text
 */
function setNew (comment, text) {
	addHNav(comment);
	let original = getNewMarkerElement(comment);

	if (original) {
		original.remove(original);
	}

	if (selectHNew(comment.header)) {
		return;
	}

	var hnav = selectHNav(comment.header);
	var span = dom.createElem('span', null, ['hnew'], text);
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

function commentLink (comment, commentToLinkID, text) {
	let link = dom.selectOne(`a[href="#${commentToLinkID}"]`, comment.header);

	if (link) {
		link.parentNode.removeChild(link);
	}

	link = dom.createElem('a', [{name: 'href', value: '#' + commentToLinkID}], null, text);

	addHNav(comment);
	insertIntoHnav(comment, link);
}

/**
 * @param string id Comment id
 * @param string nextCommentId
 */
function addLinkToPrevComment (comment, prevCommentId) {
	commentLink(comment, prevCommentId, TEXT_PREV);
}

/**
 * @param string id Comment id
 * @param string nextCommentId
 */
function addLinkToNextComment (comment, nextCommentId) {
	commentLink(comment, nextCommentId, TEXT_NEXT);
}

/**
 * @param string id Comment id
 * @return HTMLDOMElement Comment element
 */
function getCommentFromId (id) {
	var elem = document.getElementById(id);

	return dom.next(`.${COMMENT_CLASS}`, elem);
}

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

	var replies = dom.next(`.${INDENTED_CLASS}`, comment.node);

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

	var replies = dom.next(`.${INDENTED_CLASS}`, comment.node);

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
	var trolled = func.toArray(document.querySelectorAll([
		`.${TROLL_COMMENT_CLASS}`,
		`.${TROLL_COMMENT_HEADER_CLASS}`,
		`.${TROLL_COMMENT_REPLY_CLASS}`
	].join(',')));

	trolled.forEach(function (element) {
		[TROLL_COMMENT_CLASS, TROLL_COMMENT_HEADER_CLASS, TROLL_COMMENT_REPLY_CLASS]
			.map(className => func.curry(dom.removeClass, className))
			.forEach(f => f(element));
	});
}

/**
 * @param commentStruct comment
 */
function unhighlightComment (comment) {
	var commentObj = commentDataStructToObj(comment);
	dom.removeClass(HIGHLIGHTED_COMMENT_CLASS, commentObj.node);
	commentObj.header.style.backgroundColor = '';
	commentObj.header.style.color = '';
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
	var commentObj = commentDataStructToObj(comment);
	if (!hasFooter(commentObj)) {
		return;
	}

	let footer = dom.selectOne(`.${COMMENT_FOOTER_LINKS_CLASS}`, commentObj.footer);

	let href = dom.selectOne('a', link).href;

	func.toArray(footer.querySelectorAll('a'))
		.filter(a => a.href === href)
		.forEach(a => footer.removeChild(a.parentNode));

	footer.appendChild(link);
}

/**
 * @param string text
 * @param href text
 * @param {string[]} classes
 */
function createFooterLink (text, href, classes) {
	var listItem = dom.createElem('li'),
		link;

	link = dom.createElem('a', [{name: 'href', value: href}], classes, text);
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

function hide (comment) {
	dom.addClass('hup-hidden', getCommentFromId(comment.id));
}

function show (comment) {
	dom.removeClass('hup-hidden', getCommentFromId(comment.id));
}

function setProp (comment, prop, value) {
	let elem = getCommentFromId(comment.id);

	elem.dataset[prop] = value;
	elem.dataset[prop + 'Type'] = typeof value;
}

function getProp (comment, prop) {
	let elem = getCommentFromId(comment.id);

	let value = elem.dataset[prop];
	let type = elem.dataset[prop + 'Type'];
	let undef;

	switch (type) {
		case 'boolean':
			return Boolean(value);
		case 'number':
			return +value;
		case 'undefined':
			return undef;
		default:
			return value;
	}
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
	let elem = commentDataStructToObj(comment);
	let content = dom.selectOne('.content', elem.node);

	let scores = dom.selectOne('.scores', elem.node);

	if (!scores) {
		let scores = dom.createElem('div', [
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

function onCommentUpdate (comments) {
	comments.forEach((comment) => {
		setProp(comment, 'boring', comment.boring);
		setProp(comment, 'troll', comment.troll);

		if (comment.hide) {
			hide(comment);
		} else {

			show(comment);

			if (comment.userColor) {
				highlightComment(comment);
			} else {
				unhighlightComment(comment);
			}

			if (hasScore(comment)) {
				showScore(comment);
			}
		}
	});
}

function onCommentSetNew (newComments) {
	let obj = newComments.map(commentDataStructToObj);
	obj.forEach((comment, index) => {
		let commentObj = newComments[index];

		setNew(comment, commentObj.newCommentText || 'új');

		if (commentObj.prevId) {
			addLinkToPrevComment(comment, commentObj.prevId);
		}

		if (commentObj.nextId) {
			addLinkToNextComment(comment, commentObj.nextId);
		}
	});
}

function onCommentsContainerClick (e) {
	if (dom.is('.expand-comment', e.target)) {
		e.preventDefault();
		unwideComments();
		let id = dom.prev('a', dom.closest('.comment', e.target)).getAttribute('id');
		widenComment(id);

	}
}

function onBodyClick (e) {
	if (e.target.nodeName === 'A') {
		return;
	}

	if (dom.closest('.comment', e.target)) {
		return;
	}

	unwideComments();
}

function convertComments (comments, opts) {
	return comments.filter(comment => comment.id !== '').map(function (opts, comment) {
		let output = parseComment(getCommentFromId(comment.id), {
			content: opts && opts.content
		});

		output.children = convertComments(comment.children, opts);

		return output;
	}.bind(null, opts));
}

export {
	getComments,
	parseComment,
	setNew,
	commentDataStructToObj,
	addLinkToNextComment,
	addLinkToPrevComment,
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
	setProp,
	getProp,
	getCommentFromId,
	showScore,
	onCommentUpdate,
	onCommentSetNew,
	onCommentsContainerClick,
	onBodyClick,
	convertComments
};
