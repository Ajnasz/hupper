import * as chromeHelpers from '../../chromeHelpers';
import * as tabsModule from '../../../lib/modules/tabs';
// import * as testUtil from '../../../core/testUtil';

const test = require('tape');

test('lib/modules/tabs', _ => {
	_.test('getTabs', __ => {
		__.test('returns existing hup tabs', t => {
			const tabs = [
				chromeHelpers.createTab('https://hup.hu/'),
				chromeHelpers.createTab('https://hup.hu/blog'),
				chromeHelpers.createTab('https://example.com/hup.hu/'),
				chromeHelpers.createTab('https://wiki.hup.hu/'),
			];

			tabs.forEach(chromeHelpers.addTab);
			const ret = tabsModule.getTabs();
			t.equal(Array.from(ret).length, 2, 'returned two tabs');
			t.ok(ret.has(tabs[0].id), 'has first hup');
			t.ok(ret.has(tabs[1].id), 'has second hup');
			t.notOk(ret.has(tabs[2].id), 'no not hup tab');
			t.notOk(ret.has(tabs[3].id), 'no hupwiki tab');

			chromeHelpers.clear();
			t.end();
		});
		__.end();
	});

	_.test('events', __ => {
		__.test('dispatching updateUrl event', t => {
			t.plan(3);
			const tab = chromeHelpers.createTab('https://hup.hu/');

			tabsModule.events.on('updateUrl', (e) => {
				t.pass('update url called');

				t.equal(e.tabID, tab.id, 'tab id matches');
				t.equal(e.url, tab.url, 'tab url matches');

				tabsModule.events.off('updateUrl');
				chromeHelpers.clear();
			});
			chromeHelpers.addTab(tab);
		});

		__.test('dispatching onRemove event', t => {
			t.plan(2);
			const tab = chromeHelpers.createTab('https://hup.hu/');
			chromeHelpers.addTab(tab);

			tabsModule.events.on('tabRemove', (e) => {
				t.pass('tabRemove called');
				t.equal(e.tabID, tab.id, 'tab id matches');

				tabsModule.events.off('tabRemove');
				chromeHelpers.clear();
			});

			chromeHelpers.removeTab(tab.id);
		});
	});
	_.end();
});
