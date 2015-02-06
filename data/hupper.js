/*jshint moz:true*/
/*global self*/
console.log('hupper.js');

(function (req) {
	'use strict';

	self.port.on('getComments', function () {
		var modComment = req('comment')();
		var comments = Array.prototype.slice.call(document.querySelectorAll('.comment'));

		self.port.emit('gotComments', comments.map(function (item) {
			return modComment.parseComment(item);
		}));

		self.port.on('setNew', function (newComments) {
			var obj = newComments.comments.map(modComment.commentDataStructToObj);
			obj.forEach(function (comment) {
				modComment.setNew(comment, newComments.text);
			});
		});
	});
}(window.req));
