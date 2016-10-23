import * as modBlocks from './core/blocks';
import * as modArticles from './core/articles';
import * as modHupperBlock  from './core/hupper-block';
import * as modComment from './core/comments';

import * as unlimitedlinks from './core/unlimitedlinks';
import * as modCommentTree from './core/commenttree';

import { log } from '../core/log';

log.log(modBlocks, modArticles, modHupperBlock, modComment);

let events = (function () {
	let listeners = new Map();

	function listen(request, sender) {
		let {event, data} = request;

		if (listeners.has(event)) {
			listeners.get(event).forEach(cb => cb(data));
		}

		log.log('message request', request, sender);
	}

	return {
		on(name, cb) {
			log.log('Add listener', name);

			if (!listeners.has(name)) {
				listeners.set(name, []);
			}

			listeners.get(name).push(cb);
		},

		emit(name, args) {
			log.log('Emit Listener', name, args);
			chrome.runtime.sendMessage({event: name, data: args});
		},

		init() {
			log.log('events init');
			chrome.runtime.onMessage.addListener(listen);
			window.addEventListener('unload', function () {
				listeners.clear();
				listeners = null;
			});

		}

	};
}());

function addHupperBlock() {
	return new Promise(function (resolve) {
		modHupperBlock.addHupperBlock();

		document.getElementById('block-hupper').addEventListener('click', function (e) {
			let event = modBlocks.onBlockControlClick(e);
			if (event) {
				events.emit('block.action', event);
			}
		}, false);
		resolve();
	});
}

function onGetArticles() {
	let articles = modArticles.parseArticles();

	if (articles.length > 0) {
		events.emit('gotArticles', articles);
	}
}

function onAddCategoryHideButton(items) {
	modArticles.onAddCategoryHideButton(items);
}

function onArticlesHide(articles) {
	modArticles.hideArticles(articles);
}

function getCommentObjects(options) {
	let commentsContainer = document.getElementById('comments');

	if (!commentsContainer) {
		return;
	}

	return modComment.convertComments(modCommentTree.getCommentTree(), options);
}

function onGetBlocks() {
	events.emit('gotBlocks', modBlocks.getBlocks());
}

function onCommentSetNew(newComments) {
	modComment.onCommentSetNew(newComments);
}

function onCommentAddNextPrev(item) {
	modComment.onCommentAddNextPrev(item);
}

function onBlocakChangeOrderAll(data) {
	modBlocks.reorderBlocks(data);
	setTimeout(function () {
		events.emit('blocks.change-order-all-done');
	}, 5);
}

function onBlockChangeOrder(data) {
	modBlocks.setBlockOrder(data.sidebar, data.blocks);
}

function onBlockChangeColunn(data) {
	modBlocks.reorderBlocks(data);
}

function onBlockShow(data) {
	modBlocks.show(data);
}

function onBlockHideContent(data) {
	modBlocks.hideContent(data);
}

function onBlockShowContent(data) {
	modBlocks.showContent(data);
}

function onBlockHide(data) {
	modBlocks.hide(data);
}

function onBlockSetTitles(data) {
	modBlocks.setTitles(data);
}

function getContextUser(data) {
	let elem = document.querySelector('.comment .submitted > a[href="' + data.linkUrl + '"]');

	if (elem === null) {
		elem = document.querySelector('.comment .submitted > a[href="' + data.linkUrl.replace(/^https?:\/\/hup\.(?:hu|lh)/, '') + '"]');
	}
	return elem ? elem.textContent : null;
}

function onHighlightUser(data) {
	log.log('on highlight user', data);

	let user = getContextUser(data);

	if (user) {
		events.emit('highlightuser', user);
	}
}

function onUnhighlightUser(data) {
	let user = getContextUser(data);
	if (user) {
		events.emit('unhighlightuser', user);
	}
}

function onTrollUser(data) {
	let user = getContextUser(data);

	if (user) {
		events.emit('trolluser', user);
	}
}

function onUntrollUser(data) {
	let user = getContextUser(data);

	if (user) {
		events.emit('untrolluser', user);
	}
}

