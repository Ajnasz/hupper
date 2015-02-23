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

	function articleAddNextPrev(item) {
		let modArticles = req('articles');

		if (item.prevId) {
			modArticles.addLinkToPrevArticle(item.id, item.prevId);
		}

		if (item.nextId) {
			modArticles.addLinkToNextArticle(item.id, item.nextId);
		}
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
					articleAddNextPrev(request.data);
				break;
			}
			console.log('message request', request, sender);
		});

		console.log('dom content loaded');
		chrome.runtime.sendMessage({'event': 'DOMContentLoaded'});
	}, false);

	window.addEventListener('unload', function () {
		chrome.runtime.sendMessage({'event': 'unload'});
	});
}(window.req));
