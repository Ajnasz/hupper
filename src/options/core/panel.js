import * as dom from './dom';
import * as editor from '../editor';
import { createEmitter } from '../../core/events';

function createPanelBg () {
	let panelBg = document.getElementById('panel-bg');

	if (panelBg) {
		return panelBg;
	}

	let div = dom.createElem('div', [{name: 'id', value: 'panel-bg'}]);
	document.body.appendChild(div);

	return div;
}

function transitionTrack (elem) {
	return new Promise(resolve => {
		let transitions = new Set();

		function transitionTrack (e) {
			if (e.target === elem) {
				transitions.add(e.type);
			}
		}

		elem.addEventListener('transitionstart', transitionTrack);

		elem.addEventListener('transitionend', function onTransitionEnd (e) {
			if (e.target !== elem) {
				return;
			}

			transitions.delete(e.type);

			if (transitions.size === 0) {
				elem.removeEventListener('transitionstart', transitionTrack);
				elem.removeEventListener('transitionend', onTransitionEnd);
				resolve();
			}
		}, false);
	});
}

function closeElem (elem) {
	let promise =  transitionTrack(elem).then(() => elem.parentNode.removeChild(elem));
	elem.classList.remove('show');

	return promise;
}

function showElem (elem) {
	let promise =  transitionTrack(elem);
	setTimeout(() => {
		elem.classList.add('show');
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
		transitionTrack(panel).then(() => panel.style.transform = null);
		panel.style.transform = 'scale(1.05)';
	}

	div.addEventListener('click', onClick, false);
	div.querySelector('form').addEventListener('submit', onSubmit, false);

	function closePanel () {

		let panelBg = document.getElementById('panel-bg');

		closeElem(div).then(function () {
			div.removeEventListener('click', onClick);
			div.querySelector('form').removeEventListener('submit', onSubmit);
			document.getElementById('panel-bg').removeEventListener('click', panelAlert);
			panelContainer.parentNode.removeChild(panelContainer);
		}).then(closeElem.bind(null, panelBg)).then(function () {
			events.emit('close');
		});
	}

	close.addEventListener('click', function onClose () {
		close.removeEventListener('click', onClose);
		closePanel();
	});

	document.getElementById('panel-bg').addEventListener('click', function onClose () {
		// document.getElementById('panel-bg').removeEventListener('click', onClose);
		panelAlert(div);
	});

	window.addEventListener('keyup', function c (ev) {
		if (ev.keyCode === 27) {
			if (!ev.target.matches('.panel input,.panel textarea,.panel select')) {
				closePanel();
				window.removeEventListener('keyup', c);
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
			return showBg(panelBg).then(showPanel.bind(null, panel));
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
