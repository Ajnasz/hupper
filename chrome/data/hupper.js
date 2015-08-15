/*jshint esnext:true*/
/*global chrome*/
(function (req) {
	'use strict';

	let func = req('func');

	let modBlocks = req('blocks');
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
		let modArticles = req('articles');
		let articles = modArticles.parseArticles();

		if (articles.length > 0) {
			chrome.runtime.sendMessage({'event': 'gotArticles', data: articles});
		}
	}

	function onArticlesMarkNew(data) {
		let modArticles = req('articles');
		data.articles.map(modArticles.articleStructToArticleNodeStruct)
				.forEach(func.partial(modArticles.markNewArticle, data.text));

	}

	function onArticleAddNextPrev(item) {
		let modArticles = req('articles');

		if (item.prevId) {
			modArticles.addLinkToPrevArticle(item.id, item.prevId);
		}

		if (item.nextId) {
			modArticles.addLinkToNextArticle(item.id, item.nextId);
		}
	}

	function onAddCategoryHideButton(items) {
		req('articles').onAddCategoryHideButton(items);
	}

	function onArticlesHide(articles) {
		req('articles').hideArticles(articles);
	}

	function onGetComments(options) {
		let commentsContainer = document.getElementById('comments');

		if (!commentsContainer) {
			return;
		}

		let modComment = req('comment');
		let modCommentTree = req('commenttree');

		console.log('subscribe');
		document.querySelector('body').addEventListener('click', function (e) {
			if (e.target.nodeName === 'A') {
				return;
			}

			let dom = req('dom');
			if (dom.closest(e.target, '.comment')) {
				return;
			}

			modComment.unwideComments();
		}, false);

		commentsContainer.addEventListener('click', function (e) {
			let dom = req('dom');

			if (dom.is(e.target, '.expand-comment')) {
				e.preventDefault();
				modComment.unwideComments();
				modComment.widenComment(dom.prev(dom.closest(e.target, '.comment'), 'a').getAttribute('id'));

			}
		}, false);

		function convertComments(comments) {
			return comments.map((comment) => {
				let output = modComment.parseComment(modComment.getCommentFromId(comment.id), {
					content: options.content
				});

				output.children = convertComments(comment.children);

				return output;
			});
		}

		chrome.runtime.sendMessage({
			event: 'gotComments',
			data: convertComments(modCommentTree.getCommentTree())
		});

	}

	function onGetBlocks() {
		let modBlocks = req('blocks');
		chrome.runtime.sendMessage({
			event: 'gotBlocks',
			data: modBlocks.getBlocks()
		});

	}

	function onCommentSetNew(newComments) {
		let modComment = req('comment');
		var obj = newComments.comments.map(modComment.commentDataStructToObj);
		obj.forEach((comment) => modComment.setNew(comment, newComments.text));
	}

	function onCommentAddNextPrev(item) {
		let modComment = req('comment');
		if (item.prevId) {
			modComment.addLinkToPrevComment(item.id, item.prevId);
		}

		if (item.nextId) {
			modComment.addLinkToNextComment(item.id, item.nextId);
		}
	}

	function onBlocakChangeOrderAll(data) {
		let modBlocks = req('blocks');
		modBlocks.reorderBlocks(data);
		setTimeout(function () {
			chrome.runtime.sendMessage({event: 'blocks.change-order-all-done'});
		}, 5);
	}

	function onBlockChangeOrder(data) {
		let modBlocks = req('blocks');
		modBlocks.setBlockOrder(data.sidebar, data.blocks);
	}

	function onBlockChangeColunn(data) {
		let modBlocks = req('blocks');
		modBlocks.reorderBlocks(data);
	}

	function onBlockShow(data) {
		let modBlocks = req('blocks');
		modBlocks.show(data);
	}

	function onBlockHideContent(data) {
		let modBlocks = req('blocks');
		modBlocks.hideContent(data);
	}

	function onBlockShowContent(data) {
		let modBlocks = req('blocks');
		modBlocks.showContent(data);
	}

	function onBlockHide(data) {
		let modBlocks = req('blocks');
		modBlocks.hide(data);
	}

	function onBlockSetTitles(data) {
		let modBlocks = req('blocks');
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
		let modBlocks = req('blocks');
		let dom = req('dom');
		modBlocks.decorateBlocks(blocks);

		let commonParent = dom.findCommonParent(blocks.map(modBlocks.blockDataStructToBlockElement));
		commonParent.addEventListener('click', function (e) {
			let event = modBlocks.onBlockButtonClick(e);

			if (event) {
				chrome.runtime.sendMessage({event: 'block.action', data: event});
			}
		}, false);
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

				default:
					console.info('Missing event handler for %s', event);
				break;
			}
			console.log('message request', request, sender);
		});

		document.getElementById('content-both').addEventListener('click', function (e) {
			if (e.target.classList.contains('taxonomy-button')) {
				let modArticles = req('articles');
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
