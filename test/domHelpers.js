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
