function index (array, cb) {
	for (let i = 0, al = array.length; i < al; i++) {
		if (cb(array[i])) {
			return i;
		}
	}

	return -1;
}

function first (array, cb) {
	let i = index(array, cb);

	if (i > -1) {
		return array[i];
	}

	return null;
}

/**
 * @param NodeList list
 * @return {HTMLDOMElement[]}
 */
function toArray (list) {
	return Array.prototype.slice.call(list);
}

function partial (func) {
	let pArgs = toArray(arguments).slice(1);

	return function () {
		func.apply(this, pArgs.concat(toArray(arguments)));
	};
}

function inArray (array, item) {
	return array.indexOf(item) > -1;
}


export { first, index, partial, toArray, inArray };
