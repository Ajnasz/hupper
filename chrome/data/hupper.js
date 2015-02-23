/*jshint esnext:true*/
(function (req) {
	'use strict';
	window.addEventListener('DOMContentLoaded', function () {
		let modCommentTree = req('commenttree');

		console.log('send message to: ', chrome.runtime);

		chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
			console.log('message request', request);
		});
		chrome.runtime.sendMessage({'foo': 'bar'});
	}, false);
}(window.req));
