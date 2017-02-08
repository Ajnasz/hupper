import * as preferences from '../../core/prefs';
import defaultPrefs from '../../core/defaultPrefs';

const prefs = preferences.prefs;

let test = require('tape');

function getCleanStorage () {
	return new Promise(resolve => {
		prefs.getStorage().local.clear(() => resolve());
	});
}

test('core/prefs default prefs inserted', function (t) {
	t.test('createDefaultPrefs', (t) => {
		getCleanStorage()
			.then(() => preferences.createDefaultPrefs())
			.then(function () {
				return Promise.all(defaultPrefs.map((pref) => {
					return prefs.getPref(pref.name).then(value => {
						switch (pref.type) {
							case 'bool':
							case 'string':
							case 'integer':
							case 'color':
								t.equal(value, pref.value, `${pref.name}'s default value inserted`);
								break;
							case 'array':
								t.deepEqual(value, pref.value, `${pref.name}'s default value inserted`);
								break;
							case 'control':
								t.equal(value, ':noSuchValue', `${pref.name}'s noSuchValue inserted`);
								break;
							default:
								t.fail('Unknown type ' + pref.type);
						}

						return true;
					});
				}));
			})
			.catch(err => t.fail(err))
			.then(() => t.end());
	});

	t.test('add defaults, keep existing', (t) => {
		const newCommentText = 'this is something new';
		getCleanStorage()
			.then(() => prefs.setPref('newcommenttext', newCommentText))
			.then(() => preferences.createDefaultPrefs())
			.then(function () {
				return Promise.all(defaultPrefs.map((pref) => {
					return prefs.getPref(pref.name).then(value => {
						switch (pref.type) {
							case 'bool':
							case 'string':
							case 'integer':
							case 'color':
								if (pref.name === 'newcommenttext') {
									t.equal(value, newCommentText, 'Changed pref value kept');
								} else {
									t.equal(value, pref.value, `${pref.name}'s default value inserted`);
								}
								break;
							case 'array':
								t.deepEqual(value, pref.value, `${pref.name}'s default value inserted`);
								break;
							case 'control':
								t.equal(value, ':noSuchValue', `${pref.name}'s noSuchValue inserted`);
								break;
							default:
								t.fail('Unknown type ' + pref.type);
						}

						return true;
					});
				}));
			})
			.catch(err => t.fail(err))
			.then(() => t.end());
	});

	t.end();
});

test('core/prefs migratePrefsToSync', function (t) {
	const newCommentText = 'this is something new';

	getCleanStorage()
		.then(() => prefs.setPref('newcommenttext', newCommentText))
		.catch(err => t.fail(err))
		.then(() => t.end());
});

test('core/prefs validateType', function (t) {
	t.test('boolean', function (t) {
		prefs.setPref('setunlimitedlinks', 'yes')
			.then(() => {
				t.fail('Should not allow to set boolean type to string');
			})
			.catch(() => t.pass('Rejected to set boolean type to string'))
			.then(() => t.end());
	});

	t.test('boolean', function (t) {
		prefs.setPref('style_wider_sidebar', 'hundred')
			.then(() => {
				t.fail('Should not allow to set integer type to string');
			})
			.catch(() => t.pass('Rejected to set integer type to string'))
			.then(() => t.end());
	});

	t.test('color', function (t) {
		prefs.setPref('huppercolor', 'white')
			.then(() => {
				t.fail('Should not allow to set color type to not hex string');
			})
			.catch(() => t.pass('Rejected to set color type to string'))
			.then(() => t.end());
	});

	t.test('array', function (t) {
		prefs.setPref('blocks', 'white')
			.then(() => {
				t.fail('Should not allow to set array type to string');
			})
			.catch(() => t.pass('Rejected to set array type to string'))
			.then(() => t.end());
	});

	t.test('control', function (t) {
		prefs.setPref('edittrolls', 'white')
			.then(() => {
				t.pass('For not validated type should not throw error');
			})
			.catch(err => t.fail(err, 'Should not throw if the type is not validated'))
			.then(() => t.end());
	});

	t.end();
});

