import { prefs } from '../core/prefs';
import * as editorDialog from './editor-dialog';
import * as dom from '../core/dom';
import * as func from '../core/func';
import * as color from '../core/color';

function getOrderedUsers ()  {
	return prefs.getCleanHighlightedUsers().then(users => func.sortBy(users, 'color'));
}

function dispatchUserNameChange (target) {
	const event = new Event('userNameChange', {
		'bubbles': true,
		'cancelable': true,
	});
	target.dispatchEvent(event);
}

function open (options) {
	return editorDialog.open({
		id: 'EditHighlightedUsersDialog',
		title: 'Felhasználó kiemelések szerekesztése',
		tableRowValueMap: user => [user.name, user.color],
		tpl: {
			formID: 'HighlightUserForm',
			tableID: 'ListOfHighlightedUsers',
			tableHead: ['Név', 'Szín', 'Törlés'],
			notFoundTitle: 'Még nincsenek kiemelések hozzáadva',
			fields: [{
				id: 'HighlightedUserName',
				label: 'Név',
				type: 'text',
				name: 'userName',
				value: ''
			}, {
				id: 'HighlightedUserColor',
				label: 'Szín',
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
		const rndBtn = dom.createElem('button', [{ name: 'type', value: 'button' }], ['btn', 'random-color'], 'Véletlen szín');
		dialog.panel.querySelector('#HighlightedUserColor').parentNode.appendChild(rndBtn);
		dialog.panel.addEventListener('click', (e) => {
			const colorElem = dom.elemOrClosest('.color', e.target);

			if (colorElem) {
				e.preventDefault();
				dialog.panel.querySelector('#HighlightedUserColor').value = colorElem.querySelector('.color-text').textContent;

				return;
			}

			const randomColor = dom.elemOrClosest('.random-color', e.target);

			if (randomColor) {
				e.preventDefault();
				const newColor = color.getRandomColor();

				dialog.panel.querySelector('#HighlightedUserColor').value = newColor;
			}

		}, false);

		return dialog;
	}).then(dialog => {
		dialog.panel.addEventListener('click', (e) => {
			const td = dom.elemOrClosest('td', e.target);

			if (td && td === td.parentNode.querySelector('td')) {
				e.preventDefault();
				const input = dialog.panel.querySelector('#HighlightedUserName');
				input.value = td.textContent.trim();
				dispatchUserNameChange(input);
			}
		});
		return dialog;
	}).then(dialog => {
		const onUserNameChange = (e) => {
			const value = e.target.value;
			getOrderedUsers().then(users => {
				const btn = dialog.panel.querySelector('.btn-cta');
				if (func.index(users, u => u.name === value) > -1) {
					btn.textContent = 'Frissítés';
				} else {
					btn.textContent = 'Hozzáadás';
				}
			});
		};

		const onValueChange = (e) => {
			if (dom.is('[name="userName"]', e.target)) {
				dispatchUserNameChange(e.target);
			}
		};
		dialog.panel.addEventListener('userNameChange', onUserNameChange);
		dialog.panel.addEventListener('input', onValueChange);
		dialog.panel.addEventListener('change', onValueChange);
		dialog.panel.addEventListener('submit', () => dispatchUserNameChange(dialog.panel.querySelector('#HighlightedUserName')));
	});
}

export { open };
