/*jshint moz:true*/
'use strict';
import * as func from '../../core/func';
import url from '../../core/url';

const pathNames = [
	'/cikkek',
	'/node',
	'/szavazasok',
	'/promo',
	'/treyblog',
];

function isOnHup (hostname) {
	return hostname === 'hup.hu' || hostname === 'www.hup.hu' || hostname === 'oldhup.hu';
}

function isExtendablePath (linkPathName) {
	return pathNames.some(function (pathName) {
		return linkPathName.indexOf(pathName) === 0;
	});
}

function isExtendableLink (link) {
	return isOnHup(link.hostname) && isExtendablePath(link.pathname);
}

function makeExtendable (MAX_COMMENTS_PER_PAGE, link) {
	const search = url.searchParams(link.search);

	link.search = '?' + search.set('comments_per_page', MAX_COMMENTS_PER_PAGE).toString();

	return link;
}

function setUnlimitedLinks (links, MAX_COMMENTS_PER_PAGE) {
	func.toArray(links)
		.filter(isExtendableLink)
		.forEach(func.curry(makeExtendable, MAX_COMMENTS_PER_PAGE));
}

export {
	isExtendableLink,
	makeExtendable,
	setUnlimitedLinks,
};
