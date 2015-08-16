/*jshint esnext: true*/
/*global chrome, require*/

let pref = require('./pref');

const TEXT_FIRST_ARTICLE_WITH_NEW_COMMENTS = 'Olvasatlan hozzászólások';
const TEXT_FIRST_NEW_COMMENT = 'Első olvasatlan hozzászólás';

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

function manageArticles(events) {
	'use strict';
	let modArticles = require('./core/articles');

	events.on('gotArticles', function (articles) {
		let newArticles = articles.filter(modArticles.filterNewArticles);
		console.log('articles', articles);
		pref.getPref('newcommenttext').then((pref) => {
			events.emit('articles.mark-new', {
				text: pref,
				articles: newArticles
			});
		});
		if (newArticles.length > 0) {
			events.emit('hupper-block.add-menu', {
				href: '#' + newArticles[0].id,
				text: TEXT_FIRST_ARTICLE_WITH_NEW_COMMENTS
			});

			let nextPrev = modArticles.setNewArticles(newArticles, events);

			if (nextPrev) {
				nextPrev.forEach(function (item) {
					events.emit('articles.addNextPrev', item);
				});
			}
		}

		events.emit('articles.add-category-hide-button', articles);

		events.on('article.hide-taxonomy', function (article) {
			pref.getCleanTaxonomies().then((taxonomies) => {
				if (taxonomies.indexOf(articles.cateogry) === -1) {
					taxonomies.push(article.category);
					pref.setPref('hidetaxonomy', taxonomies.join(','));

					let hideableArticles = modArticles.filterHideableArticles(articles, taxonomies);
					events.emit('articles.hide', hideableArticles);
				}
			});
		});
		pref.getCleanTaxonomies().then((taxonomies) => {
			let hideableArticles = modArticles.filterHideableArticles(articles, taxonomies);
			events.emit('articles.hide', hideableArticles);
		});
	});
	events.emit('getArticles');
}

function manageComments(events) {
	'use strict';
	console.log('parse comments');
	events.on('gotComments', function (comments) {
		let modComments = require('./core/comments');

		modComments.setScores(comments);
		pref.getPref('hideboringcomments').then((hide) => {
			if (hide) {
				pref.getPref('boringcommentcontents').then((regexp) => {
					let boringRex = new RegExp(regexp);
					modComments.markBoringComments(comments, boringRex);
				});
			}
		});
		pref.getPref('filtertrolls').then((hide) => {
			if (hide) {
				pref.getCleanTrolls().then((trolls) => {
					modComments.markTrollComments(comments, trolls);
				});
			}
		});

		pref.getCleanHighlightedUsers().then((highlightedUsers) => {

			if (highlightedUsers.length) {
				modComments.setHighlightedComments(highlightedUsers, comments);
			}

			let flatCommentList = modComments.flatComments(comments);

			let childComments = flatCommentList.filter(function (comment) {
				return comment.parent !== '';
			});

			events.emit('comment.addParentLink', childComments);
			events.emit('comment.addExpandLink', childComments.filter(function (comment) {
				return comment.indentLevel > 1;
			}));

			events.emit('comments.update', flatCommentList);

			let newComments = modComments.getNewComments(comments);

			pref.getPref('replacenewcommenttext').then((replace) => {
				if (replace && newComments.length > 0) {
					pref.getPref('newcommenttext').then((text) => {
						events.emit('comment.setNew', {
							comments: newComments,
							text: text
						});
					});
				}
			});
			modComments.setPrevNextLinks(newComments, events).forEach(function (nextPrev) {
				events.emit('comment.addNextPrev', nextPrev);
			});

			if (newComments.length > 0) {
				events.emit('hupper-block.add-menu', {
					href: '#new',
					text: TEXT_FIRST_NEW_COMMENT
				});
			}

			pref.on('highlightusers', function () {
				pref.getCleanHighlightedUsers().then((highlightedUsers) => {
					modComments.setHighlightedComments(highlightedUsers, comments);
					events.emit('comments.update', flatCommentList);
				});
			});
			pref.on('trolls', function () {
				pref.getCleanTrolls().then((trolls) => {
					modComments.updateTrolls(trolls, comments);
					events.emit('comments.update', flatCommentList);
				});
			});
		});

	});

	events.emit('getComments', {
		// get content only if filtering boring comments
		content: true
	});

}

