import * as dom from '../../../core/dom';
import { createEmitter } from '../../../core/events';

const TYPE = 'twitter';
const EVENTS = createEmitter();

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
		js.src = 'https://platform.twitter.com/widgets.js';
		fjs.parentNode.insertBefore(js, fjs);

		t._e = [];
		t.ready = function (f) {
			t._e.push(f);
		};

		return t;
	}(document, 'script', 'twitter-wjs'));
	const main = document.querySelector('.main-content');
	dom.removeClass('embed-blocked', main);
}

function provideUnblock () {
	const main = document.querySelector('.main-content');

	dom.addListener('click', function listener (e)  {
		if (dom.elemOrClosest('.twitter-tweet', e.target)) {
			dom.removeListener('click', listener, main);
			EVENTS.emit('unblock');
		}
	}, main);
	dom.addClass('embed-blocked', main);
}

export {
	EVENTS,
	TYPE,
	unblock,
	provideUnblock,
};
