import * as func from '../../core/func';

/**
 * @param HTMLDOMElement element
 * @param CSSSelector what
 * @return boolean
 */
function is (element, what) {
	if (element.matches) {
		return element.matches(what);
	} else if (element.mozMatchesSelector) {
		return element.mozMatchesSelector(what);
	}
}

	/**
	 * @param element HTMLDOMElement
	 * @param selector string
	 * @param string sibling Use 'prev' if previous
	 */
function findSibling (element, selector, sibling) {
	var elem = element,
		siblingName = sibling === 'prev' ? 'previousSibling' : 'nextSibling';

	while (elem && (elem.nodeType !== Node.ELEMENT_NODE || !is(elem, selector))) {
		elem = elem[siblingName];
	}

	return elem || null;
}

/**
 * @param element HTMLDOMElement
 * @param selector string
 */
function next (element, selector) {
	return findSibling(element, selector);
}

/**
 * @param element HTMLDOMElement
 * @param selector string
 */
function prev (element, selector) {
	return findSibling(element, selector, 'prev');
}

function closest (element, selector) {
	var elem = element.parentNode;

	while (elem && !is(elem, selector)) {
		elem = elem.parentNode;
	}

	return elem || null;
}

function remove (element) {
	return element.parentNode.removeChild(element);
}

function findCommonParent (elements) {
	var index, parent, maxIndex;

	elements = elements.filter((x) => x !== null);

	maxIndex = elements.length - 1;
	index = 0;
	parent = elements[index].parentNode;

	while (true) {
		if (index < maxIndex) {
			if (!parent.contains(elements[index + 1])) {
				parent = parent.parentNode;

				if (!parent) {
					// parent = null;
					break;
				}
			} else {
				index += 1;
			}
		} else {
			break;
		}

	}

	return parent;
}

function createElem (nodeType, attributes, classes, text) {
	var element = document.createElement(nodeType);

	if (attributes && attributes.length) {
		attributes.forEach(function (attrib) {
			element.setAttribute(attrib.name, attrib.value);
		});
	}

	if (classes && classes.length) {
		element.classList.add.apply(element.classList, classes);
	}

	if (text) {
		element.textContent = text;
	}

	return element;
}

function empty (element) {
	while (element.firstChild) {
		element.removeChild(element.firstChild);
	}
}

function emptyText (element) {
	func.toArray(element.childNodes).filter(function (node) {
		return node.nodeType === Node.TEXT_NODE;
	}).forEach(remove);
}

export { next, prev, closest, is, remove, createElem, findCommonParent, empty, emptyText };
