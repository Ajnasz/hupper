import * as dom from '../../core/dom';
import * as func from '../../core/func';
import { addHNav } from './element';

const ARTICLE_HNAV_CLASS = 'hnav';

const TEXT_NEXT = 'következő';
const TEXT_PREV = 'előző';
const TEXT_HIDE_ARTICLE_TITLE = 'Cikk kategória elrejtése';

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
	let categoryElem = element.querySelector('.links.inline > .first.last > a');
	let category = categoryElem ? categoryElem.textContent : '';
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

function removeArticleLink(item) {
	let article = articleStructToArticleNodeStruct(item),
		oldLinks = article.header.querySelectorAll('.prev-next-article');

	func.toArray(oldLinks).forEach(l => l.parentNode.removeChild(l));
}

function addPrevNextArticleLink(id, relId, text) {
	var article = articleStructToArticleNodeStruct({id: id}),
		link;

	addHNav(article);

	link = dom.createElem('a', [{name: 'href', value: '#' + relId}], ['prev-next-article'], text);
	insertIntoHnav(article, link);
}

/**
	* @param string id Article id
	* @param string nextArticleId
	*/
function addLinkToPrevArticle(id, prevArticleId) {
	addPrevNextArticleLink(id, prevArticleId, TEXT_PREV);
}

/**
	* @param string id Comment id
	* @param string nextCommentId
	*/
function addLinkToNextArticle(id, nextArticleId) {
	addPrevNextArticleLink(id, nextArticleId, TEXT_NEXT);
}

function addCategoryHideButton(article) {
	let categoryContainer = article.node.querySelector('.links.inline > .first.last');

	if (!categoryContainer) {
		return;
	}

	let button = dom.createElem('button', [
		{name: 'type', value: 'button'},
		{name: 'title', value: TEXT_HIDE_ARTICLE_TITLE}
	], [
		'hupper-button',
		'taxonomy-button',
		'delete-button'
	]);

	categoryContainer.appendChild(button);
}

/**
	* @param articleNodeStruct article
	*/
function markNewArticle(newArticleText, article) {
	if (!article || !article.header || article.header.querySelector('.hnew')) {
		return;
	}
	addHNav(article);
	let newText = dom.createElem('span', [], ['hnew', 'nnew'], newArticleText);
	article.header.querySelector('.' + ARTICLE_HNAV_CLASS).appendChild(newText);
}

function parseArticles() {
	let elements = document.getElementById('content-both').querySelectorAll('.node');
	return func.toArray(elements).map(articleElementToStruct);
}

function toggleArticles (articles) {
	articles
		.map(articleStructToArticleNodeStruct)
		.forEach(function (a, index) {
			if (articles[index].hide) {
				a.node.classList.add('hup-hidden');
			} else {
				a.node.classList.remove('hup-hidden');
			}
		});
}

function onAddCategoryHideButton(items) {
	items
		.map(articleStructToArticleNodeStruct)
		.forEach(addCategoryHideButton);
}

function onMarkNew(articles) {
	articles.map(articleStructToArticleNodeStruct)
			.forEach((a, index) => markNewArticle(articles[index].newText, a));
}

function onArticleAddNextPrev(item) {
	removeArticleLink(item);
	if (item.prevId) {
		addLinkToPrevArticle(item.id, item.prevId);
	}

	if (item.nextId) {
		addLinkToNextArticle(item.id, item.nextId);
	}
}

function listenToTaxonomyButtonClick(cb) {
	document.getElementById('content-both').addEventListener('click', function (e) {
		if (e.target.classList.contains('taxonomy-button')) {
			let articleStruct = articleElementToStruct(dom.closest(e.target, '.node'));

			cb(articleStruct);

		}
	}, false);

}

export {
	parseArticles,
	markNewArticle,
	articleStructToArticleNodeStruct,
	addLinkToPrevArticle,
	addLinkToNextArticle,
	addCategoryHideButton,
	articleElementToStruct,
	toggleArticles,
	onAddCategoryHideButton,
	onMarkNew,
	onArticleAddNextPrev,
	listenToTaxonomyButtonClick
};
