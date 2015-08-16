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
		events.emit('articles.mark-new', {
			text: pref.getPref('newcommenttext'),
			articles: newArticles
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
			let taxonomies = pref.getCleanTaxonomies();

			if (taxonomies.indexOf(articles.cateogry) === -1) {
				taxonomies.push(article.category);
				pref.setPref('hidetaxonomy', taxonomies.join(','));

				let hideableArticles = modArticles.filterHideableArticles(articles, taxonomies);
				events.emit('articles.hide', hideableArticles);
			}
		});
		let hideableArticles = modArticles.filterHideableArticles(articles, pref.getCleanTaxonomies());
		events.emit('articles.hide', hideableArticles);
	});
	events.emit('getArticles');
}

function manageComments(events) {
	'use strict';
	console.log('parse comments');
	events.on('gotComments', function (comments) {
		let modComments = require('./core/comments');

		modComments.setScores(comments);

		if (pref.getPref('hideboringcomments')) {
			let boringRex = new RegExp(pref.getPref('boringcommentcontents'));
			modComments.markBoringComments(comments, boringRex);
		}

		if (pref.getPref('filtertrolls')) {
			let trolls = pref.getCleanTrolls();
			modComments.markTrollComments(comments, trolls);
		}

		let highlightedUsers = pref.getCleanHighlightedUsers();

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

		if (pref.getPref('replacenewcommenttext') && newComments.length > 0) {
			events.emit('comment.setNew', {
				comments: newComments,
				text: pref.getPref('newcommenttext')
			});
		}
		modComments.setPrevNextLinks(newComments, events).forEach(function (nextPrev) {
			events.emit('comment.addNextPrev', nextPrev);
		});

		if (newComments.length > 0) {
			events.emit('hupper-block.add-menu', {
				href: '#new',
				text: TEXT_FIRST_NEW_COMMENT
			});
		}

		/*
		require('sdk/simple-prefs').on('highlightusers', function () {
			let highlightedUsers = pref.getCleanHighlightedUsers();
			modComments.setHighlightedComments(highlightedUsers, comments);
			events.emit('comments.update', flatCommentList);
		});
		require('sdk/simple-prefs').on('trolls', function () {
			let trolls = pref.getCleanTrolls();
			modComments.updateTrolls(trolls, comments);
			events.emit('comments.update', flatCommentList);
		});
		*/

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
		let blockPrefs = JSON.parse(pref.getPref('blocks'));
		let modBlocks = require('./core/blocks');
		let output = modBlocks.updateBlock(details, prefName, value, blockPrefs);
		pref.setPref('blocks', JSON.stringify(blockPrefs));
		return output;
	}

	let func = require('./core/func');

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
		let block = updateBlock(details, 'hidden', true);

		emitBlockEvent(events, 'block.hide', block);
		emitBlockEvent(events, 'hupper-block.hide-block', block);
	}

	function onBlockRestore(events, details) {
		let block = updateBlock(details, 'hidden', false);

		emitBlockEvent(events, 'block.show', block);
		emitBlockEvent(events, 'hupper-block.show-block', block);
	}

	function onBlockHideContent(events, details) {
		let block = updateBlock(details, 'contentHidden', true);

		emitBlockEvent(events, 'block.hide-content', block);
	}

	function onBlockShowContent(events, details) {
		let block = updateBlock(details, 'contentHidden', false);

		emitBlockEvent(events, 'block.show-content', block);
	}

	function onUpDownAction(events, details) {
		let blockPrefs = JSON.parse(pref.getPref('blocks'));
		let columnBlocks = require('./core/blocks').onBlockChangeOrder(events, details, blockPrefs);
		if (columnBlocks) {
			pref.setPref('blocks', JSON.stringify(blockPrefs));
			events.emit('block.change-order', {
				sidebar: details.column,
				blocks: columnBlocks
			});
		}
	}

	function onLeftRightAction(events, details) {
		let blockPrefs = JSON.parse(pref.getPref('blocks'));
		let allBlocks = require('./core/blocks')
				.onBlockChangeColumn(events, details, blockPrefs);

		if (allBlocks) {
			pref.setPref('blocks', JSON.stringify(blockPrefs));

			events.emit('block.change-column', blockPrefs);
		}
	}

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

	function onGotBlocks(blocks) {
		let modBlocks = require('./core/blocks'),
			blocksPref = JSON.parse(pref.getPref('blocks'));

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
	}

	events.on('gotBlocks', onGotBlocks);
	events.emit('getBlocks');
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

		if (pref.getPref('setunlimitedlinks')) {
			events.emit('setUnlimitedLinks');
		}

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
