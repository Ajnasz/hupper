(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
		global.articles = mod.exports;
	}
})(this, function (exports) {
	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
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

	exports.filterNewArticles = filterNewArticles;
	exports.setNewArticles = setNewArticles;
	exports.filterHideableArticles = filterHideableArticles;
});

},{}],2:[function(require,module,exports){
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
		global.blocks = mod.exports;
	}
})(this, function (exports, _func) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.updateBlock = exports.onBlockChangeColumn = exports.onBlockChangeOrder = exports.getBlockTitles = exports.filterContentHidden = exports.filterHidden = exports.mergeBlockPrefsWithBlocks = undefined;

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

	function createBlockPref(block) {
		return {
			id: block.id,
			hidden: false,
			contentHidden: false
		};
	}
	function mergeBlockPrefsWithBlocks(blocks, blocksPref) {
		if (!blocksPref) {
			blocksPref = {};
		}
		if (!blocksPref.left) {
			blocksPref.left = blocks.left.map(createBlockPref);
		} else {
			blocksPref.left = blocksPref.left.concat(blocks.left.filter(function (block) {
				return !blocksPref.left.some(function (b) {
					return b.id === block.id;
				}) && !blocksPref.right.some(function (b) {
					return b.id === block.id;
				});
			}));
		}
		if (!blocksPref.right) {
			blocksPref.right = blocks.right.map(createBlockPref);
		} else {
			blocksPref.right = blocksPref.right.concat(blocks.right.filter(function (block) {
				return !blocksPref.left.some(function (b) {
					return b.id === block.id;
				}) && !blocksPref.right.some(function (b) {
					return b.id === block.id;
				});
			}));
		}
		return blocksPref;
	}
	function filterHidden(block) {
		return block.hidden;
	}
	function filterContentHidden(block) {
		return block.contentHidden;
	}
	function updateBlock(details, prefName, value, blockPrefs) {
		var columnBlocks = void 0;
		if (details.column === 'sidebar-right') {
			columnBlocks = blockPrefs.right;
		} else if (details.column === 'sidebar-left') {
			columnBlocks = blockPrefs.left;
		} else {
			throw new Error('Unknown sidebar');
		}
		var matchingBlocks = columnBlocks.filter(function (b) {
			return b.id === details.id;
		});
		var block = matchingBlocks[0];
		block[prefName] = value;
		return block;
	}
	function findNotHiddenIndex(blocks, start, direction) {
		if (!blocks[start].hidden) {
			return start;
		}
		if (direction === 'down') {
			for (var i = start, bl = blocks.length; i < bl; i++) {
				if (blocks[i].hidden) {
					continue;
				}
				return i;
			}
		} else if (direction === 'up') {
			for (var _i = start, _bl = blocks.length; _i < _bl; _i--) {
				if (blocks[_i].hidden) {
					continue;
				}
				return _i;
			}
		}
		return -1;
	}
	function onBlockChangeOrder(events, details, blockPrefs) {
		var columnBlocks = details.column === 'sidebar-right' ? blockPrefs.right : blockPrefs.left;
		var oldIndex = func.index(columnBlocks, function (block) {
			return block.id === details.id;
		});
		if (oldIndex > -1) {
			var newIndex = findNotHiddenIndex(columnBlocks, details.action === 'up' ? oldIndex - 1 : oldIndex + 1, details.action);
			var tmpBlock = columnBlocks.splice(newIndex, 1, columnBlocks[oldIndex]);
			columnBlocks.splice(oldIndex, 1, tmpBlock[0]);
			return columnBlocks;
		}
	}
	function onBlockChangeColumn(events, details, blockPrefs) {
		var isOnRightSide = details.column === 'sidebar-right';
		var columnBlocks = isOnRightSide ? blockPrefs.right : blockPrefs.left;
		var blockIndex = func.index(columnBlocks, function (block) {
			return block.id === details.id;
		});
		if (blockIndex > -1) {
			var tmpBlock = columnBlocks.splice(blockIndex, 1);
			var otherColumn = isOnRightSide ? blockPrefs.left : blockPrefs.right;
			otherColumn.unshift(tmpBlock[0]);
			return blockPrefs;
		}
	}
	function getBlockTitles() {
		return {
			'block-aggregator-feed-13': 'http://distrowatch.com',
			'block-aggregator-feed-19': 'http://www.freebsd.org',
			'block-aggregator-feed-48': 'http://www.netbsd.org',
			'block-aggregator-feed-2': 'http://www.kernel.org',
			'block-aggregator-feed-3': 'http://wiki.hup.hu',
			'block-aggregator-feed-4': 'http://lwn.net',
			'block-aggregator-feed-40': 'http://www.flickr.com/photos/h_u_p/',
			'block-aggregator-feed-41': 'http://blogs.sun.com',
			'block-aggregator-feed-44': 'http://hwsw.hu',
			'block-aggregator-feed-46': 'http://www.linuxdevices.com',
			'block-aggregator-feed-47': 'http://undeadly.org',
			'block-aggregator-feed-50': '/allasajanlatok',
			'block-aggregator-feed-51': 'http://blogs.sun.com/sunhu/',
			'block-block-15': 'irc://irc.freenode.net/hup.hu',
			'block-block-12': '/tamogatok',
			'block-block-7': 'http://www.google.com/custom?ie=UTF-8&' + 'oe=UTF-8&domains=hup.hu&sa=Keres%C3%A9s&' + 'cof=%22S%3Ahttp%3A%2F%2Fhup.hu%3BVLC%3A7a7a76%3BAH%3A' + 'center%3BLH%3A74%3BLC%3A7a7a76%3BGFNT%3A7a7a76%3BL%3A' + 'http%3A%2F%2Fhup.hu%2Fimages%2Fhup_search.png%3BLW%3A484%3' + 'BT%3Ablack%3BAWFID%3Ab92ddab1875cce47%3B%22&sitesearch=hup.hu',
			'block-block-6': 'http://www.mozilla.com/firefox?from=sfx&uid=225821&t=308',
			'block-blog-0': '/blog',
			'block-comment-0': '/tracker',
			'block-poll-0': '/poll',
			'block-poll-40': '/poll',
			'block-search-0': '/search',
			'block-tagadelic-1': '/temak'
		};
	}

	exports.mergeBlockPrefsWithBlocks = mergeBlockPrefsWithBlocks;
	exports.filterHidden = filterHidden;
	exports.filterContentHidden = filterContentHidden;
	exports.getBlockTitles = getBlockTitles;
	exports.onBlockChangeOrder = onBlockChangeOrder;
	exports.onBlockChangeColumn = onBlockChangeColumn;
	exports.updateBlock = updateBlock;
});

},{"./func":4}],3:[function(require,module,exports){
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
		global.comments = mod.exports;
	}
})(this, function (exports, _func) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.flatComments = exports.markTrollComments = exports.markBoringComments = exports.setHighlightedComments = exports.updateTrolls = exports.setPrevNextLinks = exports.getNewComments = exports.setScores = undefined;

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

	var plusOneRex = new RegExp('(?:^|\\s)\\+1(?:$|\\s|\\.|,)'),
	    minusOneRex = new RegExp('(?:^|\\s)-1(?:$|\\s|\\.|,)');
	function setPrevNextLinks(newComments) {
		var newCommentsLength = newComments.length;
		return newComments.map(function (comment, index) {
			var nextPrev = { id: comment.id };
			if (index + 1 < newCommentsLength) {
				nextPrev.nextId = newComments[index + 1].id;
			}
			if (index > 0) {
				nextPrev.prevId = newComments[index - 1].id;
			}
			return nextPrev;
		});
	}
	function updateTrolls(trolls, comments) {
		comments.forEach(function (comment) {
			if (trolls.indexOf(comment.author) > -1) {
				comment.hide = true;
				comment.troll = true;
			} else {
				comment.hide = comment.boring ? true : false;
				comment.troll = false;
			}
			updateTrolls(trolls, comment.children);
		});
	}
	function getParagraphs(comment) {
		return comment.content.split('\n');
	}
	function isBorinComment(boringRegexp, comment) {
		var paragraphs = getParagraphs(comment).filter(function (p) {
			return p.trim() !== '';
		});
		return paragraphs.length === 1 && boringRegexp.test(paragraphs[0].trim());
	}
	function isTrollComment(trolls, comment) {
		return trolls.indexOf(comment.author) > -1;
	}
	function markTrollComments(comments, trolls) {
		comments.forEach(function (comment) {
			if (isTrollComment(trolls, comment)) {
				comment.hide = true;
				comment.troll = true;
			}
			markTrollComments(comment.children, trolls);
		});
	}
	function markBoringComments(comments, boringRegexp) {
		comments.forEach(function (comment) {
			if (isBorinComment(boringRegexp, comment)) {
				comment.hide = true;
				comment.boring = true;
			}
			markBoringComments(comment.children, boringRegexp);
		});
	}
	function getNewComments(comments) {
		var output = [];
		comments.forEach(function (comment) {
			if (comment.isNew && !comment.hide) {
				output.push(comment);
			}
			if (!comment.hide && comment.children.length) {
				output = output.concat(getNewComments(comment.children));
			}
		});
		return output;
	}
	function flatComments(comments) {
		var output = [];
		comments.forEach(function (comment) {
			output.push(comment);
			if (comment.children.length > 0) {
				output = output.concat(flatComments(comment.children));
			}
		});
		return output;
	}
	function setHighlightedComments(users, comments) {
		var undef = void 0;
		comments.forEach(function (comment) {
			var highlightData = func.first(users, function (user) {
				return user.name === comment.author;
			});
			if (highlightData) {
				comment.userColor = highlightData.color;
			} else {
				comment.userColor = undef;
			}
			setHighlightedComments(users, comment.children);
		});
	}
	function isPlusOne(comment) {
		return plusOneRex.test(getParagraphs(comment)[0]);
	}
	function isMinusOne(comment) {
		return minusOneRex.test(getParagraphs(comment)[0]);
	}
	function setScores(comments) {
		comments.forEach(function (comment) {
			comment.score = 0;
			comment.children.forEach(function (child) {
				if (isPlusOne(child)) {
					comment.score += 1;
				} else if (isMinusOne(child)) {
					comment.score -= 1;
				}
			});
			setScores(comment.children);
		});
	}

	exports.setScores = setScores;
	exports.getNewComments = getNewComments;
	exports.setPrevNextLinks = setPrevNextLinks;
	exports.updateTrolls = updateTrolls;
	exports.setHighlightedComments = setHighlightedComments;
	exports.markBoringComments = markBoringComments;
	exports.markTrollComments = markTrollComments;
	exports.flatComments = flatComments;
});

},{"./func":4}],4:[function(require,module,exports){
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
        global.func = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    (function () {
        'use strict';

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
        function toArray(list) {
            return Array.prototype.slice.call(list);
        }
        function partial(func) {
            var pArgs = toArray(arguments).slice(1);
            return function () {
                func.apply(this, pArgs.concat(toArray(arguments)));
            };
        }
        if (typeof exports !== 'undefined') {
            exports.index = index;
            exports.first = first;
            exports.partial = partial;
            exports.toArray = toArray;
        } else {
            define('./core/func', function (exports) {
                exports.index = index;
                exports.first = first;
                exports.partial = partial;
                exports.toArray = toArray;
            });
        }
    })();
});

},{}],5:[function(require,module,exports){
(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', './func', './comments', './articles', './blocks'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('./func'), require('./comments'), require('./articles'), require('./blocks'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.func, global.comments, global.articles, global.blocks);
		global.main = mod.exports;
	}
})(this, function (exports, _func, _comments, _articles, _blocks) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.parseBlocks = exports.parseArticles = exports.parseComments = undefined;

	var func = _interopRequireWildcard(_func);

	var modComments = _interopRequireWildcard(_comments);

	var modArticles = _interopRequireWildcard(_articles);

	var modBlocks = _interopRequireWildcard(_blocks);

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

	var _slicedToArray = function () {
		function sliceIterator(arr, i) {
			var _arr = [];
			var _n = true;
			var _d = false;
			var _e = undefined;

			try {
				for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
					_arr.push(_s.value);

					if (i && _arr.length === i) break;
				}
			} catch (err) {
				_d = true;
				_e = err;
			} finally {
				try {
					if (!_n && _i["return"]) _i["return"]();
				} finally {
					if (_d) throw _e;
				}
			}

			return _arr;
		}

		return function (arr, i) {
			if (Array.isArray(arr)) {
				return arr;
			} else if (Symbol.iterator in Object(arr)) {
				return sliceIterator(arr, i);
			} else {
				throw new TypeError("Invalid attempt to destructure non-iterable instance");
			}
		};
	}();

	function parseComments(events, pref) {
		var TEXT_FIRST_NEW_COMMENT = 'Első olvasatlan hozzászólás';
		console.log('parse comments!');
		events.on('gotComments', function onGotComments(comments) {
			console.log('GOT COMMENTS~!!!');
			modComments.setScores(comments);
			Promise.all([pref.getPref('hideboringcomments'), pref.getPref('boringcommentcontents'), pref.getPref('filtertrolls'), pref.getCleanTrolls(), pref.getCleanHighlightedUsers(), pref.getPref('replacenewcommenttext')]).then(function (results) {
				var _results = _slicedToArray(results, 6);

				var hideBoringComments = _results[0];
				var boringRexStr = _results[1];
				var filterTrolls = _results[2];
				var trolls = _results[3];
				var highlightedUsers = _results[4];
				var replaceNewCommentText = _results[5];

				if (hideBoringComments) {
					var boringRex = new RegExp(boringRexStr);
					modComments.markBoringComments(comments, boringRex);
				}
				if (filterTrolls) {
					modComments.markTrollComments(comments, trolls);
				}
				if (highlightedUsers.length) {
					modComments.setHighlightedComments(highlightedUsers, comments);
				}
				var flatCommentList = modComments.flatComments(comments);
				var childComments = flatCommentList.filter(function (comment) {
					return comment.parent !== '';
				});
				events.emit('comment.addParentLink', childComments);
				events.emit('comment.addExpandLink', childComments.filter(function (comment) {
					return comment.indentLevel > 1;
				}));
				events.emit('comments.update', flatCommentList);
				var newComments = modComments.getNewComments(comments);
				if (replaceNewCommentText && newComments.length > 0) {
					pref.getPref('newcommenttext').then(function (text) {
						events.emit('comment.setNew', {
							comments: newComments,
							text: text
						});
					});
				}
				modComments.setPrevNextLinks(newComments, events).forEach(function (nextPrev) {
					events.emit('comment.addNextPrev', nextPrev);
				});
				if (newComments.length > 0) {
					events.emit('hupper-block.add-menu', {
						href: '#new',
						text: TEXT_FIRST_NEW_COMMENT
					});
				}
				pref.on('highlightusers', function () {
					pref.getCleanHighlightedUsers().then(function (highlightedUsers) {
						modComments.setHighlightedComments(highlightedUsers, comments);
						events.emit('comments.update', flatCommentList);
					});
				});
				pref.on('trolls', function () {
					pref.getCleanTrolls().then(function (trolls) {
						modComments.updateTrolls(trolls, comments);
						events.emit('comments.update', flatCommentList);
					});
				});
			});
		});
		events.emit('getComments', { content: true });
	}
	function parseArticles(events, pref) {
		var TEXT_FIRST_ARTICLE_WITH_NEW_COMMENTS = 'Olvasatlan hozz\xE1sz\xF3l\xE1sok';
		console.log('get articles');
		events.emit('getArticles');
		events.on('gotArticles', function (articles) {
			var newArticles = articles.filter(modArticles.filterNewArticles);
			console.log('articles', articles);
			pref.getPref('newcommenttext').then(function (newCommentText) {
				events.emit('articles.mark-new', {
					text: newCommentText,
					articles: newArticles
				});
			});
			if (newArticles.length > 0) {
				events.emit('hupper-block.add-menu', {
					href: '#' + newArticles[0].id,
					text: TEXT_FIRST_ARTICLE_WITH_NEW_COMMENTS
				});
				var nextPrev = modArticles.setNewArticles(newArticles, events);
				if (nextPrev) {
					nextPrev.forEach(function (item) {
						events.emit('articles.addNextPrev', item);
					});
				}
			}
			events.emit('articles.add-category-hide-button', articles);
			events.on('article.hide-taxonomy', function (article) {
				pref.getCleanTaxonomies().then(function (taxonomies) {
					if (taxonomies.indexOf(articles.cateogry) === -1) {
						taxonomies.push(article.category);
						pref.setPref('hidetaxonomy', taxonomies.join(','));
						var hideableArticles = modArticles.filterHideableArticles(articles, taxonomies);
						events.emit('articles.hide', hideableArticles);
					}
				});
			});
			pref.getCleanTaxonomies().then(function (taxonomies) {
				var hideableArticles = modArticles.filterHideableArticles(articles, taxonomies);
				events.emit('articles.hide', hideableArticles);
			});
		});
	}
	function emitBlockEvent(events, event, block) {
		events.emit(event, {
			id: block.id,
			column: block.column
		});
	}
	function updateBlock(pref, details, prefName, value) {
		return pref.getPref('blocks').then(function (blocks) {
			return new Promise(function (resolve) {
				var blockPrefs = JSON.parse(blocks);
				var output = modBlocks.updateBlock(details, prefName, value, blockPrefs);
				pref.setPref('blocks', JSON.stringify(blockPrefs));
				resolve(output);
			});
		});
	}
	function onBlockDelete(events, pref, details) {
		updateBlock(pref, details, 'hidden', true).then(function (block) {
			emitBlockEvent(events, 'block.hide', block);
			emitBlockEvent(events, 'hupper-block.hide-block', block);
		});
	}
	function onBlockRestore(events, pref, details) {
		updateBlock(pref, details, 'hidden', false).then(function (block) {
			emitBlockEvent(events, 'block.show', block);
			emitBlockEvent(events, 'hupper-block.show-block', block);
		});
	}
	function onBlockHideContent(events, pref, details) {
		updateBlock(pref, details, 'contentHidden', true).then(function (block) {
			emitBlockEvent(events, 'block.hide-content', block);
		});
	}
	function onBlockShowContent(events, pref, details) {
		updateBlock(pref, details, 'contentHidden', false).then(function (block) {
			emitBlockEvent(events, 'block.show-content', block);
		});
	}
	function onUpDownAction(events, pref, details) {
		pref.getPref('blocks').then(function (blocks) {
			var blockPrefs = JSON.parse(blocks);
			var columnBlocks = modBlocks.onBlockChangeOrder(events, details, blockPrefs);
			if (columnBlocks) {
				pref.setPref('blocks', JSON.stringify(blockPrefs));
				events.emit('block.change-order', {
					sidebar: details.column,
					blocks: columnBlocks
				});
			}
		});
	}
	function onLeftRightAction(events, pref, details) {
		pref.getPref('blocks').then(function (blocks) {
			var blockPrefs = JSON.parse(blocks);
			var allBlocks = modBlocks.onBlockChangeColumn(events, details, blockPrefs);
			if (allBlocks) {
				pref.setPref('blocks', JSON.stringify(blockPrefs));
				events.emit('block.change-column', blockPrefs);
			}
		});
	}
	function onBlockAction(events, pref, details) {
		console.log('on block action', events, details);
		switch (details.action) {
			case 'delete':
				onBlockDelete(events, pref, details);
				break;
			case 'restore-block':
				onBlockRestore(events, pref, details);
				break;
			case 'hide-content':
				onBlockHideContent(events, pref, details);
				break;
			case 'show-content':
				onBlockShowContent(events, pref, details);
				break;
			case 'up':
			case 'down':
				onUpDownAction(events, pref, details);
				break;
			case 'left':
			case 'right':
				onLeftRightAction(events, pref, details);
				break;
		}
	}
	function requestBlockHide(events, block) {
		emitBlockEvent(events, 'block.hide', block);
		emitBlockEvent(events, 'hupper-block.hide-block', block);
	}
	function requestBlockContentHide(events, block) {
		emitBlockEvent(events, 'block.hide-content', block);
		emitBlockEvent(events, 'hupper-block.show-block', block);
	}
	function finishBlockSetup(events, pref, blocks, blocksPref) {
		events.emit('blocks.set-titles', modBlocks.getBlockTitles());
		var allBlocks = blocksPref.left.concat(blocksPref.right);
		allBlocks.filter(modBlocks.filterHidden).forEach(func.partial(requestBlockHide, events));
		allBlocks.filter(modBlocks.filterContentHidden).forEach(func.partial(requestBlockContentHide, events));
		events.on('block.action', func.partial(onBlockAction, events, pref));
	}
	function parseBlocks(events, pref, blocks) {
		pref.getPref('blocks').then(function (blocksPrefStr) {
			var blocksPref = JSON.parse(blocksPrefStr);
			blocksPref = modBlocks.mergeBlockPrefsWithBlocks(blocks, blocksPref);
			pref.setPref('blocks', JSON.stringify(blocksPref));
			events.emit('enableBlockControls', blocks.left);
			events.emit('enableBlockControls', blocks.right);
			events.on('blocks.change-order-all-done', function () {
				finishBlockSetup(events, pref, blocks, blocksPref);
			});
			events.emit('blocks.change-order-all', blocksPref);
		});
	}

	exports.parseComments = parseComments;
	exports.parseArticles = parseArticles;
	exports.parseBlocks = parseBlocks;
});

},{"./articles":1,"./blocks":2,"./comments":3,"./func":4}],6:[function(require,module,exports){
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
		global.pagestyles = mod.exports;
	}
})(this, function (exports) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	function createStyle(elements, rules) {
		return elements.join(',') + '{' + rules.map(function (rule) {
			return rule.name + ':' + rule.value + ' !important;';
		}).join('') + '}';
	}
	function getPageStyle(conf) {
		var output = [];
		if (conf.minFontSize > 0) {
			output.push(createStyle(['body', '#all', '#top-nav', '#top-nav a', '.sidebar .block .content', '#footer', '.node .links'], [{
				name: 'font-size',
				value: conf.minFontSize + 'px'
			}]));
		}
		if (conf.minWidth > 0) {
			output.push(createStyle(['.sidebar'], [{
				name: 'width',
				value: conf.minWidth + 'px'
			}]));
		}
		if (conf.hideLeftSidebar) {
			output.push(createStyle(['#sidebar-left'], [{
				name: 'display',
				value: 'none'
			}]));
		}
		if (conf.hideRightSidebar) {
			output.push(createStyle(['#sidebar-right'], [{
				name: 'display',
				value: 'none'
			}]));
		}
		return output;
	}

	exports.getPageStyle = getPageStyle;
});

},{}],7:[function(require,module,exports){
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
		global.pref = mod.exports;
	}
})(this, function (exports) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	var prefs = Object.create(null, {
		getCleanHighlightedUsers: {
			value: function value() {
				return this.getPref('highlightusers').then(function (highlightusers) {
					return new Promise(function (resolve) {
						var value = void 0;
						if (highlightusers === null) {
							value = [];
						} else {
							value = highlightusers.split(',').filter(function (user) {
								return user.trim() !== '';
							}).map(function (user) {
								return user.split(':');
							}).filter(function (user) {
								return user.length === 2 && Boolean(user[0]) && Boolean(user[1]);
							}).map(function (user) {
								return {
									name: user[0],
									color: user[1]
								};
							});
						}
						resolve(value);
					});
				});
			}
		},
		getCleanTrolls: {
			value: function value() {
				return this.getPref('trolls').then(function (trolls) {
					return new Promise(function (resolve) {
						var value = void 0;
						if (trolls === null) {
							value = [];
						} else {
							value = trolls.split(',').filter(function (troll) {
								return troll.trim() !== '';
							});
						}
						resolve(value);
					});
				});
			}
		},
		getCleanTaxonomies: {
			value: function value() {
				return this.getPref('hidetaxonomy').then(function (taxonomies) {
					return new Promise(function (resolve) {
						var value = void 0;
						if (taxonomies === null) {
							value = [];
						} else {
							value = taxonomies.split(',').filter(function (taxonomy) {
								return taxonomy.trim() !== '';
							});
						}
						resolve(value);
					});
				});
			}
		}
	});

	exports.prefs = prefs;
});

},{}],8:[function(require,module,exports){
(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['./pref', './core/pagestyles', './core/main'], factory);
	} else if (typeof exports !== "undefined") {
		factory(require('./pref'), require('./core/pagestyles'), require('./core/main'));
	} else {
		var mod = {
			exports: {}
		};
		factory(global.pref, global.pagestyles, global.main);
		global.main = mod.exports;
	}
})(this, function (_pref, _pagestyles, _main) {
	'use strict';

	var pageStyles = _interopRequireWildcard(_pagestyles);

	var coreMain = _interopRequireWildcard(_main);

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

	var _slicedToArray = function () {
		function sliceIterator(arr, i) {
			var _arr = [];
			var _n = true;
			var _d = false;
			var _e = undefined;

			try {
				for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
					_arr.push(_s.value);

					if (i && _arr.length === i) break;
				}
			} catch (err) {
				_d = true;
				_e = err;
			} finally {
				try {
					if (!_n && _i["return"]) _i["return"]();
				} finally {
					if (_d) throw _e;
				}
			}

			return _arr;
		}

		return function (arr, i) {
			if (Array.isArray(arr)) {
				return arr;
			} else if (Symbol.iterator in Object(arr)) {
				return sliceIterator(arr, i);
			} else {
				throw new TypeError("Invalid attempt to destructure non-iterable instance");
			}
		};
	}();

	var eventEmitter = function () {
		'use strict';

		var tabs = {};
		chrome.tabs.onRemoved.addListener(function (tabId) {
			tabs[tabId] = null;
		});
		chrome.runtime.onMessage.addListener(function (request, sender) {
			console.log('runtimemessage', sender);

			var tabId = sender.tab.id;

			var event = request.event;

			if (event === 'unload') {
				tabs[tabId] = null;
			} else {
				if (tabs[tabId] && tabs[tabId][event]) {
					tabs[tabId][event].forEach(function (cb) {
						cb(request.data);
					});
				}
			}
		});

		return function eventEmitter(tabId) {

			function on(event, cb) {
				if (!tabs[tabId]) {
					tabs[tabId] = {};
				}

				if (!tabs[tabId][event]) {
					tabs[tabId][event] = [];
				}

				console.log('register callback', event);

				tabs[tabId][event].push(cb);
			}

			function emit(event, args) {
				console.log('emit event', event, tabId);
				chrome.tabs.sendMessage(tabId, { event: event, data: args });
			}

			return {
				on: on,
				emit: emit
			};
		};
	}();
	function manageStyles(tabId) {
		'use strict';

		Promise.all([_pref.prefs.getPref('style_min_fontsize'), _pref.prefs.getPref('style_wider_sidebar'), _pref.prefs.getPref('style_hide_left_sidebar'), _pref.prefs.getPref('style_hide_right_sidebar')]).then(function (resp) {
			var styles = pageStyles.getPageStyle({
				minFontSize: resp[0],
				minWidth: resp[1],
				hideLeftSidebar: resp[2],
				hideRightSidebar: resp[3]
			});
			if (styles.length) {
				chrome.tabs.insertCSS(tabId, {
					code: styles.join('')
				});
			}
		});
	}

	chrome.runtime.onMessage.addListener(function (request, sender) {
		'use strict';

		console.log('runtime message', request, sender);
		var event = request.event;

		if (event === 'DOMContentLoaded') {
			(function () {
				var events = eventEmitter(sender.tab.id);

				var parseComments = coreMain.parseComments;
				var parseArticles = coreMain.parseArticles;
				var parseBlocks = coreMain.parseBlocks;

				parseComments(events, _pref.prefs);
				parseArticles(events, _pref.prefs);

				_pref.prefs.getPref('parseblocks').then(function (parse) {
					if (parse) {
						events.on('gotBlocks', parseBlocks.bind(null, events, _pref.prefs));
						events.emit('getBlocks');
					}
				});

				_pref.prefs.getPref('setunlimitedlinks').then(function (links) {
					if (links) {
						events.emit('setUnlimitedLinks');
					}
				});

				manageStyles(sender.tab.id);

				events.on('trolluser', function (username) {
					_pref.prefs.getCleanTrolls().then(function (trolls) {

						if (trolls.indexOf(username) === -1) {
							trolls.push(username);
						}

						_pref.prefs.setPref('trolls', trolls.join(','));
					});
				});

				events.on('untrolluser', function (username) {
					username = username.trim();
					_pref.prefs.getCleanTrolls().then(function (trolls) {
						var filteredTrolls = trolls.filter(function (troll) {
							return troll.trim() !== username;
						});

						_pref.prefs.setPref('trolls', filteredTrolls.join(','));
					});
				});

				events.on('unhighlightuser', function (username) {
					_pref.prefs.getCleanHighlightedUsers().then(function (users) {
						var filteredUsers = users.filter(function (user) {
							return user.name !== username;
						});

						_pref.prefs.setPref('highlightusers', filteredUsers.map(function (user) {
							return user.name + ':' + user.color;
						}).join(','));
					});
				});

				events.on('highlightuser', function (username) {
					Promise.all([_pref.prefs.getCleanHighlightedUsers(), _pref.prefs.getPref('huppercolor')]).then(function (results) {
						var _results = _slicedToArray(results, 2);

						var users = _results[0];
						var color = _results[1];

						if (!users.some(function (user) {
							return user.name === username;
						})) {
							users.push({
								name: username,
								color: color
							});
						}

						_pref.prefs.setPref('highlightusers', users.map(function (user) {
							return user.name + ':' + user.color;
						}).join(','));
					});
				});

				/*
    events.on('gotBlocks', function (data) {
    	onGotBlocks(data);
    });
    	events.emit('getBlocks');
    */
			})();
		}
	});

	var onContextClick = function onContextClick(type) {
		'use strict';

		return function (e) {
			chrome.tabs.getSelected(null, function (tab) {
				chrome.tabs.sendMessage(tab.id, {
					event: type,
					data: e
				}, function () {
					// console.log(cb)
				});
			});
		};
	};
	var contextConf = {
		contexts: ['link'],
		targetUrlPatterns: ['http://www.hup.hu/user/*', 'https://www.hup.hu/user/*', 'http://hup.hu/user/*', 'https://hup.hu/user/*']
	};
	['trolluser', 'untrolluser', 'highlightuser', 'unhighlightuser'].forEach(function (title) {
		'use strict';

		var conf = {
			title: title,
			contexts: contextConf.contexts,
			targetUrlPatterns: contextConf.targetUrlPatterns,
			onclick: onContextClick(title)
		};

		chrome.contextMenus.create(conf);
	});
});

},{"./core/main":5,"./core/pagestyles":6,"./pref":9}],9:[function(require,module,exports){
(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', './core/pref', './core/func'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('./core/pref'), require('./core/func'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.pref, global.func);
		global.pref = mod.exports;
	}
})(this, function (exports, _pref, _func) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.prefs = undefined;

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

	var _slicedToArray = function () {
		function sliceIterator(arr, i) {
			var _arr = [];
			var _n = true;
			var _d = false;
			var _e = undefined;

			try {
				for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
					_arr.push(_s.value);

					if (i && _arr.length === i) break;
				}
			} catch (err) {
				_d = true;
				_e = err;
			} finally {
				try {
					if (!_n && _i["return"]) _i["return"]();
				} finally {
					if (_d) throw _e;
				}
			}

			return _arr;
		}

		return function (arr, i) {
			if (Array.isArray(arr)) {
				return arr;
			} else if (Symbol.iterator in Object(arr)) {
				return sliceIterator(arr, i);
			} else {
				throw new TypeError("Invalid attempt to destructure non-iterable instance");
			}
		};
	}();

	var defaultPrefs = [{
		'name': 'replacenewcommenttext',
		'title': 'Replace the \"új\" text of new comments to a better searchable one',
		'type': 'bool',
		'value': true
	}, {
		'name': 'newcommenttext',
		'title': 'The text to show instead of \"új\"',
		'type': 'string',
		'value': '[new]'
	}, {
		'name': 'filtertrolls',
		'title': 'Enable trollfilter',
		'type': 'bool',
		'value': true
	}, {
		'name': 'edittrolls',
		'title': 'Edit trolls',
		'label': 'Click to edit trolls',
		'type': 'control'
	}, {
		'name': 'trolls',
		'title': 'List of trolls',
		'type': 'string',
		'value': '',
		'hidden': true
	}, {
		'name': 'huppercolor',
		'title': 'Default highlighted user\'s comment header color',
		'type': 'color',
		'value': '#B5D7BE'
	}, {
		'name': 'edithighlightusers',
		'title': 'Edit highlighted users',
		'label': 'Click to edit highlighted users',
		'type': 'control'
	}, {
		'name': 'highlightusers',
		'title': 'Highlight comments of the users',
		'type': 'string',
		'value': 'username:#fff999,username2:#999fff',
		'hidden': true
	}, {
		'name': 'hidetaxonomy',
		'title': 'Hidable article types',
		'type': 'string',
		'value': ''
	}, {
		'name': 'blocks',
		'title': 'Block settings',
		'type': 'string',
		'value': '{}',
		'hidden': true
	}, {
		'name': 'parseblocks',
		'title': 'Parse blocks',
		'type': 'bool',
		'value': true
	}, {
		'name': 'style_accessibility',
		'title': 'Load accessibility styles',
		'type': 'bool',
		'value': true
	}, {
		'name': 'style_wider_sidebar',
		'title': 'Width of sidebars',
		'type': 'integer',
		'value': 0
	}, {
		'name': 'style_min_fontsize',
		'title': 'Minimum font size',
		'type': 'integer',
		'value': 0
	}, {
		'name': 'style_hide_left_sidebar',
		'title': 'Hide left sidebar',
		'type': 'bool',
		'value': false
	}, {
		'name': 'style_hide_right_sidebar',
		'title': 'Hide right sidebar',
		'type': 'bool',
		'value': false
	}, {
		'name': 'hideboringcomments',
		'title': 'Hide boring comments',
		'type': 'bool',
		'value': true
	}, {
		'name': 'boringcommentcontents',
		'title': 'Regular expression to identify boring comments',
		'type': 'string',
		'value': '^([-_]|-1|\\\\+1)$'
	}, {
		'name': 'setunlimitedlinks',
		'title': 'Show as many comments as possible on a page',
		'type': 'bool',
		'value': true
	}];

	function storage() {
		return chrome.storage.sync || chrome.storage.local;
	}

	function createDefaultPrefs() {
		return Promise.all(defaultPrefs.map(function (pref) {
			return new Promise(function (resolve) {
				storage().get(pref.name, function (result) {
					if (typeof result[pref.name] === 'undefined') {
						// storage().set(value);
						resolve([pref.name, pref.value]);
					} else {
						resolve(null);
					}
				});
			});
		})).then(function (values) {
			var saveObj = values.reduce(function (prev, curr) {
				if (curr !== null) {
					var _curr = _slicedToArray(curr, 2);

					var name = _curr[0];
					var value = _curr[1];

					if (typeof value === 'undefined') {
						value = ':noSuchValue';
					}
					prev[name] = value;
				}
				return prev;
			}, {});

			return new Promise(function (resolve) {
				storage().set(saveObj, function () {
					resolve();
				});
			});
		});
		/* */
	}

	var events = function () {
		var listeners = new Map();
		return {
			on: function on(name, cb) {
				if (!listeners.has(name)) {
					listeners.set(name, []);
				}

				listeners.get(name).push(cb);
			},
			off: function off(name, cb) {
				if (listeners.get(name)) {
					for (var i = 0, ll = listeners.get(name).length; i < ll; i++) {
						if (listeners.get(name)[i] === cb) {
							listeners.get(name)[i] = null;
						}
					}

					listeners.set(name, listeners[name].filter(function (listener) {
						return listener !== null;
					}));
				}
			},
			emit: function emit(name, args) {
				if (listeners.get(name)) {
					listeners.get(name).forEach(function (cb) {
						cb(args);
					});
				}
			}
		};
	}();

	function validateType(prefType, value) {
		var isValid = false;

		switch (prefType) {
			case 'string':
				isValid = typeof value === 'string';
				break;
			case 'bool':
				isValid = typeof value === 'boolean';
				break;
			case 'integer':
				isValid = typeof value === 'number';
				break;
			case 'color':
				isValid = typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
				break;
			default:
				isValid = true;
				console.info('Unknown type %s', prefType);
				break;
		}

		return isValid;
	}

	function findPref(pref) {
		return new Promise(function (resolve) {
			storage().get(pref, function (results) {
				if (typeof results[pref] !== 'undefined') {
					resolve(results[pref]);
				} else {
					resolve(null);
				}
			});
		});
	}

	function savePref(pref, value) {
		return new Promise(function (resolve) {
			var item = func.first(defaultPrefs, function (item) {
				return item.name === pref;
			});

			if (item) {
				if (validateType(item.type, value)) {
					var newValue = Object.create(null);
					newValue[pref] = value;
					storage().set(newValue);
					resolve();
				} else {
					throw new Error('Pref: ' + pref + ' value is not valid type for: ' + item.type);
				}
			} else {
				throw new Error('Pref: ' + pref + ' not found');
			}
		});
	}

	var chromePrefs = Object.create(_pref.prefs, {
		setPref: {
			value: function value(pref, _value) {
				savePref(pref, _value).catch(function (err) {
					throw err;
				});
			}
		},

		getPref: {
			value: function value(pref) {
				return findPref(pref).catch(function (err) {
					throw err;
				});
			}
		},

		getAllPrefs: {
			value: function value() {
				return Promise.all(defaultPrefs.map(function (pref) {
					return findPref(pref.name).then(function (value) {
						var output = Object.create(null);
						output.name = pref.name;
						output.title = pref.title;
						output.type = pref.type;
						output.hidden = pref.hidden;
						output.value = value;

						return new Promise(function (resolve) {
							resolve(output);
						});
					});
				}));
			}
		}
	});

	chromePrefs.on = events.on;

	createDefaultPrefs();
	exports.prefs = chromePrefs;
});

},{"./core/func":4,"./core/pref":7}]},{},[8]);
