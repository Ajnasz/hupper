import * as dom from '../../core/dom';
import * as func from '../../core/func';
import { addHNav } from './element';

const ARTICLE_HNAV_CLASS = 'hnav';

const TEXT_NEXT = 'következő';
const TEXT_PREV = 'előző';
const TEXT_HIDE_ARTICLE_TITLE = 'Cikk kategória elrejtése';
const ANONYM_ARTICLE_AUTHOR_REGEXP = /[^(]+\( ([^ ]+).*/;

const articleStruct = {
	id: '',
	category: '',
	isNew: false,
	author: '',
};

const articleNodeStruct = {
	node: null,
	header: null,
};

function getAuthor (article) {
	let output = '';
	const nameLink = dom.selectOne('table > tbody > tr > td:nth-child(1) a', article);

	if (nameLink) {
		output = nameLink.textContent.trim();
	}

	if (!output) {
		const titleLine = dom.selectOne('table > tbody > tr > td:nth-child(1)', article);
		const title = titleLine.textContent;

		output = title.replace(ANONYM_ARTICLE_AUTHOR_REGEXP, '$1');
	}

	return output;
}

function articleElementToStruct (element) {
	const categoryElem = element.querySelector('.links.inline > .first.last > a');
	const category = categoryElem ? categoryElem.textContent : '';
	const isNew = element.querySelector('.comment_new_comments') !== null;
	const id = element.getAttribute('id');
	const author = getAuthor(element);

	return Object.assign({}, articleStruct, { category, isNew, id, author });
}

function articleStructToArticleNodeStruct (article) {
	const elem = document.getElementById(article.id);
	const output = Object.create(articleNodeStruct);

	output.node = elem;
	output.header = elem.querySelector('h2.title');

	return output;
}

function insertIntoHnav (article, item) {
	const header = article.header;
	const hnav = header.querySelector('.' + ARTICLE_HNAV_CLASS);
	const hnew = hnav.querySelector('.hnew');

	if (hnew) {
		hnav.insertBefore(item, hnew);
	} else {
		hnav.appendChild(item);
	}
}

function removeArticleLink (item) {
	const article = articleStructToArticleNodeStruct(item);
	const oldLinks = article.header.querySelectorAll('.prev-next-article');

	func.toArray(oldLinks).forEach(l => l.parentNode.removeChild(l));
}

function addPrevNextArticleLink (id, relId, text) {
	var article = articleStructToArticleNodeStruct({ id: id }),
		link;

	addHNav(article);

	link = dom.createElem('a', [{ name: 'href', value: '#' + relId }], ['prev-next-article'], text);
	insertIntoHnav(article, link);
}

/**
	* @param string id Article id
	* @param string nextArticleId
	*/
function addLinkToPrevArticle (id, prevArticleId) {
	addPrevNextArticleLink(id, prevArticleId, TEXT_PREV);
}

/**
	* @param string id Comment id
	* @param string nextCommentId
	*/
function addLinkToNextArticle (id, nextArticleId) {
	addPrevNextArticleLink(id, nextArticleId, TEXT_NEXT);
}

function addCategoryHideButton (article) {
	const categoryContainer = article.node.querySelector('.links.inline > .first.last');

	if (!categoryContainer) {
		return;
	}

	const button = dom.createElem('button', [
		{ name: 'type', value: 'button' },
		{ name: 'title', value: TEXT_HIDE_ARTICLE_TITLE }
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
function markNewArticle (newArticleText, article) {
	if (!article || !article.header || article.header.querySelector('.hnew')) {
		return;
	}
	addHNav(article);
	const newText = dom.createElem('span', null, ['hnew', 'nnew'], newArticleText);
	article.header.querySelector('.' + ARTICLE_HNAV_CLASS).appendChild(newText);
}

function parseArticles () {
	const elements = document.getElementById('content-both').querySelectorAll('.node');
	return func.toArray(elements).map(articleElementToStruct);
}

const hupHiddenClass = 'hup-hidden';

function toggleArticles (articles) {
	articles
		.map(articleStructToArticleNodeStruct)
		.forEach(function (a, index) {
			if (articles[index].hide) {
				dom.addClass(hupHiddenClass, a.node);
			} else {
				dom.removeClass(hupHiddenClass, a.node);
			}
		});
}

function onAddCategoryHideButton (items) {
	items
		.map(articleStructToArticleNodeStruct)
		.forEach(addCategoryHideButton);
}

function onMarkNew (articles) {
	articles.map(articleStructToArticleNodeStruct)
		.forEach((a, index) => markNewArticle(articles[index].newText, a));
}

function onArticleAddNextPrev (item) {
	removeArticleLink(item);
	if (item.prevId) {
		addLinkToPrevArticle(item.id, item.prevId);
	}

	if (item.nextId) {
		addLinkToNextArticle(item.id, item.nextId);
	}
}

function listenToTaxonomyButtonClick (cb) {
	document.getElementById('content-both').addEventListener('click', function (e) {
		if (dom.hasClass('taxonomy-button', e.target)) {
			const articleStruct = articleElementToStruct(dom.closest('.node', e.target));

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
