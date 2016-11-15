import * as func from '../../core/func';
import * as modComments from '../../core/comments';
import * as modBlocks from './blocks';
import * as colorModule from '../../core/color';

import { prefs } from '../../core/prefs';

import { log } from '../../core/log';

log.info('ok');

function setPrevNextLinks (nodes) {
	let len = nodes.length;

	nodes.forEach(function (node, index, array) {
		if (index + 1 < len) {
			node.nextId = array[index + 1].id;
		}

		if (index > 0) {
			node.prevId = array[index - 1].id;
		}
	});

	return nodes;
}

function commentParse (comments) {
	modComments.setScores(comments);

	let flatCommentList = modComments.flatComments(comments);

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

		let newComments = flatCommentList.filter(c => c.isNew && !c.hide);

		if (replaceNewCommentText) {
			newComments.forEach(c => c.newCommentText = newCommentText);
		}

		setPrevNextLinks(newComments);

		return prefs.getCleanHighlightedUsers();
	}).then(highlightusers => {
		highlightusers.forEach(user => {
			let {name, color} = user;
			flatCommentList.filter(c => c.author === name).forEach(c => {
				c.userColor = color;
				c.userContrastColor = colorModule.getContrastColor(color);
			});
		});

		return flatCommentList;
	}).then(() => flatCommentList);
}

function highlightUser (userName) {
	return prefs.getPref('huppercolor').then(color => prefs.addHighlightedUser(userName, color));
}

function unhighlightUser (userName) {
	return prefs.removeHighlightedUser(userName);
}

function trollUser (username) {
	return prefs.addTroll(username);
}

function untrollUser (username) {
	return prefs.removeTroll(username);
}

function articleParse (articles) {
	return prefs.getCleanTaxonomies()
		.then(taxonomies => {
			articles.forEach(a => a.hide = func.inArray(taxonomies, a.category));
		})
		.then(() => prefs.getPref('newcommenttext'))
		.then((newCommentText) => {
			let newArticles = articles.filter(x => x.isNew && !x.hide);
			newArticles.forEach(a => a.newText = newCommentText);
			setPrevNextLinks(newArticles);
		}).then(() => articles);
}

function hideArticle (article) {
	return prefs.addTaxonomy(article.category);
}

/**
 * @method updateBlock
 * @param {String} pref
 * @param {*} details
 */
function updateBlock (details, prefName, value) {
	return prefs.getBlocks().then(blocks => {
		let output = modBlocks.updateBlock(details, prefName, value, blocks);

		prefs.setPref('blocks', blocks);

		return output;
	});
}


function getColumnName (column) {
	switch (column) {
	case 'right':
	case 'sidebar-right':
		return 'right';
	case 'left':
	case 'sidebar-left':
		return 'left';

	}
}

function onUpDownAction (details, context) {
	return prefs.getBlocks().then(blocks => {
		let blockID = details.id;
		let blockPrefs = blocks;
		let cm = context.left.concat(context.right);
		let contextBlocks;

		let blockObjects = cm
			.map(b => modBlocks.createBlockPref(getColumnName(b.column), b))
			.map(c => func.first(blockPrefs, b => b.id === c.id) || c);

		let column = getColumnName(func.first(blockObjects, b => b.id === blockID).column);

		contextBlocks = blockObjects
			.filter(b => b.column === column)
			.filter(b => !b.hidden);

		func.sortBy(contextBlocks, 'index');

		let index = func.index(contextBlocks, o => o.id === blockID);

		if (index === -1) {
			return Promise.reject(new Error('Block not found'));
		}

		let relativeItem;

		if (details.action === 'up') {
			if (index === 0) { // no change
				return Promise.resolve(contextBlocks);
			}

			relativeItem = contextBlocks[index - 1];
		} else if (details.action === 'down') {
			if (index === contextBlocks.length - 1) { // no change
				return Promise.resolve(contextBlocks);
			}

			relativeItem = contextBlocks[index + 1];
		}

		let originalItem = contextBlocks[index],
			originalItemIndex = originalItem.index;

		originalItem.index = relativeItem.index;
		relativeItem.index = originalItemIndex;

		prefs.setPref('blocks', blockPrefs.map(b => {
			let alternateB = func.first(contextBlocks, x => x.id === b.id);

			if (alternateB) {
				return alternateB;
			}

			return b;
		}));

		return Promise.resolve(blockObjects);
	});
}

function onLeftRightAction (details) {
	return prefs.getBlocks().then(blocks => {
		let blockID = details.id;
		let blockPrefs = blocks;

		let block = func.first(blockPrefs, b => b.id === blockID);

		switch (details.action) {
		case 'left':
			if (block.column !== 'left') {
				block.column = 'left';
				block.index = -1;
			}
			break;

		case 'right':
			if (block.column !== 'right') {
				block.column = 'right';
				block.index = -1;
			}
			break;
		}

		func.sortBy(blockPrefs.filter(b => b.column === block.column), 'index').forEach((b, i) => b.index = i);

		prefs.setPref('blocks', blockPrefs);

		return Promise.resolve(blockPrefs);
	});
}

function blockParse (blocks) {
	return prefs.getBlocks().then(blocksPref => {
		blocksPref = modBlocks.mergeBlockPrefsWithBlocks(blocks, blocksPref);
		prefs.setPref('blocks', blocksPref);
		return blocksPref;
	}).then(blocksPrefs => {
		blocksPrefs.forEach(block => block.title = modBlocks.getBlockTitle(block));
		return blocksPrefs;
	});

}

function handleBlockAction (details, context) {

	switch (details.action) {

	case 'delete':
		return updateBlock(details, 'hidden', true);

	case 'restore-block':
		return updateBlock(details, 'hidden', false);

	case 'hide-content':
		return updateBlock(details, 'contentHidden', true);

	case 'show-content':
		return updateBlock(details, 'contentHidden', false);

	case 'up':
	case 'down':
		return onUpDownAction(details, context);

	case 'left':
	case 'right':
		return onLeftRightAction(details);
	}

}

export {
	commentParse,
	articleParse,
	blockParse,
	handleBlockAction,
	hideArticle,
	highlightUser,
	unhighlightUser,
	trollUser,
	untrollUser
};
