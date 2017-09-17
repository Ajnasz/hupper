import url from '../../core/url';

let test = require('tape');

test('core/urli.searchParams', (t) => {
	t.test('toString', toStringT => {
		toStringT.equal(url.searchParams('foo=bar').toString(), 'foo=bar', 'should convert back');
		toStringT.equal(url.searchParams('foo=bar&foo=baz').toString(), 'foo=bar&foo=baz', 'should convert back same param with multi values');
		toStringT.equal(url.searchParams('?foo=bar').toString(), 'foo=bar', 'should ignore starting questionmark');
		toStringT.equal(url.searchParams('').toString(), '', 'Empty search string should return empty string');
		toStringT.end();
	});
	t.test('set', setT => {
		setT.equal(url.searchParams('foo=bar').set('baz', 'qux').toString(), 'foo=bar&baz=qux', 'should add baz param');
		setT.equal(url.searchParams('foo=bar').set('foo', 'qux').toString(), 'foo=qux', 'should overwrite param');
		setT.equal(url.searchParams('foo=bar&foo=baz').set('foo', 'qux').toString(), 'foo=qux', 'should overwrite multiple params');
		setT.equal(url.searchParams('').set('foo', 'qux').toString(), 'foo=qux', 'should add first search param');
		setT.end();
	});
	t.end();
});
