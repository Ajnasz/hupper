import { prefs } from '../core/prefs';
import * as pageStyles from './core/pagestyles';
import * as coreMain from './core/main';
import { log } from '../core/log';

/*
var eventEmitter = (function () {
	'use strict';
	var tabs = {};
	chrome.tabs.onRemoved.addListener(function (tabId) {
		tabs[tabId] = null;
	});
	chrome.runtime.onMessage.addListener(function (request, sender) {
		log.log('runtimemessage', sender);

		let tabId = sender.tab.id;

		let event = request.event;

		if (event === 'unload') {
			tabs[tabId] = null;
		} else {
			if (tabs[tabId] && tabs[tabId][event]) {
				tabs[tabId][event].forEach(function (cb) {
					cb(request.data);
				});
			}
		}
	});

	return function eventEmitter(tabId) {

		function on(event, cb) {
			if (!tabs[tabId]) {
				tabs[tabId] = {};
			}

			if (!tabs[tabId][event]) {
				tabs[tabId][event] = [];
			}

			log.log('register callback', event);

			tabs[tabId][event].push(cb);
		}

		function emit(event, args) {
			log.log('emit event', event, tabId);

			if (event === 'comments.update') {
				log.trace();
			}

			chrome.tabs.sendMessage(tabId, {event: event, data: args});
		}

		return {
			on: on,
			emit: emit
		};
	};
}());
*/
function manageStyles(tabId) {
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

/*
chrome.runtime.onMessage.addListener(function (request, sender) {
	'use strict';
	log.log('runtime message', request, sender);
	let event = request.event;

	if (event === 'DOMContentLoaded') {
		let events = eventEmitter(sender.tab.id);

		let {parseComments, parseArticles, parseBlocks} = coreMain;

		parseComments(events, prefs);
		parseArticles(events, prefs);
		manageStyles(sender.tab.id);

		prefs.getPref('parseblocks').then((parse) => {
			if (parse) {
				events.on('gotBlocks', parseBlocks.bind(null, events, prefs));
				events.emit('getBlocks');
			}
		});

		prefs.getPref('setunlimitedlinks').then((links) => {
			if (links) {
				events.emit('setUnlimitedLinks');
			}
		});


		events.on('trolluser', function (username) {
			username = username.trim();

			prefs.getCleanTrolls().then((trolls) => {

				if (trolls.indexOf(username) === -1) {
					trolls.push(username);
				}

				prefs.setPref('trolls', trolls.join(','));
			});
		});

		events.on('untrolluser', function (username) {
			username = username.trim();

			prefs.getCleanTrolls().then((trolls) => {
				let filteredTrolls = trolls.filter(function (troll) {
					return troll.trim() !== username;
				});

				prefs.setPref('trolls', filteredTrolls.join(','));
			});
		});

		events.on('unhighlightuser', function (username) {
			prefs.getCleanHighlightedUsers().then((users) => {
				let filteredUsers = users.filter(function (user) {
					return user.name !== username;
				});

				prefs.setPref('highlightusers', filteredUsers.map(function (user) {
					return user.name + ':' + user.color;
				}).join(','));
			});
		});

		events.on('highlightuser', function (username) {
			Promise.all([
				prefs.getCleanHighlightedUsers(),
				prefs.getPref('huppercolor')
			]).then((results) => {
				let [users, color] = results;
				if (!users.some(function (user) {
					return user.name === username;
				})) {
					users.push({
						name: username,
						color: color
					});
				}

				prefs.setPref('highlightusers', users.map(function (user) {
					return user.name + ':' + user.color;
				}).join(','));
			});
		});

		// events.on('gotBlocks', function (data) {
		// 	onGotBlocks(data);
		// });

		// events.emit('getBlocks');
	}
});
*/

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
	chrome.contextMenus.onClicked.addListener(function (info, tab) {
		chrome.tabs.sendMessage(tab.id, {
			event: info.menuItemId,
			data: info
		});
	});
});

(function () {
	var tabs = new Set();
	chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
		let {event, data} = msg;

		switch (event) {
		case 'register':
			tabs.add(sender.tab.id);
			sendResponse({event: 'registered'});
			manageStyles(sender.tab.id);
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
			coreMain.updateBlockGenya(data).then(sendResponse);
			return true;

		case 'article.hide-taxonomy':
			coreMain.hideArticle(data).then(sendResponse);
			return true;
		}


	});

	chrome.tabs.onRemoved.addListener(function (tabID) {
		tabs.delete(tabID);
	});
}());
