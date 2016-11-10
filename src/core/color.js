function getContrastRatio (r, g, b) {
	return ((r * 299) + (g * 587) + (b * 114)) / 1000;
}


function getContrastColor (hexcolor) {
	hexcolor = hexcolor[0] === '#' ? hexcolor.slice(1) : hexcolor;

	let r = parseInt(hexcolor.substr(0,2),16);
	let g = parseInt(hexcolor.substr(2,2),16);
	let b = parseInt(hexcolor.substr(4,2),16);

	return (getContrastRatio(r, g, b) >= 128) ? '#000000' : '#ffffff';
}

export { getContrastColor };
