import * as events from '../../core/events';
import * as testUtil from '../../core/testUtil';

let test = require('tape');

test('core/events.createEmitter.on', (t) => {
	t.plan(6);

	let emitter = events.createEmitter();

	let listener = testUtil.spy();

	emitter.on('foo', listener);

	emitter.emit('foo', 1);

	t.equal(listener.getCallCount(), 1, 'listener called');

	t.equal(listener.getCalls()[0].args.length, 2, 'event passes to arguments to the callback');
	t.equal(listener.getCalls()[0].args[0], 1, 'event passes the args to the callback');
	t.equal(listener.getCalls()[0].args[1], 'foo', 'event passes the event name to the callback');

	let anyListener = testUtil.spy();
	emitter.on('*', anyListener);

	emitter.emit('foo');

	t.equal(listener.getCallCount(), 2, 'listener called');
	t.equal(anyListener.getCallCount(), 1, 'anyListener called');

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
	t.plan(2);
	let emitter = events.createEmitter();

	let listener = testUtil.spy();
	let listener2 = testUtil.spy();

	emitter.on('foo', listener);
	emitter.on('foo', listener2);

	emitter.off('foo', listener);
	emitter.emit('foo');

	t.equal(listener.getCallCount(), 0, 'Unsubscribed listener should not be called');
	t.equal(listener2.getCallCount(), 1, 'One remaining listener called');

	t.end();
});

test('core/events.createEmitter.emit all listeners', (t) => {
	t.plan(1);
	let emitter = events.createEmitter();

	let listener = testUtil.spy();

	emitter.on('foo', listener);
	emitter.on('foo', listener);
	emitter.on('foo', listener);

	emitter.emit('foo');

	t.equal(listener.getCallCount(), 3, 'called all listeners');

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
