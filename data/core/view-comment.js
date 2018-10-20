import * as dom from '../../core/dom';
import getCommentFromId from './get-comment-from-id';

const VIEW_COMMENT_CLASS = 'hupper-view-comment';
const VIEW_COMMENT_HEADER_CLASS = 'hupper-view-comment-header';
const VIEW_COMMENT_CLOSE_CLASS = 'hupper-view-comment-close';
const VIEW_COMMENT_CLASS_BG = 'hupper-view-comment-bg';

function close () {
	const bg = dom.selectOne(`.${VIEW_COMMENT_CLASS_BG}`, document.body);

	if (bg) {
		dom.remove(bg);
	}
	dom.selectAll(`.${VIEW_COMMENT_CLASS}`, document.body).forEach(dom.remove);
}

function createBg () {
	if (!dom.selectOne(`.${VIEW_COMMENT_CLASS_BG}`, document.body)) {
		const node = dom.createElem('div', null, [VIEW_COMMENT_CLASS_BG]);
		document.body.appendChild(node);
		dom.addListener('click', close, node);
	}
}

function removeCurrent () {
	dom.selectAll(`.${VIEW_COMMENT_CLASS}`, document.body).forEach(dom.remove);
}

function createHeader () {
	const header = dom.createElem('header', null, [VIEW_COMMENT_HEADER_CLASS]);
	const closeButton = dom.createElem('button', null, [VIEW_COMMENT_CLOSE_CLASS], 'close');
	dom.addListener('click', close, closeButton);
	header.appendChild(closeButton);

	return header;
}

function createDialog (id) {
	const comment = getCommentFromId(id);
	const clone = comment.cloneNode(true);
	const container = dom.createElem('div', null, [VIEW_COMMENT_CLASS]);

	container.appendChild(createHeader());
	container.appendChild(clone);

	return container;
}

function addViewCommentDialog (id) {
	document.body.appendChild(createDialog(id));
}

export default function viewComment (id) {
	createBg();
	removeCurrent();
	addViewCommentDialog(id);
}
