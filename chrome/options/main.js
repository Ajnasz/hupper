import { prefs } from '../core/prefs';
import * as dom from './core/dom';
import * as panel from './core/panel';
import * as func from '../core/func';
import * as editHighlightedUsers from './edit-highlightedusers';
import * as editTrolls from './edit-trolls';

function createControlGroup () {
	let div = dom.createElem('div');

	div.classList.add('control-group');

	return div;
}

function camelConcat () {
	return func.toArray(arguments).map((i) => {
		return i[0].toUpperCase() + i.slice(1);
	}).join('');
}

function getElemId (item) {
	return camelConcat('Item', item.name);
}

function createInput (item) {
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
			input.classList.add('btn');
		} else {
			input.type = 'text';
		}
	}

	return input;
}

function createLabel (item) {
	let label = dom.createElem('label');
	label.textContent = item.title;
	label.setAttribute('for', getElemId(item));
	return label;
}

function composeGroup (item) {
	let fragment = document.createDocumentFragment();
	let input = createInput(item);
	let label = createLabel(item);
	let div = createControlGroup();

	if (item.type === 'bool') {
		div.classList.add('control-group-bool');
		div.appendChild(input);
		div.appendChild(label);
	} else {
		div.classList.add('control-group-text');
		div.appendChild(label);
		// div.appendChild(createBr());
		div.appendChild(input);
	}

	fragment.appendChild(div);

	return fragment;
}

function createControl (item) {
	let fragment = document.createDocumentFragment();

	let button = dom.createElem('button');
	let div = dom.createElem('div');

	button.type = 'button';
	button.id = 'control-' + item.name;
	button.textContent = item.title;
	button.dataset.type = item.type;
	button.classList.add('btn');

	div.appendChild(button);
	fragment.appendChild(div);
	return fragment;
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
			if (target.id === 'control-edithighlightusers') {
				editHighlightedUsers.open();
			} else {
				editTrolls.open();
			}
		}
	});
});

document.getElementById('ResetSettings').addEventListener('click', () => prefs.clear());
