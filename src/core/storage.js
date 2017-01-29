/* global chrome */

import * as virtualStorage from './virtualStorage';

function hasChrome () {
	return typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined';
}

const storage = hasChrome() ? chrome.storage : virtualStorage.create();

export default storage;
