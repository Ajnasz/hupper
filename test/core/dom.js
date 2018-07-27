import DOMpurify from 'dompurify';
import { setGlobals } from './../domHelpers';
import * as dom from  '../../core/dom';

const test = require('tape');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

test('core/dom.is', (t) => {
	const window = new JSDOM('<div class="foo-bar" data-foo="bar"></div>').window;
	const { document } = window;
	setGlobals(window);

	t.ok(dom.is('.foo-bar', document.querySelector('.foo-bar')), 'class matched');
	t.ok(dom.is('div', document.querySelector('.foo-bar')), 'element matched');
	t.ok(dom.is('[data-foo="bar"]', document.querySelector('.foo-bar')), 'attribute matched');
	t.notOk(dom.is('span', document.querySelector('.foo-bar')), 'no false positive element match');

	t.end();
});

test('core/dom.next', (t) => {
	const window = new JSDOM('<span>text bad!</span><span class="baz">text2 bad!</span>' +
		'<div class="foo-bar"></div><span>text1</span><em class="baz">text2</em>').window;
	const { document } = window;
	setGlobals(window);

	t.equal(dom.next('span', document.querySelector('.foo-bar')).textContent, 'text1', 'next found by tag');
	t.equal(dom.next('.baz', document.querySelector('.foo-bar')).textContent, 'text2', 'next found by class');

	t.end();
});

test('core/dom.prev', (t) => {
	const window = new JSDOM('<span>text1</span><em class="baz">text2</em>' +
		'<div class="foo-bar"></div>' +
		'<span>text1 bad</span><span class="baz">text2 bad</span>').window;
	const { document } = window;
	setGlobals(window);

	t.equal(dom.prev('span', document.querySelector('.foo-bar')).textContent, 'text1', 'prev found by tag');
	t.equal(dom.prev('.baz', document.querySelector('.foo-bar')).textContent, 'text2', 'prev found by class');

	t.end();
});

test('core/dom.closest', (t) => {
	const window = new JSDOM('<span class="close" id="Close"><span><span class="elem"></span></span></span>').window;
	const { document } = window;
	setGlobals(window);

	t.equal(dom.closest('.close', document.querySelector('.elem')).id, 'Close', 'Closest span by class found');
	t.equal(dom.closest('.nosuch', document.querySelector('.elem')), null, 'Closest span by class found');

	t.end();
});

test('core/dom.elemOrClosest', (test) => {
	test.test('closest', t => {
		const window = new JSDOM('<span class="close" id="Close"><span><span class="elem" id="Elem"></span></span></span>').window;
		const { document } = window;
		setGlobals(window);

		t.equal(dom.elemOrClosest('.close', document.querySelector('.elem')).id, 'Close', 'Closest span by class found');

		t.end();
	});
	test.test('elem', t => {
		const window = new JSDOM('<span class="close" id="Close"><span><span class="close elem" id="Elem"></span></span></span>').window;
		const { document } = window;
		setGlobals(window);

		const actual = dom.elemOrClosest('.close', document.querySelector('.elem'));
		const expected = document.querySelector('#Elem');

		t.equal(actual, expected, 'Elem span by class found');

		t.end();
	});
});

test('core/dom.remove', t => {
	const window = new JSDOM('<span class="elem1"><span class="elem2"><span class="elem3"></span></span></span>').window;
	const { document } = window;
	setGlobals(window);

	dom.remove(document.querySelector('.elem3'));

	t.equal(document.querySelector('.elem3'), null, 'elem not found anymore in document');

	t.end();
});

test('core/dom.addClass', t => {
	const window = new JSDOM('<span class="elem1"></span>').window;
	const { document } = window;
	setGlobals(window);

	dom.addClass('aClass', document.querySelector('.elem1'));

	t.ok(document.querySelector('.elem1').classList.contains('aClass'), 'class added');

	t.end();
});

