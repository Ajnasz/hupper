import * as dom from '../../../core/dom';
import * as func from '../../../core/func';
import { createEmitter } from '../../../core/events';

const TYPE = 'youtube';
const EVENTS = createEmitter();

const CONTAINER_CLASS = 'youtube-embed';

const FRAME_SELECTOR = 'iframe[src^="https://www.youtube.com/embed/"]';

const addContainerClass = func.curry(dom.addClass, CONTAINER_CLASS);

function provideUnblock () {
	const main = document.querySelector('.main-content');

	dom.selectAll(FRAME_SELECTOR, main).forEach(f => addContainerClass(f.parentNode));
	dom.addClass('embed-blocked', main);
}

export {
	EVENTS,
	TYPE,
	provideUnblock,
};

