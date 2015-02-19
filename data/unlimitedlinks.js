/*jshint moz:true*/
(function (def) {
	'use strict';
	def('unlimitedlinks', function () {
		let pathNames = [
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

		return {
			isExtendableLink: isExtendableLink,
			makeExtendable: makeExtendable
		};
	});
}(window.def));