test('core/dom.addClasses', t => {
	const window = new JSDOM('<span class="elem1"></span>').window;
	const { document } = window;
	setGlobals(window);

	const elem = document.querySelector('.elem1');

	dom.addClasses(['aClass', 'bClass', 'cClass'], elem);

	t.ok(elem.classList.contains('aClass'), 'one class removed');
	t.ok(elem.classList.contains('bClass'), 'two class removed');
	t.ok(elem.classList.contains('cClass'), 'three class removed');

	t.end();
});

test('core/dom.removeClass', t => {
	const window = new JSDOM('<span class="elem1 aClass"></span>').window;
	const { document } = window;
	setGlobals(window);

	const elem = document.querySelector('.elem1');

	dom.removeClass('aClass', elem);

	t.notOk(elem.classList.contains('aClass'), 'class removed');

	t.end();
});

test('core/dom.hasClass', t => {
	const window = new JSDOM('<span class="elem1"></span>').window;
	const { document } = window;
	setGlobals(window);

	const elem = document.querySelector('.elem1');

	t.ok(dom.hasClass('elem1', elem), 'class found');
	t.notOk(dom.hasClass('aClass', elem), 'not added class not found');

	t.end();
});

test('core/dom.attr', t => {
	const window = new JSDOM('<input class="elem1">').window;
	const { document } = window;
	setGlobals(window);

	const elem = document.querySelector('.elem1');

	t.equal(dom.attr('type', 'text', elem), elem, 'returns the element');
	t.equal(elem.getAttribute('type'), 'text', 'attribute set');
	dom.attr('type', 'password', elem);
	t.equal(elem.getAttribute('type'), 'password', 'attribute set');

	t.end();
});

test('core/dom.removeAttr', t => {
	const window = new JSDOM('<input class="elem1" type="text">').window;
	const document = window.document;
	setGlobals(window);

	const elem = document.querySelector('.elem1');

	t.equal(dom.removeAttr('type', elem), elem, 'returns the element');
	t.equal(elem.getAttribute('type'), null, 'attribute removed');

	t.end();
});

test('core/dom.text', t => {
	const window = new JSDOM('<span class="elem1"></span>').window;
	const document = window.document;
	setGlobals(window);

	const elem = document.querySelector('.elem1');
	const text = 'Foobar';

	dom.text(text, elem);

	t.equal(elem.textContent, text, 'Text content set');

	t.end();
});

test('core/dom.value', t => {
	const window = new JSDOM('<span class="elem1"></span>').window;
	const document = window.document;
	setGlobals(window);

	const elem = document.querySelector('.elem1');
	const text = 'Foobar';

	dom.val(text, elem);

	t.equal(elem.value, text, 'elem value set');

	t.end();
});

test('core/dom.empty', t => {
	const window = new JSDOM('<span class="elem1"><span></span> TEXT<span><span><span></span>Text</span></span></span>').window;
	const document = window.document;
	setGlobals(window);

	const elem = document.querySelector('.elem1');

	dom.empty(elem);

	t.equal(elem.childNodes.length, 0, 'no childnodes');
	t.equal(elem.textContent, '', 'no text content');

	t.end();
});

test('core/dom.emptyText', t => {
	const window = new JSDOM('<span class="elem1"><span></span> TEXT<span><span><span></span>Text</span></span></span>').window;
	const { document } = window;
	setGlobals(window);

	const elem = document.querySelector('.elem1');

	dom.emptyText(elem);

	t.equal(elem.childNodes.length, 2, 'has childnodes');
	t.equal(elem.textContent, '', 'no text content');

	t.end();
});

