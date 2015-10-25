/*jshint esnext:true*/
/*global require, define*/
(function () {
	'use strict';
	let prefs = require('./pref').pref;
	let dom = require('./core/dom');

	let editTrollsTpl = `<h1>Edit trolls</h1>

	<form action="" method="" id="AddTrollForm">
		<div class="field-group">
			<label for="TrollName">Troll name</label>
			<input type="text" name="trollName" id="TrollName" />
		</div>
		<button type="submit">Add</button>
	</form>

	<ul id="ListOfTrolls"></ul>`;


	function editTrolls() {
		function getForm() {
			return document.getElementById('AddTrollForm');
		}

		function getList() {
			return document.getElementById('ListOfTrolls');
		}

		function getTrollNameField() {
			return document.getElementById('TrollName');
		}

		function createTrollItem(name) {
			let li = dom.createElem('li');
			let span = dom.createElem('span', null, null, name);
			let button = dom.createElem('button', [
				{name: 'type', value: 'button'}
			], ['delete-troll'], 'Delete');
			button.dataset.name = name;
			button.dataset.action = 'untroll';
			li.appendChild(span);
			li.appendChild(button);
			return li;
		}

		function addTrollItem(name) {
			let container = getList();
			container.appendChild(createTrollItem(name));
		}

		function drawTrolls() {
			prefs.getCleanTrolls().then((trolls) => {
				dom.empty(getList());
				trolls.forEach(addTrollItem);
			});
		}

		function removeTroll(troll) {
			prefs.getCleanTrolls().then((trolls) => {
				prefs.setPref('trolls', trolls.filter((n) => {
					return n !== troll;
				}).join(','));
				drawTrolls();
			});
		}

		function addTroll(troll) {
			prefs.getCleanTrolls().then((trolls) => {
				if (trolls.indexOf(troll) === -1) {
					trolls.push(troll);
					prefs.setPref('trolls', trolls.join(','));
					drawTrolls();
				}
			});
		}

		getList().addEventListener('click', (e) => {
			let target = e.target;

			if (target.dataset.action === 'untroll') {
				removeTroll(target.dataset.name);
			}
		}, false);

		getForm().addEventListener('submit', (e) => {
			e.preventDefault();
			addTroll(getTrollNameField().value);
		});

		drawTrolls();
	}

	define('./edit-trolls', (exports) => {
		exports.tpl = editTrollsTpl;
		exports.run = editTrolls;
	});
}());
