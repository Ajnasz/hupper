/*jshint moz: true*/
/*global exports, require*/
let pref = require('./pref');
function filterNewArticles(article) {
	'use strict';
	return article.isNew;
}

function setNewArticles(newArticles) {
	'use strict';
	var newArticlesLength = newArticles.length;

	if (newArticlesLength > 1) {
		return newArticles.map(function (article, index) {
			var nextPrev = {
				id: article.id
			};
			if (index + 1 < newArticlesLength) {
				nextPrev.nextId = newArticles[index + 1].id;
			}

			if (index > 0) {
				nextPrev.prevId = newArticles[index - 1].id;
			}

			return nextPrev;
		});
	}
}

function filterHideableArticles(articles) {
	'use strict';
	let taxonomies = pref.getPref('hidetaxonomy').split(',');

	return articles.filter(function (art) {
		return taxonomies.indexOf(art.category) > -1;
	});

}

exports.filterNewArticles = filterNewArticles;
exports.setNewArticles = setNewArticles;
exports.filterHideableArticles = filterHideableArticles;
