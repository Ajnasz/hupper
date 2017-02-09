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

test('core/color.calculateRatio', (t) => {
	let ratio = color.calculateRatio('#ffffff', '#000000');
	t.equal(ratio, 21, 'Contrast of white to black is ok');
	t.end();
});

test('core/color.getRandomColor', t => {
	let rndColor = color.getRandomColor();

	t.ok(/^#[0-9a-f]{6}$/.test(rndColor), 'random hex color returned');

	t.end();
});
