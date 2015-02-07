(function (def) {
	'use strict';
	def('dom', function () {
		/**
		 * @param HTMLDOMElement element
		 * @param CSSSelector what
		 * @return boolean
		 */
		function is(element, what) {
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
		function findSibling(element, selector, sibling) {
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
		function next(element, selector) {
			return findSibling(element, selector);
		}

		/**
		 * @param element HTMLDOMElement
		 * @param selector string
		 */
		function prev(element, selector) {
			return findSibling(element, selector, 'prev');
		}

		function closest(element, selector) {
			var elem = element.parentNode;

			while (elem && !is(elem, selector)) {
				elem = elem.parentNode;
			}

			return elem || null;
		}

		return {
			next: next,
			prev: prev,
			closest: closest
		};
	});
}(window.def));
