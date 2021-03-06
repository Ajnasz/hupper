/* global chrome:true */
import * as modBlocks from './core/blocks';
import * as modArticles from './core/articles';
import * as modHupperBlock from './core/hupper-block';
import * as modTrackerBlock from './modules/unread-block';
import * as modComment from './core/comments';

import * as validator from './validator';

import * as unlimitedlinks from './core/unlimitedlinks';
import * as modCommentTree from './core/commenttree';

import { log } from '../core/log';
import * as dom from '../core/dom';
import * as func from '../core/func';

import * as contentBlocker from './modules/content-blocker';
import { getUserData } from './modules/user-data';

const MAX_COMMENTS_PER_PAGE = 9999;
const addClickListener = func.curry(dom.addListener, 'click');

log.logger = console;

function getCommentObjects (options) {
	const commentsContainer = document.getElementById('comments');

	if (!commentsContainer) {
		return null;
	}

	return modComment.convertComments(modCommentTree.getCommentTree(), options);
}

function getContextUser (data) {
	const url = new URL(data.linkUrl);

	let elem = document.querySelector(`.comment .submitted > a[href$="${url.pathname}"]`);

	if (elem === null) {
		elem = document.querySelector(`.node > table > tbody > tr > td:nth-child(1) > a[href$="${url.pathname}"]`);
	}

	return elem ? elem.textContent : null;
}

function shouldGoToComment () {
	return window.location.hash === '#new';
}

function goToComment (commentId) {
	const url = new URL(window.location.href);
	url.hash = `#${commentId}`;

	window.location.replace(url.href);
}

function updateComments () {
	const comments = getCommentObjects({ content: true });

	if (!comments) {
		return;
	}

	const article = modArticles.parseArticles()[0];

	chrome.runtime.sendMessage({
		event: 'requestCommentParse',
		data: comments,
		context: { article },
	}, function (comments) {
		if (comments) {
			const childComments = comments.filter(c => c.parentID !== '');
			modComment.addParentLinkToComments(childComments);
			modComment.addExpandLinkToComments(childComments.filter(c => c.indentLevel > 1));

			const newComments = modComment.filterNewComments(comments);

			modComment.onCommentSetNew(newComments);

			modComment.onCommentUpdate(comments);

			if (newComments.length > 0) {
				const commentId = newComments[0].id;
				modHupperBlock.addMenuItem({
					href: `#${commentId}`,
					text: 'Első olvasatlan hozzászólás'
				});

				if (shouldGoToComment()) {
					goToComment(commentId);
				}
			}
		}
	});
}

function updateArticles () {
	const articles = modArticles.parseArticles();

	if (!articles || !articles.length) {
		return;
	}

	chrome.runtime.sendMessage({
		event: 'requestArticleParse',
		data: articles
	}, function (articles) {
		if (articles) {
			modArticles.toggleArticles(articles);
			modArticles.onMarkNew(articles.filter(article => article.isNew && !article.hide));
			articles.filter(a => a.hasOwnProperty('nextId') || a.hasOwnProperty('prevId'))
				.forEach(modArticles.onArticleAddNextPrev);
			modArticles.onAddCategoryHideButton(articles);
		}
	});
}

function updateBlocks () {
	const blocks = modBlocks.getBlocks();

	if (!blocks.left && !blocks.right) {
		return;
	}

	chrome.runtime.sendMessage({
		event: 'requestBlockParse',
		data: {
			blocks,
			user: getUserData(),
		}
	}, function (blocks) {
		log.log('block responses', blocks);

		if (blocks) {
			modBlocks.reorderBlocks(blocks);
			modBlocks.decorateBlocks(blocks);
		}
	});
}

function addBlockListeners () {
	modBlocks.onEnableBlockControls(function (event) {
		chrome.runtime.sendMessage({
			event: 'block.action',
			data: event,
			context: modBlocks.getBlocks()
		}, function (response) {
			switch (event.action) {
				case 'up':
				case 'down':
				case 'left':
				case 'right':
					modBlocks.reorderBlocks(response);
					break;
				default:
					modBlocks.toggleBlock(response);
					return;
			}
		});
	});
}

