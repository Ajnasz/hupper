import * as main from '../../../lib/core/main';

let test = require('tape');
import { prefs } from '../../../core/prefs';

test('lib/core/main', (t) => {
	t.test('trollUser', (t) => {
		main.trollUser('geza')
			.then(() => prefs.getPref('trolls'))
			.then(trolls => {
				t.ok(trolls.includes('geza'), 'troll added');
				t.end();
			});

	});

	t.test('trollUser', (t) => {
		main.trollUser('geza')
			.then(() => prefs.getPref('trolls'))
			.then(trolls => {
				t.ok(trolls.includes('geza'), 'troll added');
				t.end();
			});
	});

	t.test('untrollUser', (t) => {
		prefs.addTroll('geza')
			.then(() => main.untrollUser('geza'))
			.then(() => prefs.getPref('trolls'))
			.then(trolls => {
				t.notOk(trolls.includes('geza'), 'troll removed');
				t.end();
			});
	});

	t.test('highlightUser', (t) => {
		const color = '#aaffaa';
		prefs.setPref('huppercolor', color)
			.then(() => main.highlightUser('geza'))
			.then(() => prefs.getPref('highlightusers'))
			.then(users => {
				const user = users.filter(u => u.name === 'geza');
				t.equal(user.length, 1, 'user found');
				t.equal(user[0].color, color, 'user color set');
				t.end();
			});
	});

	t.test('unhighlightUser', (t) => {
		prefs.setPref('highlightusers', [{name: 'geza', color: '#ffaaff'}])
			.then(() => main.unhighlightUser('geza'))
			.then(() => prefs.getPref('highlightusers'))
			.then(users => {
				const user = users.filter(u => u.name === 'geza');
				t.equal(user.length, 0, 'user removed');
				t.end();
			});
	});

	t.end();
});