function onEnableBlockControls(blocks) {
	modBlocks.decorateBlocks(blocks);

	modBlocks.onEnableBlockControls(blocks, function (event) {
		events.emit('block.action', event);
	});
}
function onDOMContentLoaded() {
	/*
	events.init();
	events.on('getArticles', onGetArticles);
	events.on('getComments', (options) => {
		addCommentListeners();
		let comments = getCommentObjects(options);

		events.emit('gotComments', );
	});
	events.on('getBlocks', onGetBlocks);
	events.on('comments.update', modComment.onCommentUpdate);
	events.on('comment.setNew', onCommentSetNew);
	events.on('comment.addNextPrev', onCommentAddNextPrev);
	events.on('comment.addParentLink', modComment.addParentLinkToComments);
	events.on('comment.addExpandLink', modComment.addExpandLinkToComments);
	events.on('articles.mark-new', modArticles.onMarkNew);
	events.on('articles.addNextPrev', modArticles.onArticleAddNextPrev);
	events.on('articles.add-category-hide-button', onAddCategoryHideButton);
	events.on('articles.hide', onArticlesHide);
	events.on('block.hide', onBlockHide);
	events.on('enableBlockControls', onEnableBlockControls);
	events.on('block.show', onBlockShow);
	events.on('block.hide-content', onBlockHideContent);
	events.on('block.show-content', onBlockShowContent);
	events.on('blocks.change-order-all', onBlocakChangeOrderAll);
	events.on('block.change-order', onBlockChangeOrder);
	events.on('block.change-column', onBlockChangeColunn);
	events.on('blocks.set-titles', onBlockSetTitles);
	events.on('trolluser', onTrollUser);
	events.on('untrolluser', onUntrollUser);
	events.on('highlightuser', onHighlightUser);
	events.on('unhighlightuser', onUnhighlightUser);
	events.on('hupper-block.add-menu', modHupperBlock.addMenuItem);
	events.on('hupper-block.hide-block', modHupperBlock.addHiddenBlock);
	events.on('hupper-block.show-block', modHupperBlock.removeHiddenBlock);
	events.on('setUnlimitedLinks', unlimitedlinks.setUnlimitedLinks);

	modArticles.listenToTaxonomyButtonClick((articleStruct) => {
		events.emit('article.hide-taxonomy', articleStruct);
	});

	addHupperBlock().then(function () {
		log.log('huper block added');
	});

	log.log('dom content loaded');
	events.emit('DOMContentLoaded');
	// window.removeEventListener('DOMContentLoaded', onDOMContentLoaded); // run once
	// */
}


/*
window.addEventListener('unload', function () {
	events.emit('unload');
});
*/

function updateComments() {
	let comments = getCommentObjects({content: true});

	if (!comments) {
		return;
	}

	chrome.runtime.sendMessage({
		event: 'requestCommentParse',
		data: comments
	}, function (comments) {
		if (comments) {
			modComment.onCommentUpdate(comments);
			let childComments = comments.filter(c => c.parent !== '');
			modComment.addParentLinkToComments(childComments);
			modComment.addExpandLinkToComments(childComments.filter(c => c.indentLevel > 1));

			let newComments = comments.filter(c => c.isNew && !c.hide);
			newComments.forEach(modComment.onCommentAddNextPrev);
			modComment.onCommentSetNew(newComments);

		}
	});
}

function updateArticles() {
	let articles = modArticles.parseArticles();

	if (!articles) {
		return;
	}

	chrome.runtime.sendMessage({
		event: 'requestArticleParse',
		data: articles
	}, function (articles) {
		if (articles) {
			modArticles.hideArticles(articles.filter(a => a.hide));
			modArticles.onMarkNew(articles);
			articles.filter(a => a.hasOwnProperty('nextId') || a.hasOwnProperty('prevId'))
				.forEach(modArticles.onArticleAddNextPrev);
			modArticles.onAddCategoryHideButton(articles);
		}
	});
}

function updateBlocks() {
	let blocks = modBlocks.getBlocks();

	if (!blocks.left && !blocks.right) {
		return;
	}

	chrome.runtime.sendMessage({
		event: 'requestBlockParse',
		data: blocks
	}, function (blocks) {
		if (blocks) {
			modBlocks.reorderBlocks(blocks);
			modBlocks.decorateBlocks(blocks.left);
			modBlocks.decorateBlocks(blocks.right);
		}
	});
}

function addBlockListeners() {
	modBlocks.onEnableBlockControls(function (event) {
		chrome.runtime.sendMessage({event: 'block.action', data: event}, function (response) {
			modBlocks.toggleBlock(response);
		});
	});
}

function addArticleListeners() {
	console.info('TODO add article listeners');
}

function addCommentListeners() {
	let commentsContainer = document.getElementById('comments');

	if (commentsContainer) {
		document.querySelector('body').addEventListener('click', modComment.onBodyClick, false);
		commentsContainer.addEventListener('click', modComment.onCommentsContainerClick, false);
	}
}

// window.addEventListener('DOMContentLoaded', onDOMContentLoaded, false);
window.addEventListener('DOMContentLoaded', function () {
	chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
	});

	chrome.runtime.sendMessage({event: 'register'}, function (response) {
		if (response.event === 'registered') {
			updateComments();
			updateArticles();
			updateBlocks();
			addCommentListeners();
			addBlockListeners();
		}
	});
}, false);
