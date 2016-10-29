import { prefs } from '../core/prefs';
import * as editor from './editor';
import * as dom from './core/dom';
import * as panel from './core/panel';


let editHighlightedUsersTpl = editor.createBody({
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
});

function draw (dialog) {
	prefs.getCleanHighlightedUsers().then(users => {
		let found = dialog.panel.querySelector('.js-found'),
			notFound = dialog.panel.querySelector('.js-not-found');
		
		if (users.length > 0) {
			let tbody = dialog.panel.querySelector('tbody');
			dom.empty(tbody);
			users.forEach(user => tbody.appendChild(editor.getRow([user.name, user.color])));

			notFound.classList.add('hidden');
			found.classList.remove('hidden');
		} else {
			notFound.classList.remove('hidden');
			found.classList.add('hidden');
		}
	});
}

function open () {
	const id =  'EditHighlightedUsersDialog',
		title =  'Edit highlighted users';

	let dialog = panel.create({id, title}, editHighlightedUsersTpl);

	dialog.show().then(() => {
		dialog.panel.querySelector('input').focus();
	});

	dialog.panel.addEventListener('click', (e) => {
		let target = e.target;

		if (target.dataset.action === 'delete') {
			prefs.removeHighlightedUser(target.dataset.id).then(draw.bind(null, dialog));
		}
	}, false);

	dialog.panel.querySelector('form').addEventListener('submit', (e) => {
		e.preventDefault();

		let elements = dialog.panel.querySelector('form');

		prefs.addHighlightedUser(elements[0].value, elements[1].value).then(draw.bind(null, dialog));
	});

	draw(dialog);
}
export {editHighlightedUsersTpl as tpl, open };
