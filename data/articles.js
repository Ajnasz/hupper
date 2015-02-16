/*jshint moz:true*/
console.log('articles.js');
(function (def, req) {
	'use strict';

	def('articles', function () {
		const ARTICLE_HNAV_CLASS = 'hnav';
		let func = req('func');
		let dom = req('dom');

		let articleStruct = {
			id: '',
			category: '',
			isNew: false
		};

		let articleNodeStruct = {
			node: null,
			header: null
		};

		function articleElementToStruct(element) {
			let category = element.querySelector('.links.inline > .first.last > a').textContent;
			let isNew = element.querySelector('.comment_new_comments') !== null;

			let output = Object.create(articleStruct);

			output.category = category;
			output.isNew = isNew;
			output.id = element.getAttribute('id');

			return output;
		}

		function articleStructToArticleNodeStruct(article) {
			console.log('artttt', article);
			
			let elem = document.getElementById(article.id);
			let output = Object.create(articleNodeStruct);

			output.node = elem;
			output.header = elem.querySelector('h2.title');

			return output;
		}

		function addHNav(article) {
			if (!article.header.querySelector('.' + ARTICLE_HNAV_CLASS)) {
				var span = dom.createElem('span', null, [ARTICLE_HNAV_CLASS]);

				article.header.appendChild(span);
			}
		}

		/**
		 * @param articleNodeStruct article
		 */
		function markNewArticle(newArticleText, article) {
			console.log('mark new article', arguments);
			
			addHNav(article);
			let newText = dom.createElem('span', [], ['hnew', 'nnew'], newArticleText);
			article.header.querySelector('.' + ARTICLE_HNAV_CLASS).appendChild(newText);
		}

		function parseArticles() {
			let elements = document.getElementById('content-both').querySelectorAll('.node');
			return func.toArray(elements).map(articleElementToStruct);
		}

		return {
			parseArticles: parseArticles,
			markNewArticle: markNewArticle,
			articleStructToArticleNodeStruct: articleStructToArticleNodeStruct
		};
	});
}(window.def, window.req));
