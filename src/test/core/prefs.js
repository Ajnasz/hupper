import { prefs } from '../../core/prefs';
import defaultPrefs from '../../core/defaultPrefs';

let test = require('tape');

test('core/prefs default prefs inserted', function (t) {
	Promise.all(defaultPrefs.map((pref) => {
		return prefs.getPref(pref.name).then(value => {
			switch (pref.type) {
				case 'bool':
				case 'string':
				case 'integer':
				case 'color':
					t.equal(value, pref.value);
					break;
				case 'array':
					t.deepEqual(value, pref.value);
					break;
				case 'control':
					t.equal(value, ':noSuchValue');
					break;
				default:
					t.fail('Unknown type ' + pref.type);
			}

			return true;
		});
	})).then(() => t.end());

});

test('core/prefs getPref', function (t) {
	prefs.getPref('huppercolor')
		.then((color) => {
			t.equal(color, '#B5D7BE', 'Returns a preference value');
		})
		.then(() => prefs.getPref('non such property'))
		.then(value => t.equal(value, null, 'Non existing property value should be null'))
		.then(() => t.end());
});

test('core/prefs setPref', function (t) {
	prefs.setPref('newcommenttext', 'foobar')
		.then(value => t.deepEqual(value, {newcommenttext: 'foobar'}, 'New value returned in promise resolve as an object'))
		.then(() => prefs.getPref('newcommenttext'))
		.then((color) => t.equal(color, 'foobar', 'Newcomment text updated'))
		.then(() => {
			return prefs.setPref('newcommenttext', 1234)
				.then(() => {
					t.fail('should not allow to set different type');
				})
				.catch(() => {
					t.pass('Error for not allowed type');
				});
		})
		.then(() => {
			return prefs.setPref('no such property', 1234)
				.then(() => {
					t.fail('should not allow to set non existing property');
				})
				.catch(() => {
					t.pass('Error for non existent property');
				});
		})
		.then(() => t.end());
});

test('core/prefs getAllPrefs', function (t) {
	prefs.getAllPrefs()
		.then(results => {
			t.equal(results.length, defaultPrefs.length, 'all prefs returned an array with a length of the defaultPrefs');
			return results;
		})
		.then(results => results.every(pref => defaultPrefs.some(defaultPref => defaultPref.name === pref.name)))
		.then(result => t.ok(result, 'Should find all value in defaultPrefs'))
		.catch((e) => t.fail('should not fail', e))
		.then(() => t.end());
});

test('core/prefs getBlocks', function (t) {
	let blocksObj = [
		{ id: 1 },
		{ id: 2 },
		{ id: 3 }
	];
	let blocksString = JSON.stringify([ {id: 99}, {id: 932} ]);

	prefs.setPref('blocks', blocksObj)
		.then(() => prefs.getBlocks())
		.then((actual) => t.deepEqual(blocksObj, actual, 'Saved block object returned'))
		.then(() => {
			return new Promise(resolve => {
				prefs.getStorage().local.set({
					blocks: blocksString
				}, () => resolve());
			});
		})
		.then(() => prefs.getBlocks())
		.then((actual) => t.deepEqual(JSON.parse(blocksString), actual, 'Saved block string returned as object'))
		.catch((e) => t.fail(e))
		.then(() => t.end());
});

