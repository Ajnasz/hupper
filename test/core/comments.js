import * as comments from '../../core/comments';

let test = require('tape');

const BORING_REGEXP = /^([-_.]|[+-]1|sub[!]?|subscribe)$/;

function getMockComments () {
	return [
		// index: 0
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
				},
				{
					id: 3,
					author: 'b',
					content: 'nothing special',
					children: []
				}
			]
		},

		// index: 1
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

		// index: 2
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

		// index: 3
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

		// index: 4
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

		// index: 5
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
		},

		// boring comments
		// index: 6
		{
			id: 20,
			author: 'not-boring-1',
			content: 'foo bar baz',
			children: [
				{
					id: 21,
					author: 'boring-1',
					content: '.',
					children: [
						{
							id: 22,
							author: 'not-boring-1',
							children: [],
							content: 'It is not boring, ok?'
						}
					]
				},
			]
		},

		// index: 7
		{
			id: 23,
			author: 'boring-1',
			content: '.\n--\nasdf',
			children: [
				{
					id: 24,
					author: 'not-boring-5',
					content: 'lorem ipsum dolor sit amet',
					children: []
				}
			]
		},

		// index: 8
		{
			id: 25,
			author: 'boring-1',
			content: '.',
			children: [
				{
					id: 26,
					author: 'boring-2',
					content: '-',
					children: []

				}
			]
		},

		// troll comments
		// index: 9
		{
			id: 27,
			author: 'troll-1',
			children: [
				{
					id: 28,
					author: 'not-troll-1',
					children: []
				}
			]
		},

		// index: 10
		{
			id: 29,
			author: 'troll-2',
			children: []
		},

		// index: 11
		{
			id: 30,
			author: 'not-troll',
			children: [
				{
					id: 31,
					author: 'troll-1',
					children: []
				}
			]
		},

		// index: 12
		{
			id: 32,
			author: 'not-troll-2',
			children: []
		},

		// color
		// index: 13
		{
			id: 33,
			author: 'color1',
			children: []
		},

		// index: 14
		{
			id: 34,
			author: 'color2',
			children: []
		},

		// index: 15
		{
			id: 35,
			author: 'no-color',
			children: []
		}
	];
}

