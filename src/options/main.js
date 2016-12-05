import { prefs } from '../core/prefs';
import * as dom from '../core/dom';
import * as func from '../core/func';
import * as editHighlightedUsers from './edit-highlightedusers';
import * as editTrolls from './edit-trolls';
import * as editHidetaxonomy from './edit-hidetaxonomy';

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

function composeGroup (item) {
	let fragment = document.createDocumentFragment();
	let input = createInput(item);
	let div = createControlGroup();

	if (item.type === 'bool') {
		div.classList.add('control-group-bool');
		let l = dom.createElem('label');
		let s = dom.createElem('span');
		l.appendChild(input);
		l.appendChild(s);
		s.textContent = item.title;
		div.appendChild(l);
	} else {
		div.classList.add('control-group-text');
		let l = dom.createElem('label');
		let s = dom.createElem('span');
		l.appendChild(s);
		l.appendChild(input);
		s.textContent = item.title + ':';
		div.appendChild(l);
	}

	fragment.appendChild(div);

	return fragment;
}

function createControl (item) {
	let fragment = document.createDocumentFragment();

	let button = dom.createElem('button');
	let div = createControlGroup();

	div.classList.add('control-group-control');

	button.type = 'button';
	button.id = 'control-' + item.name;
	button.textContent = item.title;
	button.dataset.type = item.type;
	button.classList.add('btn');

	div.appendChild(button);
	fragment.appendChild(div);
	return fragment;
}

function getGroupName (group) {
	switch (group) {
	case 'comments':
		return 'Hozzászólások';
	case 'articles':
		return 'Cikkek';
	case 'blocks':
		return 'Blokkok';
	case 'styles':
		return 'Megjelenés';
	}
}

prefs.getAllPrefs().then((pref) => {
	let msg = document.querySelector('#Messages');

	let byGroup = func.groupBy(pref, 'group');

	Object.keys(byGroup).forEach(groupName => {
		let pref = byGroup[groupName];

		let group = dom.createElem('div', null, ['group']),
			title = dom.createElem('h2', null, ['group-title'], getGroupName(groupName)),
			groupContainer = dom.createElem('div', null, ['group-container']);

		group.appendChild(title);
		group.appendChild(groupContainer);

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
				groupContainer.appendChild(elem);
			}
		});

		msg.appendChild(group);
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
			switch (target.id) {
			case 'control-edithighlightusers':

				Promise.all([
					editHighlightedUsers.open(),
					prefs.getPref('huppercolor')
				]).then(([dialog, huppercolor]) => dialog.panel.querySelector('#HighlightedUserColor').value = huppercolor);
				break;
			case 'control-edittrolls':
				editTrolls.open();
				break;
			case 'control-edithidetaxonomy':
				editHidetaxonomy.open();
				break;
			}
		}
	});
});

document.getElementById('ResetSettings').addEventListener('click', () => prefs.clear());
