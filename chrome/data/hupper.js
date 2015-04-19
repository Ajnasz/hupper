/*jshint esnext:true*/
/*global chrome*/
(function (req) {
	'use strict';

	let func = req('func');

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
		let modArticles = req('articles');

		items.map(modArticles.articleStructToArticleNodeStruct).forEach(modArticles.addCategoryHideButton);
	}

	function onArticlesHide(articles) {
		let modArticles = req('articles');
		articles
			.map(modArticles.articleStructToArticleNodeStruct)
			.forEach(function (a) {
				a.node.classList.add('hup-hidden');
			});
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
			console.log('click somewhere', e.target);
			
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

	function onCommentsUpdate(comments) {
		comments.forEach(function (comment) {
			let modComment = req('comment');
			if (comment.hide) {
				modComment.hide(comment);

				if (comment.boring) {
					modComment.setProp(comment, 'boring', true);
				}

				if (comment.troll) {
					modComment.setProp(comment, 'troll', true);
				}
			} else {
				if (modComment.getProp(comment, 'boring')) {
					modComment.setProp(comment, 'boring', false);
				} else if (modComment.getProp(comment, 'troll')) {
					modComment.setProp(comment, 'troll', false);
				}

				modComment.show(comment);

				if (comment.userColor) {
					modComment.highlightComment(comment);
				} else {
					modComment.unhighlightComment(comment);
				}

				if (comment.score !== 0) {
					modComment.showScore(comment);
				}
			}

		});
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
		chrome.runtime.sendMessage({event: 'blocks.change-order-all-done'});
	}

	function onBlockHide(data) {
		let modBlocks = req('blocks');
		modBlocks.hide(data);
	}

	function onBlockSetTitles(data) {
		let modBlocks = req('blocks');
		modBlocks.setTitles(data);
	}

	window.addEventListener('DOMContentLoaded', function () {
		chrome.runtime.onMessage.addListener(function (request, sender) {
			let event = request.event;
			switch (event) {
				case 'getArticles':
					onGetArticles(request.data);
				break;

				case 'getComments':
					onGetComments(request.data);
				break;

				case 'getBlocks':
					onGetBlocks(request.data);
				break;

				case 'comments.update':
					onCommentsUpdate(request.data);
				break;

				case 'comment.setNew':
					onCommentSetNew(request.data);
				break;

				case 'comment.addNextPrev':
					onCommentAddNextPrev(request.data);
				break;

				case 'comment.addParentLink':
					req('comment').addParentLinkToComments(request.data);
				break;

				case 'comment.addExpandLink':
					req('comment').addExpandLinkToComments(request.data);
				break;

				case 'articles.mark-new':
					onArticlesMarkNew(request.data);
				break;

				case 'articles.addNextPrev':
					onArticleAddNextPrev(request.data);
				break;

				case 'articles.add-category-hide-button':
					onAddCategoryHideButton(request.data);
				break;

				case 'articles.hide':
					onArticlesHide(request.data);
				break;

				case 'block.hide':
					onBlockHide(request.data);
				break;

				// case 'block.show':
				// 	modBlocks.show(request.data);
				// break;

				// case 'block.hide-content':
				// 	modBlocks.hideContent(request.data);
				// break;
				// case 'block.show-content':
				// 	modBlocks.showContent(request.data);
				// break;
				case 'blocks.change-order-all':
					onBlocakChangeOrderAll(request.data);
				break;
				// case 'block.change-order':
				// 	// (event) => modBlocks.setBlockOrder(event.sidebar, event.blocks)();
				// break;

				// case 'block.change-column':
				// 	// (blocks) => modBlocks.reorderBlocks(blocks)();
				// break;

				case 'blocks.set-titles':
					onBlockSetTitles(request.data);
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

		console.log('dom content loaded');
		chrome.runtime.sendMessage({'event': 'DOMContentLoaded'});
	}, false);

	window.addEventListener('unload', function () {
		chrome.runtime.sendMessage({'event': 'unload'});
	});
}(window.req));
