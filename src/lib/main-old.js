/*jshint esnext: true*/
/*global chrome, require*/

let pref = require('./pref').pref;

var eventEmitter = (function () {
	'use strict';
	var tabs = {};
	chrome.tabs.onRemoved.addListener(function (tabId) {
		tabs[tabId] = null;
	});
	chrome.runtime.onMessage.addListener(function (request, sender) {
		console.log('runtimemessage', sender);

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

			console.log('register callback', event);

			tabs[tabId][event].push(cb);
		}

		function emit(event, args) {
			console.log('emit event', event, tabId);
			chrome.tabs.sendMessage(tabId, {event: event, data: args});
		}

		return {
			on: on,
			emit: emit
		};
	};
}());
function manageStyles(tabId) {
	'use strict';
	let pageStyles = require('./core/pagestyles');
	Promise.all([
		pref.getPref('style_min_fontsize'),
		pref.getPref('style_wider_sidebar'),
		pref.getPref('style_hide_left_sidebar'),
		pref.getPref('style_hide_right_sidebar')
	]).then((resp) => {
		let styles = pageStyles.getPageStyle({
			minFontSize: resp[0],
			minWidth: resp[1],
			hideLeftSidebar: resp[2],
			hideRightSidebar: resp[3]
		});
		if (styles.length) {
			chrome.tabs.insertCSS(tabId, {
				code: styles.join('')
			});
		}
	});
}

chrome.runtime.onMessage.addListener(function (request, sender) {
	'use strict';
	console.log('runtime message', request, sender);
	let event = request.event;

	if (event === 'DOMContentLoaded') {
		let events = eventEmitter(sender.tab.id);

		let parseComments = require('./core/main').parseComments;
		let parseArticles = require('./core/main').parseArticles;
		let parseBlocks = require('./core/main').parseBlocks;

		parseComments(events, pref);
		parseArticles(events, pref);

		pref.getPref('parseblocks').then((parse) => {
			if (parse) {
				events.on('gotBlocks', parseBlocks.bind(null, events, pref));
				events.emit('getBlocks');
			}
		});

		pref.getPref('setunlimitedlinks').then((links) => {
			if (links) {
				events.emit('setUnlimitedLinks');
			}
		});

		manageStyles(sender.tab.id);

		events.on('trolluser', function (username) {
			pref.getCleanTrolls().then((trolls) => {

				if (trolls.indexOf(username) === -1) {
					trolls.push(username);
				}

				pref.setPref('trolls', trolls.join(','));
			});
		});

		events.on('untrolluser', function (username) {
			username = username.trim();
			pref.getCleanTrolls().then((trolls) => {
				let filteredTrolls = trolls.filter(function (troll) {
					return troll.trim() !== username;
				});

				pref.setPref('trolls', filteredTrolls.join(','));
			});
		});

		events.on('unhighlightuser', function (username) {
			pref.getCleanHighlightedUsers().then((users) => {
				let filteredUsers = users.filter(function (user) {
					return user.name !== username;
				});

				pref.setPref('highlightusers', filteredUsers.map(function (user) {
					return user.name + ':' + user.color;
				}).join(','));
			});
		});

		events.on('highlightuser', function (username) {
			Promise.all([
				pref.getCleanHighlightedUsers(),
				pref.getPref('huppercolor')
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

				pref.setPref('highlightusers', users.map(function (user) {
					return user.name + ':' + user.color;
				}).join(','));
			});
		});

		/*
		events.on('gotBlocks', function (data) {
			onGotBlocks(data);
		});

		events.emit('getBlocks');
		*/
	}
});

var onContextClick = function (type) {
	'use strict';
    return function (e) {
        chrome.tabs.getSelected(null, function (tab) {
            chrome.tabs.sendMessage(tab.id, {
                event: type,
                data: e
            }, function () {
                // console.log(cb)
            });
        });
    };
};
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
        title: title,
        contexts: contextConf.contexts,
        targetUrlPatterns: contextConf.targetUrlPatterns,
        onclick: onContextClick(title)
    };

    chrome.contextMenus.create(conf);
});
