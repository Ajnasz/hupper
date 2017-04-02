import { prefs } from '../core/prefs';
import * as editorDialog from './editor-dialog';
import * as dom from '../core/dom';
import * as func from '../core/func';
import * as color from '../core/color';

function getOrderedUsers ()  {
	return prefs.getCleanHighlightedUsers().then(users => func.sortBy(users, 'color'));
}

function open (options) {
	return editorDialog.open({
		id: 'EditHighlightedUsersDialog',
		title: 'Edit highlighted users',
		tableRowValueMap: user => [user.name, user.color],
		tpl: {
			formID: 'HighlightUserForm',
			tableID: 'ListOfHighlightedUsers',
			tableHead: [ 'Name', 'Color', 'Delete' ],
			notFoundTitle: 'No users added',
			fields: [{
				id: 'HighlightedUserName',
				label: 'Name',
				type: 'text',
				name: 'userName',
				value: ''
			}, {
				id: 'HighlightedUserColor',
				label: 'Color',
				type: 'color',
				name: 'userColor',
				value: options.huppercolor
			}]
		},

		formValueMap: ['userName', 'userColor'],

		get: getOrderedUsers,
		remove: prefs.removeHighlightedUser.bind(prefs),
		add: prefs.addHighlightedUser.bind(prefs),
		changeField: 'highlightusers'
	}).then(dialog => {
		let rndBtn = dom.createElem('button', [{name: 'type', value: 'button'}], ['button', 'random-color'], 'Random color');
		dialog.panel.querySelector('#HighlightedUserColor').parentNode.appendChild(rndBtn);
		dialog.panel.addEventListener('click', (e) => {
			let colorElem = dom.elemOrClosest('.color', e.target);

			if (colorElem) {
				e.preventDefault();
				dialog.panel.querySelector('#HighlightedUserColor').value = colorElem.querySelector('.color-text').textContent;

				return;
			}

			let randomColor = dom.elemOrClosest('.random-color', e.target);

			if (randomColor) {
				e.preventDefault();
				let newColor = color.getRandomColor();

				dialog.panel.querySelector('#HighlightedUserColor').value = newColor;
			}

		}, false);

		return dialog;
	}).then(dialog => {
		dialog.panel.addEventListener('click', (e) => {
			let td = dom.elemOrClosest('td', e.target);

			if (td && td === td.parentNode.querySelector('td')) {
				e.preventDefault();
				dialog.panel.querySelector('#HighlightedUserName').value = td.textContent.trim();
			}

		});

		return dialog;
	});
}

export { open };
