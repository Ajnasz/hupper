import { prefs } from '../core/prefs';
import * as editorDialog from './editor-dialog';

function open () {
	return editorDialog.open({
		id: 'EditTrollsDialog',
		title: 'Edit trolls',
		tableRowValueMap: x => [x],
		tpl: {
			formID: 'AddTrollForm',
			tableID: 'ListOfTrolls',
			tableHead: [ 'Name', 'Delete' ],
			notFoundTitle: 'No trolls added',
			fields: [{
				id: 'TrollName',
				label: 'Troll name',
				type: 'text',
				name: 'trollName',
				value: ''
			}]
		},

		formValueMap: ['trollName'],

		get: prefs.getCleanTrolls.bind(prefs),
		remove: prefs.removeTroll.bind(prefs),
		add: prefs.addTroll.bind(prefs),
		changeField: 'trolls'
	});
}

export { open };
