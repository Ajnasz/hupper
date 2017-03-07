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

	nameLink = comment.header.querySelector('a');

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
	var element = dom.prev(comment.node, 'a');

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
	commentObj.header = node.querySelector('.' + COMMENT_HEADER_CLASS);
	commentObj.footer = node.querySelector('.' + COMMENT_FOOTER_CLASS);

	return commentObj;
}

function getCommentContent (comment) {
	return comment.node.querySelector('.content').textContent;
}

/**
 * @param HTMLDOMElement elem
 * @return string
 */
function findParentId (elem) {
	let indented = dom.closest(elem, '.' + INDENTED_CLASS);

	if (indented) {
		let parentComment = dom.prev(indented, '.' + COMMENT_CLASS);

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
		indented = '.' + INDENTED_CLASS,
		elem;

	elem = dom.closest(comment.node, indented);
	while (elem) {
		++level;

		elem = dom.closest(elem, indented);
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

	output.isNew = commentObj.node.classList.contains(NEW_COMMENT_CLASS);
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
	return comment.node.querySelector('.' + COMMENT_NEW_MARKER_CLASS);
}

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

	if (comment.header.querySelector('.hnew')) {
		return;
	}

	var hnav = comment.header.querySelector('.' + COMMENT_HNAV_CLASS);
	var span = dom.createElem('span', null, ['hnew'], text);
	hnav.appendChild(span);
}

function insertIntoHnav (comment, item) {
	var header = comment.header,
		hnew = header.querySelector('.hnew');

	if (hnew) {
		header.querySelector('.' + COMMENT_HNAV_CLASS)
			.insertBefore(item, hnew);
	} else {
		header.querySelector('.' + COMMENT_HNAV_CLASS)
			.appendChild(item);
	}
}

function commentLink (comment, commentToLinkID, text) {
	let link = comment.header.querySelector(`a[href="#${commentToLinkID}"]`);

	if (link) {
		link.parentNode.removeChild(link);
	}

	link = dom.createElem('a', [{name: 'href', value: '#' + commentToLinkID}], null, text);

	addHNav(comment);

	insertIntoHnav(comment, link);
	// comment.header.querySelector('.' + COMMENT_HNAV_CLASS).appendChild(link);
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

	return dom.next(elem, '.' + COMMENT_CLASS);
}

/**
 * @param commentDataStruct comment
 * @return commentStruct
 */
function commentDataStructToObj (comment) {
	var item = getCommentFromId(comment.id);

	return getCommentObj(item);
}

/**
 * @param commentStruct comment
 */
function setTroll (comment) {
	comment.node.classList.add(TROLL_COMMENT_CLASS);
	comment.header.classList.add(TROLL_COMMENT_HEADER_CLASS);

	var replies = dom.next(comment.node, '.' + INDENTED_CLASS);

	if (replies) {
		replies.classList.add(TROLL_COMMENT_REPLY_CLASS);
	}
}

/**
 * @param commentStruct comment
 */
function unsetTroll (comment) {
	comment.node.classList.remove(TROLL_COMMENT_CLASS);
	comment.header.classList.remove(TROLL_COMMENT_HEADER_CLASS);

	var replies = dom.next(comment.node, '.' + INDENTED_CLASS);

	if (replies) {
		replies.classList.remove(TROLL_COMMENT_REPLY_CLASS);
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
		'.' + TROLL_COMMENT_CLASS,
		'.' + TROLL_COMMENT_HEADER_CLASS,
		'.' + TROLL_COMMENT_REPLY_CLASS
	].join(',')));

	trolled.forEach(function (element) {
		element.classList.remove(TROLL_COMMENT_CLASS, TROLL_COMMENT_HEADER_CLASS, TROLL_COMMENT_REPLY_CLASS);
	});
}

/**
 * @param commentStruct comment
 */
function unhighlightComment (comment) {
	var commentObj = commentDataStructToObj(comment);
	commentObj.node.classList.remove(HIGHLIGHTED_COMMENT_CLASS);
	commentObj.header.style.backgroundColor = '';
	commentObj.header.style.color = '';
}

/**
 * @param commentStruct comment
 */
function highlightComment (comment) {
	var commentObj = commentDataStructToObj(comment);
	commentObj.node.classList.add(HIGHLIGHTED_COMMENT_CLASS);
	commentObj.header.style.backgroundColor = comment.userColor;

	commentObj.header.style.color = comment.userContrastColor;
	func.toArray(commentObj.header.querySelectorAll('a')).forEach(l => l.style.color = comment.userContrastColor);
}

/**
 * @param commentStruct comment
 */
function markBoring (comment) {
	comment.node.classList.add(BORING_COMMENT_CLASS);
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

	let footer = commentObj.footer.querySelector('.' + COMMENT_FOOTER_LINKS_CLASS);

	let href = link.querySelector('a').href;

	func.toArray(footer.querySelectorAll('a'))
		.filter(a => a.href === href)
		.forEach(a => footer.removeChild(a.parentNode));

	footer.appendChild(link);
}

/**
 * @param string text
 * @param href text
 * @param {string[]} classList
 */
function createFooterLink (text, href, classList) {
	var listItem = dom.createElem('li'),
		link;

	link = dom.createElem('a', [{name: 'href', value: href}], classList, text);
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
	var indentedClass = '.' + INDENTED_CLASS;
	var indented;
	var skippedOne = false;

	indented = dom.closest(comment, indentedClass);
	while (indented) {
		if (skippedOne) {
			indented.classList.add(WIDEN_COMMENT_CLASS);
		}

		skippedOne = true;

		indented = dom.closest(indented, indentedClass);
	}
}

function unwideComments () {
	func.toArray(document.querySelectorAll('.' + WIDEN_COMMENT_CLASS))
		.forEach(function (elem) {
			elem.classList.remove(WIDEN_COMMENT_CLASS);
		});
}

/**
 * @return {HTMLDOMElement[]}
 */
function getComments () {
	return func.toArray(document.querySelectorAll('.' + COMMENT_CLASS));
}

function hide (comment) {
	getCommentFromId(comment.id).classList.add('hup-hidden');
}

function show (comment) {
	getCommentFromId(comment.id).classList.remove('hup-hidden');
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
	let content = elem.node.querySelector('.content');

	let scores = elem.node.querySelector('.scores');

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
		scores.setAttribute('title', getScoreTitle(comment.votes));
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
	if (dom.is(e.target, '.expand-comment')) {
		e.preventDefault();
		unwideComments();
		let id = dom.prev(dom.closest(e.target, '.comment'), 'a').getAttribute('id');
		widenComment(id);

	}
}

function onBodyClick (e) {
	if (e.target.nodeName === 'A') {
		return;
	}

	if (dom.closest(e.target, '.comment')) {
		return;
	}

	unwideComments();
}

function convertComments (comments, opts) {
	return comments.map(function (opts, comment) {
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
