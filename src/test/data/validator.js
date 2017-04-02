import * as validator from '../../data/validator';
import { setGlobals } from './../domHelpers';

const jsdom = require('jsdom');
const test = require('tape');

test('data.validator.validateElement', t => {
	const document = jsdom.jsdom(`<form action=" " method="" id="Form">
		<input type="text" name="elem" required id="Element" value="">
		</form>`);
	const window = document.defaultView;
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

	t.end();

});
test('data.validator.validate', t => {
	const document = jsdom.jsdom(`<form action=" " method="" id="Form">
		<input type="text" name="elem" required id="Element" value="">
		</form>`);
	const window = document.defaultView;
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
