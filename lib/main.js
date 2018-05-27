/* global chrome:true */

import * as preferences from '../core/prefs';
import * as pageStyles from './core/pagestyles';
import * as coreMain from './core/main';
import * as contentBlocker from './modules/content-blocker';

import { log } from '../core/log';

import updater from './updater';
import update01 from './updates/storage_local_to_sync_u01';

updater([{
	num: 1,
	updater: update01
}], chrome.storage);

preferences.createDefaultPrefs();

const prefs = preferences.prefs;

function manageStyles (tabID) {
	'use strict';
	Promise.all([
		prefs.getPref('style_min_fontsize'),
		prefs.getPref('style_wider_sidebar'),
		prefs.getPref('style_hide_left_sidebar'),
		prefs.getPref('style_hide_right_sidebar'),
		prefs.getPref('style_accessibility')
	]).then((resp) => {
		const  [minFontSize, minWidth, hideLeftSidebar, hideRightSidebar, loadStyles] = resp;
		const styles = pageStyles.getPageStyle({ minFontSize, minWidth, hideLeftSidebar, hideRightSidebar });
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

	const conf = {
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
				chrome.tabs.sendMessage(tab.id, { event: 'userChange', data: info });
			});
		}
	});
});

(function () {
	const tabs = new Set();
	const blockTabs = new Set();

	const toggleEmbedBlock = contentBlocker.getBlocker(blockTabs);

	prefs.getPref('block-embed').then(toggleEmbedBlock);
	prefs.on('block-embed', toggleEmbedBlock);

	prefs.on('*', function (value, name) {
		const msg = {
			event: 'prefChange',
			data: { name, value }
		};
		const sendMessage = tab => chrome.tabs.sendMessage(tab, msg);

		tabs.forEach(sendMessage);
	});

	chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
		const { event, data } = msg;

		switch (event) {

			case 'register':
				tabs.add(sender.tab.id);
				blockTabs.add(sender.tab.id);
				manageStyles(sender.tab.id);

				Promise.all([
					prefs.getPref('setunlimitedlinks'),
					prefs.getPref('parseblocks'),
					prefs.getPref('validateForms'),
					prefs.getPref('logenabled'),
					prefs.getPref('block-embed')
				]).then(settings => {
					const [
						setunlimitedlinks,
						parseblocks,
						validateForms,
						logenabled,
						blockEmbed,
					] = settings;

					sendResponse({ event: 'registered', data: {
						setunlimitedlinks,
						parseblocks,
						validateForms,
						logenabled,
						blockEmbed,
					} });
				});

				return true;

			case 'requestCommentParse':
				coreMain.commentParse(data, msg.context).then(sendResponse);

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
				coreMain.handleBlockAction(data, msg.context)
					.then(sendResponse)
					.catch(log.error);

				return true;

			case 'article.hide-taxonomy':
				coreMain.hideArticle(data).then(sendResponse);

				return true;

			case 'unblock-me':
				contentBlocker.unblockTab(sender.tab.id);
				Promise.resolve().then(() => sendResponse('unblock'));
				return true;
			default:
				return false;
		}

	});

	chrome.tabs.onRemoved.addListener(function (tabID) {
		tabs.delete(tabID);
		blockTabs.delete(tabID);
	});
}());
