import updater from '../../../lib/updates/storage_local_to_sync_u01';
import * as virtualStorage from '../../../core/virtualStorage';

import * as testUtil from '../../../core/testUtil';

let test = require('tape');

test('lib/updates/storage_local_to_sync_01', (t) => {
	t.test('no sync storage', (t) => {
		let storage = virtualStorage.create();

		new Promise(resolve => {
			storage.local.set({
				foo: 1,
				bar: 2,
				baz: 'three'
			}, resolve);
		}).then(() => {
			let spy = testUtil.spy();

			storage.onChanged.addListener(spy);

			updater(storage)
				.then(() => t.equal(spy.getCallCount(), 0, 'No change event fired'))
				.catch(e => t.fail(e))
				.then(() => t.end());
		});
	});
	t.test('with sync storage', (t) => {
		let storage = virtualStorage.createWithSync();

		let obj = {
			foo: 1,
			bar: 2,
			baz: 'three'
		};

		new Promise(resolve => {
			storage.local.set(obj, resolve);
		}).then(() => {
			let spy = testUtil.spy();

			storage.onChanged.addListener(spy);

			updater(storage)
				.then(() => t.ok(spy.getCallCount() > 0, 'Change should fire'))
				.then(() => {
					return new Promise(resolve => {
						storage.sync.get(['foo', 'bar', 'baz'], result => {
							t.equal(result.foo, obj.foo, 'Key foo migrated');
							t.equal(result.bar, obj.bar, 'Key bar migrated');
							t.equal(result.baz, obj.baz, 'Key baz migrated');
							resolve();
						});
					});
				})
				.then(() => {
					return new Promise(resolve => {
						storage.local.get(['foo', 'bar', 'baz'], result => {
							t.equal(result.foo, void(0), 'Key foo deleted from local');
							t.equal(result.bar, void(0), 'Key bar deleted from local');
							t.equal(result.baz, void(0), 'Key baz deleted from local');
							resolve();
						});
					});
				})
				.catch(e => t.fail(e))
				.then(() => t.end());
		});
	});

	t.end();
});
