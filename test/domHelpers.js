const jsdom = require('jsdom');
const { JSDOM } = jsdom;

export function setGlobals (window) {
	global.document = window.document;
	global.window = window;
	Object.keys(window).forEach((property) => {
		if (typeof global[property] === 'undefined') {
			global[property] = window[property];
		}
	});

	global.Node = window.Node;

	global.navigator = {
		userAgent: 'node.js'
	};

}

export function readPage (filePath) {
	return JSDOM.fromFile(filePath).then(dom => dom.window.top).then(window => {
		setGlobals(window);
		return window;
	});
}
