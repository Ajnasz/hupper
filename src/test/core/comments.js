import * as comments from '../../core/comments';

let test = require('tape');

test('core/comments.setPrevNextLinks', t => {
	t.plan(4);
	let newComments = [
		{id: 1},
		{id: 2},
		{id: 5},
		{id: 9},
		{id: 10},
		{id: 15}
	];

	comments.setPrevNextLinks(newComments);

	t.equal(newComments[0].prevId, undefined, 'No previous for the first comment');
	t.equal(newComments[newComments.length - 1].nextId, undefined, 'No previous for the first comment');
	let anIndex = Math.round(newComments.length / 2);
	t.equal(newComments[anIndex].prevId, newComments[anIndex - 1].id, 'Preivous id must be set to the id of the previous element in the list');
	t.equal(newComments[anIndex].nextId, newComments[anIndex + 1].id, 'Next id must be set to the id of the next element in the list');

	t.end();

});
