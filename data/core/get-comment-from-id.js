import { next } from '../../core/dom';

const COMMENT_CLASS = 'comment';
/**
 * @param string id Comment id
 * @return HTMLDOMElement Comment element
 */
export default function getCommentFromId (id) {
	var elem = document.getElementById(id);

	return next(`.${COMMENT_CLASS}`, elem);
}
