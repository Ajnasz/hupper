import * as dom from '../../core/dom';

export const CLASSES = {
	COMMENT_HEADER: 'submitted',
	COMMENT_FOOTER: 'link',
};

/**
 * @type commentStruct
 *   node: HTMLCommentNode
 *   header: HTMLDOMElement
 *   footer: HTMLDOMElement
 */
const commentStruct = {
	node: null,
	header: null,
	footer: null
};

/**
 * @param HTMLCommentNode node
 * @return Object
 *   node: HTMLCommentNode
 *   header: HTMLDOMElement
 *   footer: HTMLDOMElement
 */
export function getCommentObj (node) {
	const commentObj = Object.create(commentStruct);

	commentObj.node = node;
	commentObj.header = dom.selectOne(`.${CLASSES.COMMENT_HEADER}`, node);
	commentObj.footer = dom.selectOne(`.${CLASSES.COMMENT_FOOTER}`, node);

	if (!commentObj.footer && node.nextElementSibling && dom.hasClass(CLASSES.COMMENT_FOOTER, node.nextElementSibling)) {
		commentObj.footer = node.nextElementSibling;
		node.appendChild(commentObj.footer);
	}

	return commentObj;
}
