import * as dom from './dom';

const HNAV_CLASS = 'hnav';

function addHNav(node) {
	if (node && node.header && !node.header.querySelector(`.${HNAV_CLASS}`)) {
		let span = dom.createElem('span', null, [HNAV_CLASS]);

		node.header.appendChild(span);
	}
}

export {
	addHNav
};
