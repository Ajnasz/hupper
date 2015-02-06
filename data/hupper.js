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
			var obj = newComments.map(modComment.commentDataStructToObj);
			console.log('new comments', obj, newComments);

			obj.forEach(modComment.setNew);
		});
	});
}(window.req));
