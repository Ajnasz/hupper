import { prefs } from '../../core/prefs';
import * as func from '../../core/func';
import * as colorModule from '../../core/color';
import * as modComments from '../../core/comments';

function setParent (comments, parent) {
	comments.forEach(comment => {
		comment.parent = parent;
		setParent(comment.children, comment);
	});
}

export default function commentParse (comments, context) {
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

