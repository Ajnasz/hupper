/*jshint moz:true*/
/*global self*/
(function (req) {
	'use strict';

	let dom = req('dom');

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

	function showError(msg) {
		let container = getTrollNameField().parentNode;

		let errorField = container.querySelector('.error');

		if (!errorField) {
			errorField = dom.createElem('label', [
				{
					name: 'for',
					value: getTrollNameField().name
				}
			], ['error'], msg);

			container.appendChild(errorField);
		} else {
			errorField.textContent = msg;
		}
	}

	self.port.on('showTrolls', function (trolls) {
		dom.empty(getList());
		trolls.forEach(addTrollItem);
	});

	getList().addEventListener('click', function (e) {
		let target = e.target;

		if (target.dataset.action === 'untroll') {
			self.port.emit('untroll', target.dataset.name);
		}
	}, false);

	getForm().addEventListener('submit', function (e) {
		e.preventDefault();

		self.port.emit('addTroll', getTrollNameField().value);
	});

	self.port.on('addTrollError', showError);

	self.port.on('addTrollSuccess', function () {
		getTrollNameField().value = '';
	});

	self.port.emit('getTrolls');
}(window.req));
