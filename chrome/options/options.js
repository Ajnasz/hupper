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

	function createPanel(options, html) {
		let div = createElement('div');
		let close = createElement('span');

		let panelContent = createElement('div');
		panelContent.classList.add('panel-content');

		div.appendChild(panelContent);

		close.classList.add('close');
		close.appendChild(document.createTextNode('X'));

		div.classList.add('panel');

		if (options.id) {
			div.setAttribute('id', options.id);
		}

		panelContent.insertAdjacentHTML('afterbegin', html);
		div.insertBefore(close, div.firstChild);

		close.addEventListener('click', function () {
			div.addEventListener('transitionend', function r() {
				div.parentNode.removeChild(div);
				div.removeEventListener('transitionEnd', r);
			}, false);

			let panelBg = document.getElementById('panel-bg');
			panelBg.addEventListener('transitionend', function r() {
				panelBg.parentNode.removeChild(panelBg);
				div.removeEventListener('transitionEnd', r);
			}, false);

			div.classList.remove('show');
			panelBg.classList.remove('show');
		});

		return div;
	}

	function createPanelBg() {
		let div = createElement('div');
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
				let html = `
	<h1>Edit highlighted users</h1>

	<form action="" method="" id="HighlightUserForm">
		<div class="field-group">
			<label for="HighlightedUserName">User name</label>
			<input type="text" name="userName" id="HighlightedUserName" required />
		</div>
		<div class="field-group">
			<label for="HighlightedUserColor">Highlight color</label>
			<input type="text" name="userColor" id="HighlightedUserColor" required />
		</div>
		<button type="submit">Add</button>
	</form>

	<table id="ListOfHighlightedUsers">
		<thead>
			<th>User name</th>
			<th>User color</th>
			<th>Delete user</th>
		</thead>
		<tbody></tbody>
	</table>`;

				let id = 'panel-' + target.id;
				let panel = document.getElementById(id);
				let panelBg = document.getElementById('panel-bg');

				if (!panel) {
					panel = createPanel({id: id}, html);
				}

				if (!panelBg) {
					panelBg = createPanelBg();
					document.body.appendChild(panelBg);
				}


				document.body.appendChild(panel);
				setTimeout(function () {
					panelBg.classList.add('show');
					setTimeout(function () {
						panel.classList.add('show');
					}, 10);
				}, 10);

			}
		});
	});
}());
