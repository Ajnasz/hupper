import matchPattern from '../core/match-pattern';
import * as chromeEvents from '../core/chromeEvents';
import * as func from '../core/func';

let tabs = [];

function addTab (tab) {
	tabs.push(tab);
	global.chrome.tabs.onUpdated.dispatch(tab.id, { url: tab.url });
}

function removeTab (tab) {
	tabs = tabs.filter(t => {
		global.chrome.tabs.onRemoved.dispatch(t.id);
		return t.id !== tab;
	});
}

function createTab (url) {
	return {
		url,
		id: func.genID()
	};
}

function clear () {
	tabs.length = 0;
}

if (!global.chrome) {
	global.chrome = {};
}

if (!global.chrome.tabs) {
	global.chrome.tabs = {};
}

if (!global.chrome.tabs.onUpdated) {
	global.chrome.tabs.onUpdated = chromeEvents.create();
}

if (!global.chrome.tabs.onRemoved) {
	global.chrome.tabs.onRemoved = chromeEvents.create();
}

if (!global.chrome.tabs.query) {
	global.chrome.tabs.query = (pattern, callback) => {
		const patternRegexp = matchPattern(pattern.url);
		callback(tabs.filter(tab => patternRegexp.test(tab.url)));
	};
}

export {
	addTab,
	removeTab,
	createTab,
	clear
};
