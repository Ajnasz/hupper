import * as dom from '../../../core/dom';
import * as func from '../../../core/func';
import { createEmitter } from '../../../core/events';

const TYPE = 'youtube';
const EVENTS = createEmitter();

const CONTAINER_CLASS = 'youtube-embed';

const FRAME_SELECTOR = 'iframe[src^="https://www.youtube.com/embed/"]';

const addContainerClass = func.curry(dom.addClass, CONTAINER_CLASS);

function addVideoLink (frame) {
	const src = new URL(frame.src);
	const videoID = src.pathname.replace(/\/embed\/(.+)$/, '$1');
	src.pathname = '/watch';
	src.search = `?v=${videoID}`;

	const link = dom.createElem('a', [
		{ name: 'href', value: src.href },
		{ name: 'target', value: '_blank' },
		{ name: 'rel', value: 'noreferrer' },
	], ['link-to-youtube'], 'Nézd meg YouTube-on');

	frame.parentNode.appendChild(link);
}

function provideUnblock () {
	const main = document.querySelector('.main-content');

	dom.selectAll(FRAME_SELECTOR, main).forEach(f => {
		addContainerClass(f.parentNode);
		addVideoLink(f);
	});
	dom.addClass('embed-blocked', main);
}

export {
	EVENTS,
	TYPE,
	provideUnblock,
};
