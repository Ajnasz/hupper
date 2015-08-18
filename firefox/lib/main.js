/*jshint moz:true, esnext: true*/
/*global require*/
var pageMod = require('sdk/page-mod');
var sdkSelf = require('sdk/self');
var pref = require('./pref').pref;
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
		console.log('listen to', event);
		worker.port.on(event, cb);
	}

	function emit(event, args) {
		console.log('EMIT', event);
		worker.port.emit(event, args);
	}
	return {
		on: on,
		emit: emit
	};
}
function manageStyles() {
	'use strict';
	return Promise.all([
		pref.getPref('style_min_fontsize'),
		pref.getPref('style_wider_sidebar'),
		pref.getPref('style_hide_left_sidebar'),
		pref.getPref('style_hide_right_sidebar'),
		pagestyles.getPageStyleFiles()
	]).then((resp) => {
		let styles = pagestyles.getPageStyle({
			minFontSize: resp[0],
			minWidth: resp[1],
			hideLeftSidebar: resp[2],
			hideRightSidebar: resp[3]
		});

		return new Promise((resolve) => {
			resolve({styles: styles, files: resp[4]});
		});
	});
}


(function () {
	'use strict';

manageStyles().then((results) => {
return new pageMod.PageMod({
	include: ['*.hup.lh', '*.hup.hu'],
	attachTo: ['top', 'existing'],
	onAttach: function (worker) {
		let events = eventEmitter(worker);
		console.log('on attach');

		function parseComments() {
			console.log('parse comments!');
			events.on('gotComments', function onGotComments(comments) {
				console.log('GOT COMMENTS~!!!');

				let modComments = require('./core/comments');

				modComments.setScores(comments);

				Promise.all([
					pref.getPref('hideboringcomments'),
					pref.getPref('boringcommentcontents'),
					pref.getPref('filtertrolls'),
					pref.getCleanTrolls(),
					pref.getCleanHighlightedUsers(),
					pref.getPref('replacenewcommenttext')
				]).then((results) => {
					let [
						hideBoringComments,
						boringRexStr,
						filterTrolls,
						trolls,
						highlightedUsers,
						replaceNewCommentText
					] = results;
					if (hideBoringComments) {
						let boringRex = new RegExp(boringRexStr);
						modComments.markBoringComments(comments, boringRex);
					}

					if (filterTrolls) {
						modComments.markTrollComments(comments, trolls);
					}

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

					if (replaceNewCommentText && newComments.length > 0) {
						pref.getPref('newcommenttext').then((text) => {
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

					require('sdk/simple-prefs').on('highlightusers', function () {
						pref.getCleanHighlightedUsers().then((highlightedUsers) => {
							modComments.setHighlightedComments(highlightedUsers, comments);
							events.emit('comments.update', flatCommentList);
						});
					});
					require('sdk/simple-prefs').on('trolls', function () {
						pref.getCleanTrolls().then((trolls) => {
							modComments.updateTrolls(trolls, comments);
							events.emit('comments.update', flatCommentList);
						});
					});
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

				pref.getPref('newcommenttext').then((newCommentText) => {
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

					let nextPrev = modArticles.setNewArticles(newArticles, events);

					if (nextPrev) {
						nextPrev.forEach(function (item) {
							events.emit('articles.addNextPrev', item);
						});
					}
				}

				events.emit('articles.add-category-hide-button', articles);

				events.on('article.hide-taxonomy', function (article) {

					pref.getCleanTaxonomies().then((taxonomies) => {
						if (taxonomies.indexOf(articles.cateogry) === -1) {
							taxonomies.push(article.category);
							pref.setPref('hidetaxonomy', taxonomies.join(','));

							let hideableArticles = modArticles.filterHideableArticles(articles, taxonomies);
							events.emit('articles.hide', hideableArticles);
						}
					});
				});

				pref.getCleanTaxonomies().then((taxonomies) => {
					let hideableArticles = modArticles.filterHideableArticles(articles, taxonomies);
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

		function requestBlockHide(events, block) {
			emitBlockEvent(events, 'block.hide', block);
			emitBlockEvent(events, 'hupper-block.hide-block', block);
		}

		function requestBlockContentHide(events, block) {
			emitBlockEvent(events, 'block.hide-content', block);
			emitBlockEvent(events, 'hupper-block.show-block', block);
		}

		function updateBlock(details, prefName, value) {
			return pref.getPref('blocks').then((blocks) => {
				return new Promise((resolve) => {
					let blockPrefs = JSON.parse(blocks);
					let modBlocks = require('./core/blocks');
					let output = modBlocks.updateBlock(details, prefName, value, blockPrefs);
					pref.setPref('blocks', JSON.stringify(blockPrefs));
					resolve(output);
				});
			});
		}

		function onBlockDelete(events, details) {
			updateBlock(details, 'hidden', true).then((block) => {
				emitBlockEvent(events, 'block.hide', block);
				emitBlockEvent(events, 'hupper-block.hide-block', block);
			});
		}

		function onBlockRestore(events, details) {
			updateBlock(details, 'hidden', false).then((block) => {
				emitBlockEvent(events, 'block.show', block);
				emitBlockEvent(events, 'hupper-block.show-block', block);
			});
		}

		function onBlockHideContent(events, details) {
			updateBlock(details, 'contentHidden', true).then((block) => {
				emitBlockEvent(events, 'block.hide-content', block);
			});
		}

		function onBlockShowContent(events, details) {
			updateBlock(details, 'contentHidden', false).then((block) => {
				emitBlockEvent(events, 'block.show-content', block);
			});
		}

		function onUpDownAction(events, details) {
			pref.getPref('blocks').then((blocks) => {
				let blockPrefs = JSON.parse(blocks);
				let columnBlocks = require('./core/blocks').onBlockChangeOrder(events, details, blockPrefs);
				if (columnBlocks) {
					pref.setPref('blocks', JSON.stringify(blockPrefs));
					events.emit('block.change-order', {
						sidebar: details.column,
						blocks: columnBlocks
					});
				}
			});
		}

		function onLeftRightAction(events, details) {
			pref.getPref('blocks').then((blocks) => {
				let blockPrefs = JSON.parse(blocks);
				let allBlocks = require('./core/blocks')
						.onBlockChangeColumn(events, details, blockPrefs);

				if (allBlocks) {
					pref.setPref('blocks', JSON.stringify(blockPrefs));

					events.emit('block.change-column', blockPrefs);
				}
			});
		}

		/**
		* @param blockActionStruct action
		*/
		function onBlockAction(events, details) {
			console.log('on block action', events, details);

			switch (details.action) {
				case 'delete':
					onBlockDelete(events, details);
				break;

				case 'restore-block':
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
			pref.getPref('blocks').then((blocksPrefStr) => {
				let modBlocks = require('./core/blocks'),
					blocksPref = JSON.parse(blocksPrefStr);

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
			});
		}
		pref.getPref('parseblocks').then((parse) => {
			if (parse) {
				events.on('gotBlocks', onGotBlocks);

				events.emit('getBlocks');
			} else {
				parseComments();
				parseArticles();
			}
		});

		pref.getPref('setunlimitedlinks').then((setLinks) => {
			if (setLinks) {
				events.emit('setUnlimitedLinks');
			}
		});
	},
	contentStyle: results.styles,
	contentStyleFile: results.files,
	contentScriptFile: [
		sdkSelf.data.url('core/rq.js'),
		sdkSelf.data.url('core/dom.js'),
		sdkSelf.data.url('core/func.js'),
		sdkSelf.data.url('core/commenttree.js'),
		sdkSelf.data.url('core/comments.js'),
		sdkSelf.data.url('core/articles.js'),
		sdkSelf.data.url('core/blocks.js'),
		sdkSelf.data.url('core/hupper-block.js'),
		sdkSelf.data.url('core/unlimitedlinks.js'),
		sdkSelf.data.url('hupper.js')
	]
});
});
}());
