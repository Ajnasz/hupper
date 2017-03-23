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

	return tester(elem) ?
		findRelative(tester, getter, getter(elem)) :
		(elem || null);
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
	element.parentNode.removeChild(element);

	return element;
}

function addClass (className, elem) {
	elem.classList.add(className);
	return elem;
}

function addClasses (classNames, elem) {
	classNames.forEach(cn => addClass(cn, elem));

	return elem;
}

function removeClass (className, elem) {
	elem.classList.remove(className);

	return elem;
}

function hasClass (className, elem) {
	return elem.classList.contains(className);
}

function attr (name, value, elem) {
	elem.setAttribute(name, value);

	return elem;
}

function removeAttr (attrib, elem) {
	elem.removeAttribute(attrib);

	return elem;
}

function text (textContent, element) {
	element.textContent = textContent;

	return element;
}

function createElem (nodeType, attributes, classes, textContent) {
	var element = document.createElement(nodeType);

	if (attributes && attributes.length) {
		attributes.map((attrib) => func.curry(attr, attrib.name, attrib.value)).forEach(f => f(element));
	}

	if (classes && classes.length) {
		addClasses(classes, element);
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

	return element;
}

function emptyText (element) {
	func.toArray(element.childNodes).filter(node => node.nodeType === Node.TEXT_NODE).forEach(remove);

	return element;
}

function selectOne (selector, element) {
	return element.querySelector(selector);
}

function addListener (event, callback, element) {
	element.addEventListener(event, callback, false);

	return element;
}

function removeListener (event, callback, element) {
	element.removeEventListener(event, callback, false);

	return element;
}

function append (to, elem) {
	to.appendChild(elem);
	return elem;
}

function data (name, value, elem) {
	elem.dataset[name] = value;

	return elem;
}

function prop (name, value, elem) {
	elem[name] = !!value;

	return elem;
}

function val (value, elem) {
	elem.value = value;

	return elem;
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
	addClasses,
	removeClass,
	hasClass,
	selectOne,
	attr,
	removeAttr,
	addListener,
	removeListener,
	append,
	data,
	prop,
	val,
	text
};
