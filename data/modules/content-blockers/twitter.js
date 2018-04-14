import * as dom from '../../../core/dom';
import { createEmitter } from '../../../core/events';

const TYPE = 'twitter';
const EVENTS = createEmitter();

function provideUnblock () {
	const main = document.querySelector('.main-content');

	dom.selectAll('.twitter-tweet', main).forEach(f => dom.addClass('twitter-embed', f.parentNode));
}

export {
	EVENTS,
	TYPE,
	provideUnblock,
};
