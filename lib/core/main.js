import * as func from '../../core/func';
import * as modBlocks from './blocks';
import commentParse from '../modules/commentparse';
import setPrevNextLinks from '../../core/setprevnext';

import { prefs } from '../../core/prefs';

import { log } from '../../core/log';

log.info('ok');

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
	return Promise.all([
		prefs.getCleanTaxonomies(),
		prefs.getPref('newcommenttext'),
	]).then(([taxonomies, newCommentText]) => {
		return articles.map(article => Object.assign({
			hide: func.inArray(taxonomies, article.category),
			newText: (article.isNew && !article.hide)
				? newCommentText
				: null
		}, article));
	})
		.then(setPrevNextLinks);
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
		const output = modBlocks.updateBlock(details, prefName, value, blocks);

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
		default:
			return null;
	}
}

function onUpDownAction (details, context) {
	return prefs.getBlocks().then(blocks => {
		const blockID = details.id;
		const blockPrefs = blocks;
		const cm = context.left.concat(context.right);

		const blockObjects = cm
			.map(b => modBlocks.createBlockPref(getColumnName(b.column), b))
			.map(c => func.first(blockPrefs, b => b.id === c.id) || c);

		const column = getColumnName(func.first(blockObjects, b => b.id === blockID).column);

		const contextBlocks = blockObjects
			.filter(b => b.column === column)
			.filter(b => !b.hidden);

		func.sortBy(contextBlocks, 'index');

		const index = func.index(contextBlocks, o => o.id === blockID);

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

		const originalItem = contextBlocks[index];
		const originalItemIndex = originalItem.index;

		originalItem.index = relativeItem.index;
		relativeItem.index = originalItemIndex;

		prefs.setPref('blocks', blockPrefs.map(b => {
			const alternateB = func.first(contextBlocks, x => x.id === b.id);

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
		const blockID = details.id;
		const blockPrefs = blocks;

		const block = func.first(blockPrefs, b => b.id === blockID);

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

function blockParse ({ blocks, user }) {
	return prefs.getBlocks().then(blocksPref => {
		blocksPref = modBlocks.mergeBlockPrefsWithBlocks(blocks, blocksPref);
		prefs.setPref('blocks', blocksPref);
		return blocksPref;
	}).then(blocksPrefs => {
		blocksPrefs.forEach(block => block.title = modBlocks.getBlockTitle(block, user));
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

		default:
			return null;
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
