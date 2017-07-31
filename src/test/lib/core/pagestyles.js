import getPageStyle from '../../../lib/core/pagestyles';

const test = require('tape');

test('lib/core/pagestyles', (t) => {
	const res = getPageStyle();
	t.pass('not throw if no argument');
	t.ok(Array.isArray(res), 'returns an array');

	t.test('minFontSize', (t) => {
		const res1 = getPageStyle({minFontSize: 2});
		const exp1 =  'body,#all,#top-nav,#top-nav a,' +
			'.sidebar .block .content,#footer,' +
			'.node .links{font-size:2px !important;}';

		t.equal(res1.length, 1, 'has style');
		t.ok(res1.includes(exp1), 'generates correct font size rule');

		const res2 = getPageStyle({minFontSize: 0});
		t.equal(res2.length, 0, 'not generating font size if its 0');

		const res3 = getPageStyle({minFontSize: -1});
		t.equal(res3.length, 0, 'not generating font size if its less than 0');

		t.end();
	});

	t.test('minWidth', (t) => {
		const res1 = getPageStyle({minWidth: 2});
		const exp1 = '.sidebar{min-width:2px !important;}';

		t.equal(res1.length, 1, 'has style');
		t.ok(res1.includes(exp1), 'generates correct min-width rule');

		const res2 = getPageStyle({minWidth: 0});
		t.equal(res2.length, 0, 'not generating min-width if its 0');

		const res3 = getPageStyle({minWidth: -1});
		t.equal(res3.length, 0, 'not generating min-width if its less than 0');
		t.end();
	});

	t.test('hideLeftSidebar', (t) => {
		const res1 = getPageStyle({hideLeftSidebar: 2});
		const exp1 = '#sidebar-left{display:none !important;}';

		t.equal(res1.length, 1, 'has style');
		t.ok(res1.includes(exp1), 'generates correct rule to hide left sidebar');

		const res2 = getPageStyle({hideLeftSidebar: false});
		t.equal(res2.length, 0, 'not generating left sidebar menu');

		t.end();
	});

	t.test('hideRightSidebar', (t) => {
		const res1 = getPageStyle({hideRightSidebar: 2});
		const exp1 = '#sidebar-right{display:none !important;}';

		t.equal(res1.length, 1, 'has style');
		t.ok(res1.includes(exp1), 'generates correct rule to hide right sidebar');

		const res2 = getPageStyle({hideRightSidebar: false});
		t.equal(res2.length, 0, 'not generating right sidebar menu');

		t.end();
	});
	t.end();
});
