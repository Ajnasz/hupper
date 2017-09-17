import { StorageArea } from '../../core/StorageArea';

let test = require('tape');

test('core/StorageArea interface', function (t) {
	let storage = new StorageArea();

	t.plan(5);

	t.equal(typeof storage.get, 'function', 'has get method');
	t.equal(typeof storage.set, 'function', 'has set method');
	t.equal(typeof storage.remove, 'function', 'has remove method');
	t.equal(typeof storage.clear, 'function', 'has clear method');
	t.equal(typeof storage.getBytesInUse, 'function', 'has getBytesInUse method');

	t.end();
});

test('core/StorageArea get', function (t) {
	t.comment('Test expects that StorageArea.set is working');
	{
		let storage = new StorageArea();

		let value = {foo: 1, bar: 2};
		storage.set(value);
		let called = 0;
		storage.get(function (result) {
			t.equal(result.foo, value.foo, 'with emtpy param has foo key');
			t.equal(result.bar, value.bar, 'with emtpy param has bar key');
			t.equal(Object.keys(result).length, 2, 'With emtpy param Has no more keys then expected');
			++called;
		});
		t.equal(called, 1);
	}

	{
		let storage = new StorageArea();
		let value = {foo: 1, bar: 2};
		storage.set(value);

		storage.get([], function (result) {
			t.equal(Object.keys(result).length, 0, 'With empty array param, an empty object returned');
		});
	}

	{
		let storage = new StorageArea();
		let value = {foo: 1, bar: 2};
		storage.set(value);

		storage.get('foo', function (result) {
			t.equal(result.foo, value.foo, 'With a key, it\'s value returned');
			t.equal(Object.keys(result).length, 1, 'With a key, no other value returned');
		});
	}

	{
		let storage = new StorageArea();
		let value = {foo: 1, bar: 2};
		storage.set(value);

		storage.get('no_such_key', function (result) {
			t.equal(Object.keys(result).length, 0, 'Doesn\'t return any keys if no value set');
		});
	}

	{
		let storage = new StorageArea();
		let value = {foo: 1, bar: 2};
		storage.set(value);

		storage.get(['foo', 'bar'], function (result) {
			t.equal(result.foo, value.foo, 'with emtpy param has foo key');
			t.equal(result.bar, value.bar, 'with emtpy param has bar key');
			t.equal(Object.keys(result).length, 2, 'With emtpy param Has no more keys then expected');
		});
	}

	t.end();
});

test('core/StorageArea set', function (t) {
	t.comment('Test expects that StorageArea.get is working');
	{
		let storage = new StorageArea();
		t.throws(function () {
			storage.set('foo');
		}, /Incorrect argument types/, 'should throw error if argument is a string');
	}

	{
		let storage = new StorageArea();
		t.throws(function () {
			storage.set(12345);
		}, /Incorrect argument types/, 'should throw error if argument is a number');
	}

	{
		let storage = new StorageArea();
		t.throws(function () {
			storage.set(null);
		}, /Incorrect argument types/, 'should throw error if argument is null');
	}

	{
		let storage = new StorageArea();
		t.throws(function () {
			storage.set();
		}, /Incorrect argument types/, 'should throw error if argument is undefined');
	}

	{
		let storage = new StorageArea();
		let called = 0;
		storage.set({asdfJKLE: 1}, function () {
			++called;
		});

		t.equal(called, 1, 'should call its callback');
	}

	{
		let storage = new StorageArea();
		let values = {foo: 1};

		storage.set(values, function () {
			storage.get('foo', function (result) {
				t.equal(result.foo, values.foo, 'set a single number value');
			});
		});
	}

	{
		let storage = new StorageArea();
		let values = {foo: 'foobar'};
		storage.set(values, function () {
			storage.get('foo', function (results) {
				t.equal(results.foo, values.foo, 'set a single string value');
			});
		});
	}

	{
		let storage = new StorageArea();
		let values = {foo: 1, bar: 2};
		storage.set(values, function () {
			storage.get(function (results) {
				t.deepEqual(results, values);
			});
		});
	}

	{
		let storage = new StorageArea();
		let values = {date: new Date()};
		storage.set(values, function () {
			storage.get('date', function (results) {
				t.deepEqual(results.date, values.date.toISOString(), 'Setting a Date object must convert it to iso string');
			});
		});
	}

	{
		let storage = new StorageArea();
		let values = {func: function () {}};
		storage.set(values, function () {
			storage.get('func', function (results) {
				t.deepEqual(results.func, void(0), 'Setting a function must be removed');
			});
		});
	}

	{
		let storage = new StorageArea();
		let values = {obj: {
			a: 1,
			b: 2
		}};
		storage.set(values, function () {
			storage.get('obj', function (results) {
				t.deepEqual(results.obj, values.obj, 'Setting an object as values should be kept');
			});
		});
	}
	t.end();
});

test('core/StorageArea remove', function (t) {
	t.comment('Expects that get and set working');

	{
		let storage = new StorageArea();

		storage.set({foo: 1});

		let called = 0;
		storage.remove('foo', function () {
			++called;
		});

		t.equal(called, 1, 'should call the callback');
	}

	{
		let storage = new StorageArea();
		storage.set({foo: 1});
		storage.remove('foo', function () {
			storage.get('foo', function (results) {
				t.equal(results.foo, void(0), 'deleted key must be undefined');
			});
		});
	}

	{
		let storage = new StorageArea();
		storage.set({foo: 1, bar: 2}, function () {
			storage.remove('foo', function () {
				storage.get('foo', function (results) {
					t.equal(results.foo, void(0), 'deleted key must be undefined');
				});
			});
		});
	}

	{
		let storage = new StorageArea();
		storage.set({foo: 1, bar: 2}, function () {
			storage.remove(['foo', 'bar'], function () {
				storage.get(['foo', 'bar'], function (results) {
					t.equal(results.foo, void(0), 'Delete with list of keys: deleted key must be undefined');
					t.equal(results.bar, void(0), 'dDelete with list of keys: eleted key must be undefined');
				});
			});
		});
	}

	t.end();
});

test('core/StorageArea clear', function (t) {
	t.comment('Expects that get and set working');

	{
		let storage = new StorageArea();

		storage.set({foo: 1});

		let called = 0;

		storage.clear(function () {
			++called;
		});

		t.equal(called, 1, 'should call the callback');
	}

	{
		let storage = new StorageArea();
		storage.set({foo: 1, bar: 2, baz: new Date()}, function () {
			storage.clear(function () {
				storage.get(function (results) {
					t.equal(Object.keys(results).length, 0, 'should delete every keys');
				});
			});
		});
	}

	t.end();
});
