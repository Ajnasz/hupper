console.log('rq.js');

(function (win) {
	'use strict';

	var modules = new Map();

	var moduleOutput = new Map();

	function def(name, factory) {
		// console.log('define', name);

		modules.set(name, factory);
	}

	function req(name) {
		// console.log('request', name);

		if (!moduleOutput.has(name)) {
			if (!modules.has(name)) {
				throw new Error('No module defined with name: ' + name);
			}
			moduleOutput.set(name, modules.get(name)());
		}

		return moduleOutput.get(name);
	}

	win.def = def;
	win.req = req;
}(window));
/*jshint moz:true*/
(function (def, req) {
	'use strict';
	def('dom', function () {
		var func = req('func');
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

			maxIndex = elements.length - 1;
			index = 0;
			parent = elements[index].parentNode;

			while (true) {
				if (index < maxIndex) {
					if (!parent.contains(elements[index + 1])) {
						parent = parent.parentNode;

						if (!parent) {
							parent = null;
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
			while(element.firstChild) {
				element.removeChild(element.firstChild);
			}
		}

		function emptyText(element) {
			func.toArray(element.childNodes).filter(function (node) {
				return node.nodeType === Node.TEXT_NODE;
			}).forEach(remove);
		}

		return {
			next: next,
			prev: prev,
			closest: closest,
			is: is,
			remove: remove,
			createElem: createElem,
			findCommonParent: findCommonParent,
			empty: empty,
			emptyText: emptyText
		};
	});
}(window.def, window.req));
/*jshint moz: true*/
(function (def) {
	'use strict';

	def('func', function () {
		function index(array, cb) {
			for (let i = 0, al = array.length; i < al; i++) {
				if (cb(array[i])) {
					return i;
				}
			}

			return -1;
		}

		function first(array, cb) {
			let i = index(array, cb);

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
			let pArgs = toArray(arguments).slice(1);

			return function() {
				func.apply(this, pArgs.concat(toArray(arguments)));
			};
		}

		return {
			first: first,
			index: index,
			partial: partial,
			toArray: toArray
		};
	});
}(window.def));
/*jshint moz:true*/
(function (def) {
	'use strict';
	def('commenttree', function () {

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
			let output = Object.create(null);
			output.id = item.id;

			return output;
		}

		function normalizeCommentTree(tree) {
			return tree.map(function (item) {
				let normalized = noramlizeCommentTreeItem(item);
				normalized.children = normalizeCommentTree(item.children);
				return normalized;
			});
		}

		function getCommentTree() {
			let root = document.getElementById('comments');

			return normalizeCommentTree(recObj(createObj(findComments(root))));
		}

		return {
			getCommentTree: getCommentTree
		};
	});

}(window.def));
/*jshint moz:true*/
console.log('comments.js');
(function (def, req) {
	'use strict';
	def('comment', function () {
		const TROLL_COMMENT_CLASS = 'trollComment';
		const TROLL_COMMENT_HEADER_CLASS = 'trollHeader';
		const TROLL_COMMENT_REPLY_CLASS = 'trollCommentAnswer';
		const INDENTED_CLASS = 'indented';
		const HIGHLIGHTED_COMMENT_CLASS = 'highlighted';
		const BORING_COMMENT_CLASS = 'hup-boring';
		const COMMENT_HEADER_CLASS = 'submitted';
		const COMMENT_FOOTER_CLASS = 'link';
		const COMMENT_FOOTER_LINKS_CLASS = 'links';
		const COMMENT_HNAV_CLASS = 'hnav';
		const NEW_COMMENT_CLASS = 'comment-new';
		const EXPAND_COMMENT_CLASS = 'expand-comment';
		const WIDEN_COMMENT_CLASS = 'widen-comment';
		const COMMENT_CLASS = 'comment';
		const COMMENT_NEW_MARKER_CLASS = 'new';
		const ANONYM_COMMENT_AUTHOR_REGEXP = /[^\(]+\( ([^ ]+).*/;
		const COMMENT_DATE_REGEXP = /[\s\|]+([0-9]+)\.\s([a-zúőűáéóüöí]+)\s+([0-9]+)\.,\s+([a-zűáéúőóüöí]+)\s+-\s+(\d+):(\d+).*/;
		const COMMENT_MONTH_NAMES = {
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

		const TEXT_WIDEN = 'szélesítés';
		const TEXT_PARENT = 'szülő';
		const TEXT_NEXT = 'következő';
		const TEXT_PREV = 'előző';

		var dom = req('dom');
		var func = req('func');

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
			var output = '';

			output = comment.header.querySelector('a').textContent.trim();

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
				header.querySelector('.' + COMMENT_HNAV_CLASS)
						.insertBefore(item, hnew);
			} else {
				header.querySelector('.' + COMMENT_HNAV_CLASS)
						.appendChild(item);
			}
		}

		/**
		 * @param string id Comment id
		 * @param string nextCommentId
		 */
		function addLinkToPrevComment(id, prevCommentId) {
			var comment = getCommentObj(getCommentFromId(id)),
				link;

			link = dom.createElem('a', [{name: 'href', value: '#' + prevCommentId}], null, TEXT_PREV);

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

			link = dom.createElem('a', [{name: 'href', value: '#' + nextCommentId}], null, TEXT_NEXT);

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
			getTrollComments()
				.filter(function (comment) {
					return trollComments.indexOf(comment.author) === -1;
				})
				.map(function (comment) {
					return getCommentObj(getCommentFromId(comment.id));
				})
				.forEach(unsetTroll);

			trollComments.map(function (comment) {
				return getCommentObj(getCommentFromId(comment.id));
			}).forEach(setTroll);
		}

		function unsetTrolls() {
			var trolled = func.toArray(document.querySelectorAll([
				'.' + TROLL_COMMENT_CLASS,
				'.' + TROLL_COMMENT_HEADER_CLASS,
				'.' + TROLL_COMMENT_REPLY_CLASS
			].join(',')));

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

			link = dom.createElem('a', [{name: 'href', value: href}], classList, text);
			listItem.appendChild(link);

			return listItem;
		}

		/**
		 * @param commentDataStruct comment
		 */
		function addParentLinkToComment(comment) {
			var commentObj = commentDataStructToObj(comment);

			commentObj.footer.querySelector('.' + COMMENT_FOOTER_LINKS_CLASS)
				.appendChild(createFooterLink(TEXT_PARENT, '#' + comment.parent));
		}

		/**
		 * @param commentDataStruct comment
		 */
		function addExpandLinkToComment(comment) {
			var commentObj = commentDataStructToObj(comment);

			commentObj.footer.querySelector('.' + COMMENT_FOOTER_LINKS_CLASS)
				.appendChild(createFooterLink(TEXT_WIDEN, '#', [EXPAND_COMMENT_CLASS]));
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
			func.toArray(document.querySelectorAll('.' + WIDEN_COMMENT_CLASS))
				.forEach(function (elem) {
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
			let elem = getCommentFromId(comment.id);

			elem.dataset[prop] = value;
			elem.dataset[prop + 'Type'] = typeof value;
		}

		function getProp(comment, prop) {
			let elem = getCommentFromId(comment.id);

			let value = elem.dataset[prop];
			let type = elem.dataset[prop + 'Type'];
			let undef;

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
			let elem = commentDataStructToObj(comment);
			let content = elem.node.querySelector('.content');

			let scores = elem.node.querySelector('.scores');

			if (!scores) {
				let scores = dom.createElem('div', [
					{
						name: 'title',
						value: getScoreTitle(comment.score)
					}
				], ['scores'], comment.score);
				elem.node.insertBefore(scores, content);
			} else {
				scores.textContent = comment.score;
				scores.setAttribute('title', getScoreTitle(comment.score));
			}
		}

		return {
			getComments: getComments,
			parseComment: parseComment,
			setNew: setNew,
			commentDataStructToObj: commentDataStructToObj,
			addLinkToNextComment: addLinkToNextComment,
			addLinkToPrevComment: addLinkToPrevComment,
			setTrolls: setTrolls,
			unsetTrolls: unsetTrolls,
			highlightComment: highlightComment,
			unhighlightComment: unhighlightComment,
			hideBoringComments: hideBoringComments,
			addParentLinkToComments: addParentLinkToComments,
			addExpandLinkToComments: addExpandLinkToComments,
			widenComment: widenComment,
			unwideComments: unwideComments,
			hide: hide,
			show: show,
			setProp: setProp,
			getProp: getProp,
			getCommentFromId: getCommentFromId,
			showScore: showScore
		};
	});
}(window.def, window.req));
/*jshint moz:true*/
console.log('articles.js');
(function (def, req) {
	'use strict';

	def('articles', function () {
		const ARTICLE_HNAV_CLASS = 'hnav';

		const TEXT_NEXT = 'következő';
		const TEXT_PREV = 'előző';
		const TEXT_HIDE_ARTICLE_TITLE = 'Cikk kategória elrejtése';


		let func = req('func');
		let dom = req('dom');

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
			let category = element.querySelector('.links.inline > .first.last > a').textContent;
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

		function addHNav(article) {
			if (!article.header.querySelector('.' + ARTICLE_HNAV_CLASS)) {
				var span = dom.createElem('span', null, [ARTICLE_HNAV_CLASS]);

				article.header.appendChild(span);
			}
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

		function addPrevNextArticleLink(id, relId, text) {
			var article = articleStructToArticleNodeStruct({id: id}),
				link;

			link = dom.createElem('a', [{name: 'href', value: '#' + relId}], null, text);

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
			let categoryContainer = article.node.querySelector('.links.inline > .first.last');
			let button = dom.createElem('button', [
				{name: 'type', value: 'button'},
				{name: 'title', value: TEXT_HIDE_ARTICLE_TITLE}
			], [
				'hupper-button',
				'taxonomy-button',
				'delete-button',
			]);

			categoryContainer.appendChild(button);
		}

		/**
		 * @param articleNodeStruct article
		 */
		function markNewArticle(newArticleText, article) {
			addHNav(article);
			let newText = dom.createElem('span', [], ['hnew', 'nnew'], newArticleText);
			article.header.querySelector('.' + ARTICLE_HNAV_CLASS).appendChild(newText);
		}

		function parseArticles() {
			let elements = document.getElementById('content-both').querySelectorAll('.node');
			return func.toArray(elements).map(articleElementToStruct);
		}

		return {
			parseArticles: parseArticles,
			markNewArticle: markNewArticle,
			articleStructToArticleNodeStruct: articleStructToArticleNodeStruct,
			addLinkToPrevArticle: addLinkToPrevArticle,
			addLinkToNextArticle: addLinkToNextArticle,
			addCategoryHideButton: addCategoryHideButton,
			articleElementToStruct: articleElementToStruct
		};
	});
}(window.def, window.req));
/*jshint moz:true*/
(function (def, req) {
	'use strict';

	var dom = req('dom');
	var func = req('func');

	def('blocks', function () {
		const BLOCK_CLASS = 'block';
		const SIDEBAR_CLASS = 'sidebar';
		const SIDEBAR_LEFT_CLASS = 'sidebar-left';
		const SIDEBAR_RIGHT_CLASS = 'sidebar-right';
		const BLOCK_HEADER_ELEMENT = 'h2';

		var blockDataStruct = {
			id: '',
			column: ''
		};

		var blockSturct = {
			node: null,
			header: null
		};

		/**
		 * @param blockDataStruct
		 * @return blockSturct
		 */
		function blockDataStructToBlockSturct(block) {
			let output = Object.create(blockSturct),
				node = blockDataStructToBlockElement(block);

			output.node = node;
			output.header = node.querySelector(BLOCK_HEADER_ELEMENT);
			// output.content = node.querySelector('.content');

			return output;
		}

		function blockDataStructToBlockElement(blockObj) {
			return document.getElementById(blockObj.id);
		}

		function getBlockElements(sidebar) {
			return func.toArray(sidebar.querySelectorAll('.' + BLOCK_CLASS));
		}

		/**
		 * @param HTMLBlockElement block
		 * @return string
		 */
		function getBlockColumn(block) {
			let sidebar = dom.closest(block, '.' + SIDEBAR_CLASS);

			return sidebar.getAttribute('id');
		}

		/**
		 * @param HTMLBlockElement block
		 * @return blockDataStruct
		 *	id string
		 *	column string
		 */
		function blockElemToBlockDataStruct(block) {
			let output = Object.create(blockDataStruct);

			output.id = block.getAttribute('id');
			output.column = getBlockColumn(block);

			return output;
		}

		function getBlocks() {
			let leftBlocks = getBlockElements(document.getElementById(SIDEBAR_LEFT_CLASS))
					.map(blockElemToBlockDataStruct);
			let rightBlocks = getBlockElements(document.getElementById(SIDEBAR_RIGHT_CLASS))
					.map(blockElemToBlockDataStruct);

			return {
				left: leftBlocks,
				right: rightBlocks
			};
		}

		function createBlockButton(action) {
			let btn = dom.createElem('button',
				[{ name: 'data-action', value: action }],
				['hupper-button', 'block-button', action + '-button']
			);

			return btn;
		}

		function decorateBlock(block) {
			let blockStruct = blockDataStructToBlockSturct(block);

			if (blockStruct.header) {
				['delete', 'hide-content', 'show-content', 'right', 'left', 'down', 'up']
					.map(createBlockButton).forEach(function (btn) {
						blockStruct.header.appendChild(btn);
					});
			}

		}

		function decorateBlocks(blocks) {
			blocks.forEach(decorateBlock);
		}

		function toggleBlockClass(block, cls, add) {
			let blockElem = blockDataStructToBlockElement(block);

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

		function renderSidebar(sidebar, blocks, elementList) {
			blocks.forEach(function (block) {
				let index = func.index(elementList, function (blockElem) {
					return blockElem.id === block.id;
				});

				if (index > -1) {
					let  elem = elementList.splice(index, 1)[0];
					sidebar.appendChild(elem);
				}
			});
		}

		function setBlockOrder(sidebar, blocks) {
			let sidebarElem = document.getElementById(sidebar);

			let blockElements = getBlockElements(sidebarElem);


			blockElements.forEach(function (element) {
				dom.remove(element);
			});

			renderSidebar(sidebarElem, blocks, blockElements);
		}

		function reorderBlocks(blocks) {
			console.log('reorder blocks', blocks);

			let sidebarLeft = document.getElementById(SIDEBAR_LEFT_CLASS);
			let sidebarRight = document.getElementById(SIDEBAR_RIGHT_CLASS);

			let elementList = getBlockElements(sidebarLeft)
					.concat(getBlockElements(sidebarRight));

			renderSidebar(sidebarLeft, blocks.left, elementList);
			renderSidebar(sidebarRight, blocks.right, elementList);
		}

		function setBlockTitleLink(blockId, href) {
			let block = document.getElementById(blockId);

			if (block) {
				let h2 = block.querySelector(BLOCK_HEADER_ELEMENT);
				if (h2) {
					let title = h2.textContent;
					dom.emptyText(h2);
					h2.appendChild(dom.createElem('a', [{name: 'href', value: href}], null, title));
				}
			}
		}

		function setTitles(titles) {
			Object.keys(titles).forEach(function (id) {
				setBlockTitleLink(id, titles[id]);
			});
		}

		return {
			getBlocks: getBlocks,
			decorateBlocks: decorateBlocks,
			blockDataStructToBlockElement: blockDataStructToBlockElement,
			blockElemToBlockDataStruct: blockElemToBlockDataStruct,
			getBlockColumn: getBlockColumn,
			hide: hideBlock,
			show: showBlock,
			hideContent: hideBlockContent,
			showContent: showBlockContent,
			setBlockOrder: setBlockOrder,
			reorderBlocks: reorderBlocks,
			setTitles: setTitles
		};
	});
}(window.def, window.req));
/*jshint moz:true*/
(function (def, req) {
	'use strict';

	var dom = req('dom');

	def('hupper-block', function () {
		const TEXT_HIDDEN_BLOCKS = 'Rejtett dobozok';
		function addHupperBlock() {
			if (document.getElementById('block-hupper')) {
				return;
			}

			let block = dom.createElem('div', [{
				name: 'id',
				value: 'block-hupper'
			}], ['block', 'block-block']);

			let h2 = dom.createElem('h2', null, null, 'Hupper');
			let content = dom.createElem('div', null, ['content']);
			let ul = dom.createElem('ul', null, ['menu']);

			content.appendChild(ul);

			block.appendChild(h2);
			block.appendChild(content);

			let sidebar = document.getElementById('sidebar-right');

			sidebar.insertBefore(block, sidebar.firstChild);

			ul.addEventListener('click', function (e) {
				let target = e.target.parentNode;
				let classList = target.classList;

				let collapsed = classList.contains('collapsed');

				let expanded = !collapsed && classList.contains('expanded');

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
			let block = document.getElementById('block-hupper');
			return block.querySelector('.menu');

		}

		function addMenuItem(item, parent) {
			parent = parent || getItemList();
			let li = dom.createElem('li', null, ['leaf']);
			let a = dom.createElem('a', [
				{name: 'href', value: item.href}
			], null, item.text);

			li.appendChild(a);

			parent.appendChild(li);

			return li;
		}

		function addHiddenBlockContainer() {
			let container = getItemList().querySelector('.hidden-blocks');

			if (!container) {
				let li = addMenuItem({
					text: TEXT_HIDDEN_BLOCKS,
					href: '#'
				});

				li.classList.remove('leaf');
				li.classList.add('collapsed', 'hup-collapsed');

				let hiddenBlocks = dom.createElem('ul', null, ['hidden-blocks']);

				li.appendChild(hiddenBlocks);

				return hiddenBlocks;
			}

			return container;
		}

		function addHiddenBlock(block) {
			let container = addHiddenBlockContainer();

			let element = document.getElementById(block.id);

			if (!element) {
				return;
			}

			let menuItem = addMenuItem({
				href: '#restore-' + block.id,
				text: element.querySelector('h2').textContent.trim()
			}, container);

			let link = menuItem.firstChild;

			link.dataset.action = 'restore-block';
			link.dataset.blockid = block.id;
		}

		function removeHiddenBlock(block) {
			let container = addHiddenBlockContainer();
			let link = container.querySelector('[data-action="restore-block"][data-blockid="' + block.id + '"]');

			if (link) {
				dom.remove(link.parentNode);
			}
		}

		return {
			addHupperBlock: addHupperBlock,
			addMenuItem: addMenuItem,
			addHiddenBlock: addHiddenBlock,
			removeHiddenBlock: removeHiddenBlock
		};
	});


}(window.def, window.req));
/*jshint moz:true*/
(function (def) {
	'use strict';
	def('unlimitedlinks', function () {
		let pathNames = [
			'/cikkek',
			'/node',
			'/szavazasok',
			'/promo'
		];

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
			let search = link.search;
			link.search = search[0] === '?' ? '&comments_per_page=9999' : '?comments_per_page=9999';
		}

		return {
			isExtendableLink: isExtendableLink,
			makeExtendable: makeExtendable
		};
	});
}(window.def));
/*jshint esnext:true*/
(function (req) {
	'use strict';
	console.log(window, window.req)
	window.addEventListener('DOMContentLoaded', function () {
		let modCommentTree = req('commenttree');

		console.log(document.getElementById('comments'), modCommentTree.getCommentTree());
	}, false);
}(window.req));