function manageBlocks(events) {
	'use strict';
	function emitBlockEvent(events, event, block) {
		events.emit(event, {
			id: block.id,
			column: block.column
		});
	}

	function requestBlockHide(events, block) {
		emitBlockEvent(events, 'block.hide', block);
		emitBlockEvent(events, 'hupper-block.hide-block', block);
	}

	function requestBlockContentHide(events, block) {
		emitBlockEvent(events, 'block.hide-content', block);
		emitBlockEvent(events, 'hupper-block.show-block', block);
	}

	function updateBlock(details, prefName, value) {
		return pref.getPref('blocks').then((blocks) => {
			return new Promise((resolve) => {
				let blockPrefs = JSON.parse(blocks);
				let modBlocks = require('./core/blocks');
				let output = modBlocks.updateBlock(details, prefName, value, blockPrefs);
				pref.setPref('blocks', JSON.stringify(blockPrefs));
				resolve(output);
			});
		});
	}

	let func = require('./core/func');

	function onBlockAction(events, details) {

		switch (details.action) {
			case 'delete':
				onBlockDelete(events, details);
			break;

			case 'restore':
				onBlockRestore(events, details);
			break;

			case 'hide-content':
				onBlockHideContent(events, details);
			break;

			case 'show-content':
				onBlockShowContent(events, details);
			break;

			case 'up':
			case 'down':
				onUpDownAction(events, details);
			break;

			case 'left':
			case 'right':
				onLeftRightAction(events, details);
			break;
		}
	}

	function finishBlockSetup(blocks, blocksPref) {
		let modBlocks = require('./core/blocks');

		events.emit('blocks.set-titles', modBlocks.getBlockTitles());

		let allBlocks = blocksPref.left.concat(blocksPref.right);

		allBlocks.filter(modBlocks.filterHidden)
				.forEach(func.partial(requestBlockHide, events));

		allBlocks.filter(modBlocks.filterContentHidden)
				.forEach(func.partial(requestBlockContentHide, events));

		events.on('block.action', func.partial(onBlockAction, events));
	}

	function onBlockDelete(events, details) {
		updateBlock(details, 'hidden', true).then((block) => {
			emitBlockEvent(events, 'block.hide', block);
			emitBlockEvent(events, 'hupper-block.hide-block', block);
		});
	}

	function onBlockRestore(events, details) {
		updateBlock(details, 'hidden', false).then((block) => {
			emitBlockEvent(events, 'block.show', block);
			emitBlockEvent(events, 'hupper-block.show-block', block);
		});
	}

	function onBlockHideContent(events, details) {
		updateBlock(details, 'contentHidden', true).then((block) => {
			emitBlockEvent(events, 'block.hide-content', block);
		});
	}

	function onBlockShowContent(events, details) {
		updateBlock(details, 'contentHidden', false).then((block) => {
			emitBlockEvent(events, 'block.show-content', block);
		});
	}

	function onUpDownAction(events, details) {
		pref.getPref('blocks').the((blocks) => {
			let blockPrefs = JSON.parse(blocks);
			let columnBlocks = require('./core/blocks').onBlockChangeOrder(events, details, blockPrefs);
			if (columnBlocks) {
				pref.setPref('blocks', JSON.stringify(blockPrefs));
				events.emit('block.change-order', {
					sidebar: details.column,
					blocks: columnBlocks
				});
			}
		});
	}

	function onLeftRightAction(events, details) {
		pref.getPref('blocks').the((blocks) => {
			let blockPrefs = JSON.parse(blocks);
			let allBlocks = require('./core/blocks')
					.onBlockChangeColumn(events, details, blockPrefs);

			if (allBlocks) {
				pref.setPref('blocks', JSON.stringify(blockPrefs));

				events.emit('block.change-column', blockPrefs);
			}
		});
	}

	function onGotBlocks(blocks) {
		pref.getPref('blocks').then((blocksPrefStr) => {
			let modBlocks = require('./core/blocks'),
				blocksPref = JSON.parse(blocksPrefStr);

			blocksPref = modBlocks.mergeBlockPrefsWithBlocks(blocks, blocksPref);

			pref.setPref('blocks', JSON.stringify(blocksPref));

			events.emit('enableBlockControls', blocks.left);
			events.emit('enableBlockControls', blocks.right);

			events.on('blocks.change-order-all-done', function () {
				finishBlockSetup(blocks, blocksPref);

				// parseComments();
				// parseArticles();
			});

			events.emit('blocks.change-order-all', blocksPref);
		});
	}

	events.on('gotBlocks', onGotBlocks);
	events.emit('getBlocks');
}

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

		manageArticles(events);
		manageComments(events);
		manageBlocks(events);
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
			]).then((users, color) => {
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

		pref.getPref('setunlimitedlinks').then((links) => {
			if (links) {
				events.emit('setUnlimitedLinks');
			}
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
['trolluser', 'untrolluser', 'highlightuser', 'unhighlightuser'].forEach(function (title) {
	'use strict';

    let conf = {
        title: title,
        contexts: contextConf.contexts,
        targetUrlPatterns: contextConf.targetUrlPatterns,
        onclick: onContextClick(title)
    };
    chrome.contextMenus.create(conf);
});
