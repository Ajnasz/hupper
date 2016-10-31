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
		return func.apply(this, pArgs.concat(toArray(arguments)));
	};
}

function inArray (array, item) {
	return array.indexOf(item) > -1;
}

function yesOrNo (isOk, yes, no) {
	return isOk ? yes() : no();
}

function sortBy (array, field) {
	return array.sort((a, b) => {
		let aVal = a[field],
			bVal = b[field];

		if (aVal > bVal) {
			return 1;
		} else if (aVal < bVal) {
			return -1;
		}

		return 0;
	});
}

function groupBy (array, field) {
	return array.reduce((acc, item) => {
		if (!acc[item[field]]) {
			acc[item[field]] = [];
		}

		acc[item[field]].push(item);

		return acc;
	}, {});
}



export { first, index, partial, toArray, inArray, yesOrNo, sortBy, groupBy };
