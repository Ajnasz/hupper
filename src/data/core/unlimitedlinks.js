/*jshint moz:true*/
'use strict';
import * as func from '../../core/func';
import url from '../../core/url';

const MAX_COMMENTS_PER_PAGE = 9999;
const pathNames = [
	'/cikkek',
	'/node',
	'/szavazasok',
	'/promo'
];

function isOnHup (hostname) {
	return hostname === 'hup.hu' || hostname === 'www.hup.hu';
}

function isExtendablePath (linkPathName) {
	return pathNames.some(function (pathName) {
		return linkPathName.indexOf(pathName) === 0;
	});
}

function isExtendableLink (link) {
	return isOnHup(link.hostname) && isExtendablePath(link.pathname);
}

function makeExtendable (link) {
	let search = url.searchParams(link.search);

	link.search = '?' + search.set('comments_per_page', MAX_COMMENTS_PER_PAGE).toString();
}

function setUnlimitedLinks () {
	func.toArray(document.getElementsByTagName('a'))
		.filter(isExtendableLink)
		.forEach(makeExtendable);
}

export {
	isExtendableLink,
	makeExtendable,
	setUnlimitedLinks,
};
