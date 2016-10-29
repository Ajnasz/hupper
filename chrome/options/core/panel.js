import * as dom from './dom';
import * as editor from '../editor';
import { createEmitter } from '../../core/events';

function createPanelBg () {
	let div = dom.createElem('div');
	div.setAttribute('id', 'panel-bg');

	return div;
}

function createPanel (options, body, events) {
	let div = dom.createElem('div');
	let close = dom.createElem('button');
	let header = dom.createElem('header');
	let title = dom.createElem('h1');
	let panelContent = dom.createElem('div');

	title.textContent = options.title;

	panelContent.classList.add('panel-content');

	div.appendChild(panelContent);

	close.classList.add('close');
	close.setAttribute('type', 'button');
	close.appendChild(document.createTextNode('X'));
	header.appendChild(title);
	header.appendChild(close);

	div.classList.add('panel');

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

	div.addEventListener('click', onClick, false);
	div.querySelector('form').addEventListener('submit', onSubmit, false);

	function closePanel () {
		div.addEventListener('transitionend', function removeDiv () {
			div.removeEventListener('click', onClick);
			div.querySelector('form').removeEventListener('submit', onSubmit);
			events.emit('close');
			div.parentNode.removeChild(div);
			div.removeEventListener('transitionend', removeDiv);
		}, false);

		let panelBg = document.getElementById('panel-bg');
		panelBg.addEventListener('transitionend', function removePanel () {
			panelBg.parentNode.removeChild(panelBg);
			div.removeEventListener('transitionend', removePanel);
		}, false);

		div.classList.remove('show');
		panelBg.classList.remove('show');
	}

	close.addEventListener('click', function onClose () {
		close.removeEventListener('click', onClose);
		closePanel();
	});

	document.getElementById('panel-bg').addEventListener('click', function onClose () {
		document.getElementById('panel-bg').removeEventListener('click', onClose);
	});

	window.addEventListener('keyup', function c (ev) {
		if (ev.keyCode === 27) {
			if (!ev.target.matches('.panel input,.panel textarea,.panel select')) {
				closePanel();
				window.removeEventListener('keyup', c);
			}
		}
	}, false);

	return div;
}

function showBg (panelBg) {
	return new Promise(function (resolve) {
		setTimeout(function () {
			panelBg.classList.add('show');
			resolve();
		}, 10);
	});
}

function showPanel (panel) {
	return new Promise(function (resolve) {
		setTimeout(function () {
			panel.classList.add('show');
			resolve();
		}, 10);
	});
}

function create (options, body) {
	let id = 'panel-' + options.id;

	let panelBg = document.getElementById('panel-bg');
	if (!panelBg) {
		panelBg = createPanelBg();
		document.body.appendChild(panelBg);
	}

	if (document.getElementById(id)) {
		throw new Error('Panel already exists');
	}

	let events = createEmitter();

	let panel = createPanel(options, body, events);

	document.body.appendChild(panel);

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
