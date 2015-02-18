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

		function insertIntoHnav(article, item) {
			let header = article.header,
				hnav = header.querySelector('.' + ARTICLE_HNAV_CLASS),
				hnew = hnav.querySelector('.hnew');

			if (hnew) {
				hnav.insertBefore(item, hnew);
			} else {
				hnav.appendChild(item);
			}
		}

		function addPrevNextArticleLink(id, relId, text) {
			var article = articleStructToArticleNodeStruct({id: id}),
				link;

			link = dom.createElem('a', [{name: 'href', value: '#' + relId}], null, text);

			addHNav(article);
			insertIntoHnav(article, link);
		}

		/**
		 * @param string id Article id
		 * @param string nextArticleId
		 */
		function addLinkToPrevArticle(id, prevArticleId) {
			addPrevNextArticleLink(id, prevArticleId, 'Prev');
		}

		/**
		 * @param string id Comment id
		 * @param string nextCommentId
		 */
		function addLinkToNextArticle(id, nextArticleId) {
			addPrevNextArticleLink(id, nextArticleId, 'Next');
		}

		function addCategoryHideButton(article) {
			let categoryContainer = article.node.querySelector('.links.inline > .first.last');
			let button = dom.createElem('button', [{name: 'type', value: 'button'}], [
				'hupper-button',
				'taxonomy-button',
				'delete-button',
			]);

			categoryContainer.appendChild(button);
		}

		/**
		 * @param articleNodeStruct article
		 */
		function markNewArticle(newArticleText, article) {
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
			articleStructToArticleNodeStruct: articleStructToArticleNodeStruct,
			addLinkToPrevArticle: addLinkToPrevArticle,
			addLinkToNextArticle: addLinkToNextArticle,
			addCategoryHideButton: addCategoryHideButton,
			articleElementToStruct: articleElementToStruct
		};
	});
}(window.def, window.req));