test('core/prefs getCleanHighlightedUsers', function (t) {
	let usersEx = [
		{ name: 'foo', color: '#ff00ff' },
		{ name: 'bar', color: '#aa00ff' }
	];

	let usersEx2 = [
		{ name: 'foo', color: '#ff00ff' },
		{ name: 'bar', color: '#aa00ff' },
		{ name: 'baz', color: '#0000ff' }
	];

	let usersEx3 = [
		{ name: 'foo', color: '#ff00ff' },
		null,
		{ color: '#aa00ff' },
		{ name: 'bar', color: '#aa00ff' },
		{ name: 'foo' },
	];

	new Promise(resolve => {
		prefs.getStorage().local.set({
			highlightusers: null
		}, () => resolve());
	})
		.then(() => prefs.getCleanHighlightedUsers())
		.then(users => t.deepEqual(users, [], 'If highlightusers is null, it must return an empty array'))

		.then(() => {
			return new Promise(resolve => {
				prefs.getStorage().local.set({
					highlightusers: JSON.stringify(usersEx)
				}, () => resolve());
			});
		})
		.then(() => prefs.getCleanHighlightedUsers())
		.then(users => t.deepEqual(usersEx, users, 'Should parse highlightusers if stored as string'))

		.then(() => {
			return new Promise(resolve => {
				prefs.getStorage().local.set({
					highlightusers: usersEx2
				}, () => resolve());
			});
		})
		.then(() => prefs.getCleanHighlightedUsers())
		.then(users => t.deepEqual(usersEx2, users, 'Should return highlightusers object'))

		.then(() => {
			return new Promise(resolve => {
				prefs.getStorage().local.set({
					highlightusers: usersEx3
				}, () => resolve());
			});
		})
		.then(() => prefs.getCleanHighlightedUsers())
		.then(users => t.ok(users.every(u => Boolean(u.name && u.color)), 'Should filter out null items'))

		.then(() => {
			return new Promise(resolve => {
				prefs.getStorage().local.set({
					highlightusers: 'foo:#aaff00,bar:#ddddee'
				}, () => resolve());
			});
		})
		.then(() => prefs.getCleanHighlightedUsers())
		.then(users => {
			return t.deepEqual([
				{name: 'foo', color:'#aaff00'},
				{name: 'bar', color:'#ddddee'}
			], users, 'Converting from old, should return highlightusers object');
		})

		.catch(err => t.fail(err))
		.then(() => t.end());
});

test('core/prefs removeHighlightedUser', function (t) {
	let usersEx = [
		{ name: 'foo', color: '#ff00ff' },
		{ name: 'bar', color: '#aa00ff' }
	];

	new Promise(resolve => {
		prefs.getStorage().local.set({
			highlightusers: usersEx
		}, () => resolve());
	})
		.then(() => prefs.removeHighlightedUser('foo'))
		.then(() => prefs.getCleanHighlightedUsers())
		.then(users => t.ok(users.every(u => u.name !== 'foo'), 'Removed user'))

		.catch(err => t.fail(err))
		.then(() => t.end());
});

test('core/prefs setCleanHighlightedUsers', function (t) {

	let usersEx = [
		{ name: 'foo', color: '#ff00ff' },
		{ name: 'bar', color: '#aa00ff' },
		null,
		{ name: null, color: '#aa00ff' },
		{ name: 'baz', color: null },
		{ color: '#ff00ff' },
		{ name: 'qux' },
	];

	prefs.setCleanHighlightedUsers(usersEx)
		.then(() => prefs.getCleanHighlightedUsers())
		.then(users => {
			t.ok(users.every(u => usersEx.some(exampleUser => exampleUser.name === u.name && exampleUser.color === u.color)), 'all user is from usersExample');
		})
		.then(() => prefs.setCleanHighlightedUsers(usersEx))
		.then(() => prefs.getCleanHighlightedUsers())
		.then(users => t.ok(users.every(u => u.name && u.color), 'Removed not valid users'))
		.catch(err => t.fail(err))
		.then(() => t.end());
});


test('core/prefs addHighlightedUser', function (t) {
	new Promise(resolve => {
		prefs.getStorage().local.set({
			highlightusers: []
		}, () => resolve());
	})
		.then(() => prefs.addHighlightedUser('foo', '#ff0f00'))
		.then(() => prefs.getCleanHighlightedUsers())
		.then(users => {
			t.ok(users.every(u => u.name && u.color), 'Removed not valid users');
			t.equal(users.length, 1, 'Only one user should be in the users array');
			t.equal(users[0].name, 'foo', 'User name should be foo');
			t.equal(users[0].color, '#ff0f00', 'User color should be #ff0f00');
		})

		.then(() => prefs.addHighlightedUser('foo', '#ff0f00'))
		.then(() => prefs.getCleanHighlightedUsers())
		.then(users => {
			t.ok(users.every(u => u.name && u.color), 'Removed not valid users');
			t.equal(users.length, 1, 'Not added duplicated user');
		})
		.catch(err => t.fail(err))
		.then(() => t.end());
});
