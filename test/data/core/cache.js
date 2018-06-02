import cache from '../../../core/cache';
import time from '../../../core/time';

const test = require('tape');

test('core/cache', (t) => {
	t.equal(cache.get('no-such-item'), null, 'returns null for non exisiting key');
	cache.set('foo', 'bar', time.SECOND);
	t.equal(cache.get('foo'), 'bar', 'returns cached item');
	t.end();
});
