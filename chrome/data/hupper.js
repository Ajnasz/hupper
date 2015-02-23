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

	window.addEventListener('DOMContentLoaded', function () {
		chrome.runtime.onMessage.addListener(function (request, sender) {
			let event = request.event;
			switch (event) {
				case 'getArticles':
					onGetArticles(request.data);
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