test('core/dom.selectOne', t => {
	const window = new JSDOM('<span class="elem1" id="FirstElem"><span id="SecondElem" class="elem1"></span></span><span class="elem1"></span>').window;
	const { document } = window;
	setGlobals(window);

	t.test('select from document', t => {
		const acutal = dom.selectOne('.elem1', document);
		const expected = document.querySelector('#FirstElem');

		t.equal(acutal, expected, 'selected the first element');

		t.end();
	});

	t.test('select from a childnode', t => {
		const acutal = dom.selectOne('.elem1', document.querySelector('#FirstElem'));
		const expected = document.querySelector('#SecondElem');

		t.equal(acutal, expected, 'selected the first element');

		t.end();
	});


	t.end();
});

test('core/dom.prop', t => {
	const window = new JSDOM('<input type="checkbox" class="elem1">').window;
	const { document } = window;
	setGlobals(window);

	const elem = document.querySelector('.elem1');

	dom.prop('disabled', true, elem);

	t.ok(elem.disabled, 'elem set to disabled');

	dom.prop('disabled', false, elem);
	t.notOk(elem.disabled, 'elem set to disabled');

	t.end();
});

test('core/dom.append', t => {
	const window = new JSDOM('<span class="elem1"></span>').window;
	const { document } = window;
	setGlobals(window);

	const elem = document.querySelector('.elem1');
	const elem2 = document.createElement('div');
	elem2.id = 'Foo';

	dom.append(elem, elem2);

	t.equal(elem.firstChild, elem2, 'elem appended');

	t.end();
});

test('core/dom.createElem', t => {
	const window = new JSDOM('<span class="elem1"></span>').window;
	setGlobals(window);

	t.test('just create element', t => {
		const elem = dom.createElem('div');

		t.equal(elem.nodeType, Node.ELEMENT_NODE, 'Element node created');
		t.equal(elem.nodeName, 'DIV', 'has DIV nodename');

		t.end();
	});

	t.test('create element with attribute', t => {
		const elem = dom.createElem('input', [{
			name: 'type',
			value: 'text'
		}]);

		t.equal(elem.nodeType, Node.ELEMENT_NODE, 'Element node created');
		t.equal(elem.nodeName, 'INPUT', 'has INPUT nodename');
		t.equal(elem.type, 'text', 'type text set');

		t.end();
	});

	t.test('create element with classes', t => {
		const elem = dom.createElem('input', null, ['foo', 'bar', 'baz']);

		t.equal(elem.nodeType, Node.ELEMENT_NODE, 'Element node created');
		t.equal(elem.nodeName, 'INPUT', 'has INPUT nodename');
		t.ok(elem.classList.contains('foo'), 'has foo class');
		t.ok(elem.classList.contains('bar'), 'has bar class');
		t.ok(elem.classList.contains('baz'), 'has baz class');

		t.end();
	});

	t.test('create element with text content', t => {
		const elem = dom.createElem('div', null, null, 'foo');

		t.equal(elem.nodeType, Node.ELEMENT_NODE, 'Element node created');
		t.equal(elem.nodeName, 'DIV', 'has INPUT nodename');
		t.equal(elem.textContent, 'foo');

		t.end();
	});

	t.end();
});

test('core/dom.fixHTML', t => {
	const window = new JSDOM('<span class="elem1"></span>').window;
	setGlobals(window);

	t.test('one missing tag', t => {
		const actual = dom.fixHTML('<span>asdfsdafsdaf');
		const expected = '<span>asdfsdafsdaf</span>';

		t.equal(actual, expected, 'html fixed');

		t.end();
	});

	t.test('nested a bit', t => {
		const actual = dom.fixHTML('<p>asdfsdafsdaf<span>asdf');
		const expected = '<p>asdfsdafsdaf<span>asdf</span></p>';

		t.equal(actual, expected, 'html fixed');

		t.end();
	});

	t.end();
});

test.skip('core/dom.data', t => {
	const window = new JSDOM('<span class="elem1"></span>').window;
	const document = window.document;
	setGlobals(window);

	const elem = document.querySelector('.elem1');

	dom.data('foo', 'bar', elem);

	t.equal(elem.dataset.foo, 'bar', 'data set');

	t.end();
});
