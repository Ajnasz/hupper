import { setGlobals } from '../../domHelpers';
import * as commenttree from  '../../../data/core/commenttree';
import * as comments from  '../../../core/comments';

const path = require('path');

const test = require('tape');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

function loadFixture (fixture) {
	return JSDOM.fromFile(path.join(__dirname, `fixtures/${fixture}`)).then(dom => dom.window.top).then(window => {
		setGlobals(window);
		return window;
	});
}

test('data/core/commenttree.getCommentTree', (t) => {
	loadFixture('ok_comments.html')
		.then((data) => {
			const { document, window } = data;
			setGlobals(window);

			const tree = commenttree.getCommentTree();

			t.equal(comments.flatComments(tree).length, document.querySelectorAll('.comment').length, 'Found all comments');

		}).then(() => loadFixture('screwed_comments.html'))
		.then((data) => {
			const { document, window } = data;
			setGlobals(window);

			const tree = commenttree.getCommentTree();

			const actual = comments.flatComments(tree).length;
			const expected = document.querySelectorAll('.comment').length;

			t.equal(actual, expected, 'Found all comments');

		}).then(() => t.end()).catch((err) => {
			t.fail(err);
			t.end();
		});
});
