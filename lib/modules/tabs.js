/* global chrome:true */

import * as func from '../../core/func';
import { createEmitter } from '../../core/events';
import matchPattern from '../../core/match-pattern';

const events = createEmitter();
const tabURLs = new Map();

function addTabUrl (tabID, url) {
	tabURLs.set(tabID, url);
}

chrome.tabs.onUpdated.addListener((tabID, changeInfo) => {
	if (changeInfo.url) {
		addTabUrl(tabID, changeInfo.url);
	}

	Object.keys(changeInfo).forEach(key => {
		const eventName = func.toCamelCase(`update-${key}`);

		events.emit(func.toCamelCase(eventName), {
			tabID,
			[key]: changeInfo[key],
		});
	});
});

chrome.tabs.onRemoved.addListener((tabID) => {
	tabURLs.delete(tabID);
	events.emit('tabRemove', { tabID });
});

if (chrome.tabs.query) {
	chrome.tabs.query({ url: '*://hup.hu/*' }, tabs => {
		tabs.forEach(tab => addTabUrl(tab.id, tab.url));
	});
}

function getTabs () {
	const pattern = matchPattern('*://hup.hu/*');
	const tabs = new Set();

	tabURLs.forEach((url, tabID) => {
		if (pattern.test(url)) {
			tabs.add(tabID);
		}
	});

	return tabs;
}

export {
	getTabs,
	events
};
