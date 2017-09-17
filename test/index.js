var assert = require('assert');
var func = {
	index (array, cb) {
		for (let i = 0, al = array.length; i < al; i++) {
			if (cb(array[i])) {
				return i;
			}
		}

		return -1;
	},

	first (array, cb) {
		let i = func.index(array, cb);

		if (i > -1) {
			return array[i];
		}

		return null;
	}
};

function comparator (a, b) {
	if (a.index > b.index) {
		return 1;
	} else if (a.index < b.index) {
		return -1;
	}

	return 0;
}

function test (text, cb) {
	process.stdout.write(text);
	process.stdout.write(' .');
	cb();
	process.stdout.write(' . ');
	process.stdout.write('ok\n\n');
}

var blockPrefs = [
	{id: 2, column: 'left', index: 0, hidden: false},
	{id: 3, column: 'left', index: 1, hidden: false},
	{id: 1, column: 'left', index: 2, hidden: false},
	{id: 5, column: 'left', index: 3, hidden: false},
	{id: 4, column: 'left', index: 4, hidden: false},
	{id: 8, column: 'left', index: 5, hidden: false},
	{id: 7, column: 'left', index: 6, hidden: true},
	{id: 6, column: 'left', index: 7, hidden: false},

	{id: 27, column: 'right', index: 0, hidden: false},
	{id: 23, column: 'right', index: 1, hidden: false},
	{id: 26, column: 'right', index: 2, hidden: false},
	{id: 25, column: 'right', index: 3, hidden: false},
	{id: 24, column: 'right', index: 4, hidden: false},
	{id: 28, column: 'right', index: 5, hidden: false},
	{id: 22, column: 'right', index: 6, hidden: false},
	{id: 21, column: 'right', index: 7, hidden: false},
];

var context = [
	{id: 1, column: 'left'},
	{id: 4, column: 'left'},
	{id: 5, column: 'left'},
	{id: 6, column: 'left'},
	{id: 7, column: 'left'},

	{id: 26, column: 'right'},
	{id: 25, column: 'right'},
	{id: 27, column: 'right'},
];

function getValidContextObjects (block, context, blockPrefs) {
	return context.map(c => func.first(blockPrefs, b => b.id === c.id))
			.filter(b => b.column === block.column)
			.filter(b => !b.hidden)
			.sort(comparator);
}

function findIndex (block, contextObjects) {
	return func.index(contextObjects, o => o.id === block.id);
}

function findClosestNext (block, context, blockPrefs) {
	let contextObjects = getValidContextObjects(block, context, blockPrefs);

	let i = findIndex(block, contextObjects);

	if (i > 0) {
		return contextObjects[i - 1];
	}

	return null;
}

function findClosestNext (block, context, blockPrefs) {
	let contextObjects = getValidContextObjects(block, context, blockPrefs);

	let i = findIndex(block, contextObjects);

	if (i < contextObjects.length) {
		return contextObjects[i + 1];
	}

	return null;
}

test('find next', function () {
	var clicked = {id: 1, column: 'left'};

	let result = findClosestNext(clicked, context, blockPrefs);
	assert.equal(result.id, 5);
});

test('find next after hidden', function () {
	var clicked = {id: 4, column: 'left'};

	let result = findClosestNext(clicked, context, blockPrefs);
	assert.equal(result.id, 6);
});
