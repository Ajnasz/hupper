import * as dom from './dom';
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

function transitionTrack (elem) {
	return new Promise(resolve => {
		let transitions = new Set();

		function transitionTrack (e) {
			log.log('transtion track', e);
			
			if (e.target === elem) {
				transitions.add(getTrackName(e));
			}
		}

		function onTransitionEnd (e) {
			log.log('end', e);
			
			if (e.target !== elem) {
				return;
			}

			transitions.delete(getTrackName(e));

			log.log('transitions', transitions);
			if (transitions.size === 0) {
				elem.removeEventListener('transitionstart', transitionTrack, false);
				elem.removeEventListener('transitionend', onTransitionEnd, false);

				elem.removeEventListener('animationstart', transitionTrack, false);
				elem.removeEventListener('animationend', onTransitionEnd, false);
				resolve(elem);
			}
		}

		elem.addEventListener('transitionstart', transitionTrack), false;
		elem.addEventListener('transitionend', onTransitionEnd, false);

		elem.addEventListener('animationstart', transitionTrack, false);
		elem.addEventListener('animationend', onTransitionEnd, false);
	});
}

function closeElem (elem) {
	let promise =  transitionTrack(elem).then(() => elem.parentNode.removeChild(elem));
	elem.classList.remove('show');
	elem.classList.add('hide');

	return promise;
}

function showElem (elem) {
	let promise =  transitionTrack(elem);
	setTimeout(() => {
		elem.classList.add('show', 'visible');
	}, 10);

	return promise;
}

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
		div.setAttribute('id', options.id);
	}

	panelContent.insertAdjacentHTML('afterbegin', body);
	div.insertBefore(header, div.firstChild);

	function onClick (e) {
		events.emit('click', e);
	}

	function onSubmit (e) {
		events.emit('submit', e);
	}

	function panelAlert (panel) {
		let promise = transitionTrack(panel).then(() => panel.classList.remove('pulse'));
		panel.classList.add('pulse');
		return promise;
	}

	function onPanelBGClick () {
		// document.getElementById('panel-bg').removeEventListener('click', onClose);
		panelAlert(div);
	}

	function closePanel () {

		let panelBg = document.getElementById('panel-bg');

		closeElem(div).then(function () {
			div.removeEventListener('click', onClick);
			div.querySelector('form').removeEventListener('submit', onSubmit);
			document.getElementById('panel-bg').removeEventListener('click', onPanelBGClick, false);
			panelContainer.parentNode.removeChild(panelContainer);
		}).then(closeElem.bind(null, panelBg)).then(function () {
			events.emit('close');
		});
	}

	div.addEventListener('click', onClick, false);
	div.querySelector('form').addEventListener('submit', onSubmit, false);

	close.addEventListener('click', function onClose () {
		close.removeEventListener('click', onClose);
		closePanel();
	});

	document.getElementById('panel-bg').addEventListener('click', onPanelBGClick, false);

	window.addEventListener('keyup', function onKeyup (ev) {
		if (ev.keyCode === 27) {
			if (!ev.target.matches('.panel input,.panel textarea,.panel select')) {
				closePanel();
				window.removeEventListener('keyup', onKeyup);
			}
		}
	}, false);

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
				.then(() => panel.classList.remove('show'));
		},

		drawTable (items) {
			let found = panel.querySelector('.js-found'),
				notFound = panel.querySelector('.js-not-found');

			if (items.length > 0) {
				let tbody = panel.querySelector('tbody');
				dom.empty(tbody);
				items.forEach(item => tbody.appendChild(editor.getRow(item)));

				notFound.classList.add('hidden');
				found.classList.remove('hidden');
			} else {
				notFound.classList.remove('hidden');
				found.classList.add('hidden');
			}
		}
	};
}

export { createPanel, createPanelBg, create };
