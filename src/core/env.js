/* global chrome */
function hasChrome () {
	return typeof chrome !== 'undefined';
}

function hasChromeStorage () {
	return hasChrome() && typeof chrome.storage !== 'undefined';
}

function hasChromeRuntime () {
	return hasChrome() && typeof chrome.runtime !== 'undefined';
}

function getChromeRuntime () {
	return chrome.runtime;
}

function getChromeStorage () {
	return chrome.storage;
}

export {
	hasChrome,
	hasChromeStorage,
	getChromeStorage,
	hasChromeRuntime,
	getChromeRuntime
};
