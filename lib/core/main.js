import * as func from '../../core/func';
import * as modComments from '../../core/comments';
import * as modBlocks from './blocks';
import * as colorModule from '../../core/color';

import { prefs } from '../../core/prefs';

import { log } from '../../core/log';

log.info('ok');

function setParent (comments, parent) {
	comments.forEach(comment => {
		comment.parent = parent;
		setParent(comment.children, comment);
	});
}

function commentParse (comments, context) {
	setParent(comments, null);

	comments = modComments.setScores(comments);

	let flatCommentList;

	return Promise.all([
		prefs.getPref('hideboringcomments'),
		prefs.getPref('boringcommentcontents'),
		prefs.getPref('filtertrolls'),
		prefs.getCleanTrolls(),
		prefs.getCleanHighlightedUsers(),
		prefs.getPref('replacenewcommenttext'),
		prefs.getPref('newcommenttext'),
		prefs.getPref('alwaysshownewcomments'),
	]).then(results => {
		const [
			hideBoringComments, boringRexStr,
			filterTrolls, trolls,
			highlightedUsers,
			replaceNewCommentText, newCommentText, alwaysShowNewComments,
		] = results;

		if (hideBoringComments) {
			const boringRex = new RegExp(boringRexStr);
			comments = func.flow(
				func.always(comments),
				() => modComments.markBoringComments(comments, boringRex),
				comments => modComments.markHasInterestingChild(comments)
			);
		}

		if (filterTrolls) {
			comments = modComments.markTrollComments(comments, trolls);
		}

		comments = modComments.updateHiddenState(comments, alwaysShowNewComments);

		if (highlightedUsers.length) {
			comments = modComments.setHighlightedComments(comments, highlightedUsers);
		}

		if (context.article && context.article.author) {
			comments = modComments.markAuthorComments(comments, context.article.author);
		}

		if (replaceNewCommentText) {
			comments = func.recurse(comments, c => c.isNew && !c.hide ? Object.assign({}, c, { newCommentText }) : c);
		}


		flatCommentList = func.flow(
			func.always(comments),
			comments => modComments.flatComments(comments),
			comments => modComments.setPrevNextLinks(comments)
		);
		// let newComments = flatCommentList.filter(c => c.isNew && !c.hide);

		highlightedUsers.forEach(user => {
			const { name, color } = user;

			flatCommentList
				.filter(c => c.author === name)
				.forEach(c => {
					c.userColor = color;
					c.userContrastColor = colorModule.getContrastColor(color);
				});
		});

		flatCommentList.forEach(c => {
			c.parent = c.parent ? c.parent.id : null;
		});
		return flatCommentList;
	});
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
			const newArticles = articles.filter(x => x.isNew && !x.hide);
			newArticles.forEach(a => a.newText = newCommentText);
			modComments.setPrevNextLinks(newArticles);
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
