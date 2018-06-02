import time from '../../core/time';

const test = require('tape');

test('core/time', (t) => {
	t.ok(time.SECOND, 'has second');
	t.ok(time.MINUTE, 'has minute');
	t.ok(time.HOUR, 'has hour');
	t.ok(time.DAY, 'has day');
	t.end();
});
