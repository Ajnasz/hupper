import * as chromeEvents from '../../core/chromeEvents';

let test = require('tape');

test('core/chromeEvents interface', function (t) {
	t.plan(4);

	const events = chromeEvents.create();

	t.equal(typeof events.addListener, 'function', 'has addListener function');
	t.equal(typeof events.removeListener, 'function', 'has removeListener function');
	t.equal(typeof events.hasListener, 'function', 'has hasListener function');
	t.equal(typeof events.dispatch, 'function', 'has dispatch function');

	t.end();
});

test('chrome/chromeEvents.addListener should accept only functions', function (t) {
	const events = chromeEvents.create();

	t.doesNotThrow(function () {
		events.addListener(() => {});
	});

	t.throws(function () {
		events.addListener();
	}, /Invalid listener for/, 'callback should exist');

	t.throws(function () {
		events.addListener(null);
	}, /Invalid listener for/, 'should not allow callback to be null');

	t.throws(function () {
		events.addListener(1235);
	}, /Invalid listener for/, 'should not allow callback to be number');

	t.throws(function () {
		events.addListener('asdf');
	}, /Invalid listener for/, 'should not allow callback to be string');

	t.throws(function () {
		events.addListener('');
	}, /Invalid listener for/, 'should not allow callback to be number');

	t.end();
});

test('chrome/chromeEvents.hasListener', function (t) {
	const events = chromeEvents.create();

	function listener1 () {
		return true;
	}
	function listener2 () {
		return true;
	}

	t.notOk(events.hasListener(), 'Has listener should return false if no listener passed');
	t.notOk(events.hasListener(listener1), 'Has listener should return false if given listener not registered yet');
	events.addListener(listener2);
	t.ok(events.hasListener(listener2), 'Has listener should return true if given listener registered');

	t.end();
});


test('chrome/chromeEvents.removeListener', function (t) {
	const events = chromeEvents.create();

	function listener () {
		return true;
	}

	events.addListener(listener);
	t.ok(events.hasListener(listener), 'Has listener should return true if given listener registered');

	events.removeListener(listener);
	t.notOk(events.hasListener(listener), 'After calling removeListener, hasListener should return false');

	t.end();
});

test('chrome/chromeEvents.dispatch', function (t) {
	t.plan(1);
	const events = chromeEvents.create();

	let called = 0;
	function listener () {
		++called;
	}

	events.addListener(listener);
	events.dispatch();

	t.equal(called, 1, 'Listener must be called once');

	t.end();
});


test('chrome/chromeEvents flow', function (t) {
	const events = chromeEvents.create();

	let called = 0;
	function listener () {
		++called;
	}

	events.addListener(listener);
	events.dispatch();

	t.equal(called, 1, 'Listener must be called once');
	called = 0;

	if (!events.hasListener(listener)) {
		events.addListener(listener);
	}
	events.dispatch();
	t.equal(called, 1, 'Listener must be called once, has listener returned false');
	called = 0;

	events.addListener(listener);
	events.dispatch();
	t.equal(called, 2, 'Listener must be called twice, added listener again');
	called = 0;

	events.removeListener(listener);
	events.dispatch();
	t.equal(called, 0, 'Listener removed');
	t.end();
});
