import { prefs } from '../core/prefs';
import * as editTrolls from './core/edit-trolls';

let editTrollsTpl = `<form action="" method="" id="AddTrollForm">
	<div class="field-group">
		<label for="TrollName">Troll name</label>
		<input type="text" name="trollName" id="TrollName" />
	</div>
	<button class="btn btn-cta" type="submit">Add</button>
</form>

<table id="ListOfTrolls">
	<thead><tr><th>Name</th><td>Delete</td></tr></thead>
	<tbody></tbody>
</table>`;

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
