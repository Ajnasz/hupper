/*jshint esnext:true*/
(function (req) {
	'use strict';
	console.log(window, window.req)
	window.addEventListener('DOMContentLoaded', function () {
		let modCommentTree = req('commenttree');

		console.log(document.getElementById('comments'), modCommentTree.getCommentTree());
	}, false);
}(window.req));
