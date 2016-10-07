function filterNewArticles(article) {
	return article.isNew;
}
function setNewArticles(newArticles) {
	var newArticlesLength = newArticles.length;
	if (newArticlesLength > 1) {
		return newArticles.map(function (article, index) {
			var nextPrev = { id: article.id };
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
function filterHideableArticles(articles, taxonomies) {
	return articles.filter(function (art) {
		return taxonomies.indexOf(art.category) > -1;
	});
}

export {
	filterNewArticles,
	setNewArticles,
	filterHideableArticles,
};
