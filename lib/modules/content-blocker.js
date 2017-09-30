import * as tabs from './tabs';
import * as twitterBlocker from './content-blockers/twitter';

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

	function toggleBlocker (enabled) {
		toggleTwitterBlocker(enabled);
	}

	return toggleBlocker;
}

export {
	getBlocker,
	unblockTab,
};
