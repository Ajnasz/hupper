import { prefs } from '../core/prefs';
import * as dom from './core/dom';
import * as func from '../core/func';
import * as editHighlightedUsers from './edit-highlightedusers';
import * as editTrolls from './edit-trolls';

function createControlGroup() {
	let div = dom.createElem('div');

	div.classList.add('control-group');

	return div;
}

function camelConcat() {
	return func.toArray(arguments).map((i) => {
		return i[0].toUpperCase() + i.slice(1);
	}).join('');
}

function getElemId(item) {
	return camelConcat('Item', item.name);
}

function createInput(item) {
	let input = dom.createElem('input');

	input.dataset.type = item.type;
	input.name = item.name;
	input.id = getElemId(item);

	if (item.type === 'bool') {
		input.type = 'checkbox';
		input.value = '1';
		input.checked = item.value;
	} else {
		input.value = item.value;

		if (item.type === 'integer') {
			input.type = 'number';
		} else if (item.type === 'color') {
			input.type = 'color';
		} else {
			input.type = 'text';
		}
	}

	return input;
}

function createLabel(item) {
	let label = dom.createElem('label');
	label.textContent = item.title;
	label.setAttribute('for', getElemId(item));
	return label;
}

function createBr() {
	let br = dom.createElem('br');
	return br;
}

function composeGroup(item) {
	let fragment = document.createDocumentFragment();
	let input = createInput(item);
	let label = createLabel(item);
	let div = createControlGroup();

	if (item.type === 'bool') {
		div.appendChild(input);
		div.appendChild(label);
	} else {
		div.appendChild(label);
		div.appendChild(createBr());
		div.appendChild(input);
	}

	fragment.appendChild(div);

	return fragment;
}

function createControl(item) {
	let fragment = document.createDocumentFragment();
	let button = dom.createElem('button');
	let div = dom.createElem('div');

	button.type = 'button';
	button.id = 'control-' + item.name;
	button.textContent = item.title;
	button.dataset.type = item.type;

	div.appendChild(button);
	fragment.appendChild(div);
	return fragment;
}

function createPanel(options, html) {
	let div = dom.createElem('div');
	let close = dom.createElem('button');
	let panelContent = dom.createElem('div');

	panelContent.classList.add('panel-content');

	div.appendChild(panelContent);

	close.classList.add('close');
	close.setAttribute('type', 'button');
	close.appendChild(document.createTextNode('X'));

	div.classList.add('panel');

	if (options.id) {
		div.setAttribute('id', options.id);
	}

	panelContent.insertAdjacentHTML('afterbegin', html);
	div.insertBefore(close, div.firstChild);

	function closePanel() {
		div.addEventListener('transitionend', function removeDiv() {
			div.parentNode.removeChild(div);
			div.removeEventListener('transitionend', removeDiv);
		}, false);

		let panelBg = document.getElementById('panel-bg');
		panelBg.addEventListener('transitionend', function removePanel() {
			panelBg.parentNode.removeChild(panelBg);
			div.removeEventListener('transitionend', removePanel);
		}, false);

		div.classList.remove('show');
		panelBg.classList.remove('show');
	}

	close.addEventListener('click', function onClose() {
		close.removeEventListener('click', onClose);
		closePanel();
	});
	document.getElementById('panel-bg').addEventListener('click', function onClose() {
		document.getElementById('panel-bg').removeEventListener('click', onClose);
	});

	window.addEventListener('keyup', function c(ev) {
		if (ev.keyCode === 27) {
			if (!ev.target.matches('.panel input,.panel textarea,.panel select')) {
				closePanel();
				window.removeEventListener('keyup', c);
			}
		}
	}, false);

	return div;
}

function createPanelBg() {
	let div = dom.createElem('div');
	div.setAttribute('id', 'panel-bg');

	return div;
}

prefs.getAllPrefs().then((pref) => {
	let msg = document.querySelector('#Messages');

	pref.forEach((x) => {
		let elem;

		if (x.hidden) {
			return;
		}

		if (x.type === 'control') {
			elem = createControl(x);
		} else {
			elem = composeGroup(x);
		}

		if (elem) {
			msg.appendChild(elem);
		}
	});

	msg.addEventListener('change', (e) => {
		let target = e.target;
		let name = target.name;
		let type = target.dataset.type;
		let value;

		if (type === 'bool') {
			value = target.checked;
		} else if (['string', 'color'].indexOf(type) > -1) {
			value = target.value;
		} else if (type === 'integer') {
			value = parseInt(target.value, 10);
		} else {
			throw new Error('Unkown type');
		}

		prefs.setPref(name, value);
	}, false);

	msg.addEventListener('click', (e) => {
		let target = e.target;

		if (target.dataset.type === 'control') {

			let id = 'panel-' + target.id;
			let panel = document.getElementById(id);
			let panelBg = document.getElementById('panel-bg');

			let html;

			if (target.id === 'control-edithighlightusers') {
				html = editHighlightedUsers.tpl;
			} else if (target.id === 'control-edittrolls') {
				html = editTrolls.tpl;
			}

			if (!panelBg) {
				panelBg = createPanelBg();
				document.body.appendChild(panelBg);
			}

			if (!panel) {
				panel = createPanel({id: id}, html);
			}

			document.body.appendChild(panel);
			panel.querySelector('input').focus();
			setTimeout(function () {
				panelBg.classList.add('show');
				setTimeout(function () {
					panel.classList.add('show');

					if (target.id === 'control-edithighlightusers') {
						editHighlightedUsers.run();
					} else if (target.id === 'control-edittrolls') {
						editTrolls.run();
					}
				}, 10);
			}, 10);

		}
	});
});
