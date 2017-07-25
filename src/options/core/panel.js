import * as dom from '../../core/dom';
import * as func from '../../core/func';
import * as editor from '../editor';
import { createEmitter } from '../../core/events';
import { log } from '../../core/log';

function createPanelBg () {
	let panelBg = document.getElementById('panel-bg');

	if (panelBg) {
		return panelBg;
	}

	let div = dom.createElem('div', [{name: 'id', value: 'panel-bg'}]);
	document.body.appendChild(div);

	return div;
}

function getTrackName (e) {
	e.type.indexOf('animation') === 0 ? e.animationname : e.type;
}

const hiddenClass = 'hidden';
const hideClass = 'hide';
const showClass = 'show';
const visibleClass = 'visible';

const hide = func.curry(dom.addClass, hiddenClass);
const show = func.curry(dom.removeClass, hiddenClass);

function transitionTrack (elem) {
	return new Promise(resolve => {
		let transitions = new Set();

		function onTransitionStart (e) {
			log.log('transtion start', e);

			if (e.target === elem) {
				transitions.add(getTrackName(e));
			}
		}

		function onTransitionEnd (e) {
			log.log('transition end', e);

			if (e.target !== elem) {
				return;
			}

			transitions.delete(getTrackName(e));

			log.log('transitions', transitions);
			if (transitions.size === 0) {
				['transitionstart', 'animationstart'].map(ev => func.curry(dom.removeListener, ev, onTransitionStart)).forEach(f => f(elem));
				['transitionend', 'animationend'].map(ev => func.curry(dom.removeListener, ev, onTransitionEnd)).forEach(f => f(elem));
				resolve(elem);
			}
		}

		['transitionstart', 'animationstart'].map(ev => func.curry(dom.addListener, ev, onTransitionStart)).forEach(f => f(elem));
		['transitionend', 'animationend'].map(ev => func.curry(dom.addListener, ev, onTransitionEnd)).forEach(f => f(elem));

	});
}

function closeElem (elem) {
	const promise =  transitionTrack(elem)
		.then(() => dom.removeClass(visibleClass, elem))
		.then(() => elem.parentNode.removeChild(elem));

	dom.addClass(hideClass, elem);

	return promise;
}

function showElem (elem) {
	const promise =  transitionTrack(elem);

	// elem.offsetWidth
	// triggers reflow which needed to fire animation and transition events
	requestAnimationFrame(() => (elem.offsetWidth, [showClass, visibleClass].map(className => func.curry(dom.addClass, className)).forEach(f => f(elem))));

	const removeShowClass = func.curry(dom.removeClass, showClass);
	promise.then(x => {
		removeShowClass(elem);
		return x;
	});

	return promise;
}

const selectForm = func.curry(dom.selectOne, 'form');

function createPanel (options, body, events) {
	let panelContainer = dom.createElem('div', null, ['panel-container']);
	let div = dom.createElem('div', null, [ 'panel']);
	let close = dom.createElem('button', [{name: 'type', value: 'button'}], ['close']);
	let header = dom.createElem('header');
	let title = dom.createElem('h1');
	let panelContent = dom.createElem('div', null, ['panel-content']);

	title.textContent = options.title;

	panelContainer.appendChild(div);
	div.appendChild(panelContent);

	close.appendChild(document.createTextNode('✕'));
	header.appendChild(title);
	header.appendChild(close);

	if (options.id) {
		dom.attr('id', options.id, div);
	}

	panelContent.insertAdjacentHTML('afterbegin', body);
	div.insertBefore(header, div.firstChild);

	function onClick (e) {
		events.emit('click', e);
	}

	function onSubmit (e) {
		events.emit('submit', e);
	}

	const pulseClass = 'pulse';

	function panelAlert (panel) {
		let promise = transitionTrack(panel).then(() => dom.removeClass(pulseClass, panel));

		dom.addClass(pulseClass, panel);

		return promise;
	}

	function onPanelBGClick () {
		// document.getElementById('panel-bg').removeEventListener('click', onClose);
		panelAlert(div);
	}

	function onKeyup (ev) {
		if (ev.keyCode === 27) {
			if (!dom.is('.panel input,.panel textarea,.panel select', ev.target)) {
				closePanel();
			}
		}
	}

	function closePanel () {
		let panelBg = document.getElementById('panel-bg');

		closeElem(div).then(function () {
			const removeClickListener = func.curry(dom.removeListener, 'click');
			removeClickListener(onClick, div);
			removeClickListener(closePanel, close);
			removeClickListener(onPanelBGClick, dom.selectOne('#panel-bg', document));

			dom.removeListener('submit', onSubmit, selectForm(div));
			dom.removeListener('keyup', onKeyup, window);

			panelContainer.parentNode.removeChild(panelContainer);
		}).then(func.curry(closeElem, panelBg)).then(function () {
			events.emit('close');
		});
	}

	const addClickListner = func.curry(dom.addListener, 'click');
	addClickListner(onClick, div);
	addClickListner(closePanel, close);
	addClickListner(onPanelBGClick, dom.selectOne('#panel-bg', document));

	dom.addListener('submit', onSubmit, selectForm(div));
	dom.addListener('keyup', onKeyup, window);

	document.body.appendChild(panelContainer);

	return div;
}

function showBg (panelBg) {
	return showElem(panelBg);
}

function showPanel (panel) {
	return showElem(panel);
}

function create (options, body) {
	let id = 'panel-' + options.id;

	if (document.getElementById(id)) {
		throw new Error('Panel already exists');
	}

	let panelBg = createPanelBg();

	let events = createEmitter();

	let panel = createPanel(options, body, events);

	return {
		events,
		panel,
		panelBg,
		show () {
			return showBg(panelBg)
				.then(showPanel.bind(null, panel))
				.then(() => show(panel));
		},

		drawTable (items) {
			let found = dom.selectOne('.js-found', panel),
				notFound = dom.selectOne('.js-not-found', panel);

			if (items.length > 0) {
				let tbody = dom.selectOne('tbody', panel);
				dom.empty(tbody);
				items.forEach(item => tbody.appendChild(editor.getRow(item)));

				hide(notFound);
				show(found);
			} else {
				hide(found);
				show(notFound);
			}
		}
	};
}

export { create };
