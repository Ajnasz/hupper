import * as comments from '../../../data/core/comments';

const fs = require('fs');
const path = require('path');

const jsdom = require('jsdom');
const test = require('tape');

const fixturesPath = path.resolve(__dirname, '../fixtures');

function setGlobals (window) {
	global.document = window.document;
	global.window = window;
	Object.keys(window).forEach((property) => {
		if (typeof global[property] === 'undefined') {
			global[property] = window[property];
		}
	});

	global.Node = window.Node;

	global.navigator = {
		userAgent: 'node.js'
	};

}

function readPage (page) {
	return new Promise((resolve, reject) => {
		fs.readFile(path.join(fixturesPath, page), (err, data) => {
			if (err) {
				reject(err);
				return;
			}

			jsdom.env(data.toString('utf8'), (err, window) => {
				if (err) {
					reject(err);
					return;
				}

				setGlobals(window);

				resolve(window);
			});
		});
	});
}

test('data/core/comments', (commentsSuite) => {
	commentsSuite.test('getComments', (t) => {
		readPage('page_with_comments.html').then(window => {
			const commentNodes = comments.getComments();
			t.ok(commentNodes.length > 0, 'comments found');
			t.ok(commentNodes.every(c => c.nodeType === window.Node.ELEMENT_NODE), 'all comment is an element node');
			t.ok(commentNodes.every(c => c.classList.contains('comment')), 'all found node has comment class');
			t.end();
		});
	});

	commentsSuite.test('parseComment', (t) => {
		readPage('page_with_comments.html').then(() => {
			const commentNodes = comments.getComments();

			const firstParsedComment = comments.parseComment(commentNodes[0]);

			t.equal(typeof firstParsedComment, 'object', 'parsed first comment');
			t.equal(typeof firstParsedComment.isNew, 'boolean', 'isNew property added');
			t.equal(typeof firstParsedComment.author, 'string', 'author property added');
			t.equal(typeof firstParsedComment.created, 'number', 'created');
			t.assert(!isNaN(firstParsedComment.created), 'Got valid created date');
			t.equal(typeof firstParsedComment.indentLevel, 'number', 'indentLevel property added');
			t.equal(typeof firstParsedComment.parentID, 'string', 'parentID property added');
			t.equal(firstParsedComment.content, null, 'content is null');

			const secondParsedComment = comments.parseComment(commentNodes[1], {content: true});
			t.equal(typeof secondParsedComment.content, 'string', 'content is string');
			t.end();
		});
	});

	commentsSuite.end();
});
