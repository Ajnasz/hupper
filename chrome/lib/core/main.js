'use strict';
import * as func from './func';
import * as modComments from './comments';
import * as modArticles from './articles';
import * as modBlocks from './blocks';

function parseComments(events, pref) {
	const TEXT_FIRST_NEW_COMMENT = 'Els\u0151 olvasatlan hozz\xE1sz\xF3l\xE1s';
	console.log('parse comments!');
	events.on('gotComments', function onGotComments(comments) {
		console.log('GOT COMMENTS~!!!');
		modComments.setScores(comments);
		Promise.all([
			pref.getPref('hideboringcomments'),
			pref.getPref('boringcommentcontents'),
			pref.getPref('filtertrolls'),
			pref.getCleanTrolls(),
			pref.getCleanHighlightedUsers(),
			pref.getPref('replacenewcommenttext')
		]).then(results => {
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
				pref.getPref('newcommenttext').then(text => {
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
				pref.getCleanHighlightedUsers().then(highlightedUsers => {
					modComments.setHighlightedComments(highlightedUsers, comments);
					events.emit('comments.update', flatCommentList);
				});
			});
			pref.on('trolls', function () {
				pref.getCleanTrolls().then(trolls => {
					modComments.updateTrolls(trolls, comments);
					events.emit('comments.update', flatCommentList);
				});
			});
		});
	});
	events.emit('getComments', { content: true });
}
function parseArticles(events, pref) {
	const TEXT_FIRST_ARTICLE_WITH_NEW_COMMENTS = 'Olvasatlan hozz\xE1sz\xF3l\xE1sok';
	console.log('get articles');
	events.emit('getArticles');
	events.on('gotArticles', function (articles) {
		let newArticles = articles.filter(modArticles.filterNewArticles);
		console.log('articles', articles);
		pref.getPref('newcommenttext').then(newCommentText => {
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
			pref.getCleanTaxonomies().then(taxonomies => {
				if (taxonomies.indexOf(articles.cateogry) === -1) {
					taxonomies.push(article.category);
					pref.setPref('hidetaxonomy', taxonomies.join(','));
					let hideableArticles = modArticles.filterHideableArticles(articles, taxonomies);
					events.emit('articles.hide', hideableArticles);
				}
			});
		});
		pref.getCleanTaxonomies().then(taxonomies => {
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
	return pref.getPref('blocks').then(blocks => {
		return new Promise(resolve => {
			let blockPrefs = JSON.parse(blocks);
			let output = modBlocks.updateBlock(details, prefName, value, blockPrefs);
			pref.setPref('blocks', JSON.stringify(blockPrefs));
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
	pref.getPref('blocks').then(blocks => {
		let blockPrefs = JSON.parse(blocks);
		let columnBlocks = modBlocks.onBlockChangeOrder(events, details, blockPrefs);
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
	pref.getPref('blocks').then(blocks => {
		let blockPrefs = JSON.parse(blocks);
		let allBlocks = modBlocks.onBlockChangeColumn(events, details, blockPrefs);
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
	let allBlocks = blocksPref.left.concat(blocksPref.right);
	allBlocks.filter(modBlocks.filterHidden).forEach(func.partial(requestBlockHide, events));
	allBlocks.filter(modBlocks.filterContentHidden).forEach(func.partial(requestBlockContentHide, events));
	events.on('block.action', func.partial(onBlockAction, events, pref));
}
function parseBlocks(events, pref, blocks) {
	pref.getPref('blocks').then(blocksPrefStr => {
		let blocksPref = JSON.parse(blocksPrefStr);
		blocksPref = modBlocks.mergeBlockPrefsWithBlocks(blocks, blocksPref);
		pref.setPref('blocks', JSON.stringify(blocksPref));
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
};
