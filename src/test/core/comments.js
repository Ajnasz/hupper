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

test('core/comments.setScores', t => {
	t.plan(21);

	let items = [
		{
			id: 1,
			author: 'a',
			content: 'super content with one score',
			children: [
				{
					id: 2,
					author: 'b',
					content: '+1',
					children: []
				}
			]
		},

		{
			id: 4,
			author: 'c',
			content: 'super content with minus one score',
			children: [
				{
					id: 5,
					author: 'b',
					content: '-1',
					children: []
				}
			]
		},

		{
			id: 6,
			author: 'c',
			content: 'super content with minus two scores',
			children: [
				{
					id: 7,
					author: 'b',
					content: '+1',
					children: []
				},
				{
					id: 8,
					author: 'e',
					content: '+1',
					children: []
				}
			]
		},

		{
			id: 9,
			author: 'c',
			content: 'super content with minus two scores',
			children: [
				{
					id: 10,
					author: 'b',
					content: '-1',
					children: []
				},
				{
					id: 11,
					author: 'e',
					content: '-1',
					children: []
				}
			]
		},

		{
			id: 12,
			author: 'c',
			content: 'super content with plus one and mindus one scores',
			children: [
				{
					id: 13,
					author: 'b',
					content: '+1',
					children: []
				},
				{
					id: 14,
					author: 'e',
					content: '-1',
					children: []
				}
			]
		},

		{
			id: 15,
			author: 'c',
			content: 'super content with plus one and mindus one scores',
			children: [
				{
					id: 16,
					author: 'b',
					content: '+1',
					children: [
						{
							id: 17,
							author: 'b',
							content: '+1',
							children: []
						},
						{
							id: 18,
							author: 'b',
							content: '+1',
							children: []
						},
						{
							id: 19,
							author: 'e',
							content: '-1',
							children: []
						}
					]
				}
			]
		}

	];

	comments.setScores(items);
	t.equal(items[0].votes.score, 1, 'Set score to 1 when an answer contains only +1');
	t.equal(items[0].votes.plusone, 1, 'Set plusone to 1 when an answer contains only +1');
	t.equal(items[0].votes.minusone, 0, 'Set minusone to 0 when an answer contains only +1');

	t.equal(items[1].votes.score, -1, 'Set score to -1 when an answer contains only -1');
	t.equal(items[1].votes.plusone, 0, 'Set plusone to 0 when an answer contains only -1');
	t.equal(items[1].votes.minusone, 1, 'Set minusone to 1 when an answer contains only -1');

	t.equal(items[2].votes.score, 2, 'Set score to 2 when two answers contains +1');
	t.equal(items[2].votes.plusone, 2, 'Set plusone to 2 when two answer contains +1');
	t.equal(items[2].votes.minusone, 0, 'Set minusone to 0 when two answer contains +1');

	t.equal(items[3].votes.score, -2, 'Set score to -2 when two answers contains -1');
	t.equal(items[3].votes.plusone, 0, 'Set plusone to 0 when two answers contains -1');
	t.equal(items[3].votes.minusone, 2, 'Set minusone to -2 when two answers contains -1');

	t.equal(items[4].votes.score, 0, 'Set score to 0 when has a plus one and a minus one score');
	t.equal(items[4].votes.plusone, 1, 'Set plusone to 1 when an answer contains +1');
	t.equal(items[4].votes.minusone, 1, 'Set minusone to 1 when an answers contains -1');

	t.equal(items[5].votes.score, 1, 'Set score to 1 when has a plus one, children are not affects the score of this comment');
	t.equal(items[5].votes.plusone, 1, 'Set plusone to 1 when an answer contains +1, children are not affects the score of this comment');
	t.equal(items[5].votes.minusone, 0, 'Set minusone to 0 when an answer contains +1, children are not affects the score of this comment');
	t.equal(items[5].children[0].votes.score, 1, 'Set children score to 1, if has two plusone and one minusone answer');
	t.equal(items[5].children[0].votes.plusone, 2, 'Set children plusone to 2, if has two plusone and one minusone answer');
	t.equal(items[5].children[0].votes.minusone, 1, 'Set children minusone to 1, if has two plusone and one minusone answer');

	t.end();

});
