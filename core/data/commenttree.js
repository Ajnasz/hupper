/*jshint moz:true*/
(function (def) {
	'use strict';
	def('commenttree', function () {

		function findComments(parent) {
			var output = [];
			if (!parent) {
				return output;
			}

			var child = parent.firstChild;

			while (child) {
				if (child.nodeType === Node.ELEMENT_NODE && child.classList.contains('comment')) {
					output.push(child);
				}

				child = child.nextElementSibling;
			}

			return output;
		}

		function createObj(comments) {
			return comments.map(function (c) {
				return {
					id: c.previousElementSibling.id,
					node: c,
					children: null
				};
			});
		}

		function recObj(comments) {
			comments.forEach(function (comment) {
				var children = findComments(comment.node.nextElementSibling);

				comment.children = createObj(children);
				recObj(comment.children);
			});

			return comments;
		}

		function noramlizeCommentTreeItem(item) {
			let output = Object.create(null);
			output.id = item.id;

			return output;
		}

		function normalizeCommentTree(tree) {
			return tree.map(function (item) {
				let normalized = noramlizeCommentTreeItem(item);
				normalized.children = normalizeCommentTree(item.children);
				return normalized;
			});
		}

		function getCommentTree() {
			let root = document.getElementById('comments');

			return normalizeCommentTree(recObj(createObj(findComments(root))));
		}

		return {
			getCommentTree: getCommentTree
		};
	});

}(window.def));
