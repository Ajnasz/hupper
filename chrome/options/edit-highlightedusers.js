import { prefs } from '../core/prefs';
import * as editor from './editor';
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
		dialog.drawTable(users.map(user => [user.name, user.color]));
	});
}

function open () {
	const id =  'EditHighlightedUsersDialog',
		title =  'Edit highlighted users';

	let dialog = panel.create({id, title}, editHighlightedUsersTpl);

	function onClick (e) {
		let target = e.target;

		if (target.dataset.action === 'delete') {
			prefs.removeHighlightedUser(target.dataset.id).then(draw.bind(null, dialog));
		}
	}

	function onSubmit (e) {
		e.preventDefault();

		let elements = dialog.panel.querySelector('form');

		prefs.addHighlightedUser(elements[0].value, elements[1].value).then(draw.bind(null, dialog));
	}

	dialog.events.on('click', onClick);
	dialog.events.on('submit', onSubmit);

	dialog.show().then(() => {
		dialog.panel.querySelector('input').focus();
	});

	draw(dialog);
}
export {editHighlightedUsersTpl as tpl, open };
