import updater from '../../lib/updater';
import * as testUtil from '../../core/testUtil';
import * as virtualStorage from '../../core/virtualStorage';

let test = require('tape');

function getTestUpdates () {
	let spy = testUtil.spy();

	let updates = [
		{
			num: 1,
			updater () {
				return new Promise(resolve => {
					spy();
					resolve();
				});
			}
		},
		{
			num: 2,
			updater () {
				return new Promise(resolve => {
					spy();
					resolve();
				});
			}
		},
		{
			num: 3,
			updater () {
				return new Promise(resolve => {
					spy();
					resolve();
				});
			}
		},
	];

	return { spy, updates };
}

test('lib/updater.js', (t) => {
	t.test('updater must be a function', (t) => {
		t.equal(typeof updater, 'function', 'Updater is a function');
		t.end();
	});

	t.test('All updates should be called', (t) => {
		let { spy, updates } = getTestUpdates();
		updater(updates, virtualStorage.create()).then(() => {
			t.equal(spy.getCallCount(), 3, 'All updates has been called');
			spy.reset();
			t.end();
		});
	});


	t.test('set last update number', (t) => {
		let { spy, updates } = getTestUpdates();
		let storage = virtualStorage.create();

		updater(updates, storage).then(() => {
			storage.local.get('lastUpdate', val => {
				t.equal(val.lastUpdate, 3, 'updated lastUpdate in storage');
				spy.reset();
				t.end();
			});
		});
	});

	t.test('don\'t run tests older than the lastUpdate num', (t) => {
		let spies = [testUtil.spy(), testUtil.spy(), testUtil.spy()];
		let updates = spies.map((spy, index) => {
			return {
				num: index + 1,
				updater () {
					return new Promise(resolve => {
						spy();
						resolve();
					});
				}
			};
		});
		let storage = virtualStorage.create();
		storage.local.set({ lastUpdate: 2 }, () => {
			updater(updates, storage).then(() => {
				t.equal(spies[0].getCallCount(), 0, 'first update not called');
				t.equal(spies[1].getCallCount(), 0, 'second update not called');
				t.equal(spies[2].getCallCount(), 1, 'third update not called');
				t.end();
			});
		});
	});

	t.end();
});
