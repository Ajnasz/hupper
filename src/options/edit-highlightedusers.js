import { prefs } from '../core/prefs';
import * as editorDialog from './editor-dialog';
import * as dom from '../core/dom';
import * as func from '../core/func';

function getOrderedUsers ()  {
	return prefs.getCleanHighlightedUsers().then(users => func.sortBy(users, 'color'));
}

function open () {
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
				name: 'userName'
			}, {
				id: 'HighlightedUserColor',
				label: 'Color',
				type: 'color',
				name: 'userColor'
			}]
		},

		formValueMap: ['userName', 'userColor'],

		get: getOrderedUsers,
		remove: prefs.removeHighlightedUser.bind(prefs),
		add: prefs.addHighlightedUser.bind(prefs)
	}).then(dialog => {
		dialog.panel.addEventListener('click', (e) => {
			let color = dom.elemOrClosest(e.target, '.color');

			if (color) {
				e.preventDefault();
				dialog.panel.querySelector('#HighlightedUserColor').value = color.querySelector('.color-text').textContent;
			}
		}, false);

		return dialog;
	}).then(dialog => {
		dialog.panel.addEventListener('click', (e) => {
			let td = dom.elemOrClosest(e.target, 'td');

			if (td && td === td.parentNode.querySelector('td')) {
				e.preventDefault();
				dialog.panel.querySelector('#HighlightedUserName').value = td.textContent.trim();
			}

		});

		return dialog;
	});
}

export { open };
