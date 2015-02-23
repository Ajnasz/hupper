/*jshint moz: true*/
/*global exports*/
let pref = require('pref');
function filterNewArticles(article) {
	'use strict';
	return article.isNew;
}

function setNewArticles(newArticles, events) {
	'use strict';
	var newArticlesLength = newArticles.length;

	if (newArticlesLength > 1) {
		newArticles.forEach(function (article, index) {
			var nextPrev = {
				id: article.id
			};
			if (index + 1 < newArticlesLength) {
				nextPrev.nextId = newArticles[index + 1].id;
			}

			if (index > 0) {
				nextPrev.prevId = newArticles[index - 1].id;
			}

			events.emit('articles.addNextPrev', nextPrev);
		});
	}
}

function hideCategoryArticles(categories, events) {
	'use strict';
	events.emit('articles.hide', categories);
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
exports.hideCategoryArticles = hideCategoryArticles;
exports.filterHideableArticles = filterHideableArticles;
