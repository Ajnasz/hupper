/*jshint esnext:true, moz:true*/
/*global chrome*/
(function (req) {
	'use strict';

	let modBlocks = req('blocks');
	let modArticles = req('articles');
	let modHupperBlock = req('hupper-block');
	let modComment = req('comment');

	let events = (function () {
		let listeners = new Map();

		function listen(request, sender) {
			let event = request.event;
			let data = request.data;

			if (listeners.has(event)) {
				listeners.get(event).forEach((cb) => {
					cb(data);
				});
			}

			console.log('message request', request, sender);
		}

		return {
			on(name, cb) {
				console.log('Add listener', name);

				if (!listeners.has(name)) {
					listeners.set(name, []);
				}

				listeners.get(name).push(cb);
			},

			emit(name, args) {
				console.log('Emit Listener', name);
				chrome.runtime.sendMessage({'event': name, data: args});
			},

			init() {
				console.log('events init');
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

	function onGetComments(options) {
		let commentsContainer = document.getElementById('comments');

		if (!commentsContainer) {
			return;
		}

		let modCommentTree = req('commenttree');

		console.log('subscribe');
		document.querySelector('body').addEventListener('click', modComment.onBodyClick, false);

		commentsContainer.addEventListener('click', modComment.onCommentsContainerClick, false);
		events.emit('gotComments', modComment.convertComments(modCommentTree.getCommentTree(), options));

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
		return elem ? elem.textContent : null;
	}

	function onHighlightUser(data) {
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
		modBlocks.onEnableBlockControls(blocks, function (event) {
			events.emit('block.action', event);
		});
	}
	function onDomContentLoaded() {
		events.init();
		events.on('getArticles', onGetArticles);
		events.on('getComments', onGetComments);
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
		events.on('setUnlimitedLinks', req('unlimitedlinks').setUnlimitedLinks);

		modArticles.listenToTaxonomyButtonClick((articleStruct) => {
			events.emit('article.hide-taxonomy', articleStruct);
		});

		addHupperBlock().then(function () {
			console.log('huper block added');
		});

		console.log('dom content loaded');
		events.emit('DOMContentLoaded');
		// window.removeEventListener('DOMContentLoaded', onDomContentLoaded); // run once
	}
	window.addEventListener('DOMContentLoaded', onDomContentLoaded, false);

	window.addEventListener('unload', function () {
		events.emit('unload');
	});
}(window.req));
