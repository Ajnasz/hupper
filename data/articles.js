/*jshint moz:true*/
console.log('articles.js');
(function (def, req) {
	'use strict';

	def('articles', function () {
		let func = req('func');

		var articleStruct = {
			category: '',
			isNew: false
		};

		function articleElementToStruct(element) {
			let category = element.querySelector('.links.inline > .first.last > a').textContent;
			let isNew = element.querySelector('.comment_new_comments') !== null;

			let output = Object.create(articleStruct);

			output.category = category;
			output.isNew = isNew;

			return output;
		}

		function parseArticles() {
			let elements = document.getElementById('content-both').querySelectorAll('.node');
			return func.toArray(elements).map(articleElementToStruct);
		}

		return {
			parseArticles: parseArticles
		};
	});
}(window.def, window.req));
