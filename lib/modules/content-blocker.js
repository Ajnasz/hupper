/* global chrome:true */
import * as tabs from './tabs';
import * as twitterBlocker from './content-blockers/twitter';
import * as youtubeBlocker from './content-blockers/youtube';

const unblockTabs = new Set();

function removeUnblock ({ tabID }) {
	if (unblockTabs.has(tabID)) {
		unblockTabs.delete(tabID);
	}
}

tabs.events.on('updateStatus', removeUnblock);
tabs.events.on('tabRemove', removeUnblock);

function unblockTab (tabId) {
	unblockTabs.add(tabId);
}

function getBlocker (blockTabs) {
	const toggleTwitterBlocker = twitterBlocker.getBlocker(blockTabs, unblockTabs);
	const toggleYoutubeBlocker = youtubeBlocker.getBlocker(blockTabs, unblockTabs);

	function toggleBlocker (enabled) {
		toggleTwitterBlocker(enabled);
		toggleYoutubeBlocker(enabled);

		if (!enabled) {
			tabs.getTabs().forEach(tab => chrome.tabs.sendMessage(tab, { event: 'unblocked' }));
		}
	}

	return toggleBlocker;
}

export {
	getBlocker,
	unblockTab,
};
