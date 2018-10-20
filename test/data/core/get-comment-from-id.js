import getCommentFromId from '../../../data/core/get-comment-from-id';

const test = require('tape');
const path = require('path');

const fixturesPath = path.resolve(__dirname, './fixtures');
import { readPage } from '../../domHelpers';

function readFixturePage (page) {
	return readPage(path.join(fixturesPath, page));
}

test('data/core/get-comment-from-id', (t) => {
	t.test('should return comment node', (t) => {
		readFixturePage('ok_comments.html').then((win) => {
			const comment = getCommentFromId('comment-1');
			t.equal(comment.nodeType, win.Node.ELEMENT_NODE, 'should return element node');
			t.ok(comment.classList.contains('comment'), 'should return comment node');
			t.end();
		});
	});
});
