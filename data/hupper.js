/*jshint moz:true*/
/*global self*/
console.log('hupper.js');

(function (req) {
	'use strict';

	self.port.on('getComments', function (options) {
		var modComment = req('comment');
		var comments = Array.prototype.slice.call(document.querySelectorAll('.comment'));

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

		var dom = req('dom');
		document.querySelector('body').addEventListener('click', function (e) {
			if (e.target.nodeName === 'A') {
				return;
			}

			if (dom.closest(e.target, '.comment')) {
				return;
			}

			modComment.unwideComments();
		}, false);

		document.getElementById('comments').addEventListener('click', function (e) {
			if (dom.is(e.target, '.expand-comment')) {
				e.preventDefault();
				modComment.unwideComments();
				modComment.widenComment(dom.prev(dom.closest(e.target, '.comment'), 'a').getAttribute('id'));

			}
		}, false);
	});
}(window.req));
