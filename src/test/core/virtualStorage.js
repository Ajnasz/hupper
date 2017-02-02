import * as virtualStorage from '../../core/virtualStorage';
import * as testUtil from '../../core/testUtil';
let test = require('tape');

test('core/virtualStorage interface', function (t) {
	let storage = virtualStorage.create();

	t.plan(2);

	t.equal(typeof storage.local, 'object', 'has a local storage');
	t.equal(typeof storage.onChanged, 'object', 'has onChanged object');

	t.end();
});

test('core/virtualStorage onChanged set', function (t) {
	let storage = virtualStorage.create();

	let listener = testUtil.spy();
	storage.onChanged.addListener(listener);

	let callback = testUtil.spy();
	storage.local.set({foo: 1}, callback);

	t.equal(callback.getCallCount(), 1, 'setter callback called');

	t.equal(listener.getCallCount(), 1, 'On first set, set called the onChanged event listener');
	t.equal(listener.getCalls()[0].args.length, 2, 'On first set, callback an argument');
	t.equal(typeof listener.getCalls()[0].args[0].foo, 'object', 'On first set, StorageChange object present');
	t.equal(listener.getCalls()[0].args[0].foo.newValue, 1, 'On first set, StorageChange.newValue is correct');
	t.equal(listener.getCalls()[0].args[0].foo.oldValue, void(0), 'On first set, No old value was present');

	listener.reset();
	storage.local.set({foo: 2});
	t.equal(listener.getCalls()[0].args[0].foo.newValue, 2, 'StorageChange.newValue is correct');
	t.equal(listener.getCalls()[0].args[0].foo.oldValue, 1, 'Old value is ok');
	t.equal(listener.getCalls()[0].args[1], 'local', 'namespace set');

	storage.local.set({foo: 3, bar: 1, baz: 2});
	listener.reset();
	storage.local.set({foo: 4, bar: 2, baz: 3});

	t.equal(typeof listener.getCalls()[0].args[0].foo, 'object', 'On first set, StorageChange object present for one key');
	t.equal(typeof listener.getCalls()[0].args[0].bar, 'object', 'On first set, StorageChange object present for two key');
	t.equal(typeof listener.getCalls()[0].args[0].baz, 'object', 'On first set, StorageChange object present for three key');
	t.equal(listener.getCalls()[0].args[0].foo.newValue, 4, 'StorageChange.newValue is correct for first key');
	t.equal(listener.getCalls()[0].args[0].foo.oldValue, 3, 'Old value is ok for first key');
	t.equal(listener.getCalls()[0].args[0].bar.newValue, 2, 'StorageChange.newValue is correct for second key');
	t.equal(listener.getCalls()[0].args[0].bar.oldValue, 1, 'Old value is ok for second key');
	t.equal(listener.getCalls()[0].args[0].baz.newValue, 3, 'StorageChange.newValue is correct for third key');
	t.equal(listener.getCalls()[0].args[0].baz.oldValue, 2, 'Old value is ok for third key');

	listener.reset();
	storage.local.set({foo: 4, bar: 2, baz: 3});

	t.deepEqual(listener.getCallCount(), 0, 'Should not call change if no change');

	t.end();
});

test('core/virtualStorage onChanged remove', function (t) {
	let storage = virtualStorage.create();

	storage.local.set({foo: 2});

	let listener = testUtil.spy();
	storage.onChanged.addListener(listener);

	let callback = testUtil.spy();

	storage.local.remove('foo', callback);

	storage.local.get('foo', val => {
		t.deepEqual(val, {}, 'Removed the value');
	});

	t.equal(callback.getCallCount(), 1, 'callback called');

	t.equal(listener.getCallCount(), 1, 'remove called onChanged');
	t.equal(typeof listener.getCalls()[0].args[0], 'object', 'Call got argument');
	t.equal(typeof listener.getCalls()[0].args[0].foo, 'object', 'StorageChange object present');
	t.equal(listener.getCalls()[0].args[0].foo.oldValue, 2, 'StorageChange.oldValue correct');
	t.equal(listener.getCalls()[0].args[0].foo.newValue, void(0), 'StorageChange.newValue correct');

	t.equal(listener.getCalls()[0].args[1], 'local', 'namespace set');

	listener.reset();

	storage.local.remove('foo', callback);

	t.equal(listener.getCalls()[0].args[0].foo.oldValue, void(0), 'StorageChange.oldValue correct for non existing key');
	t.equal(listener.getCalls()[0].args[0].foo.newValue, void(0), 'StorageChange.newValue correct for non existing key');

	storage.local.set({foo: 2});
	t.doesNotThrow(() => {
		storage.local.remove('foo');
	});

	storage.local.set({foo: 2});
	t.doesNotThrow(() => {
		storage.local.remove(['foo']);
	});

	storage.local.get('foo', val => {
		t.deepEqual(val, {}, 'Removed the value');
		t.end();
	});
});

test('core/virtualStorage onChanged clear', function (t) {
	let storage = virtualStorage.create();

	storage.local.set({foo: 1});
	let listener = testUtil.spy();
	let callback = testUtil.spy();
	storage.onChanged.addListener(listener);

	storage.local.clear(callback);

	t.equal(listener.getCallCount(), 1, 'clear called onChanged');
	t.equal(typeof listener.getCalls()[0].args[0], 'object', 'Call got argument');
	t.equal(typeof listener.getCalls()[0].args[0].foo, 'object', 'StorageChange present');
	t.equal(listener.getCalls()[0].args[0].foo.oldValue, 1, 'StorageChange.oldValue present');
	t.notOk('newValue' in listener.getCalls()[0].args[0].foo, 'No newValue key in StorageChange');
	t.equal(listener.getCalls()[0].args[1], 'local', 'namespace set');

	t.equal(callback.getCallCount(), 1, 'clear called callback');

	t.doesNotThrow(() => {
		storage.local.clear();
	});

	t.end();
});