function addArticleListeners () {
	modArticles.listenToTaxonomyButtonClick(function (article) {
		chrome.runtime.sendMessage({ event: 'article.hide-taxonomy', data: article }, updateArticles);
	});
}

function addCommentListeners () {
	const commentsContainer = document.getElementById('comments');

	if (commentsContainer) {
		addClickListener(modComment.onBodyClick, document.querySelector('body'));
		addClickListener(modComment.onCommentsContainerClick, document.querySelector('body'));
	}
}

function onHupperBlockClick (e) {
	const event = modBlocks.onBlockControlClick(e);
	if (!event) {
		return;
	}

	chrome.runtime.sendMessage({ event: 'block.action', data: event }, function (block) {
		modBlocks.toggleBlock(block);
	});
}

function addHupperBlockListeners () {
	addClickListener(onHupperBlockClick, document.getElementById('block-hupper'));
}


function onPrefChange (pref) {
	switch (pref.name) {
		case 'trolls':
		case 'filtertrolls':
		case 'highlightusers':
		case 'hideboringcomments':
		case 'boringcommentcontents':
		case 'alwaysshownewcomments':
			updateComments();
			break;
		case 'hidetaxonomy':
			updateArticles();
			break;

		case 'logenabled':
			log.enabled = pref.value;
			break;
	}
}

function attachFormValidators () {
	dom.selectAll('#comment-form,#node-form', document).forEach((form) => {
		const textarea = dom.selectOne('textarea', form);
		dom.addClass('html', textarea);
		validator.attachValidator(form);
	});
}

function onRuntimMessage (msg, sender, sendResponse) {
	log.log('message', msg.event);

	switch (msg.event) {
		case 'trolluser':
		case 'untrolluser':
		case 'highlightuser':
		case 'unhighlightuser':
			sendResponse({ event: msg.event, data: getContextUser(msg.data) });
			break;

		case 'userChange':
			updateComments();
			break;

		case 'prefChange':
			onPrefChange(msg.data);
			break;
	}
}

function onRegsitered (response) {
	log.enabled = response.data.logenabled;

	const {
		setunlimitedlinks,
		parseblocks,
		validateForms,
		blockEmbed,
	} = response.data;

	let promise;
	if (parseblocks) {
		promise = (new Promise(resolve => {
			const user = getUserData();

			if (user) {
				const block = resolve(modTrackerBlock.create());
				dom.addClass('hup-content-loading', block);
			}

			resolve();
		}))
			.catch(log.error)
			.then(() => {
				modHupperBlock.addHupperBlock();
				addHupperBlockListeners();
				updateBlocks();
			});
	} else {
		promise = Promise.resolve();
	}

	promise
		.then(() => {
			updateComments();
			updateArticles();
			addCommentListeners();
			addBlockListeners();
			addArticleListeners();

			if (validateForms) {
				attachFormValidators();
			}

			if (blockEmbed) {
				contentBlocker.provideUnblock(contentBlocker.TYPES.TWITTER);
				contentBlocker.provideUnblock(contentBlocker.TYPES.YOUTUBE);
			}

			if (setunlimitedlinks) {
				unlimitedlinks.setUnlimitedLinks(document.getElementsByTagName('a'), MAX_COMMENTS_PER_PAGE);
			}

			if (parseblocks) {
				const user = getUserData();

				return modTrackerBlock
					.fill(user)
					.then(() => {
						if (setunlimitedlinks) {
							const links = document.getElementById(modTrackerBlock.BLOCK_ID)
								.getElementsByTagName('a');
							unlimitedlinks.setUnlimitedLinks(links, MAX_COMMENTS_PER_PAGE);
						}
					});
			}

			return Promise.resolve();
		});
}

window.addEventListener('DOMContentLoaded', function () {
	chrome.runtime.onMessage.addListener(onRuntimMessage);
	chrome.runtime.sendMessage({
		event: 'register',
		data: {
			user: getUserData(),
		},
	}, (response) => {
		if (response.event === 'registered') {
			onRegsitered(response);
		}
	});
}, false);
