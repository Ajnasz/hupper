/* global chrome:true */

import { prefs } from '../core/prefs';
import * as pageStyles from './core/pagestyles';
import * as coreMain from './core/main';
// import { log } from '../core/log';


function manageStyles (tabId) {
	'use strict';
	Promise.all([
		prefs.getPref('style_min_fontsize'),
		prefs.getPref('style_wider_sidebar'),
		prefs.getPref('style_hide_left_sidebar'),
		prefs.getPref('style_hide_right_sidebar')
	]).then((resp) => {
		let  [ minFontSize, minWidth, hideLeftSidebar, hideRightSidebar ] = resp;
		let styles = pageStyles.getPageStyle({ minFontSize, minWidth, hideLeftSidebar, hideRightSidebar });
		if (styles.length) {
			chrome.tabs.insertCSS(tabId, {
				code: styles.join('')
			});
		}
	});
}

var contextConf = {
	contexts: ['link'],
	targetUrlPatterns: [
		'http://www.hup.hu/user/*',
		'https://www.hup.hu/user/*',
		'http://hup.hu/user/*',
		'https://hup.hu/user/*'
	]
};

[
	'trolluser',
	'untrolluser',
	'highlightuser',
	'unhighlightuser'
].forEach((title) => {
	'use strict';

	let conf = {
		id: title,
		title: title,
		contexts: contextConf.contexts,
		targetUrlPatterns: contextConf.targetUrlPatterns,
		// onclick: onContextClick(title)
	};

	chrome.contextMenus.create(conf);
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
	console.log('menu clicked', info);
	chrome.tabs.sendMessage(tab.id, {
		event: info.menuItemId,
		data: info
	}, function (user) {
		if (user) {
			let action;
			switch (info.menuItemId) {
			case 'highlightuser':
				action = coreMain.highlightUser(user.data);
				break;

			case 'unhighlightuser':
				action = coreMain.unhighlightUser(user.data);
				break;

			case 'trolluser':
				action = coreMain.trollUser(user.data);
				break;

			case 'untrolluser':
				action = coreMain.untrollUser(user.data);
				break;
			}

			if (!action) {
				return;
			}

			action.then(function () {
				chrome.tabs.sendMessage(tab.id, {event: 'userChange', data: info});
			});
		}
	});
});

(function () {
	let tabs = new Set();

	chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
		let {event, data} = msg;

		switch (event) {

		case 'register':
			tabs.add(sender.tab.id);
			manageStyles(sender.tab.id);
			prefs.getPref('setunlimitedlinks').then(s => {
				sendResponse({event: 'registered', data: {
					setunlimitedlinks: s
				}});
			});

			return true;

		case 'requestCommentParse':
			coreMain.commentGenya(data).then(sendResponse);

			return true;

		case 'requestArticleParse':
			coreMain.articleGenya(data).then(sendResponse);

			return true;

		case 'requestBlockParse':
			coreMain.blockGenya(data).then(sendResponse);

			return true;

		case 'block.action':
			coreMain.updateBlockGenya(data, msg.context).then(x => {
				console.log('foobar', x);
				sendResponse(x);
			}).catch(e => {
				console.error(e);
				// sendResponse(e);
			});

			return true;

		case 'article.hide-taxonomy':
			coreMain.hideArticle(data).then(sendResponse);

			return true;
		default:
			return false;
		}

	});

	chrome.tabs.onRemoved.addListener(function (tabID) {
		tabs.delete(tabID);
	});
}());
