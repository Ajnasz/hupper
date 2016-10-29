import { prefs } from '../core/prefs';
import * as editor from './editor';
import * as editTrolls from './core/edit-trolls';

let editTrollsTpl = editor.createBody({
	formID: 'AddTrollForm',
	tableID: 'ListOfTrolls',
	tableHead: [ 'Name', 'Delete' ],
	fields: [{
		id: 'TrollName',
		label: 'Troll name',
		type: 'text',
		name: 'trollName'
	}]
});

function run () {
	function removeTroll (troll) {
		prefs.getCleanTrolls().then((trolls) => {
			let filteredTrolls = trolls.filter((n) => {
				return n !== troll;
			});
			prefs.setPref('trolls', filteredTrolls.join(','));
			editTrolls.drawTrolls(filteredTrolls);
		});
	}

	function addTroll (troll) {
		prefs.getCleanTrolls().then((trolls) => {
			if (trolls.indexOf(troll) === -1) {
				trolls.push(troll);
				prefs.setPref('trolls', trolls.join(','));
				editTrolls.drawTrolls(trolls);
			}
		});
	}

	editTrolls.events.on('troll', (name) => {
		addTroll(name);
	});

	editTrolls.events.on('untroll', (name) => {
		removeTroll(name);
	});

	prefs.getCleanTrolls().then((trolls) => {
		editTrolls.drawTrolls(trolls);
	});

	editTrolls.init();
}

export {editTrollsTpl as tpl, run };
