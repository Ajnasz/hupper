/*jshint esnext: true*/
/*global chrome*/

var eventEmitter = (function () {
	'use strict';
	var tabs = {};
	chrome.tabs.onRemoved.addListener(function (tabId) {
		tabs[tabId] = null;
	});
	chrome.runtime.onMessage.addListener(function (request, sender) {
		console.log('runtimemessage', sender);

		let tabId = sender.tab.id;

		let event = request.event;
		
		if (event === 'unload') {
			tabs[tabId] = null;
		} else {
			if (tabs[tabId] && tabs[tabId][event]) {
				tabs[tabId][event].forEach(function (cb) {
					cb(request.data);
				});
			}
		}
	});

	return function eventEmitter(tabId) {

		function on(event, cb) {
			if (!tabs[tabId]) {
				tabs[tabId] = {};
			}

			if (!tabs[tabId][event]) {
				tabs[tabId][event] = [];
			}

			console.log('register callback', event);

			tabs[tabId][event].push(cb);
		}

		function emit(event, args) {
			console.log('emit event', event, tabId);
			chrome.tabs.sendMessage(tabId, {event: event, data: args});
		}

		return {
			on: on,
			emit: emit
		};
	};
}());

function onGotBlocks(blocks) {
	'use strict';
	console.log('on got blocks', blocks);
}


chrome.runtime.onMessage.addListener(function (request, sender) {
	'use strict';
	console.log('runtime message', request, sender);
	let event = request.event;

	if (event === 'DOMContentLoaded') {
		let events = eventEmitter(sender.tab.id);

		events.on('gotBlocks', function (data) {
			onGotBlocks(data);
		});

		events.emit('getBlocks');
	}
});
