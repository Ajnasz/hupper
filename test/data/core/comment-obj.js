import { getCommentObj } from '../../../data/core/comment-obj';

const test = require('tape');
const jsdom = require('jsdom');
const path = require('path');

const { JSDOM } = jsdom;
const fixturesPath = path.resolve(__dirname, './fixtures');
import { setGlobals } from '../../domHelpers';

function readPage (page) {
	return JSDOM.fromFile(path.join(fixturesPath, page)).then(dom => dom.window.top).then(window => {
		setGlobals(window);
		return window;
	});
}

test('data/core/comment-obj', suite => {
	suite.test('getCommentObj', t => {
		t.test('comments with correct markup', t => {
			readPage('ok_comments.html').then(win => {
				const { document } = win;
				const comments = Array.from(document.querySelectorAll('.comment'));

				const commentObjects = comments.map(getCommentObj);

				t.ok(commentObjects.every(c => 'header' in c), 'returned object has header key');
				t.ok(commentObjects.every(c => 'node' in c), 'returned object has node key');
				t.ok(commentObjects.every(c => 'footer' in c), 'returned object has footer key');

				t.ok(commentObjects.every(c => c.node.nodeType === window.Node.ELEMENT_NODE), 'node is an element node');
				t.ok(commentObjects.every(c => c.header.nodeType === window.Node.ELEMENT_NODE), 'header is an element node');
				t.ok(commentObjects.every(c => c.footer.nodeType === window.Node.ELEMENT_NODE), 'footer is an element node');
				t.end();
			});
		});

		t.test('comments with incorrect markup', t => {
			readPage('screwed_comments.html').then(win => {
				const { document } = win;
				const comments = Array.from(document.querySelectorAll('.comment'));

				const commentObjects = comments.map(getCommentObj);

				t.ok(commentObjects.every(c => 'header' in c), 'returned object has header key');
				t.ok(commentObjects.every(c => 'node' in c), 'returned object has node key');
				t.ok(commentObjects.every(c => 'footer' in c), 'returned object has footer key');

				t.ok(commentObjects.every(c => c.node.nodeType === window.Node.ELEMENT_NODE), 'node is an element node');
				t.ok(commentObjects.every(c => c.header.nodeType === window.Node.ELEMENT_NODE), 'header is an element node');
				t.ok(commentObjects.every(c => c.footer.nodeType === window.Node.ELEMENT_NODE), 'footer is an element node');
				t.end();
			});
		});

		t.end();
	});
	suite.end();
});

