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
		readPage('page_with_comments.html').then((window) => {
			const commentNodes = comments.getComments();
			t.ok(commentNodes.length > 0, 'comments found');
			t.ok(commentNodes.every(c => c.nodeType === window.Node.ELEMENT_NODE), 'all comment is an element node');
			t.ok(commentNodes.every(c => c.classList.contains('comment')), 'all found node has comment class');
			t.end();
		});
	});

	commentsSuite.test('parseComment', (t) => {
		t.test('authenticated', (t) => {
			readPage('page_with_comments.html').then(() => {
				const commentNodes = comments.getComments();

				const firstParsedComment = comments.parseComment(commentNodes[0]);

				t.equal(typeof firstParsedComment, 'object', 'parsed first comment');
				t.equal(typeof firstParsedComment.isNew, 'boolean', 'isNew property added');
				t.equal(typeof firstParsedComment.author, 'string', 'author property added');
				t.ok(firstParsedComment.author.length > 0, 'author property not empty');
				t.equal(typeof firstParsedComment.created, 'number', 'created');
				t.assert(!isNaN(firstParsedComment.created), 'Got valid created date');
				t.equal(typeof firstParsedComment.indentLevel, 'number', 'indentLevel property added');
				t.assert(!isNaN(firstParsedComment.indentLevel), 'indentLevel valid');
				t.equal(typeof firstParsedComment.parentID, 'string', 'parentID property added');
				t.equal(firstParsedComment.content, null, 'content is null');

				const secondParsedComment = comments.parseComment(commentNodes[1], { content: true });
				t.equal(typeof secondParsedComment.content, 'string', 'content is string');
				t.end();
			}).catch((err) => {
				t.fail(err);
				t.end();
			});
		});

		t.test('non authenticated', (t) => {
			readPage('page_with_comments_unauth.html').then(() => {
				const commentNodes = comments.getComments();

				const firstParsedComment = comments.parseComment(commentNodes[0]);

				t.equal(typeof firstParsedComment, 'object', 'parsed first comment');
				t.equal(typeof firstParsedComment.isNew, 'boolean', 'isNew property added');
				t.equal(typeof firstParsedComment.author, 'string', 'author property added');
				t.ok(firstParsedComment.author.length > 0, 'author property not empty');
				t.equal(typeof firstParsedComment.created, 'number', 'created');
				t.assert(!isNaN(firstParsedComment.created), 'Got valid created date');
				t.equal(typeof firstParsedComment.indentLevel, 'number', 'indentLevel property added');
				t.assert(!isNaN(firstParsedComment.indentLevel), 'indentLevel valid');
				t.equal(typeof firstParsedComment.parentID, 'string', 'parentID property added');
				t.equal(firstParsedComment.content, null, 'content is null');

				const secondParsedComment = comments.parseComment(commentNodes[1], { content: true });
				t.equal(typeof secondParsedComment.content, 'string', 'content is string');
				t.end();
			}).catch((err) => {
				t.fail(err);
				t.end();
			});
		});

		t.end();
	});

	commentsSuite.test('filterNewComments', (t) => {
		readPage('page_with_comments.html').then(() => {
			const commentOjbects = comments.getComments().map(c => comments.parseComment(c)).map((c, i) => {
				if (i % 3 === 0) {
					return Object.assign({}, c, { hide: true });
				}

				if (i % 4 === 0) {
					return Object.assign({}, c, { isNew: false });
				}

				return c;
			});
			const newComments = comments.filterNewComments(commentOjbects);

			t.ok(newComments.length > 0, 'New comments found');
			t.ok(newComments.every(c => c.isNew), 'All comments isNew property is true');
			t.ok(newComments.every(c => !c.hide), 'All comments hide property is false');
			t.end();
		});
	});

	commentsSuite.end();
});
