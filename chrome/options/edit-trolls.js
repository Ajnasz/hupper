import { prefs } from '../core/prefs';
import * as editor from './editor';
import * as panel from './core/panel';

let editTrollsTpl = editor.createBody({
	formID: 'AddTrollForm',
	tableID: 'ListOfTrolls',
	tableHead: [ 'Name', 'Delete' ],
	notFoundTitle: 'No trolls added',
	fields: [{
		id: 'TrollName',
		label: 'Troll name',
		type: 'text',
		name: 'trollName'
	}]
});

function draw (dialog) {
	prefs.getCleanTrolls().then((trolls) => {
		dialog.drawTable(trolls.map(t => [t]));
	});
}

function open () {
	const id =  'EditTrollsDialog',
		title =  'Edit trolls';

	let dialog = panel.create({id, title}, editTrollsTpl);

	function onClick (e) {
		let target = e.target;
		if (target.dataset.action === 'delete') {
			prefs.removeTroll(target.dataset.id).then(draw.bind(null, dialog));
		}
	}

	function onSubmit (e) {
		e.preventDefault();
		prefs.addTroll(dialog.panel.querySelector('form').elements[0].value).then(draw.bind(null, dialog));
	}

	dialog.events.on('click', onClick);
	dialog.events.on('submit', onSubmit);

	dialog.show().then(() => {
		dialog.panel.querySelector('input').focus();
	});

	draw(dialog);

}

export {editTrollsTpl as tpl, open };