test('core/comments.setScores', t => {
	t.plan(21);

	let items = getMockComments();

	items = comments.setScores(items);
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

test('core/comments.markBoringComments', (t) => {
	let testComments = getMockComments();

	let processed = comments.markBoringComments(testComments, BORING_REGEXP);

	function allHasBoring (comments) {
		let output = comments.every(c => 'boring' in c);

		if (output && comments.children) {
			output = allHasBoring(comments.children);
		}
		return output;
	}

	t.ok(allHasBoring(processed), 'All comments has boring property');
	t.notOk(processed[6].boring, 'First comment is not boring');
	t.ok(processed[6].children[0].boring, 'First subcomment is boring');
	t.ok(processed[7].boring, 'Third comment is boring');
	t.ok(processed[8].boring, 'Fourth comment is boring');

	t.end();
});

test('core/comments.markTrollComments', (t) => {
	let trolls = ['troll-1', 'troll-2'];

	let testComments = getMockComments();

	let trollMarked = comments.markTrollComments(testComments, trolls);

	t.ok(trollMarked[9].troll, 'first comment marked as troll');
	t.ok(trollMarked[10].troll, 'second comment marked as troll');
	t.notOk(trollMarked[11].troll, 'third comment not marked as troll');
	t.notOk(trollMarked[9].children[0].troll, 'third comment not marked as troll');
	t.ok(trollMarked[9].children[0].isParentTroll, 'third comment isParentTroll is true');

	t.notOk(trollMarked[11].troll, 'third comment not marked as troll');
	t.ok(trollMarked[11].children[0].troll, 'troll subcomment marked troll');
	t.notOk(trollMarked[11].children[0].isParentTroll, 'troll subcomment marked troll');
	t.notOk(trollMarked[12].troll, 'not troll comment not marked as troll');
	t.end();
});

test('core/comments.setHighlightedComments', t => {
	let testComments = getMockComments();

	let users = [
		{name: 'color1', color: '#ffffff'},
		{name: 'color2', color: '#000000'},
	];

	let colorComments = comments.setHighlightedComments(testComments, users);

	t.equal(colorComments[13].userColor, users[0].color, 'user 1\'s color set');
	t.equal(colorComments[14].userColor, users[1].color, 'user 2\'s color set');
	t.equal(colorComments[15].userColor, void(0), 'not colored user\'s color is undef');

	t.end();
});

test('core/comments.setParent', t => {
	let testComments = getMockComments();

	let withParentComments = comments.setParent(testComments);

	t.equal(withParentComments[0].parent, void(0), 'First comment has no parent');
	t.equal(withParentComments[0].children[0].parent.id, withParentComments[0].id, 'First subcommand comment has parent');

	t.end();
});

test('core/comments.markHasInterestingChild', t => {
	let testComments = getMockComments();

	let boringMarkedComments = comments.markBoringComments(testComments, BORING_REGEXP);

	let interestingMarkedComments = comments.markHasInterestingChild(comments.setParent(boringMarkedComments));
	t.ok(interestingMarkedComments[6].hasInterestingChild, 'Comment has interesting child');
	t.ok(interestingMarkedComments[6].children[0].hasInterestingChild, 'Comment has interesting child');
	t.ok(interestingMarkedComments[7].hasInterestingChild, 'Comment has interesting child');
	t.notOk(interestingMarkedComments[8].hasInterestingChild, 'Comment has interesting child');

	t.end();
});

test('core/comments.flatComments', t => {
	let testComments = getMockComments();

	let flatComments = comments.flatComments(testComments);

	t.ok(flatComments.every(c => !c.children), 'Children removed from flat');
	t.equal(flatComments[0].id, 1, 'First comment is id 1');
	t.ok(flatComments.every((comment, index, array) => index === 0 || comment.id - 1 === array[index - 1].id),
		'Comments are in order');
	t.end();
});

test('core/comments.updateHiddenState', t => {
	t.test('hide troll', t => {
		let testComments = [
			{
				id: 1,
				troll: true,
				children: []
			}
		];

		let result = comments.updateHiddenState(testComments);

		t.ok(result[0].hide, 'troll comment hidden');
		t.end();
	});

	t.test('hide boring', t => {
		let testComments = [
			{
				id: 1,
				boring: true,
				children: []
			}
		];

		let result = comments.updateHiddenState(testComments);

		t.ok(result[0].hide, 'boring comment hidden');
		t.end();
	});

	t.test('do not hide boring', t => {
		let testComments = [
			{
				id: 1,
				boring: true,
				children: []
			}
		];

		let result = comments.updateHiddenState(testComments);

		t.ok(result[0].hide, 'boring comment hidden');
		t.end();
	});

	t.test('hide if parent hidden', t => {
		let testComments = [
			{
				id: 1,
				boring: true,
				children: [
					{
						id: 2,
						boring: false,
						troll: false,
						children: []
					}
				]
			},
			{
				id: 3,
				troll: true,
				children: [
					{
						id: 4,
						boring: false,
						troll: false,
						children: []
					}
				]
			}
		];

		let result = comments.updateHiddenState(testComments);

		t.ok(result[0].children[0].hide, 'hide child if parent hidden');
		t.ok(result[1].children[0].hide, 'hide child if parent hidden');
		t.end();

	});

	t.test('do not hide if has interesting child', t => {
		let testComments = [
			{
				id: 1,
				boring: true,
				hasInterestingChild: true,
				children: [
					{
						id: 2,
						boring: false,
						troll: false,
						children: []
					}
				]
			}
		];

		let result = comments.updateHiddenState(testComments);
		t.notOk(result[0].hide, 'boring with interesting child not hidden');
		t.end();
	});
	t.end();
});
