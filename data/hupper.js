/*jshint moz:true*/
/*global self*/
console.log('hupper.js');
(function (req) {
	'use strict';
	let dom = req('dom');

	let modBlocks = req('blocks');
	let modHupperBlock = req('hupper-block');

	let func = req('func');

	let blockActionStruct = {
		id: '',
		action: '',
		column: ''
	};

	function addHupperBlock() {
		return new Promise(function (resolve) {
			modHupperBlock.addHupperBlock();
			self.port.on('hupper-block.add-menu', modHupperBlock.addMenuItem);
			self.port.on('hupper-block.hide-block', modHupperBlock.addHiddenBlock);
			self.port.on('hupper-block.show-block', modHupperBlock.removeHiddenBlock);

			document.getElementById('block-hupper').addEventListener('click', function (e) {
				var target = e.target;
				let dataSet = target.dataset;

				if (dataSet.action === 'restore-block') {
					e.preventDefault();

					let event = Object.create(blockActionStruct);

					let blockId = dataSet.blockid;

					let block = document.getElementById(blockId);

					event.id = blockId;
					event.action = 'restore';
					event.column = modBlocks.getBlockColumn(block);
					self.port.emit('block.action', event);
				}
			}, false);
			resolve();
		});
	}

	addHupperBlock().then(function () {
		self.port.on('getComments', function (options) {
			let commentsContainer = document.getElementById('comments');

			if (!commentsContainer) {
				return;
			}

			let modComment = req('comment');
			let modCommentTree = req('commenttree');

			console.log('subscribe');

			self.port.on('comments.update', function (comments) {
				comments.forEach(function (comment) {
					if (comment.hide) {
						modComment.hide(comment);

						if (comment.boring) {
							modComment.setProp(comment, 'boring', true);
						}

						if (comment.troll) {
							modComment.setProp(comment, 'troll', true);
						}
					} else {
						if (modComment.getProp(comment, 'boring')) {
							modComment.setProp(comment, 'boring', false);
						} else if (modComment.getProp(comment, 'troll')) {
							modComment.setProp(comment, 'troll', false);
						}

						modComment.show(comment);

						if (comment.userColor) {
							modComment.highlightComment(comment);
						} else {
							modComment.unhighlightComment(comment);
						}
					}

				});
			});

			self.port.on('comment.setNew', function (newComments) {
				var obj = newComments.comments.map(modComment.commentDataStructToObj);
				obj.forEach(function (comment) {
					modComment.setNew(comment, newComments.text);
				});
			});

			self.port.on('comment.addNextPrev', function (item) {
				if (item.prevId) {
					modComment.addLinkToPrevComment(item.id, item.prevId);
				}

				if (item.nextId) {
					modComment.addLinkToNextComment(item.id, item.nextId);
				}
			});

			self.port.on('comment.addParentLink', modComment.addParentLinkToComments);
			self.port.on('comment.addExpandLink', modComment.addExpandLinkToComments);

			document.querySelector('body').addEventListener('click', function (e) {
				if (e.target.nodeName === 'A') {
					return;
				}

				if (dom.closest(e.target, '.comment')) {
					return;
				}

				modComment.unwideComments();
			}, false);

			commentsContainer.addEventListener('click', function (e) {
				if (dom.is(e.target, '.expand-comment')) {
					e.preventDefault();
					modComment.unwideComments();
					modComment.widenComment(dom.prev(dom.closest(e.target, '.comment'), 'a').getAttribute('id'));

				}
			}, false);


			function convertComments(comments) {
				return comments.map(function (comment) {
					let output = modComment.parseComment(modComment.getCommentFromId(comment.id), {
						content: options.content
					});

					output.children = convertComments(comment.children);

					return output;
				});
			}

			self.port.emit('gotComments', convertComments(modCommentTree.getCommentTree()));
		});

		self.port.on('enableBlockControls', function (blocks) {
			modBlocks.decorateBlocks(blocks);
			var commonParent = dom.findCommonParent(blocks.map(modBlocks.blockDataStructToBlockElement));
			commonParent.addEventListener('click', function (e) {
				if (dom.is(e.target, '.block-button')) {
					let block = dom.closest(e.target, '.block'),
					action = e.target.dataset.action,
					event = Object.create(blockActionStruct);

					event.id = block.getAttribute('id');
					event.action = action;
					event.column = modBlocks.getBlockColumn(block);
					self.port.emit('block.action', event);
				}
			}, false);
		});

		self.port.on('getBlocks', function () {
			self.port.on('block.hide', modBlocks.hide);
			self.port.on('block.show', modBlocks.show);

			self.port.on('block.hide-content', modBlocks.hideContent);
			self.port.on('block.show-content', modBlocks.showContent);
			self.port.on('blocks.change-order-all', function (blocks) {
				modBlocks.reorderBlocks(blocks);
				self.port.emit('blocks.change-order-all-done');
			});
			self.port.on('block.change-order', function (event) {
				modBlocks.setBlockOrder(event.sidebar, event.blocks);
			});

			self.port.on('block.change-column', function (blocks) {
				modBlocks.reorderBlocks(blocks);
			});

			self.port.on('blocks.set-titles', modBlocks.setTitles);

			self.port.emit('gotBlocks', modBlocks.getBlocks());
		});
		self.port.on('getArticles', function () {
			let modArticles = req('articles');
			let articles = modArticles.parseArticles();

			if (articles.length > 0) {
				self.port.emit('gotArticles', articles);
				self.port.on('articles.mark-new', function (data) {
					data.articles.map(modArticles.articleStructToArticleNodeStruct)
							.forEach(func.partial(modArticles.markNewArticle, data.text));
				});
			}
			self.port.on('articles.addNextPrev', function (item) {
				if (item.prevId) {
					modArticles.addLinkToPrevArticle(item.id, item.prevId);
				}

				if (item.nextId) {
					modArticles.addLinkToNextArticle(item.id, item.nextId);
				}
			});

			self.port.on('articles.add-category-hide-button', function (items) {
				items.map(modArticles.articleStructToArticleNodeStruct).forEach(modArticles.addCategoryHideButton);
			});

			self.port.on('articles.hide', function (articles) {
				articles.map(modArticles.articleStructToArticleNodeStruct).forEach(function (a) {
					a.node.classList.add('hup-hidden');

				});
			});

			document.getElementById('content-both').addEventListener('click', function (e) {
				if (e.target.classList.contains('taxonomy-button')) {
					let articleStruct = modArticles.articleElementToStruct(dom.closest(e.target, '.node'));

					self.port.emit('article.hide-taxonomy', articleStruct);
				}
			}, false);
		});
	});

	self.port.on('setUnlimitedLinks', function () {
		let modUnlimitedlinks = req('unlimitedlinks');
		func.toArray(document.getElementsByTagName('a'))
				.filter(modUnlimitedlinks.isExtendableLink)
				.forEach(modUnlimitedlinks.makeExtendable);
	});
}(window.req));
