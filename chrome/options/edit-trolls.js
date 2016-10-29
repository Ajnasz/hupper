import * as dom from './core/dom';
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
		let found = dialog.panel.querySelector('.js-found'),
			notFound = dialog.panel.querySelector('.js-not-found');

		if (trolls.length > 0) {
			let tbody = dialog.panel.querySelector('tbody');
			dom.empty(tbody);
			trolls.forEach(troll => tbody.appendChild(editor.getRow([troll])));

			notFound.classList.add('hidden');
			found.classList.remove('hidden');
		} else {
			notFound.classList.remove('hidden');
			found.classList.add('hidden');
		}
		// editTrolls.drawTrolls(trolls);
	});
}

function open () {
	const id =  'EditTrollsDialog',
		title =  'Edit trolls';

	let dialog = panel.create({id, title}, editTrollsTpl);

	dialog.show().then(() => {
		dialog.panel.querySelector('input').focus();
	});

	dialog.panel.addEventListener('click', (e) => {
		let target = e.target;

		if (target.dataset.action === 'delete') {
			prefs.removeTroll(target.dataset.id).then(draw.bind(null, dialog));
		}
	}, false);

	dialog.panel.querySelector('form').addEventListener('submit', (e) => {
		e.preventDefault();

		prefs.addTroll(dialog.panel.querySelector('form').elements[0].value).then(draw.bind(null, dialog));
	});

	draw(dialog);

}

export {editTrollsTpl as tpl, open };
