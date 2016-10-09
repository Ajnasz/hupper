import { prefs } from '../core/prefs';
import * as dom from './core/dom';

let editHighlightedUsersTpl = `<h1>Edit highlighted users</h1>
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

	function editHighlightedUsers() {
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

		function drawUsers() {
			dom.empty(getList());

			prefs.getCleanHighlightedUsers().then((users) => {
				users.forEach(addHighlightedUser);
			});
		}

		function getUsersString(users) {
			return users.filter((user) => {
				return user && user.name && user.color;
			}).map((user) => {
				return user.name + ':' + user.color;
			}).join(',');
		}

		getList().addEventListener('click', (e) => {
			let target = e.target;

			if (target.dataset.action === 'unhighlight') {
				let userName = target.dataset.name;
				prefs.getCleanHighlightedUsers().then((users) => {
					let filteredUsers = users.filter((user) => {
						return user.name !== userName;
					});
					prefs.setPref('highlightusers', getUsersString(filteredUsers));
					drawUsers();
				});
			}
		}, false);

		getForm().addEventListener('submit', (e) => {
			e.preventDefault();
			let user = {
				name: getUserNameField().value,
				color: getUserColorField().value
			};
			// prefs
			prefs.getCleanHighlightedUsers().then((users) => {
				users.push(user);
				prefs.setPref('highlightusers', getUsersString(users));
				drawUsers();
			});
		});

		drawUsers();

	}

export {editHighlightedUsersTpl as tpl, editHighlightedUsers as run };
