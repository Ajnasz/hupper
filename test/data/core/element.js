import { getCommentObj } from '../../../data/core/comment-obj';
import * as element from '../../../data/core/element';

const test = require('tape');
const path = require('path');

const fixturesPath = path.resolve(__dirname, './fixtures');
import { readPage } from '../../domHelpers';

function readFixturePage (page) {
	return readPage(path.join(fixturesPath, page));
}

test('data/core/element', (suite) => {
	suite.test('addHNav', (t) => {
		t.test('optimal way', (t) => {
			readFixturePage('ok_comments.html').then(win => {
				const { document } = win;
				const comments = Array.from(document.querySelectorAll('.comment'));

				comments.map(getCommentObj).forEach(element.addHNav);

				t.ok(comments.every(c => c.querySelector(`.${element.HNAV_CLASS}`)), 'All element has hnav');
				t.end();
			});
		});

		t.test('add only once', (t) => {
			readFixturePage('ok_comments.html').then(win => {
				const { document } = win;
				const comments = Array.from(document.querySelectorAll('.comment'));

				comments.map(getCommentObj).forEach(element.addHNav);
				comments.map(getCommentObj).forEach(element.addHNav);

				t.ok(comments.every(c => c.querySelectorAll(`.${element.HNAV_CLASS}`).length === 1), 'All element has only one hnav');
				t.end();
			});
		});

		t.test('add only once', (t) => {
			readFixturePage('ok_comments.html').then(win => {
				const { document } = win;
				const comments = Array.from(document.querySelectorAll('.comment'));

				t.doesNotThrow(() => {
					comments.map(getCommentObj)
						.map(c => Object.assign({}, c, { header: null }))
						.forEach(element.addHNav);
				}, 'should not fail if no header fount');

				t.end();
			});
		});

		t.end();
	});

	suite.end();
});
