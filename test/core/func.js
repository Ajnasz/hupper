import * as func from '../../core/func';

let test = require('tape');

function createTestArray () {
	return [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
}

function createTestArrayObject () {
	return [ 4, 5, 6, 2, 2, 3, 1, 7, 8, 9 ].map(i => {
		return {value: i};
	});
}

test('core/func.index', (t) => {
	t.plan(3);

	let array = createTestArray();

	t.equal(func.index(array, (i) => i === 5), 4, 'should return the index of the matching item');
	t.equal(func.index(array, (i) => i > 5), 5, 'should return the index of the first matching item');
	t.equal(func.index(array, (i) => isNaN(i)), -1, 'should return -1 if no item found');

	t.end();
});

test('core/func.first', (t) => {
	t.plan(3);

	let array = createTestArray();

	t.equal(func.first(array, (i) => i === 5), 5, 'should return the matching item');
	t.equal(func.first(array, (i) => i > 5), 6, 'should return the first matching item');
	t.deepEqual(func.first(array, (i) => isNaN(i)), null, 'should return null if no item found');

	t.end();
});

test('core/func.toArray', (t) => {
	t.plan(3);

	let object = {
		0: 1,
		2: 3,
		1: 2,
		length: 3
	};

	let array = func.toArray(object);

	t.equal(Object.prototype.toString.call(array), '[object Array]', 'converted item should be an array');
	t.equal(array.length, object.length);
	array.forEach((i, index) => {
		if (object[index] !== i) {
			t.fail(`wrong value at index ${index}: expected ${object[index]}, actual: ${i}`);
		}
	});

	t.pass('Values set from object to array');

	t.end();
});

test('core/func.inArray', (t) => {
	t.plan(2);

	let array = createTestArray();

	t.ok(func.inArray(array, 5), 'Should return true if the given item exists in the array');
	t.notOk(func.inArray(array, -1), 'Should return false if the given item not exists in the array');

	t.end();
});

test('core/func.sortBy', (t) => {
	t.plan(1);
	let array = createTestArrayObject();

	let sorted = func.sortBy(array, 'value');

	sorted.forEach((item, index, arr) => {
		if (index === 0) {
			return;
		}

		if (item.value < arr[index - 1].value) {
			t.fail(`Sort by failed, at index ${index} value ${item.value} is smaller or equal than ${array[index - 1].value}`);
		}
	});

	t.pass('array sorted by value');

	t.end();
});

test('core/func.partial', (t) => {
	t.plan(2);

	const firstArg = 1,
		secondArg = 2;

	let newFunc = func.partial((a, b) => {
		if (a !== firstArg) {
			return t.fail(`wrong value of firstArg: expected ${firstArg}, actual: ${a}`);
		}

		if (b !== secondArg) {
			return t.fail(`wrong value of firstArg: expected ${secondArg}, actual: ${b}`);
		}

		return t.pass('Arguments passed to function');
	}, firstArg, secondArg);

	newFunc();

	const thirdArg = 3,
		fourthArg = 4;

	let newFunc2 = func.partial((a, b, c, d) => {
		if (a !== firstArg) {
			return t.fail(`when new arg passed on invoke, wrong value of firstArg: expected ${firstArg}, actual: ${a}`);
		}

		if (b !== secondArg) {
			return t.fail(`when new arg passed on invoke, wrong value of secondArg: expected ${secondArg}, actual: ${b}`);
		}


		if (c !== thirdArg) {
			return t.fail(`when new arg passed on invoke, wrong value of thirdArg: expected ${thirdArg}, actual: ${c}`);
		}

		if (d !== fourthArg) {
			return t.fail(`when new arg passed on invoke, wrong value of thirdArg: expected ${fourthArg}, actual: ${d}`);
		}

		return t.pass('Arguments passed to function, when new arg passed on invoke');
	}, firstArg, secondArg);
	newFunc2(thirdArg, fourthArg);

	t.end();
});


test('core/func.yesOrNo', (t) => {
	t.plan(2);
	func.yesOrNo(true, () => {
		t.pass('If first argument truthy Yes callback called');
	}, () => {
		t.fail('If first argument truthy No callback called');
	});

	func.yesOrNo(false, () => {
		t.fail('If first argument falsy Yes callback called');
	}, () => {
		t.pass('If first argument falsy No callback called');
	});

	t.end();
});

test('core/func.groupBy', (t) => {
	t.plan(3);
	let array = [{id: 1, value: 1}, {id: 2, value: 3}, {id: 3, value: 1}];

	let output = func.groupBy(array, 'value');

	t.equal(Object.prototype.toString(output), '[object Object]', 'groupBy returns an object');
	t.equal(output[1].length, 2, 'all values are in group 1');
	t.equal(output[3].length, 1, 'all values are in group 2');

	t.end();
});

test('core/func.random', (t) => {

	t.test('positive integers', t => {
		let success = Array(100).fill(null).every(function () {
			let min = 3, max = 5;

			let output = func.random(min, max, true);

			if (output < min) {
				t.fail(`expected random number minimum value to be ${min} and got ${output}`);
				return false;
			}

			if (output > max) {
				t.fail(`expected random number maximum value to be ${max} and got ${output}`);
				return false;
			}

			if (parseInt(output, 10) !== output) {
				t.fail(`expected random number to be integer, but got ${output}`);
				return false;
			}

			return true;
		});

		t.ok(success, 'random integer number looks good');

		t.end();
	});

	t.test('positive floats', t => {
		let success = Array(100).fill(null).every(function () {
			let min = 0.1, max = 0.9;
			let output = func.random(min, max);

			if (output < min) {
				t.fail(`expected random number minimum value to be ${min} and got ${output}`);
				return false;
			}

			if (output > max) {
				t.fail(`expected random number maximum value to be ${max} and got ${output}`);
				return false;
			}

			return true;
		});

		t.ok(success, 'float random number looks good');
		t.end();
	});

	t.test('default min and max', (t) => {
		let success = Array(100).fill(null).every(function () {
			let min = 0, max = 1;
			let output = func.random();

			if (output < min) {
				t.fail(`expected random number minimum value to be ${min} and got ${output}`);
				return false;
			}

			if (output > max) {
				t.fail(`expected random number maximum value to be ${max} and got ${output}`);
				return false;
			}

			return true;
		});

		t.ok(success, 'float random number looks good');

		t.end();
	});

	t.end();
});

test('core/func.padStart', (t) => {
	t.plan(3);

	t.equal(func.padStart('a', 10), '         a', 'pad start with space by default');
	t.equal(func.padStart('abcdefg', 5), 'abcdefg', 'pad start with longer text dont add more chars');
	t.equal(func.padStart('9', 5, '0'), '00009', 'pad start with custom char');

	t.end();
});

test('core/func.toCamelCase', (t) => {
	t.plan(9);

	t.equal(func.toCamelCase('lorem ipsum'), 'loremIpsum', 'replace space');
	t.equal(func.toCamelCase('lorem    ipsum'), 'loremIpsum', 'replace multiple space');

	t.equal(func.toCamelCase('lorem_ipsum'), 'loremIpsum', 'replace underline');
	t.equal(func.toCamelCase('lorem____ipsum'), 'loremIpsum', 'replace multiple underline');

	t.equal(func.toCamelCase('lorem_ipsum'), 'loremIpsum', 'replace underline');
	t.equal(func.toCamelCase('lorem____ipsum'), 'loremIpsum', 'replace multiple underline');

	t.equal(func.toCamelCase('loremipsum'), 'loremipsum', 'no change if no separator');

	t.equal(func.toCamelCase('Loremipsum'), 'loremipsum', 'First character lowercase');
	t.equal(func.toCamelCase('Lorem ipsum'), 'loremIpsum', 'First character lowercase with separator');

	t.end();
});

test('core/func.maxBy', t => {
	t.plan(1);
	var items = [
		{ id: 3, value: 1 },
		{ id: 4, value: 2 },
		{ id: 1, value: -2 },
		{ id: 2, value: -1 }
	];

	let actual = func.maxBy(items, 'value').id;
	let expected = 4;

	t.equal(actual, expected, `maxBy expected id ${expected}, got ${actual}`);

	t.end();
});

test('core/func.hex2rgb', t => {
	t.deepEqual(func.hex2rgb('#000000'), [0, 0, 0], 'black converted');
	t.deepEqual(func.hex2rgb('000000'), [0, 0, 0], 'black converted without hashmark prefix');
	t.deepEqual(func.hex2rgb('#ffffff'), [255, 255, 255], 'white converted');
	t.deepEqual(func.hex2rgb('ffffff'), [255, 255, 255], 'white converted without hashmark prefix');
	t.end();
});

test('core/func.negate', t => {
	t.ok(func.negate(() => false)(), 'negated false');
	t.notOk(func.negate(() => true)(), 'negated true');

	t.end();
});

test('core/func.flow', t => {
	t.plan(4);
	const output = func.flow(
		() => (t.pass('first function called'), 1),
		arg => (t.pass('second function called'), arg * 2),
		arg => (t.pass('third function called'), arg * 2)
	);

	t.equal(output, 4, 'passed all param');
});
