import * as dom from '../../core/dom';

const HNAV_CLASS = 'hnav';

function addHNav (node) {
	if (node && node.header && !node.header.querySelector(`.${HNAV_CLASS}`)) {
		const span = dom.createElem('span', null, [HNAV_CLASS]);

		node.header.appendChild(span);
	}
}

export {
	addHNav
};