test('core/prefs getPref', function (t) {
	prefs.setPref('huppercolor', '#B5D7BE')
		.then(() => prefs.getPref('huppercolor'))
		.then(color => {
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

		.then(() => {
			return new Promise(resolve => {
				prefs.getStorage().local.set({
					highlightusers: [{name: 'foo', color: '#0000aa'}]
				}, () => resolve());
			});
		})

		.then(() => prefs.addHighlightedUser('foo', '#ffffff'))
		.then(() => prefs.getCleanHighlightedUsers())
		.then(users => {
			t.equal(users.length, 1, 'Not added duplicated user');
			t.equal(users[0].name, 'foo', 'Name not changed');
			t.equal(users[0].color, '#ffffff', 'Color updated');
		})
		.catch(err => t.fail(err))
		.then(() => t.end());
});

test('core/prefs getCleanTrolls', function (t) {
	let trollsExample = ['foo', 'bar'];

	new Promise(resolve => {
		prefs.getStorage().local.set({
			trolls: null
		}, () => resolve());
	})
		.then(() => prefs.getCleanTrolls())
		.then(trolls => t.deepEqual(trolls, [], 'If trolls is null, it must return an empty array'))

		.then(() => {
			return new Promise(resolve => {
				prefs.getStorage().local.set({
					trolls: JSON.stringify(trollsExample)
				}, () => resolve());
			});
		})
		.then(() => prefs.getCleanTrolls())
		.then(trolls => t.deepEqual(trolls, trollsExample, 'Should parse trolls if stored as string'))

		.then(() => {
			return new Promise(resolve => {
				prefs.getStorage().local.set({
					trolls: 'foo,bar,baz'
				}, () => resolve());
			});
		})
		.then(() => prefs.getCleanTrolls())
		.then(trolls => t.deepEqual(trolls, ['foo', 'bar', 'baz'], 'Should return trolls object'))

		.then(() => {
			return new Promise(resolve => {
				prefs.getStorage().local.set({
					trolls: trollsExample
				}, () => resolve());
			});
		})
		.then(() => prefs.getCleanTrolls())
		.then(trolls => t.deepEqual(trollsExample, trolls, 'Should return trolls object'))

		.catch(err => t.fail(err))
		.then(() => t.end());
});

test('core/prefs removeTroll', function (t) {
	let trollsExample = ['foo', 'bar'];

	new Promise(resolve => {
		prefs.getStorage().local.set({
			trolls: trollsExample
		}, () => resolve());
	})
		.then(() => prefs.removeTroll('bar'))
		.then(() => prefs.getCleanTrolls())
		.then(trolls => {
			t.equal(trolls.length, 1, 'Only one trolls left');
			t.equal(trolls[0], 'foo', 'Removed troll bar');
		})

		.catch(err => t.fail(err))
		.then(() => t.end());
});

test('core/prefs addTroll', function (t) {
	let trollsExample = ['foo', 'bar'];

	new Promise(resolve => {
		prefs.getStorage().local.set({
			trolls: trollsExample
		}, () => resolve());
	})
		.then(() => prefs.addTroll('baz'))
		.then(() => prefs.getCleanTrolls())
		.then(trolls => {
			t.equal(trolls.length, 3, 'A new troll added');
			t.equal(trolls[2], 'baz', 'Troll baz added');
		})

		.then(() => prefs.addTroll('baz'))
		.then(() => prefs.getCleanTrolls())
		.then(trolls => {
			t.equal(trolls.length, 3, 'No duplicated troll added');
			t.equal(trolls.indexOf('baz'), trolls.lastIndexOf('baz'), 'No duplicated troll added');
		})

		.catch(err => t.fail(err))
		.then(() => t.end());
});

test('core/prefs getCleanTaxonomies', function (t) {
	let taxonomiesExample = ['foo', 'bar'];

	new Promise(resolve => {
		prefs.getStorage().local.set({
			hidetaxonomy: null
		}, () => resolve());
	})
		.then(() => prefs.getCleanTaxonomies())
		.then(taxonomies => t.deepEqual(taxonomies, [], 'If taxonomies is null, it must return an empty array'))

		.then(() => {
			return new Promise(resolve => {
				prefs.getStorage().local.set({
					hidetaxonomy: JSON.stringify(taxonomiesExample)
				}, () => resolve());
			});
		})
		.then(() => prefs.getCleanTaxonomies())
		.then(taxonomies => t.deepEqual(taxonomies, taxonomiesExample, 'Should parse taxonomies if stored as string'))


		.then(() => {
			return new Promise(resolve => {
				prefs.getStorage().local.set({
					hidetaxonomy: taxonomiesExample
				}, () => resolve());
			});
		})
		.then(() => prefs.getCleanTaxonomies())
		.then(taxonomies => t.deepEqual(taxonomiesExample, taxonomies, 'Should return taxonomies object'))

		.catch(err => t.fail(err))
		.then(() => t.end());
});

test('core/prefs removeTroll', function (t) {
	let taxonomiesExample = ['foo', 'bar'];

	new Promise(resolve => {
		prefs.getStorage().local.set({
			hidetaxonomy: taxonomiesExample
		}, () => resolve());
	})
		.then(() => prefs.removeTaxonomy('bar'))
		.then(() => prefs.getCleanTaxonomies())
		.then(taxonomies => {
			t.equal(taxonomies.length, 1, 'Only one taxonomies left');
			t.equal(taxonomies[0], 'foo', 'Removed taxonomy bar');
		})

		.catch(err => t.fail(err))
		.then(() => t.end());
});

test('core/prefs addTaxonomy', function (t) {
	let taxonomiesExample = ['foo', 'bar'];

	new Promise(resolve => {
		prefs.getStorage().local.set({
			hidetaxonomy: taxonomiesExample
		}, () => resolve());
	})
		.then(() => prefs.addTaxonomy('baz'))
		.then(() => prefs.getCleanTaxonomies())
		.then(taxonomies => {
			t.equal(taxonomies.length, 3, 'A new troll added');
			t.equal(taxonomies[2], 'baz', 'Troll baz added');
		})

		.then(() => prefs.addTaxonomy('baz'))
		.then(() => prefs.getCleanTaxonomies())
		.then(taxonomies => {
			t.equal(taxonomies.length, 3, 'No duplicated troll added');
			t.equal(taxonomies.indexOf('baz'), taxonomies.lastIndexOf('baz'), 'No duplicated troll added');
		})

		.catch(err => t.fail(err))
		.then(() => t.end());
});

test('core/prefs setCleanTaxonomies', function (t) {
	prefs.setCleanTaxonomies(['foo', 'bar', '  ', 'baz'])
		.then(() => prefs.getCleanTaxonomies())
		.then(taxonomies => {
			t.equal(taxonomies.length, 3, 'Empty taxonomy not added');
		})

		.catch(err => t.fail(err))
		.then(() => t.end());
});
