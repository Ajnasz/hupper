/* global chrome:true */

import { prefs } from '../core/prefs';
import * as pageStyles from './core/pagestyles';
import * as coreMain from './core/main';
// import { log } from '../core/log';


function manageStyles (tabID) {
	'use strict';
	Promise.all([
		prefs.getPref('style_min_fontsize'),
		prefs.getPref('style_wider_sidebar'),
		prefs.getPref('style_hide_left_sidebar'),
		prefs.getPref('style_hide_right_sidebar'),
		prefs.getPref('style_accessibility')
	]).then((resp) => {
		let  [ minFontSize, minWidth, hideLeftSidebar, hideRightSidebar, loadStyles ] = resp;
		let styles = pageStyles.getPageStyle({ minFontSize, minWidth, hideLeftSidebar, hideRightSidebar });
		if (styles.length) {
			chrome.tabs.insertCSS(tabID, {
				code: styles.join('')
			});
		}

		if (loadStyles) {
			chrome.tabs.insertCSS(tabID, {
				file: 'data/core/css/accessibilitystyles.css'
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

	chrome.storage.onChanged.addListener(function (changes, namespace) {
		console.log('storage change', changes, namespace);

		tabs.forEach(tab => {
			Object.keys(changes)
				.forEach(name => chrome.tabs.sendMessage(tab, {event: 'prefChange', data: name}));
		});
	});

	chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
		let {event, data} = msg;

		switch (event) {

		case 'register':
			tabs.add(sender.tab.id);
			manageStyles(sender.tab.id);
			Promise.all([
				prefs.getPref('setunlimitedlinks'),
				prefs.getPref('parseblocks')
			]).then(settings => {
				let [setunlimitedlinks, parseblocks] = settings;
				sendResponse({event: 'registered', data: {
					setunlimitedlinks,
					parseblocks
				}});
			});

			return true;

		case 'requestCommentParse':
			coreMain.commentParse(data).then(sendResponse);

			return true;

		case 'requestArticleParse':
			coreMain.articleParse(data).then(sendResponse);

			return true;

		case 'requestBlockParse':
			prefs.getPref('parseblocks').then(parse => {
				if (parse) {
					coreMain.blockParse(data).then(sendResponse);
				} else {
					sendResponse(null);
				}
			});

			return true;

		case 'block.action':
			coreMain.handleBlockAction(data, msg.context).then(x => {
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
