/*jshint moz:true*/
/*global require*/
var pageMod = require('sdk/page-mod');
var self = require('sdk/self');
var pref = require('./pref');
var pagestyles = require('./pagestyles');
let func = require('./core/func');

require('./context-menu').setContextMenu();
require('sdk/simple-prefs').on('edittrolls', function () {
	'use strict';
	require('./edit-trolls').start();
});
require('sdk/simple-prefs').on('edithighlightusers', function () {
	'use strict';
	require('./edit-highlightedusers').start();
});

const TEXT_FIRST_ARTICLE_WITH_NEW_COMMENTS = 'Olvasatlan hozzászólások';

const TEXT_FIRST_NEW_COMMENT = 'Első olvasatlan hozzászólás';

function eventEmitter(worker) {
	'use strict';
	function on(event, cb) {
		worker.port.on(event, cb);
	}

	function emit(event, args) {
		worker.port.emit(event, args);
	}
	return {
		on: on,
		emit: emit
	};
}

pageMod.PageMod({
	include: ['*.hup.lh', '*.hup.hu'],
	attachTo: ['top', 'existing'],
	onAttach: function (worker) {
		'use strict';
		let events = eventEmitter(worker);
		console.log('on attach');

		function parseComments() {
			console.log('parse comments!');
			events.on('gotComments', function onGotComments(comments) {
				console.log('GOT COMMENTS~!!!');
				
				let modComments = require('./core/comments');

				modComments.setScores(comments);

				if (pref.getPref('hideboringcomments')) {
					let boringRex = new RegExp(pref.getPref('boringcommentcontents'));
					modComments.markBoringComments(comments, boringRex);
				}

				if (pref.getPref('filtertrolls')) {
					let trolls = pref.getCleanTrolls();
					modComments.markTrollComments(comments, trolls);
				}

				let highlightedUsers = pref.getCleanHighlightedUsers();

				if (highlightedUsers.length) {
					modComments.setHighlightedComments(highlightedUsers, comments);
				}

				let flatCommentList = modComments.flatComments(comments);

				let childComments = flatCommentList.filter(function (comment) {
					return comment.parent !== '';
				});

				events.emit('comment.addParentLink', childComments);
				events.emit('comment.addExpandLink', childComments.filter(function (comment) {
					return comment.indentLevel > 1;
				}));

				events.emit('comments.update', flatCommentList);

				let newComments = modComments.getNewComments(comments);

				if (pref.getPref('replacenewcommenttext') && newComments.length > 0) {
					events.emit('comment.setNew', {
						comments: newComments,
						text: pref.getPref('newcommenttext')
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

				require('sdk/simple-prefs').on('highlightusers', function () {
					let highlightedUsers = pref.getCleanHighlightedUsers();
					modComments.setHighlightedComments(highlightedUsers, comments);
					events.emit('comments.update', flatCommentList);
				});
				require('sdk/simple-prefs').on('trolls', function () {
					let trolls = pref.getCleanTrolls();
					modComments.updateTrolls(trolls, comments);
					events.emit('comments.update', flatCommentList);
				});

			});

			events.emit('getComments', {
				// get content only if filtering boring comments
				content: true
			});
		}

		function parseArticles() {
			console.log('get articles');

			let modArticles = require('./core/articles');

			events.emit('getArticles');
			events.on('gotArticles', function (articles) {
				let newArticles = articles.filter(modArticles.filterNewArticles);
				console.log('articles', articles);
				events.emit('articles.mark-new', {
					text: pref.getPref('newcommenttext'),
					articles: newArticles
				});
				if (newArticles.length > 0) {
					events.emit('hupper-block.add-menu', {
						href: '#' + newArticles[0].id,
						text: TEXT_FIRST_ARTICLE_WITH_NEW_COMMENTS
					});

					let nextPrev = modArticles.setNewArticles(newArticles, events);

					if (nextPrev) {
						nextPrev.forEach(function (item) {
							events.emit('articles.addNextPrev', item);
						});
					}
				}

				events.emit('articles.add-category-hide-button', articles);

				events.on('article.hide-taxonomy', function (article) {
					let taxonomies = pref.getCleanTaxonomies();

					if (taxonomies.indexOf(articles.cateogry) === -1) {
						taxonomies.push(article.category);
						pref.setPref('hidetaxonomy', taxonomies.join(','));

						let hideableArticles = modArticles.filterHideableArticles(articles, taxonomies);
						events.emit('articles.hide', hideableArticles);
					}
				});

				let hideableArticles = modArticles.filterHideableArticles(articles, pref.getCleanTaxonomies());
				events.emit('articles.hide', hideableArticles);
			});
		}

		function requestBlockHide(events, block) {
			emitBlockEvent(events, 'block.hide', block);
			emitBlockEvent(events, 'hupper-block.hide-block', block);
		}

		function requestBlockContentHide(events, block) {
			emitBlockEvent(events, 'block.hide-content', block);
			emitBlockEvent(events, 'hupper-block.show-block', block);
		}

		function emitBlockEvent(events, event, block) {
			events.emit(event, {
				id: block.id,
				column: block.column
			});
		}

		function updateBlock(details, prefName, value) {
			let blockPrefs = JSON.parse(pref.getPref('blocks'));
			let modBlocks = require('./core/blocks');
			let output = modBlocks.updateBlock(details, prefName, value, blockPrefs);
			pref.setPref('blocks', JSON.stringify(blockPrefs));
			return output;
		}

		function onBlockDelete(events, details) {
			let block = updateBlock(details, 'hidden', true);

			emitBlockEvent(events, 'block.hide', block);
			emitBlockEvent(events, 'hupper-block.hide-block', block);
		}

		function onBlockRestore(events, details) {
			let block = updateBlock(details, 'hidden', false);

			emitBlockEvent(events, 'block.show', block);
			emitBlockEvent(events, 'hupper-block.show-block', block);
		}

		function onBlockHideContent(events, details) {
			let block = updateBlock(details, 'contentHidden', true);

			emitBlockEvent(events, 'block.hide-content', block);
		}

		function onBlockShowContent(events, details) {
			let block = updateBlock(details, 'contentHidden', false);

			emitBlockEvent(events, 'block.show-content', block);
		}

		function onUpDownAction(events, details) {
			let blockPrefs = JSON.parse(pref.getPref('blocks'));
			let columnBlocks = require('./core/blocks').onBlockChangeOrder(events, details, blockPrefs);
			if (columnBlocks) {
				pref.setPref('blocks', JSON.stringify(blockPrefs));
				events.emit('block.change-order', {
					sidebar: details.column,
					blocks: columnBlocks
				});
			}
		}

		function onLeftRightAction(events, details) {
			let blockPrefs = JSON.parse(pref.getPref('blocks'));
			let allBlocks = require('./core/blocks')
					.onBlockChangeColumn(events, details, blockPrefs);

			if (allBlocks) {
				pref.setPref('blocks', JSON.stringify(blockPrefs));

				events.emit('block.change-column', blockPrefs);
			}
		}

		/**
		* @param blockActionStruct action
		*/
		function onBlockAction(events, details) {

			switch (details.action) {
				case 'delete':
					onBlockDelete(events, details);
				break;

				case 'restore':
					onBlockRestore(events, details);
				break;

				case 'hide-content':
					onBlockHideContent(events, details);
				break;

				case 'show-content':
					onBlockShowContent(events, details);
				break;

				case 'up':
				case 'down':
					onUpDownAction(events, details);
				break;

				case 'left':
				case 'right':
					onLeftRightAction(events, details);
				break;
			}
		}

		function finishBlockSetup(blocks, blocksPref) {
			let modBlocks = require('./core/blocks');

			events.emit('blocks.set-titles', modBlocks.getBlockTitles());

			let allBlocks = blocksPref.left.concat(blocksPref.right);

			allBlocks.filter(modBlocks.filterHidden)
					.forEach(func.partial(requestBlockHide, events));

			allBlocks.filter(modBlocks.filterContentHidden)
					.forEach(func.partial(requestBlockContentHide, events));

			events.on('block.action', func.partial(onBlockAction, events));
		}

		function onGotBlocks(blocks) {
			let modBlocks = require('./core/blocks'),
				blocksPref = JSON.parse(pref.getPref('blocks'));

			blocksPref = modBlocks.mergeBlockPrefsWithBlocks(blocks, blocksPref);

			pref.setPref('blocks', JSON.stringify(blocksPref));

			events.emit('enableBlockControls', blocks.left);
			events.emit('enableBlockControls', blocks.right);

			events.on('blocks.change-order-all-done', function () {
				finishBlockSetup(blocks, blocksPref);

				parseComments();
				parseArticles();
			});

			events.emit('blocks.change-order-all', blocksPref);
		}

		if (pref.getPref('parseblocks')) {
			events.on('gotBlocks', onGotBlocks);

			events.emit('getBlocks');
		} else {
			parseComments();
			parseArticles();
		}

		if (pref.getPref('setunlimitedlinks')) {
			events.emit('setUnlimitedLinks');
		}
	},
	contentStyle: pagestyles.getPageStyle(),
	contentStyleFile: pagestyles.getPageStyleFiles(),
	contentScriptFile: [
		self.data.url('core/rq.js'),
		self.data.url('core/dom.js'),
		self.data.url('core/func.js'),
		self.data.url('core/commenttree.js'),
		self.data.url('core/comments.js'),
		self.data.url('core/articles.js'),
		self.data.url('core/blocks.js'),
		self.data.url('core/hupper-block.js'),
		self.data.url('core/unlimitedlinks.js'),
		self.data.url('hupper.js')
	]
});
