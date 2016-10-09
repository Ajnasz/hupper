/*jshint moz:true*/
'use strict';
import * as func from '../../core/func';

const pathNames = [
	'/cikkek',
	'/node',
	'/szavazasok',
	'/promo'
];

function isOnHup(hostname) {
	return hostname === 'hup.hu' || hostname === 'www.hup.hu';
}

function isExtendablePath(linkPathName) {
	return pathNames.some(function (pathName) {
		return linkPathName.indexOf(pathName) === 0;
	});
}

function isExtendableLink(link) {
	return isOnHup(link.hostname) && isExtendablePath(link.pathname);
}

function makeExtendable(link) {
	let search = link.search;
	link.search = search[0] === '?' ? '&comments_per_page=9999' : '?comments_per_page=9999';
}

function setUnlimitedLinks() {
	func.toArray(document.getElementsByTagName('a'))
		.filter(isExtendableLink)
		.forEach(makeExtendable);
}

export {
	isExtendableLink,
	makeExtendable,
	setUnlimitedLinks,
};
