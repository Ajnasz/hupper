import { createLogger } from '../../core/log';

let test = require('tape');

test('core/log calling logger function', t => {
	t.plan(2);
	let log = createLogger();

	log.enabled = true;
	let called = 0;
	log.logger = {
		info (thing) {
			++called;
			return thing;
		}
	};

	let input = 'Lorem ipsum' + Math.random();

	t.equal(log.info(input), input, 'Called logger');
	t.equal(called, 1, 'Called logger only once');
	t.end();
});

test('core/log not calling logger function if logging disabled', t => {
	t.plan(1);
	let log = createLogger();
	log.enabled = false;
	let called = 0;

	log.logger = {
		info (thing) {
			++called;
			return thing;
		}
	};

	log.info('asfd');

	t.equal(called, 0, 'logger not called while disabled');

	log.logger = null;
	log.enabled = false;
	t.end();
});

test('core/log should return undef if trying to get an undefined function', t => {
	t.plan(1);
	let log = createLogger();

	log.logger = {
		info (thing) {
			return thing;
		}
	};

	t.equal(log.nonExistentMethod, void(0), 'undefined method');

	log.logger = null;
	log.enabled = false;
	t.end();
});
