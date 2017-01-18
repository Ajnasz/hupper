import * as color from '../../core/color';

let test = require('tape');

var colors = [
	'#777777',
	'#666666',
	'#555555',
	'#444444',
	'#333333',
	'#222222',
	'#111111',
	'#000000',
	'#888888',
	'#999999',
	'#aaaaaa',
	'#bbbbbb',
	'#cccccc',
	'#dddddd',
	'#eeeeee',
	'#ffffff'
];


test('core/color.getContrastColor', (t) => {
	t.plan(1);

	let ok = colors.every(x => {
		let a = color.getContrastColor(x);
		let ratio = Math.max(color.calculateRatio(x, a), color.calculateRatio(a, x));
		if (ratio < 7) {
			// no possible better ratio
			if (
				Math.max(color.calculateRatio(x, '#ffffff'), color.calculateRatio('#ffffff', x)) > ratio ||
				Math.max(color.calculateRatio(x, '#000000'), color.calculateRatio('#000000', x)) > ratio
			) {
				t.fail(`Contrast ratio is smaller than 7 for color ${x}, calculated color is ${a}, ratio is ${ratio}`);
				return false;
			}
		}

		return true;
	});

	if (ok) {
		t.pass('Correct contrast ratios has been calculated');
	}

	t.end();
});
