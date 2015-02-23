/*jshint esnext: true*/

function onGotBlocks(blocks) {
	/*
	let modBlocks = require('blocks'),
	blocksPref = modBlocks.mergeBlockPrefsWithBlocks(blocks);

	pref.setPref('blocks', JSON.stringify(blocksPref));

	worker.port.on('blocks.change-order-all-done', function () {
		finishBlockSetup(blocks, blocksPref);

		parseComments();
		parseArticles();
	});

	worker.port.emit('blocks.change-order-all', blocksPref);
	*/
}


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	console.log('runtime message', request);

	let event = request.event;


	switch (event) {
		case 'gotBlocks':
			onGotBlocks(event.data);
		break;
	}

	chrome.tabs.query({event: true, currentWindow: true}, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {event: 'getBlocks'});
	});
});
