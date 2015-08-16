/*jshint esnext:true*/
/*global chrome*/
(function (req) {
	'use strict';

	let func = req('func');

	let modBlocks = req('blocks');
	let modArticles = req('articles');
	let modHupperBlock = req('hupper-block');

	function addHupperBlock() {
		return new Promise(function (resolve) {
			modHupperBlock.addHupperBlock();

			document.getElementById('block-hupper').addEventListener('click', function (e) {
				let event = modBlocks.onBlockControlClick(e);
				if (event) {
					chrome.runtime.sendMessage({'event': 'block.action', data: event});
				}
			}, false);
			resolve();
		});
	}

	function onGetArticles() {
		let articles = modArticles.parseArticles();

		if (articles.length > 0) {
			chrome.runtime.sendMessage({'event': 'gotArticles', data: articles});
		}
	}

	function onArticlesMarkNew(data) {
		data.articles.map(modArticles.articleStructToArticleNodeStruct)
				.forEach(func.partial(modArticles.markNewArticle, data.text));

	}

	function onArticleAddNextPrev(item) {
		if (item.prevId) {
			modArticles.addLinkToPrevArticle(item.id, item.prevId);
		}

		if (item.nextId) {
			modArticles.addLinkToNextArticle(item.id, item.nextId);
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

		let modComment = req('comment');
		let modCommentTree = req('commenttree');

		console.log('subscribe');
		document.querySelector('body').addEventListener('click', modComment.onBodyClick, false);

		commentsContainer.addEventListener('click', modComment.onCommentsContainerClick, false);
		chrome.runtime.sendMessage({
			event: 'gotComments',
			data: modComment.convertComments(modCommentTree.getCommentTree(), options)
		});

	}

	function onGetBlocks() {
		chrome.runtime.sendMessage({
			event: 'gotBlocks',
			data: modBlocks.getBlocks()
		});

	}

	function onCommentSetNew(newComments) {
		req('comment').onCommentSetNew(newComments);
	}

	function onCommentAddNextPrev(item) {
		req('comment').onCommentAddNextPrev(item);
	}

	function onBlocakChangeOrderAll(data) {
		modBlocks.reorderBlocks(data);
		setTimeout(function () {
			chrome.runtime.sendMessage({event: 'blocks.change-order-all-done'});
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

	function onHighlightUser(data) {
		return data;
	}

	function onUnhighlightUser(data) {
		return data;
	}

	function onTrollUser(data) {
		return data;
	}

	function onUntrollUser(data) {
		return data;
	}

	function onEnableBlockControls(blocks) {
		modBlocks.onEnableBlockControls(blocks, function (event) {
			chrome.runtime.sendMessage({event: 'block.action', data: event});
		});
	}

	window.addEventListener('DOMContentLoaded', function () {
		chrome.runtime.onMessage.addListener(function (request, sender) {
			let event = request.event;
			let data = request.data;
			switch (event) {
				case 'getArticles':
					onGetArticles(data);
				break;

				case 'getComments':
					onGetComments(data);
				break;

				case 'getBlocks':
					onGetBlocks(data);
				break;

				case 'comments.update':
					req('comment').onCommentUpdate(data);
				break;

				case 'comment.setNew':
					onCommentSetNew(data);
				break;

				case 'comment.addNextPrev':
					onCommentAddNextPrev(data);
				break;

				case 'comment.addParentLink':
					req('comment').addParentLinkToComments(data);
				break;

				case 'comment.addExpandLink':
					req('comment').addExpandLinkToComments(data);
				break;

				case 'articles.mark-new':
					onArticlesMarkNew(data);
				break;

				case 'articles.addNextPrev':
					onArticleAddNextPrev(data);
				break;

				case 'articles.add-category-hide-button':
					onAddCategoryHideButton(data);
				break;

				case 'articles.hide':
					onArticlesHide(data);
				break;

				case 'block.hide':
					onBlockHide(data);
				break;

				case 'enableBlockControls':
					onEnableBlockControls(data);
				break;

				case 'block.show':
					onBlockShow(data);
				break;

				case 'block.hide-content':
					onBlockHideContent(data);
				break;

				case 'block.show-content':
					onBlockShowContent(data);
				break;

				case 'blocks.change-order-all':
					onBlocakChangeOrderAll(data);
				break;

				case 'block.change-order':
					onBlockChangeOrder(data);
				break;

				case 'block.change-column':
					onBlockChangeColunn(data);
				break;

				case 'blocks.set-titles':
					onBlockSetTitles(data);
				break;

				case 'trolluser':
					onTrollUser(data);
				break;

				case 'untrolluser':
					onUntrollUser(data);
				break;

				case 'highlightuser':
					onHighlightUser(data);
				break;

				case 'unhighlightuser':
					onUnhighlightUser(data);
				break;

				case 'hupper-block.add-menu':
					modHupperBlock.addMenuItem(data);
				break;

				case 'hupper-block.hide-block':
					modHupperBlock.addHiddenBlock(data);
				break;

				case 'hupper-block.show-block':
					modHupperBlock.removeHiddenBlock(data);
				break;

				case 'setUnlimitedLinks':
					req('unlimitedlinks').setUnlimitedLinks();
				break;

				default:
					console.info('Missing event handler for %s', event);
				break;
			}
			console.log('message request', request, sender);
		});

		document.getElementById('content-both').addEventListener('click', function (e) {
			if (e.target.classList.contains('taxonomy-button')) {
				let dom = req('dom');
				let articleStruct = modArticles.articleElementToStruct(dom.closest(e.target, '.node'));

				chrome.runtime.sendMessage({event: 'article.hide-taxonomy', data: articleStruct});
			}
		}, false);

		addHupperBlock().then(function () {
			console.log('huper block added');
		});

		console.log('dom content loaded');
		chrome.runtime.sendMessage({'event': 'DOMContentLoaded'});
	}, false);

	window.addEventListener('unload', function () {
		chrome.runtime.sendMessage({'event': 'unload'});
	});
}(window.req));
