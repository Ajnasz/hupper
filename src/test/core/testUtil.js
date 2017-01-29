import * as testUtil from '../../core/testUtil';

let test = require('tape');

test('core/testUtil spy', function (t) {
	let cb = testUtil.spy();

	t.deepEqual(cb.getCalls(), [], 'get calls should return an empty array');
	t.deepEqual(cb.getCallCount(), 0, 'callCount should be 0');

	cb();

	t.comment('after call');

	t.deepEqual(cb.getCallCount(), 1, 'callCount should be 1');
	t.deepEqual(cb.getCalls().length, 1, 'get calls should be an array with one element');

	cb.reset();
	t.comment('after reset');

	t.deepEqual(cb.getCalls(), [], 'get calls should return an empty array');
	t.deepEqual(cb.getCallCount(), 0, 'callCount should be 0');
	cb.reset();

	cb(1, {a: 2});
	t.deepEqual(cb.getCalls()[0].args[0], 1, 'call args should contain the arguments of the call');
	t.deepEqual(cb.getCalls()[0].args[1], {a: 2}, 'call args should contain the arguments of the call');

	t.end();
});


