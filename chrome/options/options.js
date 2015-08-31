/*jshint esnext:true*/
/*global require*/
(function () {
	'use strict';
	let prefs = require('./pref').pref;
	let func = require('./core/func');

	function createElement(type) {
		let element = document.createElement(type);
		return element;
	}

	function createControlGroup() {
		let div = createElement('div');
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
		let input = createElement('input');

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
		let label = createElement('label');
		label.textContent = item.title;
		label.setAttribute('for', getElemId(item));
		return label;
	}

	function createBr() {
		let br = createElement('br');
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
		let button = createElement('button');
		let div = createElement('div');

		button.type = 'button';
		button.id = 'control-' + item.name;
		button.textContent = item.title;
		button.dataset.type = item.type;

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
				console.log('edit');
			}
		});
	});
}());
