chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	console.log('runtime message', request);
	chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {event: 'whatisit'});
	});
});
