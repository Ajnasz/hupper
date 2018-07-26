import * as dom from '../../core/dom';

/**
 * @param commentStruct comment
 * @return String
 */
export function getCommentId (comment) {
	const element = dom.prev('a', comment.node);

	if (element) {
		return element.getAttribute('id');
	}

	return '';
}
