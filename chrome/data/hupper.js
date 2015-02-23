/*jshint esnext:true*/
/*global chrome*/
(function (req) {
	'use strict';
	window.addEventListener('DOMContentLoaded', function () {
		let modBlocks = req('blocks');

		chrome.runtime.onMessage.addListener(function (request, sender) {
			if (request.event === 'getBlocks') {
				chrome.runtime.sendMessage({'event': 'gotBlocks', data: modBlocks.getBlocks()});
			}
			console.log('message request', request, sender);
		});

		console.log('dom content loaded');
		chrome.runtime.sendMessage({'event': 'DOMContentLoaded'});
	}, false);

	window.addEventListener('unload', function () {
		chrome.runtime.sendMessage({'event': 'unload'});
	});
}(window.req));
