import { setGlobals } from '../../domHelpers';
import { getCommentId } from  '../../../data/core/comment-data';

const path = require('path');
const test = require('tape');
const jsdom = require('jsdom');

const { JSDOM } = jsdom;

function loadFixture (fixture) {
	return JSDOM.fromFile(path.join(__dirname, `fixtures/${fixture}`))
		.then(dom => dom.window.top)
		.then(window => {
			setGlobals(window);
			return window;
	});
}

function createComment (document) {
	const comment = document.createElement('div');
	comment.classList.add('comment');

	return comment;
}

function createCommentLink (document, comment) {
	const a = document.createElement('a');
	const id = 'id-' + Math.random();
	a.setAttribute('id', id);

	comment.parentNode.insertBefore(a, comment);

	return a;
}

test('data/core/comment-data', (testMethod) => {
	testMethod.test('getCommentId', (t) => {
		loadFixture('ok_comments.html')
			.then(({ document }) => {
				// TODO: create a helper which can create a comment node on the fly
				const comment = createComment(document);
				document.body.appendChild(comment);

				const a = createCommentLink(document, comment);

				t.equal(getCommentId({ node: comment }), a.getAttribute('id'), 'found id from previous element');
			})
			.then(() => loadFixture('ok_comments.html'))
			.then(({ document }) => {
				// TODO: create a helper which can create a comment node on the fly
				const comment = createComment(document);
				document.body.appendChild(comment);

				t.equal(getCommentId({ node: comment }), '', 'returned empty string if no comment link in dom');
			})
			.catch(t.fail)
			.then(() => t.end());
	});
});
