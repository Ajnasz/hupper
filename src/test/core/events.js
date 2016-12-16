import * as events from '../../core/events';

let test = require('tape');

test('core/events.createEmitter.on', (t) => {
	t.plan(1);
	let emitter = events.createEmitter();

	emitter.on('foo', () => {
		t.pass('Foo listener called');
	});

	emitter.emit('foo');

	t.end();
});

test('core/events.createEmitter.off', (t) => {
	t.plan(1);
	let emitter = events.createEmitter();

	let called = false;
	emitter.on('foo', () => {
		called = true;
	});

	emitter.off('foo');
	emitter.emit('foo');

	if (called) {
		t.fail('listener called, but it shouldnt');
	} else {
		t.pass('listener unsubscribed');
	}

	t.end();
});

test('core/events.createEmitter.off specific listener', (t) => {
	t.plan(1);
	let emitter = events.createEmitter();

	let called = 0;
	function listener () {
		++called;
	}

	function listener2 () {
		++called;
	}

	emitter.on('foo', listener);
	emitter.on('foo', listener2);

	emitter.off('foo', listener);
	emitter.emit('foo');

	if (called > 1) {
		t.fail('listener called twice, but it shouldnt');
	} else {
		t.pass('listener unsubscribed');
	}

	t.end();
});

test('core/events.createEmitter.emit all listeners', (t) => {
	t.plan(1);
	let emitter = events.createEmitter();

	let counter = 0;
	emitter.on('foo', () => {
		counter += 1;
	});
	emitter.on('foo', () => {
		counter += 3;
	});
	emitter.on('foo', () => {
		counter += 5;
	});

	emitter.emit('foo');

	t.equal(counter, 9, 'called all listeners');

	t.end();
});

test('core/events.createEmitter.on adds only function listeners', (t) => {
	t.plan(1);
	let emitter = events.createEmitter();

	emitter.on('foo', 12);

	t.doesNotThrow(() => {
		emitter.emit('foo');
	},'emitter not try to call listener which is not a function');

	t.end();
});
