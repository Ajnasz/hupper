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

exports.index = index;
exports.first = first;
