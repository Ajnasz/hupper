import * as func from '../../core/func';
import * as modComments from '../../core/comments';
import * as modBlocks from './blocks';
import * as colorModule from '../../core/color';

import setParent from './main/setParent';
import onLeftRightAction from './main/onleftrightaction';
import onUpDownAction from './main/onupdownaction';
import updateBlock from './main/updateblock';

import { prefs } from '../../core/prefs';

import { log } from '../../core/log';

log.info('ok');

function trollUser (username) {
	return prefs.addTroll(username);
}

function untrollUser (username) {
	return prefs.removeTroll(username);
}

function highlightUser (userName) {
	return prefs.getPref('huppercolor').then(color => prefs.addHighlightedUser(userName, color));
}

function unhighlightUser (userName) {
	return prefs.removeHighlightedUser(userName);
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
			let boringRex = new RegExp(boringRexStr);
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
			let {name, color} = user;

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

function articleParse (articles) {
	return prefs.getCleanTaxonomies()
		.then(taxonomies => {
			articles.forEach(a => a.hide = func.inArray(taxonomies, a.category));
		})
		.then(() => prefs.getPref('newcommenttext'))
		.then((newCommentText) => {
			let newArticles = articles.filter(x => x.isNew && !x.hide);
			newArticles.forEach(a => a.newText = newCommentText);
			modComments.setPrevNextLinks(newArticles);
		}).then(() => articles);
}

function hideArticle (article) {
	return prefs.addTaxonomy(article.category);
}

function blockParse (blocks) {
	return prefs.getBlocks()
		.then(blocksPref => modBlocks.mergeBlockPrefsWithBlocks(blocks, blocksPref))
		.then(blocksPref => prefs.setPref('blocks', blocksPref))
		.then(blocksPrefs => blocksPrefs
			.map(block => Object.assign(block, {
				title: modBlocks.getBlockTitle(block)
			}))
		);

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
