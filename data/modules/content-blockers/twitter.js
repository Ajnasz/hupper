import * as dom from '../../../core/dom';
import { createEmitter } from '../../../core/events';

const TYPE = 'twitter';
const EVENTS = createEmitter();

function listener (e)  {
	const embedElem = dom.elemOrClosest('.twitter-embed', e.target);
	if (embedElem) {
		EVENTS.emit('unblock');
	}
}

function findTwitterScript () {
	return dom.selectOne('script[src*="platform.twitter"]', document);
}

function unblock () {
	window.twttr = (function (d, s, id) {
		if (window.twttr) {
			return window.twttr;
		}

		if (document.getElementById(id)) {
			const elem = document.getElementById(id);
			elem.parentNode.removeChild(elem);
		}

		const fjs = d.getElementsByTagName(s)[0];
		const t = {};

		const js = d.createElement(s);
		js.id = id;
		js.src = findTwitterScript().src;
		fjs.parentNode.insertBefore(js, fjs);

		t._e = [];
		t.ready = function (f) {
			t._e.push(f);
		};

		return t;
	}(document, 'script', 'twitter-wjs'));

	const main = document.querySelector('.main-content');

	dom.selectAll('.twitter-embed', main).forEach(f => dom.removeClass('twitter-embed', f));
	dom.removeListener('click', listener, main);
}

function provideUnblock () {
	const main = document.querySelector('.main-content');

	dom.addListener('click', listener, main);

	dom.selectAll('.twitter-tweet', main).forEach(f => dom.addClass('twitter-embed', f.parentNode));
}

export {
	EVENTS,
	TYPE,
	unblock,
	provideUnblock,
};
