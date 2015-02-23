/*jshint moz:true*/
/*global exports, define*/
(function () {
	'use strict';
	function index(array, cb) {
		for (let i = 0, al = array.length; i < al; i++) {
			if (cb(array[i])) {
				return i;
			}
		}

		return -1;
	}

	function first(array, cb) {
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
		return Array.prototype.slice.call(list);
	}

	function partial(func) {
		let pArgs = toArray(arguments).slice(1);

		return function() {
			func.apply(this, pArgs.concat(toArray(arguments)));
		};
	}

	if (typeof exports !== 'undefined') {
		exports.index = index;
		exports.first = first;
		exports.partial = partial;
	} else {
		define('./core/func', function (exports) {
			exports.index = index;
			exports.first = first;
			exports.partial = partial;
		});
	}
}());
