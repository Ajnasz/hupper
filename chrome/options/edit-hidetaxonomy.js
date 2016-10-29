import { prefs } from '../core/prefs';
import * as editor from './editor';
import * as panel from './core/panel';

let editTaxonomiesTpl = editor.createBody({
	formID: 'EditTaxonomyForm',
	tableID: 'ListOfTaxonomies',
	tableHead: [ 'Article type', 'Delete' ],
	notFoundTitle: 'No article types added',
	fields: [{
		id: 'ArticleType',
		label: 'ArticleType',
		type: 'text',
		name: 'articleType'
	}]
});

function draw (dialog) {
	prefs.getCleanTaxonomies().then((taxonomies) => {
		dialog.drawTable(taxonomies.map(x => [x]));
	});
}

function open () {
	const id =  'EditTaxoomiesDialog',
		title =  'Edit articles';

	let dialog = panel.create({id, title}, editTaxonomiesTpl);

	function onClick (e) {
		let target = e.target;
		if (target.dataset.action === 'delete') {
			prefs.removeTaxonomy(target.dataset.id).then(draw.bind(null, dialog));
		}
	}

	function onSubmit (e) {
		e.preventDefault();
		prefs.addTaxonomy(dialog.panel.querySelector('form').elements[0].value).then(draw.bind(null, dialog));
	}

	dialog.events.on('click', onClick);
	dialog.events.on('submit', onSubmit);

	dialog.show().then(() => {
		dialog.panel.querySelector('input').focus();
	});

	draw(dialog);

}

export { open };

