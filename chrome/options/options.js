/*jshint esnext:true*/
/*global require*/
(function () {
	'use strict';
	let prefs = require('./pref').pref;

	function createText(item) {
		let fragment = document.createDocumentFragment();
		let input = document.createElement('input');
		let label = document.createElement('label');
		let div = document.createElement('div');
		let br = document.createElement('br');

		label.textContent = item.title;
		input.type = 'text';
		input.name = item.name;
		input.value = item.value;
		input.dataset.type = item.type;

		div.appendChild(label);
		div.appendChild(br);
		div.appendChild(input);

		fragment.appendChild(div);

		return fragment;
	}

	function createInteger(item) {
		let fragment = document.createDocumentFragment();
		let input = document.createElement('input');
		let label = document.createElement('label');
		let div = document.createElement('div');
		let br = document.createElement('br');

		label.textContent = item.title;
		input.type = 'number';
		input.name = item.name;
		input.value = item.value;
		input.dataset.type = item.type;

		div.appendChild(label);
		div.appendChild(br);
		div.appendChild(input);
		fragment.appendChild(div);

		return fragment;
	}

	function createBool(item) {
		let fragment = document.createDocumentFragment();
		let input = document.createElement('input');
		let label = document.createElement('label');
		let div = document.createElement('div');

		label.textContent = item.title;
		input.type = 'checkbox';
		input.name = item.name;
		input.checked = item.value;
		input.value = '1';
		input.dataset.type = item.type;

		div.appendChild(input);
		div.appendChild(label);
		fragment.appendChild(div);
		return fragment;
	}

	function createControl(item) {
		let fragment = document.createDocumentFragment();
		let button = document.createElement('button');
		let div = document.createElement('div');

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
			if (x.type === 'string') {
				elem = createText(x);
			} else if (x.type === 'bool') {
				elem = createBool(x);
			} else if (x.type === 'integer') {
				elem = createInteger(x);
			} else if (x.type === 'control') {
				elem = createControl(x);
			}

			if (elem) {
				msg.appendChild(elem);
			}
			// msg.innerHTML += x.name + ': ' + x.value + (x.hidden ? ' hidden' : '') + ' ' + x.title + ' ' + x.type + '<br>';
		});

		msg.addEventListener('change', function (e) {
			let target = e.target;
			let name = target.name;
			let value;
			if (target.dataset.type === 'bool') {
				value = target.checked;
			} else if (target.dataset.type === 'string') {
				value = target.value;
			} else {
				return;
			}

			prefs.setPref(name, value);
		}, false);
	});
}());
