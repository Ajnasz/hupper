/*jshint moz:true*/
(function (def, req) {
	'use strict';
	def('unlimitedlinks', function () {
		let func = req('func');
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

		function setUnlimitedLinks() {
			func.toArray(document.getElementsByTagName('a'))
					.filter(isExtendableLink)
					.forEach(makeExtendable);
		}

		return {
			isExtendableLink: isExtendableLink,
			makeExtendable: makeExtendable,
			setUnlimitedLinks: setUnlimitedLinks
		};
	});
}(window.def, window.req));
