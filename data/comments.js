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
				indented  = '.' + INDENTED_CLASS,
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

			link = dom.createElem('a', [{name: 'href', value: '#' + prevCommentId}], null, 'Prev');

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

			link = dom.createElem('a', [{name: 'href', value: '#' + nextCommentId}], null, 'Next');

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
		 * @return {commentDataStruct[]}
		 */
		function getHighlightedComments() {
			return func.toArray(document.querySelectorAll('.' + HIGHLIGHTED_COMMENT_CLASS)).map(parseComment);
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
			comment.node.classList.remove(HIGHLIGHTED_COMMENT_CLASS);
			comment.header.style.backgroundColor = '';
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
		 * @param {commentDataStruct[]} comments
		 */
		function highlightComments(comments) {
			// unhighlight the comments which not in the comments
			getHighlightedComments()
				.filter(function (comment) {
					return comments.indexOf(comment.author) === -1;
				})
				.map(function (comment) {
					return getCommentObj(getCommentFromId(comment.id));
				})
				.forEach(unhighlightComment);

			comments.forEach(highlightComment);
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
				.appendChild(createFooterLink('parent', '#' + comment.parent));
		}

		/**
		 * @param commentDataStruct comment
		 */
		function addExpandLinkToComment(comment) {
			var commentObj = commentDataStructToObj(comment);

			commentObj.footer.querySelector('.' + COMMENT_FOOTER_LINKS_CLASS)
				.appendChild(createFooterLink('widen', '#', [EXPAND_COMMENT_CLASS]));
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

		function setProp(comment, prop, value) {
			let elem = getCommentFromId(comment.id);

			elem.dataset[prop] = value;
			elem.dataset[prop + 'Type'] = typeof value;
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
			highlightComments: highlightComments,
			highlightComment: highlightComment,
			hideBoringComments: hideBoringComments,
			addParentLinkToComments: addParentLinkToComments,
			addExpandLinkToComments: addExpandLinkToComments,
			widenComment: widenComment,
			unwideComments: unwideComments,
			hide: hide,
			setProp: setProp,
			getCommentFromId: getCommentFromId
		};
	});
}(window.def, window.req));
