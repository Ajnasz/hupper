/*jshint moz:true*/
/*global self*/
console.log('hupper.js');
(function (req) {
	'use strict';
	var dom = req('dom');

	var modBlocks = req('blocks');
	var modHupperBlock = req('hupper-block');

	var blockActionStruct = {
		id: '',
		action: '',
		column: ''
	};

	function addHupperBlock() {
		return new Promise(function (resolve) {
			modHupperBlock.addHupperBlock();
			self.port.on('hupper-block.add-menu', modHupperBlock.addMenuItem);
			resolve();
		});
	}

	addHupperBlock().then(function () {
		self.port.on('getComments', function (options) {
			var modComment, comments;
			var commentsContainer = document.getElementById('comments');

			if (!commentsContainer) {
				return;
			}

			modComment = req('comment');
			comments = modComment.getComments();

			self.port.emit('gotComments', comments.map(function (item) {
				return modComment.parseComment(item, {
					content: options.content
				});
			}));

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

			self.port.on('comment.setTrolls', function (trollComments) {
				modComment.setTrolls(trollComments);
			});

			self.port.on('comment.highlightComments', function (comments) {
				modComment.highlightComments(comments);
			});

			self.port.on('comment.hideBoringComments', function (comments) {
				modComment.hideBoringComments(comments);
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

			self.port.on('block.hide-content', modBlocks.hideContent);
			self.port.on('block.show-content', modBlocks.showContent);
			self.port.on('blocks.change-order-all', function (blocks) {
				modBlocks.setBlockOrder('sidebar-left', blocks.left);
				modBlocks.setBlockOrder('sidebar-right', blocks.right);
				self.port.emit('blocks.change-order-all-done');
			});
			self.port.on('block.change-order', function (event) {
				console.log('change order', event.sidebar, event.blocks);
				modBlocks.setBlockOrder(event.sidebar, event.blocks);
			});

			self.port.emit('gotBlocks', modBlocks.getBlocks());
		});
	});
}(window.req));
