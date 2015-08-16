/*jshint esnext: true*/
/*global self*/
console.log('hupper.js');
(function (req) {
	'use strict';
	let dom = req('dom');

	let modBlocks = req('blocks');
	let modHupperBlock = req('hupper-block');

	let func = req('func');

	var events = (function (){
		return {
			on: function on(name, cb) {
				console.log('LISTEN TO', name);

				self.port.on(name, cb);
			},
			emit: function emit(name, args) {
				console.log('EMIT', name);
				self.port.emit(name, args);
			}


		};
	}());

	function addHupperBlock() {
		return new Promise(function (resolve) {
			modHupperBlock.addHupperBlock();
			events.on('hupper-block.add-menu', modHupperBlock.addMenuItem);
			events.on('hupper-block.hide-block', modHupperBlock.addHiddenBlock);
			events.on('hupper-block.show-block', modHupperBlock.removeHiddenBlock);

			document.getElementById('block-hupper').addEventListener('click', function (e) {
				let event = modBlocks.onBlockControlClick(e);
				if (event) {
					events.emit('block.action', event);
				}
			}, false);
			resolve();
		});
	}

	addHupperBlock().then(function () {
		console.log('hupper block added');

		events.on('getComments', function (opts) {
			let commentsContainer = document.getElementById('comments');

			if (!commentsContainer) {
				console.log('No comments container found');
				return;
			}

			let modComment = req('comment');
			let modCommentTree = req('commenttree');

			events.on('comments.update', modComment.onCommentUpdate);

			events.on('comment.setNew', modComment.onCommentSetNew);

			events.on('comment.addNextPrev', modComment.onCommentAddNextPrev);

			events.on('comment.addParentLink', modComment.addParentLinkToComments);
			events.on('comment.addExpandLink', modComment.addExpandLinkToComments);

			document.querySelector('body').addEventListener('click', modComment.onBodyClick, false);

			commentsContainer.addEventListener('click', modComment.onCommentsContainerClick, false);

			let convertedCommends = modComment.convertComments(modCommentTree.getCommentTree(), opts);
			events.emit('gotComments', convertedCommends);
		});

		events.on('enableBlockControls', function (blocks) {
			modBlocks.onEnableBlockControls(blocks, function (event) {
				events.emit('block.action', event);
			});
		});

		events.on('getBlocks', function () {
			events.on('block.hide', modBlocks.hide);
			events.on('block.show', modBlocks.show);

			events.on('block.hide-content', modBlocks.hideContent);
			events.on('block.show-content', modBlocks.showContent);
			events.on('blocks.change-order-all', function (blocks) {
				modBlocks.reorderBlocks(blocks);
				events.emit('blocks.change-order-all-done');
			});
			events.on('block.change-order', (event) => {
				modBlocks.setBlockOrder(event.sidebar, event.blocks);
			});

			events.on('block.change-column', (blocks) => {
				modBlocks.reorderBlocks(blocks);
			});

			events.on('blocks.set-titles', modBlocks.setTitles);

			events.emit('gotBlocks', modBlocks.getBlocks());
		});
		events.on('getArticles', function () {
			let modArticles = req('articles');
			let articles = modArticles.parseArticles();

			if (articles.length > 0) {
				events.emit('gotArticles', articles);
				events.on('articles.mark-new', function (data) {
					data.articles.map(modArticles.articleStructToArticleNodeStruct)
							.forEach(func.partial(modArticles.markNewArticle, data.text));
				});
			}
			events.on('articles.addNextPrev', function (item) {
				if (item.prevId) {
					modArticles.addLinkToPrevArticle(item.id, item.prevId);
				}

				if (item.nextId) {
					modArticles.addLinkToNextArticle(item.id, item.nextId);
				}
			});

			events.on('articles.add-category-hide-button', modArticles.addCategoryHideButton);

			events.on('articles.hide', modArticles.hideArticles);

			document.getElementById('content-both').addEventListener('click', function (e) {
				if (e.target.classList.contains('taxonomy-button')) {
					let articleStruct = modArticles.articleElementToStruct(dom.closest(e.target, '.node'));

					events.emit('article.hide-taxonomy', articleStruct);
				}
			}, false);
		});
	});

	events.on('setUnlimitedLinks', req('unlimitedlinks').setUnlimitedLinks);
}(window.req));
