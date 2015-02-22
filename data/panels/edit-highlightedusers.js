/*jshint moz:true*/
/*global self*/
(function (req) {
	'use strict';

	let dom = req('dom');

	function getForm() {
		return document.getElementById('HighlightUserForm');
	}

	function getList() {
		return document.getElementById('ListOfHighlightedUsers').querySelector('tbody');
	}

	function getUserNameField() {
		return document.getElementById('HighlightedUserName');
	}

	function getUserColorField() {
		return document.getElementById('HighlightedUserColor');
	}

	function createHighlightedUserItem(user) {
		let tr = dom.createElem('tr');
		let userNameTd = dom.createElem('td', null, ['user-name'], user.name);
		let userColorTd = dom.createElem('td');

		let userColor = dom.createElem('span', null, ['user-color'], user.color.toLowerCase());
		let btnTd = dom.createElem('td', null, ['delete-user']);
		let button = dom.createElem('button', [
			{name: 'type', value: 'button'}
		], ['delete-highlighted-users'], 'Delete');

		button.dataset.name = user.name;
		button.dataset.action = 'unhighlight';
		userColor.style.backgroundColor = user.color;

		btnTd.appendChild(button);
		userColorTd.appendChild(userColor);

		tr.appendChild(userNameTd);
		tr.appendChild(userColorTd);
		tr.appendChild(btnTd);

		return tr;
	}

	function addHighlightedUser(name) {
		let container = getList();
		container.appendChild(createHighlightedUserItem(name));
	}

	function showError(msg) {
		let container = getUserNameField().parentNode;

		let errorField = container.querySelector('.error');

		if (!errorField) {
			errorField = dom.createElem('label', [
				{
					name: 'for',
					value: getUserNameField().name
				}
			], ['error'], msg);

			container.appendChild(errorField);
		} else {
			errorField.textContent = msg;
		}
	}

	self.port.on('showHighlightedUsers', function (users) {
		dom.empty(getList());
		console.log('show highlighted users', users);
		
		users.forEach(addHighlightedUser);
	});

	getList().addEventListener('click', function (e) {
		let target = e.target;

		if (target.dataset.action === 'unhighlight') {
			self.port.emit('unhighlight', target.dataset.name);
		}
	}, false);

	getForm().addEventListener('submit', function (e) {
		e.preventDefault();

		self.port.emit('addHighlightedUser', {
			name: getUserNameField().value,
			color: getUserColorField().value
		});
	});

	self.port.on('addHighlightedUserError', showError);

	self.port.on('addHighlightedUserSuccess', function () {
		getUserNameField().value = '';
		getUserColorField().value = '';
	});

	self.port.emit('getHighlightedUsers');
}(window.req));
