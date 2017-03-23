import { prefs } from '../core/prefs';
import * as dom from '../core/dom';
import * as func from '../core/func';
import * as editHighlightedUsers from './edit-highlightedusers';
import * as editTrolls from './edit-trolls';
import * as editHidetaxonomy from './edit-hidetaxonomy';

function createControlGroup (content) {
	let div = dom.createElem('div');

	dom.addClass('control-group', div);
	dom.append(div, content);

	return div;
}

function camelConcat (...args) {
	return args.map((i) => i[0].toUpperCase() + i.slice(1)).join('');
}

function getElemId (item) {
	return camelConcat('Item', item.name);
}

function createInput (item) {
	let input = dom.createElem('input');

	input.dataset.prefname = item.name;

	input.dataset.type = item.type;
	input.name = item.name;
	input.id = getElemId(item);

	if (item.type === 'bool') {
		input.type = 'checkbox';
		input.value = '1';
		input.checked = item.value;

		if (item.requiredBy) {
			input.dataset.requiredby = JSON.stringify(item.requiredBy);
		}
	} else {
		input.value = item.value;

		const setType = func.curry(dom.attr, 'type');


		if (item.type === 'integer') {
			setType('number', input);
		} else if (item.type === 'color') {
			[[setType, 'color'], [dom.addClass, 'btn']]
				.forEach(call => call[0](...call.slice(1), input));
		} else {
			setType('text', input);
		}
	}

	return input;
}

function createLabelText (item) {
	let labelText = dom.createElem('span');

	labelText.textContent = item.title;

	return labelText;
}

function createCheckboxGroup (item) {
	let input = createInput(item);
	let label = dom.createElem('label');
	let labelText = createLabelText(item);

	const appendToLabel = func.curry(dom.append, label);

	appendToLabel(input);
	appendToLabel(labelText);


	return label;
}

function createTextGroup (item) {
	let input = createInput(item);
	let label = dom.createElem('label');
	let labelText = createLabelText(item);

	labelText.textContent = `${item.title}:`;

	const appendToLabel = func.curry(dom.append, label);

	appendToLabel(labelText);
	appendToLabel(input);

	return label;
}

function createGroupContainer (className, group) {
	let div = createControlGroup(group);

	dom.addClass(className, div);

	return div;
}

function createFragment (div) {
	let fragment = document.createDocumentFragment();

	fragment.appendChild(div);

	return fragment;
}

function groupComposer (groupClassName, groupCreator, item) {
	return func.compose(
		func.always(item),
		groupCreator,
		func.partial(createGroupContainer, groupClassName),
		createFragment
	);
}

const boolGropuComposer = func.curry(groupComposer, 'control-group-bool', createCheckboxGroup);
const textGroupComposer = func.curry(groupComposer, 'control-group-text', createTextGroup);

function composeGroup (item) {
	switch (item.type) {
		case 'bool':
			return boolGropuComposer(item);
		default:
			return textGroupComposer(item);
	}
}

function createControlButton (item) {
	let button = dom.createElem('button');

	button.textContent = item.title;
	button.dataset.type = item.type;
	button.dataset.prefname = item.name;
	dom.attr('type', 'button', button);
	dom.attr('id', `control-${item.name}`, button);
	dom.addClass('btn', button);

	return button;
}

function createControl (item) {
	return func.compose(func.always(item), createControlButton, func.partial(createGroupContainer, 'control-group-control'), createFragment);
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
		default:
			return null;
	}
}

const toDisabled = func.curry(dom.attr, 'disabled', true);
const toEnabled = func.curry(dom.removeAttr, 'disabled');

function toggleRelatives (element) {
	const value = element.checked;
	const groupContainer = dom.closest('.group-container', element);
	const toggler = value ? toEnabled : toDisabled;

	JSON.parse(element.dataset.requiredby)
		.map(name => func.curry(dom.selectOne, `[data-prefname="${name}"]`))
		.map(selector => selector(groupContainer))
		.forEach(toggler);
}

function getInputValue (elem) {
	switch (elem.dataset.type) {
		case 'bool':
			return elem.checked;
		case 'string':
		case 'color':
			return elem.value;
		case 'integer':
			return parseInt(elem.value, 10);
		default:
			throw new Error('Unkown type');
	}
}

prefs.getAllPrefs().then((pref) => {
	let msg = dom.selectOne('#Messages', document);

	let byGroup = func.groupBy(pref, 'group');

	const groups = Object.keys(byGroup);

	groups.forEach(groupName => {
		let pref = byGroup[groupName];

		let group = dom.createElem('section', null, ['group']),
			title = dom.createElem('h2', null, ['group-title'], getGroupName(groupName)),
			groupContainer = dom.createElem('div', null, ['group-container']);

		group.appendChild(title);
		group.appendChild(groupContainer);

		pref.filter(x => !x.hidden).map((x) => {
			if (x.type === 'control') {
				return createControl(x);
			}

			return composeGroup(x);
		}).forEach(elem => groupContainer.appendChild(elem));

		msg.appendChild(group);
	});

	groups.forEach(groupName => {
		let pref = byGroup[groupName];

		pref.filter(x => x.type === 'bool' && x.requiredBy)
			.map(x => dom.selectOne(`[data-prefname="${x.name}"]`, document)).forEach(toggleRelatives);
	});

	msg.addEventListener('change', (e) => {
		let target = e.target;
		let name = target.name;
		let type = target.dataset.type;
		let value = getInputValue(target);

		if (type === 'bool') {
			toggleRelatives(target, value);
		}

		prefs.setPref(name, value);
	}, false);

	msg.addEventListener('click', (e) => {
		let target = e.target;

		if (target.dataset.type === 'control') {
			switch (target.id) {
				case 'control-edithighlightusers':
					prefs.getPref('huppercolor').then(huppercolor => editHighlightedUsers.open({huppercolor}));
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
