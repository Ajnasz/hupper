/* global chrome:true */
import * as tabs from '../tabs';
const BLOCK_URLS = ['*://platform.twitter.com/*'];

function getBlocker (blockTabs, unblockTabs) {

	function onWebRequest (details) {
		const hupTabs = tabs.getTabs();
		const cancel = hupTabs.has(details.tabId) &&
			details.url.indexOf('widgets.js') > -1 &&
			!unblockTabs.has(details.tabId);

		return { cancel };
	}
	return function (enabled) {
		if (enabled) {
			chrome.webRequest.onBeforeRequest.addListener(onWebRequest, {
				urls: BLOCK_URLS
			}, ['blocking']);
		} else {
			chrome.webRequest.onBeforeRequest.removeListener(onWebRequest);
			tabs.getTabs().forEach(tab => chrome.tabs.sendMessage(tab, { event: 'unblocked' }));
		}
	};
}

export {
	getBlocker
};
