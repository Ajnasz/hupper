import * as dom from '../../core/dom';
import * as func from '../../core/func';
import { addHNav } from './element';
import { log } from '../../core/log';

const ARTICLE_HNAV_CLASS = 'hnav';
const ARTICLES_CONTAINER = '#block-hup-theme-content';
const ARTICLE_SELECTOR = '.node';
const ARTICLE_HEADER_SELECTOR = 'h2';
const ARTICLE_CATEGORY_SELECTOR = '.field--type-entity-reference [property="schema:about"]';
const ARTICLE_NAME_ELEMENT_SELECTOR = '.node__submitted [property="schema:name"][typeof="schema:Person"]';

const TEXT_NEXT = 'következő';
const TEXT_PREV = 'előző';
const TEXT_HIDE_ARTICLE_TITLE = 'Cikk kategória elrejtése';

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

/**
 * @param {HTMLArticleNode} article
 * @returns string
 */
function getAuthor (article) {
	const nameElement = dom.selectOne(ARTICLE_NAME_ELEMENT_SELECTOR, article);
	if (nameElement) {
		return nameElement.textContent.trim();
	}

	log.error('Author not found for article', article);
	return '';
}

function articleElementToStruct (element) {
	const categoryElem = element.querySelector(ARTICLE_CATEGORY_SELECTOR);
	const category = categoryElem ? categoryElem.textContent : '';
	const isNew = dom.selectOne('.comment-new-comments', element) !== null;
	const id = element.dataset.historyNodeId;
	const author = getAuthor(element);

	return Object.assign({}, articleStruct, { category, isNew, id, author });
}

function articleStructToArticleNodeStruct (article) {
	const elem = dom.selectOne(`article[data-history-node-id="${article.id}"]`);
	const output = Object.create(articleNodeStruct);

	output.node = elem;
	output.header = dom.selectOne(ARTICLE_HEADER_SELECTOR, elem);

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
	const elements = dom.selectAll(ARTICLE_SELECTOR, dom.selectOne(ARTICLES_CONTAINER));
	return elements.map(articleElementToStruct);
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
	const rootNode = dom.selectOne(ARTICLES_CONTAINER);

	if (!rootNode) {
		log.error('root node not found');
	}

	dom.addListener('click', function (e) {
		if (dom.hasClass('taxonomy-button', e.target)) {
			const articleStruct = articleElementToStruct(dom.closest('.node', e.target));

			cb(articleStruct);

		}
	}, rootNode);

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
