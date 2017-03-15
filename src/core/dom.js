import * as func from './func';

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

	return false;
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

function elemOrClosest (element, selector) {
	return is(element, selector) ? element : closest(element, selector);
}

function remove (element) {
	return element.parentNode.removeChild(element);
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
	func.toArray(element.childNodes).filter(node => node.nodeType === Node.TEXT_NODE).forEach(remove);
}

export { next, prev, closest, is, remove, createElem, empty, emptyText, elemOrClosest };
