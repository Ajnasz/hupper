import * as validator from '../../data/validator';
import { setGlobals } from './../domHelpers';

const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const test = require('tape');

test('data.validator.validateElement', t => {
	const window = new JSDOM(`<form action=" " method="" id="Form">
		<input type="text" name="elem" required id="Element" value="">
		<input type="text" name="elem" id="Novalidate" class="novalidate" value="" required>
		</form>`).window;
	const { document } = window;
	setGlobals(window);

	t.test('find invalid', t => {
		validator.validateElement([validator.createRule('[required]', () => Promise.reject(new Error('Required field')))], document.querySelector('#Element'))
			.then(() => {
				t.fail('Not found invalid element');
				t.end();
			})
			.catch((err) => {
				t.ok(err.error instanceof Error, 'Has error');
				t.equal(err.element, document.querySelector('#Element'), 'Has element');
				t.end();
			});
	});
	t.test('no error on valid', t => {
		validator.validateElement([validator.createRule('[required]', () => Promise.resolve())], document.querySelector('#Element'))
			.then(() => {
				t.ok('No error detected');
				t.end();
			})
			.catch((err) => {
				t.fail('Error found', err);
				t.end();
			});
	});

	t.test('novalidated element', (t) => {
		validator.validateElement([validator.createRule('[required]',
			() => Promise.reject(new Error('Required field')))], document.querySelector('#Novalidate'))
			.then(() => {
				t.pass('Skipped novalidate element');
				t.end();
			})
			.catch(() => {
				t.fail('Error detected on novalidate element');
				t.end();
			});
	});

	t.end();

});
test('data.validator.validate', t => {
	const window = new JSDOM(`<form action=" " method="" id="Form">
		<input type="text" name="elem" required id="Element" value="">
		</form>`).window;
	const { document } = window;
	setGlobals(window);

	t.test('find invalid', t => {
		validator.validate([validator.createRule('[required]', () => Promise.reject(new Error('Required field')))], document.querySelector('#Form'))
			.then(() => {
				t.fail('Not found invalid element');
				t.end();
			})
			.catch((err) => {
				t.ok(err.error instanceof Error, 'Has error');
				t.equal(err.element, document.querySelector('#Element'), 'Has element');
				t.end();
			});
	});

	t.test('find invalid', t => {
		validator.validate([validator.createRule('[required]', () => Promise.resolve())], document.querySelector('#Form'))
			.then(() => {
				t.pass('No error detected');
				t.end();
			})
			.catch((err) => {
				t.fail('Error found', err);
				t.end();
			});
	});
});

test('data/validator.createErrorMessage', (t) => {
	const window = new JSDOM(`<form action=" " method="" id="Form">
		<input type="text" name="elem" required id="Element" value="">
		</form>`).window;
	const { document } = window;

	setGlobals(window);

	const msg = 'Error message';
	const desc = 'Error description';

	const input = document.createElement('input');
	input.id = 'input-id';
	const node = validator.createErrorMessage(msg, desc, input);

	t.test('label', (t) => {
		const label = node.querySelector('label');
		t.equal(label.getAttribute('for'), input.id, 'label has the input id as for attribute');
		t.ok(label.className.includes(validator.CLASS_NAMES.ERROR_LABEL), 'error class added');
		t.equal(label.textContent, msg, 'label text set');
		t.end();
	});

	t.test('description', (t) => {
		const description = node.querySelector('p');
		t.ok(description.className.includes(validator.CLASS_NAMES.ERROR_DESCRIPTION), 'description class set');
		t.equal(description.textContent, desc, 'description text set');
		t.end();
	});

	t.test('container', (t) => {
		t.ok(node.className.includes(validator.CLASS_NAMES.ERROR_CONTAINER), 'container class set');
		t.end();
	});

	t.end();
});
