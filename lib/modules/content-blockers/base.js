/* global chrome:true */
import * as tabs from '../tabs';

function createRequestBlocker ({ BLOCK_URLS, BLOCK_TYPES }) {
	function requestBlocker (blockTabs, unblockTabs) {
		function requestCallback (details) {
			const hupTabs = tabs.getTabs();

			const cancel = hupTabs.has(details.tabId) &&
				!unblockTabs.has(details.tabId);

			return { cancel };
		}
		return function (enabled) {
			if (enabled) {
				chrome.webRequest.onBeforeRequest.addListener(requestCallback, {
					urls: BLOCK_URLS,
					types: BLOCK_TYPES
				}, ['blocking']);
			} else {
				chrome.webRequest.onBeforeRequest.removeListener(requestCallback);
			}
		};
	}

	return requestBlocker;
}

export default createRequestBlocker;
