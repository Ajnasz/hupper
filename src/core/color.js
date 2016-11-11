var colors = new Set();
colors.add('#666666');
colors.add('#555555');
colors.add('#444444');
colors.add('#333333');
colors.add('#222222');
colors.add('#111111');
colors.add('#000000');
colors.add('#888888');
colors.add('#999999');
colors.add('#aaaaaa');
colors.add('#bbbbbb');
colors.add('#cccccc');
colors.add('#dddddd');
colors.add('#eeeeee');
colors.add('#ffffff');

function getLuminanace (r, g, b) {
	return ((r * 299) + (g * 587) + (b * 114)) / 1000;
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

	return lumiA < 128 ?
		(lumiB + 0.05) / (lumiA + 0.05) :
		(lumiA + 0.05) / (lumiB + 0.05);
}

function getContrastColor (hexcolor) {
	// let base = getLuminanace(...hex2rgb(hexcolor));
	// let chosenColors = base >= 128 ? darkColors : lightColors;
	let ratios = [];
	for (let c of colors) {
		ratios.push({color: c, ratio: calculateRatio(hexcolor, c)});
	}

	let output = ratios.filter(r => r.ratio > 4.5).reduce((acc, r) => {
		if (acc.ratio > r.ratio) {
			return r;
		}

		return acc;
	}, {color: null, ratio: Infinity});

	if (!output || !output.color) {
		return getLuminanace(...hex2rgb(hexcolor)) >= 128 ? '#000000' : '#ffffff';
	}

	return output.color;
}

export { getContrastColor };
