'use strict';
import * as func from '../../core/func';
import * as modComments from '../../core/comments';
import * as modArticles from '../../core/articles';
import * as modBlocks from './blocks';

import { prefs } from '../../core/prefs';

import { log } from '../../core/log';

function commentGenya(comments) {
	modComments.setScores(comments);

	return Promise.all([
		prefs.getPref('hideboringcomments'),
		prefs.getPref('boringcommentcontents'),
	]).then(results => {
		let [hideBoringComments, boringRexStr] = results;

		if (hideBoringComments) {
			let boringRex = new RegExp(boringRexStr);
			modComments.markBoringComments(comments, boringRex);
		}

		return Promise.all([
			prefs.getPref('filtertrolls'),
			prefs.getCleanTrolls(),
		]);
	}).then(results => {
		let [filterTrolls, trolls] = results;

		if (filterTrolls) {
			modComments.markTrollComments(comments, trolls);
		}

		modComments.updateHiddenState(comments);

		return prefs.getCleanHighlightedUsers();
	}).then(results => {
		let [highlightedUsers] = results;

		if (highlightedUsers.length) {
			modComments.setHighlightedComments(comments, highlightedUsers);
		}

		return Promise.all([
			prefs.getPref('replacenewcommenttext'),
			prefs.getPref('newcommenttext')
		]);
	}).then(results => {
		let [replaceNewCommentText, newCommentText] = results;

		let flatCommentList = modComments.flatComments(comments);

		let newComments = flatCommentList
			.filter(c => c.isNew && !c.hide);

		newComments.forEach(c => c.newCommentText = newCommentText);

		modComments.setPrevNextLinks(newComments);
		// todo new comments:
		//   replace new text
		//   add prev/next

		return Promise.resolve(flatCommentList);
	});
}

function parseComments(events, pref) {
	const TEXT_FIRST_NEW_COMMENT = 'Első olvasatlan hozzászólás';

	log.log('parse comments!');
	events.on('gotComments', function onGotComments(comments) {
		Promise.all([
			prefs.getPref('replacenewcommenttext')
		]).then(results => {
			commentGenya(comments);

			let [ replaceNewCommentText ] = results;

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
				prefs.getPref('newcommenttext').then(text => {
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

			prefs.on('highlightusers', function () {
				prefs.getCleanHighlightedUsers().then(highlightedUsers => {
					modComments.setHighlightedComments(comments, highlightedUsers);
					events.emit('comments.update', flatCommentList);
					log.log('comments.update from highlightusers');
				});
			});
			prefs.on('trolls', function () {
				prefs.getCleanTrolls().then(trolls => {
					modComments.markTrollComments(comments, trolls);
					modComments.updateHiddenState(flatCommentList);
					events.emit('comments.update', flatCommentList);
					log.log('comments.update from trolls');
				});
			});
		});
	});
	events.emit('getComments', { content: true });
}
function parseArticles(events, pref) {
	const TEXT_FIRST_ARTICLE_WITH_NEW_COMMENTS = 'Olvasatlan hozzászólások';
	log.log('get articles');
	events.emit('getArticles');
	events.on('gotArticles', function (articles) {
		let newArticles = articles.filter(modArticles.filterNewArticles);
		log.log('articles', articles);
		prefs.getPref('newcommenttext').then(newCommentText => {
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
			prefs.getCleanTaxonomies().then(taxonomies => {
				if (taxonomies.indexOf(articles.cateogry) === -1) {
					taxonomies.push(article.category);
					prefs.setPref('hidetaxonomy', taxonomies.join(','));
					let hideableArticles = modArticles.filterHideableArticles(articles, taxonomies);
					events.emit('articles.hide', hideableArticles);
				}
			});
		});
		prefs.getCleanTaxonomies().then(taxonomies => {
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
function updateBlock(pref, details, prefName, value) {
	return prefs.getPref('blocks').then(blocks => {
		return new Promise(resolve => {
			let blockPrefs = JSON.parse(blocks);
			let output = modBlocks.updateBlock(details, prefName, value, blockPrefs);
			prefs.setPref('blocks', JSON.stringify(blockPrefs));
			resolve(output);
		});
	});
}
function onBlockDelete(events, pref, details) {
	updateBlock(pref, details, 'hidden', true).then(block => {
		emitBlockEvent(events, 'block.hide', block);
		emitBlockEvent(events, 'hupper-block.hide-block', block);
	});
}
function onBlockRestore(events, pref, details) {
	updateBlock(pref, details, 'hidden', false).then(block => {
		emitBlockEvent(events, 'block.show', block);
		emitBlockEvent(events, 'hupper-block.show-block', block);
	});
}
function onBlockHideContent(events, pref, details) {
	updateBlock(pref, details, 'contentHidden', true).then(block => {
		emitBlockEvent(events, 'block.hide-content', block);
	});
}
function onBlockShowContent(events, pref, details) {
	updateBlock(pref, details, 'contentHidden', false).then(block => {
		emitBlockEvent(events, 'block.show-content', block);
	});
}
function onUpDownAction(events, pref, details) {
	prefs.getPref('blocks').then(blocks => {
		let blockPrefs = JSON.parse(blocks);
		let columnBlocks = modBlocks.onBlockChangeOrder(events, details, blockPrefs);
		if (columnBlocks) {
			prefs.setPref('blocks', JSON.stringify(blockPrefs));
			events.emit('block.change-order', {
				sidebar: details.column,
				blocks: columnBlocks
			});
		}
	});
}
function onLeftRightAction(events, pref, details) {
	prefs.getPref('blocks').then(blocks => {
		let blockPrefs = JSON.parse(blocks);
		let allBlocks = modBlocks.onBlockChangeColumn(events, details, blockPrefs);
		if (allBlocks) {
			prefs.setPref('blocks', JSON.stringify(blockPrefs));
			events.emit('block.change-column', blockPrefs);
		}
	});
}
function onBlockAction(events, pref, details) {
	log.log('on block action', events, details);
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
	let allBlocks = blocksPref.left.concat(blocksPref.right);
	allBlocks.filter(modBlocks.filterHidden).forEach(func.partial(requestBlockHide, events));
	allBlocks.filter(modBlocks.filterContentHidden).forEach(func.partial(requestBlockContentHide, events));
	events.on('block.action', func.partial(onBlockAction, events, pref));
}
function parseBlocks(events, pref, blocks) {
	prefs.getPref('blocks').then(blocksPrefStr => {
		let blocksPref = JSON.parse(blocksPrefStr);
		blocksPref = modBlocks.mergeBlockPrefsWithBlocks(blocks, blocksPref);
		prefs.setPref('blocks', JSON.stringify(blocksPref));
		events.emit('enableBlockControls', blocks.left);
		events.emit('enableBlockControls', blocks.right);
		events.on('blocks.change-order-all-done', () => {
			finishBlockSetup(events, pref, blocks, blocksPref);
		});
		events.emit('blocks.change-order-all', blocksPref);
	});
}

export {
	parseComments,
	parseArticles,
	parseBlocks,
	commentGenya
};
