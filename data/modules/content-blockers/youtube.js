import * as dom from '../../../core/dom';
import * as func from '../../../core/func';
import { createEmitter } from '../../../core/events';

const TYPE = 'youtube';
const EVENTS = createEmitter();

const CONTAINER_CLASS = 'youtube-embed';
const CONTAINER_SELECTOR = `.${CONTAINER_CLASS}`;

const FRAME_SELECTOR = 'iframe[src^="https://www.youtube.com/embed/"]';

const addContainerClass = func.curry(dom.addClass, CONTAINER_CLASS);
const removeContainerClass = func.curry(dom.removeClass, CONTAINER_CLASS);
const reloadFrame = f => f.src = f.src;

function listener (e)  {
	const { target } = e;

	if (dom.elemOrClosest(CONTAINER_SELECTOR, target)) {
		EVENTS.emit('unblock');
	}
}

function unblock () {
	const main = document.querySelector('.main-content');
	const frames = dom.selectAll(FRAME_SELECTOR, main);

	frames.map(frame => {
		removeContainerClass(frame.parentNode);
		reloadFrame(frame);
	});

	dom.removeListener('click', listener, main);
}

function provideUnblock () {
	const main = document.querySelector('.main-content');

	dom.addListener('click', listener, main);
	dom.selectAll(FRAME_SELECTOR, main).forEach(f => addContainerClass(f.parentNode));
	dom.addClass('embed-blocked', main);
}

export {
	EVENTS,
	TYPE,
	unblock,
	provideUnblock,
};

