/**
let Update = {
	num: Number,
	updater: Function
};
*/

function callUpdates (updates, storage) {
	return Promise.all(updates.map(u => u.updater(storage)));
}

function updateLastUpdateNum (storage, num) {
	return new Promise(resolve => {
		storage.local.set({
			lastUpdate: num
		}, () => resolve());
	});
}

function getHighestUpdateNum (updates) {
	return Math.max.apply(Math, updates.map(u => u.num));
}

function getUpdatesToRun (updates, storage) {
	return new Promise(resolve => {
		storage.local.get('lastUpdate', function (val) {
			const lastUpdate = val.lastUpdate || -1;
			resolve(updates.filter(u => u.num > lastUpdate));
		});
	});
}


/**
 * @method updater
 * @param {[]Update} updates
 * @param {Storage} storage
 */
function updater (updates, storage) {
	return new Promise(resolve => {
		getUpdatesToRun(updates, storage)
			.then(filteredUpdates => callUpdates(filteredUpdates, storage))
			.then(() => updateLastUpdateNum(storage, getHighestUpdateNum(updates)))
			.then(resolve);
	});
}

export default updater;
