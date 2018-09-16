import setPrevNextLinks from '../../core/setprevnext';

const test = require('tape');

test('core/setprevnext', (t) => {
	const isNew = true;
	const newComments = [
		{ id: 1, isNew },
		{ id: 2, isNew },
		{ id: 3, isNew: false },
		{ id: 4, isNew: false },
		{ id: 5, isNew },
		{ id: 6, isNew: false },
		{ id: 7, isNew: false },
		{ id: 8, isNew: false },
		{ id: 9, isNew },
		{ id: 10, isNew },
		{ id: 11, isNew: false },
		{ id: 12, isNew: false },
		{ id: 13, isNew: false },
		{ id: 14, isNew: false },
		{ id: 15, isNew },
	];

	const parsedComments = setPrevNextLinks(newComments);

	t.equal(parsedComments.length, newComments.length, 'new comments and parsed comments has the same lenggth');
	t.notEqual(parsedComments, newComments, 'returns a new array');
	t.equal(parsedComments[0].prevId, undefined, 'No previous for the first comment');
	t.equal(parsedComments[parsedComments.length - 1].nextId, undefined, 'No next for the last comment');

	t.equal(parsedComments[1].prevId, parsedComments[0].id, 'Preivous id must be set to the id of the previous element in the list');
	t.equal(parsedComments[0].nextId, parsedComments[1].id, 'Next id must be set to the id of the next element in the list');

	t.equal(parsedComments[4].prevId, parsedComments[1].id, 'Preivous id must be set to the id of the previous element in the list');
	t.equal(parsedComments[4].nextId, parsedComments[8].id, 'Next id must be set to the id of the next element in the list');

	t.end();

});
