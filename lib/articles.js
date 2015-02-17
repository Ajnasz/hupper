/*global exports*/
function filterNewArticles(article) {
	'use strict';
	return article.isNew;
}

function setNewArticles(newArticles, worker) {
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

			worker.port.emit('articles.addNextPrev', nextPrev);
		});
	}
}

exports.filterNewArticles = filterNewArticles;
exports.setNewArticles = setNewArticles;
