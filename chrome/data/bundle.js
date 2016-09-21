(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', './dom', './func'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('./dom'), require('./func'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.dom, global.func);
		global.articles = mod.exports;
	}
})(this, function (exports, _dom, _func) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.listenToTaxonomyButtonClick = exports.onArticleAddNextPrev = exports.onMarkNew = exports.onAddCategoryHideButton = exports.hideArticles = exports.articleElementToStruct = exports.addCategoryHideButton = exports.addLinkToNextArticle = exports.addLinkToPrevArticle = exports.articleStructToArticleNodeStruct = exports.markNewArticle = exports.parseArticles = undefined;

	var dom = _interopRequireWildcard(_dom);

	var func = _interopRequireWildcard(_func);

	function _interopRequireWildcard(obj) {
		if (obj && obj.__esModule) {
			return obj;
		} else {
			var newObj = {};

			if (obj != null) {
				for (var key in obj) {
					if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
				}
			}

			newObj.default = obj;
			return newObj;
		}
	}

	var ARTICLE_HNAV_CLASS = 'hnav';

	var TEXT_NEXT = 'következő';
	var TEXT_PREV = 'előző';
	var TEXT_HIDE_ARTICLE_TITLE = 'Cikk kategória elrejtése';

	var articleStruct = {
		id: '',
		category: '',
		isNew: false
	};

	var articleNodeStruct = {
		node: null,
		header: null
	};

	function articleElementToStruct(element) {
		var categoryElem = element.querySelector('.links.inline > .first.last > a');
		var category = categoryElem ? categoryElem.textContent : '';
		var isNew = element.querySelector('.comment_new_comments') !== null;

		var output = Object.create(articleStruct);

		output.category = category;
		output.isNew = isNew;
		output.id = element.getAttribute('id');

		return output;
	}

	function articleStructToArticleNodeStruct(article) {
		var elem = document.getElementById(article.id);
		var output = Object.create(articleNodeStruct);

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
		var header = article.header,
		    hnav = header.querySelector('.' + ARTICLE_HNAV_CLASS),
		    hnew = hnav.querySelector('.hnew');

		if (hnew) {
			hnav.insertBefore(item, hnew);
		} else {
			hnav.appendChild(item);
		}
	}

	function addPrevNextArticleLink(id, relId, text) {
		var article = articleStructToArticleNodeStruct({ id: id }),
		    link;

		link = dom.createElem('a', [{ name: 'href', value: '#' + relId }], null, text);

		addHNav(article);
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
		var categoryContainer = article.node.querySelector('.links.inline > .first.last');
		if (!categoryContainer) {
			return;
		}
		var button = dom.createElem('button', [{ name: 'type', value: 'button' }, { name: 'title', value: TEXT_HIDE_ARTICLE_TITLE }], ['hupper-button', 'taxonomy-button', 'delete-button']);

		categoryContainer.appendChild(button);
	}

	/**
 	* @param articleNodeStruct article
 	*/
	function markNewArticle(newArticleText, article) {
		addHNav(article);
		var newText = dom.createElem('span', [], ['hnew', 'nnew'], newArticleText);
		article.header.querySelector('.' + ARTICLE_HNAV_CLASS).appendChild(newText);
	}

	function parseArticles() {
		var elements = document.getElementById('content-both').querySelectorAll('.node');
		return func.toArray(elements).map(articleElementToStruct);
	}

	function hideArticles(articles) {
		articles.map(articleStructToArticleNodeStruct).forEach(function (a) {
			a.node.classList.add('hup-hidden');
		});
	}

	function onAddCategoryHideButton(items) {
		items.map(articleStructToArticleNodeStruct).forEach(addCategoryHideButton);
	}

	function onMarkNew(data) {
		data.articles.map(articleStructToArticleNodeStruct).forEach(func.partial(markNewArticle, data.text));
	}

	function onArticleAddNextPrev(item) {
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
				var _articleStruct = articleElementToStruct(dom.closest(e.target, '.node'));

				cb(_articleStruct);
			}
		}, false);
	}

	exports.parseArticles = parseArticles;
	exports.markNewArticle = markNewArticle;
	exports.articleStructToArticleNodeStruct = articleStructToArticleNodeStruct;
	exports.addLinkToPrevArticle = addLinkToPrevArticle;
	exports.addLinkToNextArticle = addLinkToNextArticle;
	exports.addCategoryHideButton = addCategoryHideButton;
	exports.articleElementToStruct = articleElementToStruct;
	exports.hideArticles = hideArticles;
	exports.onAddCategoryHideButton = onAddCategoryHideButton;
	exports.onMarkNew = onMarkNew;
	exports.onArticleAddNextPrev = onArticleAddNextPrev;
	exports.listenToTaxonomyButtonClick = listenToTaxonomyButtonClick;
});

},{"./dom":5,"./func":6}],2:[function(require,module,exports){
(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', './dom', './func'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('./dom'), require('./func'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.dom, global.func);
		global.blocks = mod.exports;
	}
})(this, function (exports, _dom, _func) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.onEnableBlockControls = exports.onBlockButtonClick = exports.onBlockControlClick = exports.setTitles = exports.reorderBlocks = exports.setBlockOrder = exports.showContent = exports.hideContent = exports.show = exports.hide = exports.getBlockColumn = exports.blockElemToBlockDataStruct = exports.blockDataStructToBlockElement = exports.decorateBlocks = exports.getBlocks = undefined;

	var dom = _interopRequireWildcard(_dom);

	var func = _interopRequireWildcard(_func);

	function _interopRequireWildcard(obj) {
		if (obj && obj.__esModule) {
			return obj;
		} else {
			var newObj = {};

			if (obj != null) {
				for (var key in obj) {
					if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
				}
			}

			newObj.default = obj;
			return newObj;
		}
	}

	var BLOCK_CLASS = 'block';
	var SIDEBAR_CLASS = 'sidebar';
	var SIDEBAR_LEFT_CLASS = 'sidebar-left';
	var SIDEBAR_RIGHT_CLASS = 'sidebar-right';
	var BLOCK_HEADER_ELEMENT = 'h2';

	var blockDataStruct = {
		id: '',
		column: ''
	};

	var blockSturct = {
		node: null,
		header: null
	};

	function blockDataStructToBlockElement(blockObj) {
		return document.getElementById(blockObj.id);
	}

	/**
 	* @param blockDataStruct
 	* @return blockSturct
 	*/
	function blockDataStructToBlockSturct(block) {
		var output = Object.create(blockSturct),
		    node = blockDataStructToBlockElement(block);

		output.node = node;
		output.header = node ? node.querySelector(BLOCK_HEADER_ELEMENT) : null;
		// output.content = node.querySelector('.content');

		return output;
	}

	function getBlockElements(sidebar) {
		return func.toArray(sidebar.querySelectorAll('.' + BLOCK_CLASS));
	}

	/**
 	* @param HTMLBlockElement block
 	* @return string
 	*/
	function getBlockColumn(block) {
		var sidebar = dom.closest(block, '.' + SIDEBAR_CLASS);

		return sidebar.getAttribute('id');
	}

	/**
 	* @param HTMLBlockElement block
 	* @return blockDataStruct
 	*	id string
 	*	column string
 	*/
	function blockElemToBlockDataStruct(block) {
		var output = Object.create(blockDataStruct);

		output.id = block.getAttribute('id');
		output.column = getBlockColumn(block);

		return output;
	}

	function getBlocks() {
		var leftBlocks = getBlockElements(document.getElementById(SIDEBAR_LEFT_CLASS)).map(blockElemToBlockDataStruct);
		var rightBlocks = getBlockElements(document.getElementById(SIDEBAR_RIGHT_CLASS)).map(blockElemToBlockDataStruct);

		return {
			left: leftBlocks,
			right: rightBlocks
		};
	}

	function createBlockButton(action) {
		var btn = dom.createElem('button', [{ name: 'data-action', value: action }], ['hupper-button', 'block-button', action + '-button']);

		return btn;
	}

	function decorateBlock(block) {
		var blockStruct = blockDataStructToBlockSturct(block);

		if (blockStruct.header) {
			['delete', 'hide-content', 'show-content', 'right', 'left', 'down', 'up'].map(createBlockButton).forEach(function (btn) {
				blockStruct.header.appendChild(btn);
			});
		}
	}

	function decorateBlocks(blocks) {
		blocks.forEach(decorateBlock);
	}

	function toggleBlockClass(block, cls, add) {
		var blockElem = blockDataStructToBlockElement(block);

		if (blockElem) {
			if (add) {
				blockElem.classList.add(cls);
			} else {
				blockElem.classList.remove(cls);
			}
		}
	}

	function hideBlock(block) {
		toggleBlockClass(block, 'hup-hidden', true);
	}

	function showBlock(block) {
		toggleBlockClass(block, 'hup-hidden', false);
	}

	function hideBlockContent(block) {
		toggleBlockClass(block, 'content-hidden', true);
	}

	function showBlockContent(block) {
		toggleBlockClass(block, 'content-hidden', false);
	}

	/**
 	* @param {HTMLTDElement} sidebar The sidebar where the blocks will be placed
 	* @param {blockPref[]} blocks Array of blockpref objects (See
 	* lib/blocks.js, has properties: id, hidden, contentHidden)
 	* @param {elementList} elementList List of block elements (ALL)
 	*/
	function renderSidebar(sidebar, blocks, elementList) {
		blocks.forEach(function (block) {
			var index = func.index(elementList, function (blockElem) {
				return blockElem.id === block.id;
			});

			if (index > -1) {
				var elem = elementList.splice(index, 1)[0];
				sidebar.appendChild(elem);
			}
		});
	}

	function setBlockOrder(sidebar, blocks) {
		var sidebarElem = document.getElementById(sidebar);

		var blockElements = getBlockElements(sidebarElem);

		blockElements.forEach(function (element) {
			dom.remove(element);
		});

		renderSidebar(sidebarElem, blocks, blockElements);
	}

	function reorderBlocks(blocks) {
		console.log('reorder blocks', blocks);

		var sidebarLeft = document.getElementById(SIDEBAR_LEFT_CLASS);
		var sidebarRight = document.getElementById(SIDEBAR_RIGHT_CLASS);

		var elementList = getBlockElements(sidebarLeft).concat(getBlockElements(sidebarRight));

		renderSidebar(sidebarLeft, blocks.left, elementList);
		renderSidebar(sidebarRight, blocks.right, elementList);
	}

	function setBlockTitleLink(blockId, href) {
		var block = document.getElementById(blockId);

		if (block) {
			var h2 = block.querySelector(BLOCK_HEADER_ELEMENT);
			if (h2 && !h2.querySelector('a')) {
				var title = h2.textContent;
				dom.emptyText(h2);
				h2.appendChild(dom.createElem('a', [{ name: 'href', value: href }], null, title));
			}
		}
	}

	function setTitles(titles) {
		Object.keys(titles).forEach(function (id) {
			setBlockTitleLink(id, titles[id]);
		});
	}

	var blockActionStruct = function () {
		var obj = Object.create(null);

		obj.id = '';
		obj.action = '';
		obj.column = '';

		return obj;
	}();

	function onBlockControlClick(e) {
		if (e.target.dataset.action === 'restore-block') {
			var block = dom.closest(e.target, '.block'),
			    action = e.target.dataset.action,
			    column = e.target.dataset.sidebar,
			    event = Object.create(blockActionStruct);

			event.id = e.target.dataset.blockid;
			event.action = action;
			event.column = event.column || getBlockColumn(block);

			return event;
		}

		return false;
	}

	function onBlockButtonClick(e) {
		if (dom.is(e.target, '.block-button')) {
			var block = dom.closest(e.target, '.block'),
			    action = e.target.dataset.action,
			    event = Object.create(blockActionStruct);

			event.id = block.getAttribute('id');
			event.action = action;
			event.column = getBlockColumn(block);

			return event;
		}

		return false;
	}

	function onEnableBlockControls(blocks, dispatch) {
		decorateBlocks(blocks);

		var commonParent = dom.findCommonParent(blocks.map(blockDataStructToBlockElement));
		commonParent.addEventListener('click', function (e) {
			var event = onBlockButtonClick(e);

			if (event) {
				dispatch(event);
			}
		}, false);
	}

	exports.getBlocks = getBlocks;
	exports.decorateBlocks = decorateBlocks;
	exports.blockDataStructToBlockElement = blockDataStructToBlockElement;
	exports.blockElemToBlockDataStruct = blockElemToBlockDataStruct;
	exports.getBlockColumn = getBlockColumn;
	exports.hide = hideBlock;
	exports.show = showBlock;
	exports.hideContent = hideBlockContent;
	exports.showContent = showBlockContent;
	exports.setBlockOrder = setBlockOrder;
	exports.reorderBlocks = reorderBlocks;
	exports.setTitles = setTitles;
	exports.onBlockControlClick = onBlockControlClick;
	exports.onBlockButtonClick = onBlockButtonClick;
	exports.onEnableBlockControls = onEnableBlockControls;
});

},{"./dom":5,"./func":6}],3:[function(require,module,exports){
(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', './dom', './func'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('./dom'), require('./func'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.dom, global.func);
		global.comments = mod.exports;
	}
})(this, function (exports, _dom, _func) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.convertComments = exports.onBodyClick = exports.onCommentsContainerClick = exports.onCommentSetNew = exports.onCommentAddNextPrev = exports.onCommentUpdate = exports.showScore = exports.getCommentFromId = exports.getProp = exports.setProp = exports.show = exports.hide = exports.unwideComments = exports.widenComment = exports.addExpandLinkToComments = exports.addParentLinkToComments = exports.hideBoringComments = exports.unhighlightComment = exports.highlightComment = exports.unsetTrolls = exports.setTrolls = exports.addLinkToPrevComment = exports.addLinkToNextComment = exports.commentDataStructToObj = exports.setNew = exports.parseComment = exports.getComments = undefined;

	var dom = _interopRequireWildcard(_dom);

	var func = _interopRequireWildcard(_func);

	function _interopRequireWildcard(obj) {
		if (obj && obj.__esModule) {
			return obj;
		} else {
			var newObj = {};

			if (obj != null) {
				for (var key in obj) {
					if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
				}
			}

			newObj.default = obj;
			return newObj;
		}
	}

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
		return typeof obj;
	} : function (obj) {
		return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
	};

	var TROLL_COMMENT_CLASS = 'trollComment';
	var TROLL_COMMENT_HEADER_CLASS = 'trollHeader';
	var TROLL_COMMENT_REPLY_CLASS = 'trollCommentAnswer';
	var INDENTED_CLASS = 'indented';
	var HIGHLIGHTED_COMMENT_CLASS = 'highlighted';
	var BORING_COMMENT_CLASS = 'hup-boring';
	var COMMENT_HEADER_CLASS = 'submitted';
	var COMMENT_FOOTER_CLASS = 'link';
	var COMMENT_FOOTER_LINKS_CLASS = 'links';
	var COMMENT_HNAV_CLASS = 'hnav';
	var NEW_COMMENT_CLASS = 'comment-new';
	var EXPAND_COMMENT_CLASS = 'expand-comment';
	var WIDEN_COMMENT_CLASS = 'widen-comment';
	var COMMENT_CLASS = 'comment';
	var COMMENT_NEW_MARKER_CLASS = 'new';
	var ANONYM_COMMENT_AUTHOR_REGEXP = /[^\(]+\( ([^ ]+).*/;
	var COMMENT_DATE_REGEXP = /[\s\|]+([0-9]+)\.\s([a-zúőűáéóüöí]+)\s+([0-9]+)\.,\s+([a-zűáéúőóüöí]+)\s+-\s+(\d+):(\d+).*/;
	var COMMENT_MONTH_NAMES = {
		'január': 0,
		'február': 1,
		'március': 2,
		'április': 3,
		'május': 4,
		'június': 5,
		'július': 6,
		'augusztus': 7,
		'szeptember': 8,
		'október': 9,
		'november': 10,
		'december': 11
	};

	var TEXT_WIDEN = 'szélesítés';
	var TEXT_PARENT = 'szülő';
	var TEXT_NEXT = 'következő';
	var TEXT_PREV = 'előző';

	/**
 	* @type commentDataStruct
 	*   isNew Boolean
 	*   author String
 	*   created Timestamp
 	*   id string comment id
 	*   parent string parent id
 	*/
	var commentDataStruct = {
		isNew: false,
		author: '',
		created: 0,
		id: '',
		parent: ''
	};

	/**
 	* @type commentStruct
 	*   node: HTMLCommentNode
 	*   header: HTMLDOMElement
 	*   footer: HTMLDOMElement
 	*/
	var commentStruct = {
		node: null,
		header: null,
		footer: null
	};

	/**
 	* @param commentStruct comment
 	* @return string
 	*/
	function getCommentAuthor(comment) {
		var output = '',
		    nameLink;

		nameLink = comment.header.querySelector('a');

		if (nameLink) {
			output = nameLink.textContent.trim();
		}

		if (output === '') {
			output = comment.header.textContent.replace(ANONYM_COMMENT_AUTHOR_REGEXP, '$1');
		}
		return output;
	}

	/**
 	* @param commentStruct comment
 	* @return Timestamp
 	*/
	function getCommentCreateDate(comment) {
		var date, dateMatch;
		dateMatch = comment.header.textContent.match(COMMENT_DATE_REGEXP);
		date = new Date();
		date.setYear(dateMatch[1]);
		date.setMonth(COMMENT_MONTH_NAMES[dateMatch[2]]);
		date.setDate(dateMatch[3]);
		date.setHours(dateMatch[5]);
		date.setMinutes(dateMatch[6]);
		return date.getTime();
	}

	/**
 	* @param commentStruct comment
 	* @return String
 	*/
	function getCommentId(comment) {
		var element = dom.prev(comment.node, 'a');

		if (element) {
			return element.getAttribute('id');
		}

		return '';
	}

	/**
 	* @param HTMLCommentNode node
 	* @return Object
 	*   node: HTMLCommentNode
 	*   header: HTMLDOMElement
 	*   footer: HTMLDOMElement
 	*/
	function getCommentObj(node) {
		var commentObj = Object.create(commentStruct);

		commentObj.node = node;
		commentObj.header = node.querySelector('.' + COMMENT_HEADER_CLASS);
		commentObj.footer = node.querySelector('.' + COMMENT_FOOTER_CLASS);

		return commentObj;
	}

	function getCommentContent(comment) {
		return comment.node.querySelector('.content').textContent;
	}

	/**
 	* @param HTMLDOMElement elem
 	* @return string
 	*/
	function findParentId(elem) {
		var indented = dom.closest(elem, '.' + INDENTED_CLASS),
		    parentComment;

		if (indented) {
			parentComment = dom.prev(indented, '.' + COMMENT_CLASS);

			if (parentComment) {
				return getCommentId(getCommentObj(parentComment));
			}
		}

		return '';
	}

	/**
 	* @param commentStruct comment
 	* @return integer
 	*/
	function findIndentLevel(comment) {
		var level = 0,
		    indented = '.' + INDENTED_CLASS,
		    elem;

		elem = dom.closest(comment.node, indented);
		while (elem) {
			++level;

			elem = dom.closest(elem, indented);
		}

		return level;
	}

	/**
 	* @param HTMLCommentNode node
 	* @param Object options
 	*   @param options.content boolean // get comment content too
 	* @return commentDataStruct
 	*/
	function parseComment(node, options) {
		var output = Object.create(commentDataStruct);
		var commentObj = getCommentObj(node);

		output.isNew = commentObj.node.classList.contains(NEW_COMMENT_CLASS);
		output.author = getCommentAuthor(commentObj);
		output.created = getCommentCreateDate(commentObj);
		output.id = getCommentId(commentObj);
		output.parent = findParentId(commentObj.node);
		output.indentLevel = findIndentLevel(commentObj);

		if (options.content) {
			output.content = getCommentContent(commentObj);
		}

		return output;
	}

	/**
 	*
 	* @param commentStruct comment
 	*/
	function getNewMarkerElement(comment) {
		return comment.node.querySelector('.' + COMMENT_NEW_MARKER_CLASS);
	}

	/**
 	* @param commentStruct comment
 	* @param string text
 	*/
	function setNew(comment, text) {
		addHNav(comment);
		dom.remove(getNewMarkerElement(comment));
		var hnav = comment.header.querySelector('.' + COMMENT_HNAV_CLASS);
		var span = dom.createElem('span', null, ['hnew'], text);
		hnav.appendChild(span);
	}

	function insertIntoHnav(comment, item) {
		var header = comment.header,
		    hnew = header.querySelector('.hnew');

		if (hnew) {
			header.querySelector('.' + COMMENT_HNAV_CLASS).insertBefore(item, hnew);
		} else {
			header.querySelector('.' + COMMENT_HNAV_CLASS).appendChild(item);
		}
	}

	/**
 	* @param string id Comment id
 	* @param string nextCommentId
 	*/
	function addLinkToPrevComment(id, prevCommentId) {
		var comment = getCommentObj(getCommentFromId(id)),
		    link;

		link = dom.createElem('a', [{ name: 'href', value: '#' + prevCommentId }], null, TEXT_PREV);

		addHNav(comment);
		insertIntoHnav(comment, link);
		// comment.header.querySelector('.' + COMMENT_HNAV_CLASS).appendChild(link);
	}

	/**
 	* @param string id Comment id
 	* @param string nextCommentId
 	*/
	function addLinkToNextComment(id, nextCommentId) {
		var comment = getCommentObj(getCommentFromId(id)),
		    link;

		link = dom.createElem('a', [{ name: 'href', value: '#' + nextCommentId }], null, TEXT_NEXT);

		addHNav(comment);
		insertIntoHnav(comment, link);
	}

	/**
 	* @param commentStruct comment
 	*/
	function addHNav(comment) {
		if (!comment.header.querySelector('.' + COMMENT_HNAV_CLASS)) {
			var span = dom.createElem('span', null, [COMMENT_HNAV_CLASS]);

			comment.header.appendChild(span);
		}
	}

	/**
 	* @param string id Comment id
 	* @return HTMLDOMElement Comment element
 	*/
	function getCommentFromId(id) {
		var elem = document.getElementById(id);

		return dom.next(elem, '.' + COMMENT_CLASS);
	}

	/**
 	* @param commentDataStruct comment
 	* @return commentStruct
 	*/
	function commentDataStructToObj(comment) {
		var item = getCommentFromId(comment.id);

		return getCommentObj(item);
	}

	/**
 	* @param commentStruct comment
 	*/
	function setTroll(comment) {
		comment.node.classList.add(TROLL_COMMENT_CLASS);
		comment.header.classList.add(TROLL_COMMENT_HEADER_CLASS);

		var replies = dom.next(comment.node, '.' + INDENTED_CLASS);

		if (replies) {
			replies.classList.add(TROLL_COMMENT_REPLY_CLASS);
		}
	}

	/**
 	* @param commentStruct comment
 	*/
	function unsetTroll(comment) {
		comment.node.classList.remove(TROLL_COMMENT_CLASS);
		comment.header.classList.remove(TROLL_COMMENT_HEADER_CLASS);

		var replies = dom.next(comment.node, '.' + INDENTED_CLASS);

		if (replies) {
			replies.classList.remove(TROLL_COMMENT_REPLY_CLASS);
		}
	}

	/**
 	* @return {commentDataStruct[]}
 	*/
	function getTrollComments() {
		return func.toArray(document.querySelectorAll('.' + TROLL_COMMENT_CLASS)).map(parseComment);
	}

	/**
 	* @param {commentDataStruct[]} trollComments
 	*/
	function setTrolls(trollComments) {
		getTrollComments().filter(function (comment) {
			return trollComments.indexOf(comment.author) === -1;
		}).map(function (comment) {
			return getCommentObj(getCommentFromId(comment.id));
		}).forEach(unsetTroll);

		trollComments.map(function (comment) {
			return getCommentObj(getCommentFromId(comment.id));
		}).forEach(setTroll);
	}

	function unsetTrolls() {
		var trolled = func.toArray(document.querySelectorAll(['.' + TROLL_COMMENT_CLASS, '.' + TROLL_COMMENT_HEADER_CLASS, '.' + TROLL_COMMENT_REPLY_CLASS].join(',')));

		trolled.forEach(function (element) {
			element.classList.remove(TROLL_COMMENT_CLASS, TROLL_COMMENT_HEADER_CLASS, TROLL_COMMENT_REPLY_CLASS);
		});
	}

	/**
 	* @param commentStruct comment
 	*/
	function unhighlightComment(comment) {
		var commentObj = commentDataStructToObj(comment);
		commentObj.node.classList.remove(HIGHLIGHTED_COMMENT_CLASS);
		commentObj.header.style.backgroundColor = '';
	}

	/**
 	* @param commentStruct comment
 	*/
	function highlightComment(comment) {
		var commentObj = commentDataStructToObj(comment);
		commentObj.node.classList.add(HIGHLIGHTED_COMMENT_CLASS);
		commentObj.header.style.backgroundColor = comment.userColor;
	}

	/**
 	* @param commentStruct comment
 	*/
	function markBoring(comment) {
		comment.node.classList.add(BORING_COMMENT_CLASS);
	}

	/**
 	* @param {commentDataStruct[]} comments
 	*/
	function hideBoringComments(comments) {
		comments.map(commentDataStructToObj).forEach(markBoring);
	}

	/**
 	* @param string text
 	* @param href text
 	* @param {string[]} classList
 	*/
	function createFooterLink(text, href, classList) {
		var listItem = dom.createElem('li'),
		    link;

		link = dom.createElem('a', [{ name: 'href', value: href }], classList, text);
		listItem.appendChild(link);

		return listItem;
	}

	/**
 	* @param commentDataStruct comment
 	*/
	function addParentLinkToComment(comment) {
		var commentObj = commentDataStructToObj(comment);

		commentObj.footer.querySelector('.' + COMMENT_FOOTER_LINKS_CLASS).appendChild(createFooterLink(TEXT_PARENT, '#' + comment.parent));
	}

	/**
 	* @param commentDataStruct comment
 	*/
	function addExpandLinkToComment(comment) {
		var commentObj = commentDataStructToObj(comment);

		commentObj.footer.querySelector('.' + COMMENT_FOOTER_LINKS_CLASS).appendChild(createFooterLink(TEXT_WIDEN, '#', [EXPAND_COMMENT_CLASS]));
	}

	/**
 	* @param {commentDataStruct[]} comments
 	*/
	function addParentLinkToComments(comments) {
		comments.forEach(addParentLinkToComment);
	}

	/**
 	* @param {commentDataStruct[]} comments
 	*/
	function addExpandLinkToComments(comments) {
		comments.forEach(addExpandLinkToComment);
	}

	/**
 	* @param string commentId
 	*/
	function widenComment(commentId) {
		var comment = getCommentFromId(commentId);
		var indentedClass = '.' + INDENTED_CLASS;
		var indented;
		var skippedOne = false;

		indented = dom.closest(comment, indentedClass);
		while (indented) {
			if (skippedOne) {
				indented.classList.add(WIDEN_COMMENT_CLASS);
			}

			skippedOne = true;

			indented = dom.closest(indented, indentedClass);
		}
	}

	function unwideComments() {
		func.toArray(document.querySelectorAll('.' + WIDEN_COMMENT_CLASS)).forEach(function (elem) {
			elem.classList.remove(WIDEN_COMMENT_CLASS);
		});
	}

	/**
 	* @return {HTMLDOMElement[]}
 	*/
	function getComments() {
		return func.toArray(document.querySelectorAll('.' + COMMENT_CLASS));
	}

	function hide(comment) {
		getCommentFromId(comment.id).classList.add('hup-hidden');
	}

	function show(comment) {
		getCommentFromId(comment.id).classList.remove('hup-hidden');
	}

	function setProp(comment, prop, value) {
		var elem = getCommentFromId(comment.id);

		elem.dataset[prop] = value;
		elem.dataset[prop + 'Type'] = typeof value === 'undefined' ? 'undefined' : _typeof(value);
	}

	function getProp(comment, prop) {
		var elem = getCommentFromId(comment.id);

		var value = elem.dataset[prop];
		var type = elem.dataset[prop + 'Type'];
		var undef = void 0;

		switch (type) {
			case 'boolean':
				return Boolean(value);
			case 'number':
				return +value;
			case 'undefined':
				return undef;
			default:
				return value;
		}
	}

	function getScoreTitle(score) {
		return score + ' user addott +1 pontot';
	}

	function showScore(comment) {
		var elem = commentDataStructToObj(comment);
		var content = elem.node.querySelector('.content');

		var scores = elem.node.querySelector('.scores');

		if (!scores) {
			var _scores = dom.createElem('div', [{
				name: 'title',
				value: getScoreTitle(comment.score)
			}], ['scores'], comment.score);
			elem.node.insertBefore(_scores, content);
		} else {
			scores.textContent = comment.score;
			scores.setAttribute('title', getScoreTitle(comment.score));
		}
	}

	function onCommentUpdate(comments) {
		comments.forEach(function (comment) {
			if (comment.hide) {
				hide(comment);

				if (comment.boring) {
					setProp(comment, 'boring', true);
				}

				if (comment.troll) {
					setProp(comment, 'troll', true);
				}
			} else {
				if (getProp(comment, 'boring')) {
					setProp(comment, 'boring', false);
				} else if (getProp(comment, 'troll')) {
					setProp(comment, 'troll', false);
				}

				show(comment);

				if (comment.userColor) {
					highlightComment(comment);
				} else {
					unhighlightComment(comment);
				}

				if (comment.score !== 0) {
					showScore(comment);
				}
			}
		});
	}

	function onCommentAddNextPrev(item) {
		if (item.prevId) {
			addLinkToPrevComment(item.id, item.prevId);
		}

		if (item.nextId) {
			addLinkToNextComment(item.id, item.nextId);
		}
	}

	function onCommentSetNew(newComments) {
		var obj = newComments.comments.map(commentDataStructToObj);
		obj.forEach(function (comment) {
			return setNew(comment, newComments.text);
		});
	}

	function onCommentsContainerClick(e) {
		if (dom.is(e.target, '.expand-comment')) {
			e.preventDefault();
			unwideComments();
			var id = dom.prev(dom.closest(e.target, '.comment'), 'a').getAttribute('id');
			widenComment(id);
		}
	}

	function onBodyClick(e) {
		if (e.target.nodeName === 'A') {
			return;
		}

		if (dom.closest(e.target, '.comment')) {
			return;
		}

		unwideComments();
	}

	function convertComments(comments, opts) {
		return comments.map(function (opts, comment) {
			var output = parseComment(getCommentFromId(comment.id), {
				content: opts && opts.content
			});

			output.children = convertComments(comment.children, opts);

			return output;
		}.bind(null, opts));
	}

	exports.getComments = getComments;
	exports.parseComment = parseComment;
	exports.setNew = setNew;
	exports.commentDataStructToObj = commentDataStructToObj;
	exports.addLinkToNextComment = addLinkToNextComment;
	exports.addLinkToPrevComment = addLinkToPrevComment;
	exports.setTrolls = setTrolls;
	exports.unsetTrolls = unsetTrolls;
	exports.highlightComment = highlightComment;
	exports.unhighlightComment = unhighlightComment;
	exports.hideBoringComments = hideBoringComments;
	exports.addParentLinkToComments = addParentLinkToComments;
	exports.addExpandLinkToComments = addExpandLinkToComments;
	exports.widenComment = widenComment;
	exports.unwideComments = unwideComments;
	exports.hide = hide;
	exports.show = show;
	exports.setProp = setProp;
	exports.getProp = getProp;
	exports.getCommentFromId = getCommentFromId;
	exports.showScore = showScore;
	exports.onCommentUpdate = onCommentUpdate;
	exports.onCommentAddNextPrev = onCommentAddNextPrev;
	exports.onCommentSetNew = onCommentSetNew;
	exports.onCommentsContainerClick = onCommentsContainerClick;
	exports.onBodyClick = onBodyClick;
	exports.convertComments = convertComments;
});

},{"./dom":5,"./func":6}],4:[function(require,module,exports){
(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports);
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports);
		global.commenttree = mod.exports;
	}
})(this, function (exports) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	function findComments(parent) {
		var output = [];
		if (!parent) {
			return output;
		}

		var child = parent.firstChild;

		while (child) {
			if (child.nodeType === Node.ELEMENT_NODE && child.classList.contains('comment')) {
				output.push(child);
			}

			child = child.nextElementSibling;
		}

		return output;
	}

	function createObj(comments) {
		return comments.map(function (c) {
			return {
				id: c.previousElementSibling.id,
				node: c,
				children: null
			};
		});
	}

	function recObj(comments) {
		comments.forEach(function (comment) {
			var children = findComments(comment.node.nextElementSibling);

			comment.children = createObj(children);
			recObj(comment.children);
		});

		return comments;
	}

	function noramlizeCommentTreeItem(item) {
		var output = Object.create(null);
		output.id = item.id;

		return output;
	}

	function normalizeCommentTree(tree) {
		return tree.map(function (item) {
			var normalized = noramlizeCommentTreeItem(item);
			normalized.children = normalizeCommentTree(item.children);
			return normalized;
		});
	}

	function getCommentTree() {
		var root = document.getElementById('comments');

		return normalizeCommentTree(recObj(createObj(findComments(root))));
	}

	exports.getCommentTree = getCommentTree;
});

},{}],5:[function(require,module,exports){
(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', './func'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('./func'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.func);
		global.dom = mod.exports;
	}
})(this, function (exports, _func) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.emptyText = exports.empty = exports.findCommonParent = exports.createElem = exports.remove = exports.is = exports.closest = exports.prev = exports.next = undefined;

	var func = _interopRequireWildcard(_func);

	function _interopRequireWildcard(obj) {
		if (obj && obj.__esModule) {
			return obj;
		} else {
			var newObj = {};

			if (obj != null) {
				for (var key in obj) {
					if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
				}
			}

			newObj.default = obj;
			return newObj;
		}
	}

	/**
 	* @param HTMLDOMElement element
 	* @param CSSSelector what
 	* @return boolean
 	*/
	function is(element, what) {
		if (element.matches) {
			return element.matches(what);
		} else if (element.mozMatchesSelector) {
			return element.mozMatchesSelector(what);
		}
	}

	/**
 	* @param element HTMLDOMElement
 	* @param selector string
 	* @param string sibling Use 'prev' if previous
 	*/
	function findSibling(element, selector, sibling) {
		var elem = element,
		    siblingName = sibling === 'prev' ? 'previousSibling' : 'nextSibling';

		while (elem && (elem.nodeType !== Node.ELEMENT_NODE || !is(elem, selector))) {
			elem = elem[siblingName];
		}

		return elem || null;
	}

	/**
 	* @param element HTMLDOMElement
 	* @param selector string
 	*/
	function next(element, selector) {
		return findSibling(element, selector);
	}

	/**
 	* @param element HTMLDOMElement
 	* @param selector string
 	*/
	function prev(element, selector) {
		return findSibling(element, selector, 'prev');
	}

	function closest(element, selector) {
		var elem = element.parentNode;

		while (elem && !is(elem, selector)) {
			elem = elem.parentNode;
		}

		return elem || null;
	}

	function remove(element) {
		return element.parentNode.removeChild(element);
	}

	function findCommonParent(elements) {
		var index, parent, maxIndex;

		elements = elements.filter(function (x) {
			return x !== null;
		});

		maxIndex = elements.length - 1;
		index = 0;
		parent = elements[index].parentNode;

		while (true) {
			if (index < maxIndex) {
				if (!parent.contains(elements[index + 1])) {
					parent = parent.parentNode;

					if (!parent) {
						// parent = null;
						break;
					}
				} else {
					index += 1;
				}
			} else {
				break;
			}
		}

		return parent;
	}

	function createElem(nodeType, attributes, classes, text) {
		var element = document.createElement(nodeType);

		if (attributes && attributes.length) {
			attributes.forEach(function (attrib) {
				element.setAttribute(attrib.name, attrib.value);
			});
		}

		if (classes && classes.length) {
			element.classList.add.apply(element.classList, classes);
		}

		if (text) {
			element.textContent = text;
		}

		return element;
	}

	function empty(element) {
		while (element.firstChild) {
			element.removeChild(element.firstChild);
		}
	}

	function emptyText(element) {
		func.toArray(element.childNodes).filter(function (node) {
			return node.nodeType === Node.TEXT_NODE;
		}).forEach(remove);
	}

	exports.next = next;
	exports.prev = prev;
	exports.closest = closest;
	exports.is = is;
	exports.remove = remove;
	exports.createElem = createElem;
	exports.findCommonParent = findCommonParent;
	exports.empty = empty;
	exports.emptyText = emptyText;
});

},{"./func":6}],6:[function(require,module,exports){
(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(["exports"], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports);
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports);
		global.func = mod.exports;
	}
})(this, function (exports) {
	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	function index(array, cb) {
		for (var i = 0, al = array.length; i < al; i++) {
			if (cb(array[i])) {
				return i;
			}
		}

		return -1;
	}

	function first(array, cb) {
		var i = index(array, cb);

		if (i > -1) {
			return array[i];
		}

		return null;
	}

	/*
 	* @param NodeList list
 	* @return {HTMLDOMElement[]}
 	*/
	function toArray(list) {
		return Array.prototype.slice.call(list);
	}

	function partial(func) {
		var pArgs = toArray(arguments).slice(1);

		return function () {
			func.apply(this, pArgs.concat(toArray(arguments)));
		};
	}

	exports.first = first;
	exports.index = index;
	exports.partial = partial;
	exports.toArray = toArray;
});

},{}],7:[function(require,module,exports){
(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', './dom'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('./dom'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.dom);
		global.hupperBlock = mod.exports;
	}
})(this, function (exports, _dom) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.removeHiddenBlock = exports.addHiddenBlock = exports.addMenuItem = exports.addHupperBlock = undefined;

	var dom = _interopRequireWildcard(_dom);

	function _interopRequireWildcard(obj) {
		if (obj && obj.__esModule) {
			return obj;
		} else {
			var newObj = {};

			if (obj != null) {
				for (var key in obj) {
					if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
				}
			}

			newObj.default = obj;
			return newObj;
		}
	}

	var TEXT_HIDDEN_BLOCKS = 'Rejtett dobozok';
	function addHupperBlock() {
		if (document.getElementById('block-hupper')) {
			return;
		}

		var block = dom.createElem('div', [{
			name: 'id',
			value: 'block-hupper'
		}], ['block', 'block-block']);

		var h2 = dom.createElem('h2', null, null, 'Hupper');
		var content = dom.createElem('div', null, ['content']);
		var ul = dom.createElem('ul', null, ['menu']);

		content.appendChild(ul);

		block.appendChild(h2);
		block.appendChild(content);

		var sidebar = document.getElementById('sidebar-right');

		sidebar.insertBefore(block, sidebar.firstChild);

		ul.addEventListener('click', function (e) {
			var target = e.target.parentNode;
			var classList = target.classList;

			var collapsed = classList.contains('collapsed');

			var expanded = !collapsed && classList.contains('expanded');

			if (collapsed || expanded) {
				e.preventDefault();

				if (collapsed) {
					classList.remove('collapsed', 'hup-collapsed');
					classList.add('expanded', 'hup-expanded');
				} else {
					classList.remove('expanded', 'hup-expanded');
					classList.add('collapsed', 'hup-collapsed');
				}
			}
		}, false);
	}

	function getItemList() {
		var block = document.getElementById('block-hupper');
		return block.querySelector('.menu');
	}

	function addMenuItem(item, parent) {
		parent = parent || getItemList();
		var li = dom.createElem('li', null, ['leaf']);
		var a = dom.createElem('a', [{ name: 'href', value: item.href }], null, item.text);

		li.appendChild(a);

		parent.appendChild(li);

		return li;
	}

	function addHiddenBlockContainer() {
		var container = getItemList().querySelector('.hidden-blocks');

		if (!container) {
			var li = addMenuItem({
				text: TEXT_HIDDEN_BLOCKS,
				href: '#'
			});

			li.classList.remove('leaf');
			li.classList.add('collapsed', 'hup-collapsed');

			var hiddenBlocks = dom.createElem('ul', null, ['hidden-blocks']);

			li.appendChild(hiddenBlocks);

			return hiddenBlocks;
		}

		return container;
	}

	function addHiddenBlock(block) {
		console.log('add hidden block', block);
		var container = addHiddenBlockContainer();

		var element = document.getElementById(block.id);

		if (!element) {
			return;
		}

		var menuItem = addMenuItem({
			href: '#restore-' + block.id,
			text: element.querySelector('h2').textContent.trim()
		}, container);

		var link = menuItem.firstChild;

		link.dataset.action = 'restore-block';
		link.dataset.sidebar = block.sidebar;
		link.dataset.blockid = block.id;
	}

	function removeHiddenBlock(block) {
		var container = addHiddenBlockContainer();
		var link = container.querySelector('[data-action="restore-block"][data-blockid="' + block.id + '"]');

		if (link) {
			dom.remove(link.parentNode);
		}
	}

	exports.addHupperBlock = addHupperBlock;
	exports.addMenuItem = addMenuItem;
	exports.addHiddenBlock = addHiddenBlock;
	exports.removeHiddenBlock = removeHiddenBlock;
});

},{"./dom":5}],8:[function(require,module,exports){
(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', './func'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('./func'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.func);
		global.unlimitedlinks = mod.exports;
	}
})(this, function (exports, _func) {
	/*jshint moz:true*/
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.setUnlimitedLinks = exports.makeExtendable = exports.isExtendableLink = undefined;

	var func = _interopRequireWildcard(_func);

	function _interopRequireWildcard(obj) {
		if (obj && obj.__esModule) {
			return obj;
		} else {
			var newObj = {};

			if (obj != null) {
				for (var key in obj) {
					if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
				}
			}

			newObj.default = obj;
			return newObj;
		}
	}

	var pathNames = ['/cikkek', '/node', '/szavazasok', '/promo'];

	function isOnHup(hostname) {
		return hostname === 'hup.hu' || hostname === 'www.hup.hu';
	}

	function isExtendablePath(linkPathName) {
		return pathNames.some(function (pathName) {
			return linkPathName.indexOf(pathName) === 0;
		});
	}

	function isExtendableLink(link) {
		return isOnHup(link.hostname) && isExtendablePath(link.pathname);
	}

	function makeExtendable(link) {
		var search = link.search;
		link.search = search[0] === '?' ? '&comments_per_page=9999' : '?comments_per_page=9999';
	}

	function setUnlimitedLinks() {
		func.toArray(document.getElementsByTagName('a')).filter(isExtendableLink).forEach(makeExtendable);
	}

	exports.isExtendableLink = isExtendableLink;
	exports.makeExtendable = makeExtendable;
	exports.setUnlimitedLinks = setUnlimitedLinks;
});

},{"./func":6}],9:[function(require,module,exports){
(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['./core/blocks', './core/articles', './core/hupper-block', './core/comments', './core/unlimitedlinks', './core/commenttree'], factory);
	} else if (typeof exports !== "undefined") {
		factory(require('./core/blocks'), require('./core/articles'), require('./core/hupper-block'), require('./core/comments'), require('./core/unlimitedlinks'), require('./core/commenttree'));
	} else {
		var mod = {
			exports: {}
		};
		factory(global.blocks, global.articles, global.hupperBlock, global.comments, global.unlimitedlinks, global.commenttree);
		global.main = mod.exports;
	}
})(this, function (_blocks, _articles, _hupperBlock, _comments, _unlimitedlinks, _commenttree) {
	'use strict';

	var modBlocks = _interopRequireWildcard(_blocks);

	var modArticles = _interopRequireWildcard(_articles);

	var modHupperBlock = _interopRequireWildcard(_hupperBlock);

	var modComment = _interopRequireWildcard(_comments);

	var unlimitedlinks = _interopRequireWildcard(_unlimitedlinks);

	var modCommentTree = _interopRequireWildcard(_commenttree);

	function _interopRequireWildcard(obj) {
		if (obj && obj.__esModule) {
			return obj;
		} else {
			var newObj = {};

			if (obj != null) {
				for (var key in obj) {
					if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
				}
			}

			newObj.default = obj;
			return newObj;
		}
	}

	console.log(modBlocks, modArticles, modHupperBlock, modComment);

	var events = function () {
		var listeners = new Map();

		function listen(request, sender) {
			var event = request.event;
			var data = request.data;

			if (listeners.has(event)) {
				listeners.get(event).forEach(function (cb) {
					cb(data);
				});
			}

			console.log('message request', request, sender);
		}

		return {
			on: function on(name, cb) {
				console.log('Add listener', name);

				if (!listeners.has(name)) {
					listeners.set(name, []);
				}

				listeners.get(name).push(cb);
			},
			emit: function emit(name, args) {
				console.log('Emit Listener', name);
				chrome.runtime.sendMessage({ 'event': name, data: args });
			},
			init: function init() {
				console.log('events init');
				chrome.runtime.onMessage.addListener(listen);
				window.addEventListener('unload', function () {
					listeners.clear();
					listeners = null;
				});
			}
		};
	}();

	function addHupperBlock() {
		return new Promise(function (resolve) {
			modHupperBlock.addHupperBlock();

			document.getElementById('block-hupper').addEventListener('click', function (e) {
				var event = modBlocks.onBlockControlClick(e);
				if (event) {
					events.emit('block.action', event);
				}
			}, false);
			resolve();
		});
	}

	function onGetArticles() {
		var articles = modArticles.parseArticles();

		if (articles.length > 0) {
			events.emit('gotArticles', articles);
		}
	}

	function onAddCategoryHideButton(items) {
		modArticles.onAddCategoryHideButton(items);
	}

	function onArticlesHide(articles) {
		modArticles.hideArticles(articles);
	}

	function onGetComments(options) {
		var commentsContainer = document.getElementById('comments');

		if (!commentsContainer) {
			return;
		}

		console.log('subscribe');
		document.querySelector('body').addEventListener('click', modComment.onBodyClick, false);

		commentsContainer.addEventListener('click', modComment.onCommentsContainerClick, false);
		events.emit('gotComments', modComment.convertComments(modCommentTree.getCommentTree(), options));
	}

	function onGetBlocks() {
		events.emit('gotBlocks', modBlocks.getBlocks());
	}

	function onCommentSetNew(newComments) {
		modComment.onCommentSetNew(newComments);
	}

	function onCommentAddNextPrev(item) {
		modComment.onCommentAddNextPrev(item);
	}

	function onBlocakChangeOrderAll(data) {
		modBlocks.reorderBlocks(data);
		setTimeout(function () {
			events.emit('blocks.change-order-all-done');
		}, 5);
	}

	function onBlockChangeOrder(data) {
		modBlocks.setBlockOrder(data.sidebar, data.blocks);
	}

	function onBlockChangeColunn(data) {
		modBlocks.reorderBlocks(data);
	}

	function onBlockShow(data) {
		modBlocks.show(data);
	}

	function onBlockHideContent(data) {
		modBlocks.hideContent(data);
	}

	function onBlockShowContent(data) {
		modBlocks.showContent(data);
	}

	function onBlockHide(data) {
		modBlocks.hide(data);
	}

	function onBlockSetTitles(data) {
		modBlocks.setTitles(data);
	}

	function getContextUser(data) {
		var elem = document.querySelector('.comment .submitted > a[href="' + data.linkUrl + '"]');

		if (elem === null) {
			elem = document.querySelector('.comment .submitted > a[href="' + data.linkUrl.replace(/^https?:\/\/hup\.(?:hu|lh)/, '') + '"]');
		}
		return elem ? elem.textContent : null;
	}

	function onHighlightUser(data) {
		var user = getContextUser(data);
		if (user) {
			events.emit('highlightuser', user);
		}
	}

	function onUnhighlightUser(data) {
		var user = getContextUser(data);
		if (user) {
			events.emit('unhighlightuser', user);
		}
	}

	function onTrollUser(data) {
		var user = getContextUser(data);
		if (user) {
			events.emit('trolluser', user);
		}
	}

	function onUntrollUser(data) {
		var user = getContextUser(data);
		if (user) {
			events.emit('untrolluser', user);
		}
	}

	function onEnableBlockControls(blocks) {
		modBlocks.onEnableBlockControls(blocks, function (event) {
			events.emit('block.action', event);
		});
	}
	function onDomContentLoaded() {
		events.init();
		events.on('getArticles', onGetArticles);
		events.on('getComments', onGetComments);
		events.on('getBlocks', onGetBlocks);
		events.on('comments.update', modComment.onCommentUpdate);
		events.on('comment.setNew', onCommentSetNew);
		events.on('comment.addNextPrev', onCommentAddNextPrev);
		events.on('comment.addParentLink', modComment.addParentLinkToComments);
		events.on('comment.addExpandLink', modComment.addExpandLinkToComments);
		events.on('articles.mark-new', modArticles.onMarkNew);
		events.on('articles.addNextPrev', modArticles.onArticleAddNextPrev);
		events.on('articles.add-category-hide-button', onAddCategoryHideButton);
		events.on('articles.hide', onArticlesHide);
		events.on('block.hide', onBlockHide);
		events.on('enableBlockControls', onEnableBlockControls);
		events.on('block.show', onBlockShow);
		events.on('block.hide-content', onBlockHideContent);
		events.on('block.show-content', onBlockShowContent);
		events.on('blocks.change-order-all', onBlocakChangeOrderAll);
		events.on('block.change-order', onBlockChangeOrder);
		events.on('block.change-column', onBlockChangeColunn);
		events.on('blocks.set-titles', onBlockSetTitles);
		events.on('trolluser', onTrollUser);
		events.on('untrolluser', onUntrollUser);
		events.on('highlightuser', onHighlightUser);
		events.on('unhighlightuser', onUnhighlightUser);
		events.on('hupper-block.add-menu', modHupperBlock.addMenuItem);
		events.on('hupper-block.hide-block', modHupperBlock.addHiddenBlock);
		events.on('hupper-block.show-block', modHupperBlock.removeHiddenBlock);
		events.on('setUnlimitedLinks', unlimitedlinks.setUnlimitedLinks);

		modArticles.listenToTaxonomyButtonClick(function (articleStruct) {
			events.emit('article.hide-taxonomy', articleStruct);
		});

		addHupperBlock().then(function () {
			console.log('huper block added');
		});

		console.log('dom content loaded');
		events.emit('DOMContentLoaded');
		// window.removeEventListener('DOMContentLoaded', onDomContentLoaded); // run once
	}
	window.addEventListener('DOMContentLoaded', onDomContentLoaded, false);

	window.addEventListener('unload', function () {
		events.emit('unload');
	});
});

},{"./core/articles":1,"./core/blocks":2,"./core/comments":3,"./core/commenttree":4,"./core/hupper-block":7,"./core/unlimitedlinks":8}]},{},[9]);
