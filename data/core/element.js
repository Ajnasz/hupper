import * as dom from '../../core/dom';

export const HNAV_CLASS = 'hnav';

export function addHNav (node) {
	if (node && node.header && !node.header.querySelector(`.${HNAV_CLASS}`)) {
		const span = dom.createElem('span', null, [HNAV_CLASS]);

		node.header.appendChild(span);
	}

	return node;
}
