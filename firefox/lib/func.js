/*jshint moz:true*/
/*global exports*/
function index(array, cb) {
	'use strict';
	for (let i = 0, al = array.length; i < al; i++) {
		if (cb(array[i])) {
			return i;
		}
	}

	return -1;
}

function first(array, cb) {
	'use strict';
	let i = index(array, cb);

	if (i > -1) {
		return array[i];
	}

	return null;
}

/*
 * @param NodeList list
 * @return {HTMLDOMElement[]}
 */
function toArray(list) {
	'use strict';
	return Array.prototype.slice.call(list);
}

function partial(func) {
	'use strict';
	let pArgs = toArray(arguments).slice(1);

	return function() {
		func.apply(this, pArgs.concat(toArray(arguments)));
	};
}

exports.index = index;
exports.first = first;
exports.partial = partial;
