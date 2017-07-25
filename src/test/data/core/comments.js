import * as comments from '../../../data/core/comments';

const path = require('path');

const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const test = require('tape');

const fixturesPath = path.resolve(__dirname, '../fixtures');
import { setGlobals } from '../../domHelpers';

function readPage (page) {
	return JSDOM.fromFile(path.join(fixturesPath, page)).then(dom => dom.window.top).then(window => {
		setGlobals(window);
		return window;
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

	commentsSuite.test('findParentId', (t) => {
		readPage('page_with_comments.html').then(() => {
			const commentNodes = comments.getComments();

			t.equal(comments.findParentId(commentNodes[0]), '');
			t.equal(comments.findParentId(commentNodes[1]), commentNodes[0].previousElementSibling.id);
			t.equal(comments.findParentId(commentNodes[2]), commentNodes[1].previousElementSibling.id);
			t.equal(comments.findParentId(commentNodes[3]), commentNodes[2].previousElementSibling.id);
			t.equal(comments.findParentId(commentNodes[4]), commentNodes[3].previousElementSibling.id);
			t.equal(comments.findParentId(commentNodes[5]), commentNodes[2].previousElementSibling.id);
			t.equal(comments.findParentId(commentNodes[6]), commentNodes[5].previousElementSibling.id);
			t.equal(comments.findParentId(commentNodes[7]), '');
			t.end();
		});
	});

	commentsSuite.test('findIndentLevel', (t) => {
		readPage('page_with_comments.html').then(() => {
			const commentNodes = comments.getComments();

			t.equal(comments.findIndentLevel(commentNodes[0]), 0);
			t.equal(comments.findIndentLevel(commentNodes[1]), 1);
			t.equal(comments.findIndentLevel(commentNodes[2]), 2);
			t.equal(comments.findIndentLevel(commentNodes[3]), 3);
			t.equal(comments.findIndentLevel(commentNodes[4]), 4);
			t.equal(comments.findIndentLevel(commentNodes[5]), 3);
			t.equal(comments.findIndentLevel(commentNodes[6]), 4);
			t.equal(comments.findIndentLevel(commentNodes[7]), 0);
			t.end();
		});
	});

	commentsSuite.end();
});
