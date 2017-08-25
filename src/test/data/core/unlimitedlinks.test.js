import * as unlimitedLinks from '../../../data/core/unlimitedlinks';
import { random } from '../../../core/func';

const test = require('tape');

test('data/core/unlimitedlinks', (t) => {

	function toHref (obj) {
		return [
			'search',
			'protocol',
			'hostname',
			'port',
			'pathname',
			'search',
			'hash'
		].reduce((out, key) => {
			const value = obj[key];
			if (value === '') {
				return out;
			}

			switch (key) {
				case 'protocol':
					out += `${value}//`;
					break;
				case 'port':
					out += `:${value}`;
					break;
				default:
					out += value;
			}

			return out;
		}, '');
	}

	function createURL (details) {
		const urlObj = Object.assign({
			search: '',
			protocol: 'https:',
			pathname: '',
			hostname: 'hup.hu',
			port: '',
			hash: ''
		}, details);

		return Object.assign(urlObj, { href: toHref(urlObj) });
	}
	const testCases = [
		{
			url: {
				hostname: 'hup.hu',
				pathname: '/user/4419'
			},
			result: false,
		},
		{
			url: {
				hostname: 'hupp.hu',
				pathname: '/cikkek/foo-bar-baz'
			},
			result: false,
		},
		{
			url: {
				hostname: 'hup.hu',
				pathname: '/node/foo-bar-baz',
			},
			result: true,
		},
		{
			url: {
				hostname: 'hup.hu',
				pathname: '/cikkek/foo-bar-baz'
			},
			result: true,
		},
		{
			url: {
				hostname: 'hup.hu',
				pathname: '/node/foo-bar-baz'
			},
			result: true,
		},
		{
			url: {
				hostname: 'hup.hu',
				pathname: '/szavazasok/foo-bar-baz'
			},
			result: true,
		},
		{
			url: {
				hostname: 'hup.hu',
				pathname: '/promo/foo-bar-baz'
			},
			result: true,
		},
		{
			url: {
				hostname: 'hup.hu',
				pathname: '/treyblog/foo-bar-baz'
			},
			result: true,
		},
	];

	testCases.forEach(testCase => {
		const { url, result } = testCase;
		const MAX_COMMENTS = random(100, 1000);
		const obj = createURL(url);
		unlimitedLinks.setUnlimitedLinks([obj], MAX_COMMENTS);

		if (result) {
			t.ok(obj.search.includes(`comments_per_page=${MAX_COMMENTS}`), `extended on ${url.hostname} ${url.pathname}`);
		} else {
			t.notOk(obj.search.includes(`comments_per_page=${MAX_COMMENTS}`), `extended on ${url.hostname} ${url.pathname}`);
		}
	});
	t.end();
});
