/*global exports*/
function filterNewArticles(article) {
	'use strict';
	return article.isNew;
}

exports.filterNewArticles = filterNewArticles;
