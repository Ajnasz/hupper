import { prefs } from '../core/prefs';
import * as editorDialog from './editor-dialog';

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

		get: prefs.getCleanHighlightedUsers.bind(prefs),
		remove: prefs.removeHighlightedUser.bind(prefs),
		add: prefs.addHighlightedUser.bind(prefs)
	});
}

export { open };
