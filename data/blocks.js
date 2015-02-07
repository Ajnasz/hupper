/*jshint moz:true*/
(function (def, req) {
	'use strict';
	def('blocks', function () {
		const BLOCK_CLASS = 'block';

		function toArray(list) {
			return Array.prototype.slice.call(list);
		}

		function getBlocks() {
			return toArray(document.querySelectorAll('.' + BLOCK_CLASS));
		}
		return {
			getBlocks: getBlocks
		};
	});
}(window.def, window.req));
