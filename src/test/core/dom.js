import { setGlobals } from './../domHelpers';
import * as dom from  '../../core/dom';

const test = require('tape');
const jsdom = require('jsdom');

test('core/dom.is', (t) => {
	const document = jsdom.jsdom('<div class="foo-bar" data-foo="bar"></div>');
	const window = document.defaultView;
	setGlobals(window);

	t.ok(dom.is(document.querySelector('.foo-bar'), '.foo-bar'), 'class matched');
	t.ok(dom.is(document.querySelector('.foo-bar'), 'div'), 'element matched');
	t.ok(dom.is(document.querySelector('.foo-bar'), '[data-foo="bar"]'), 'attribute matched');
	t.notOk(dom.is(document.querySelector('.foo-bar'), 'span'), 'no false positive element match');

	t.end();
});

test('core/dom.next', (t) => {
	const document = jsdom.jsdom('<span>text bad!</span><span class="baz">text2 bad!</span>' +
		'<div class="foo-bar"></div><span>text1</span><em class="baz">text2</em>');
	const window = document.defaultView;
	setGlobals(window);

	t.equal(dom.next(document.querySelector('.foo-bar'), 'span').textContent, 'text1', 'next found by tag');
	t.equal(dom.next(document.querySelector('.foo-bar'), '.baz').textContent, 'text2', 'next found by class');

	t.end();
});

test('core/dom.prev', (t) => {
	const document = jsdom.jsdom('<span>text1</span><em class="baz">text2</em>' +
		'<div class="foo-bar"></div>' +
		'<span>text1 bad</span><span class="baz">text2 bad</span>');
	const window = document.defaultView;
	setGlobals(window);

	t.equal(dom.prev(document.querySelector('.foo-bar'), 'span').textContent, 'text1', 'prev found by tag');
	t.equal(dom.prev(document.querySelector('.foo-bar'), '.baz').textContent, 'text2', 'prev found by class');

	t.end();
});
