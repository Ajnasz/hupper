import { random, padStart, sortBy, maxBy } from './func';

var colors = new Set();
colors.add('#000000');
colors.add('#111111');
colors.add('#222222');
colors.add('#333333');
colors.add('#444444');
colors.add('#555555');
colors.add('#666666');
colors.add('#777777');
colors.add('#888888');
colors.add('#999999');
colors.add('#aaaaaa');
colors.add('#bbbbbb');
colors.add('#cccccc');
colors.add('#dddddd');
colors.add('#eeeeee');
colors.add('#ffffff');

function getRandomColor () {
	return '#' + [random(0, 256, true), random(0, 256, true), random(0, 256, true)].map(c => padStart(c.toString('16'), 2, '0')).join('');
}

function getsRGB (c) {
	return (c <= 0.03928) ? c / 12.92 : Math.pow(((c + 0.055) / 1.055), 2.4);
}

function getLuminanace (r8bit, g8bit, b8bit) {
	let r = r8bit / 255,
		g = g8bit / 255,
		b = b8bit / 255;

	return 0.2126 * getsRGB(r) + 0.7152 * getsRGB(g) + 0.0722 * getsRGB(b);
}

function hex2rgb (hexcolor) {
	hexcolor = hexcolor[0] === '#' ? hexcolor.slice(1) : hexcolor;

	return [
		parseInt(hexcolor.substr(0,2), 16),
		parseInt(hexcolor.substr(2,2), 16),
		parseInt(hexcolor.substr(4,2), 16)
	];
}

function calculateRatio (colorA, colorB) {
	let lumiA = getLuminanace(...hex2rgb(colorA));
	let lumiB = getLuminanace(...hex2rgb(colorB));

	return (lumiA + 0.05) / (lumiB + 0.05);
}

function getContrastColor (hexBGColor) {
	let ratios = [];
	for (let color of colors) {
		ratios.push({color, ratio: Math.max(calculateRatio(hexBGColor, color), calculateRatio(color, hexBGColor))});
	}

	sortBy(ratios, 'ratio').reverse();

	let output = ratios.filter(r => r.ratio >= 7)
		.reduce(
			(acc, r) => acc.ratio > r.ratio ? r : acc,
			{color: null, ratio: Infinity}
		);

	if (!output || !output.color) {
		let color = getLuminanace(...hex2rgb(hexBGColor)) >= 128 ? '#000000' : '#ffffff';
		output = maxBy([
			maxBy(ratios, 'ratio'),
			{
				color,
				ratio: Math.max(calculateRatio(hexBGColor, color), calculateRatio(color, hexBGColor))
			}
		], 'ratio');
	}

	return output.color;
}

export { getContrastColor, getRandomColor, calculateRatio };
