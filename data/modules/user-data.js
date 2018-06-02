import cache from '../../core/cache';
import * as dom from '../../core/dom';

const USER_LINK_REGEXP = /^\/user\/(\d+)$/;

const userDataStruct = {
	id: 0,
	name: ''
};

function isUserLink (link) {
	return USER_LINK_REGEXP.test(link.pathname);
}

function getUserIdFromLink (link) {
	return parseInt(link.pathname.replace(USER_LINK_REGEXP, '$1'), 10);
}

function getUserData () {
	if (cache.has('userData')) {
		return cache.get('userData');
	}

	const userBlock = dom.selectOne('#block-user-1', document);

	let userData = Object.assign({}, userDataStruct);

	if (userBlock) {
		const id = dom.selectAll('.leaf a', userBlock)
			.filter(isUserLink)
			.reduce((id, link) => id || getUserIdFromLink(link), 0);

		if (!id) {
			return null;
		}

		const name = dom.selectOne('h2', userBlock).textContent;

		userData = Object.assign({}, userData, { name ,id });
		cache.set('userData', userData);
	}

	return userData;
}

export {
	getUserData,
	getUserIdFromLink,
};
