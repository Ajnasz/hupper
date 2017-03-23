import * as func from './func';

/**
 * @param HTMLDOMElement element
 * @param CSSSelector what
 * @return boolean
 */
function is (what, element) {
	if (element.matches) {
		return element.matches(what);
	} else if (element.mozMatchesSelector) {
		return element.mozMatchesSelector(what);
	}

	return false;
}

function findRelative (tester, getter, element) {
	let elem = element;

	return tester(elem) ? findRelative(tester, getter, getter(elem)) : (elem || null);
}

/**
 * @param element HTMLDOMElement
 * @param selector string
 * @param string sibling Use 'prev' if previous
 */
function findSibling (sibling, selector, element) {
	var elem = element,
		siblingName = sibling === 'prev' ? 'previousSibling' : 'nextSibling';

	return findRelative(
		elem => elem && (elem.nodeType !== Node.ELEMENT_NODE || !is(selector, elem)),
		elem => elem[siblingName],
		elem
	);
}

/**
 * @param element HTMLDOMElement
 * @param selector string
 */
const next = func.curry(findSibling, 'next');

/**
 * @param element HTMLDOMElement
 * @param selector string
 */
const prev = func.curry(findSibling, 'prev');

function closest (selector, element) {
	var elem = element.parentNode;

	return findRelative(
		elem => elem && !is(selector, elem),
		elem => elem.parentNode,
		elem
	);
}

function elemOrClosest (selector, element) {
	return is(selector, element) ? element : closest(selector, element);
}

function remove (element) {
	return element.parentNode.removeChild(element);
}

function addClass (className, elem) {
	return elem.classList.add(className);
	// return elem.classList.add.apply(elem.classList, classes);
}

function removeClass (className, elem) {
	elem.classList.remove(className);
}

function hasClass (className, elem) {
	return elem.classList.contains(className);
}

function attr (name, value, elem) {
	return elem.setAttribute(name, value);
}

function removeAttr (attrib, elem) {
	return elem.removeAttribute(attrib);
}

function text (textContent, element) {
	element.textContent = textContent;
}

function createElem (nodeType, attributes, classes, textContent) {
	var element = document.createElement(nodeType);

	if (attributes && attributes.length) {
		attributes.map((attrib) => func.curry(attr, attrib.name, attrib.value)).forEach(f => f(element));
	}

	if (classes && classes.length) {
		classes.map(className => func.curry(addClass, className)).forEach(f => f(element));
	}

	if (textContent) {
		text(textContent, element);
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

function selectOne (selector, element) {
	return element.querySelector(selector);
}

function addListener (event, callback, element) {
	return element.addEventListener(event, callback, false);
}

function removeListener (event, callback, element) {
	return element.removeEventListener(event, callback, false);
}

function append (to, elem) {
	to.appendChild(elem);
}

export {
	next,
	prev,
	closest,
	is,
	remove,
	createElem,
	empty,
	emptyText,
	elemOrClosest,
	addClass,
	removeClass,
	hasClass,
	selectOne,
	attr,
	removeAttr,
	addListener,
	removeListener,
	append,
};
