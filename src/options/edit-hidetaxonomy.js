import { prefs } from '../core/prefs';
import * as editorDialog from './editor-dialog';

function open () {
	return editorDialog.open({
		id: 'EditTaxonomiesDialog',
		title: 'Edit articles',
		tableRowValueMap: x => [x],
		tpl: {
			formID: 'EditTaxonomyForm',
			tableID: 'ListOfTaxonomies',
			tableHead: [ 'Article type', 'Delete' ],
			notFoundTitle: 'No article types added',
			fields: [{
				id: 'ArticleType',
				label: 'ArticleType',
				type: 'text',
				name: 'articleType',
				value: ''
			}]
		},

		formValueMap: ['articleType'],

		get: prefs.getCleanTaxonomies.bind(prefs),
		remove: prefs.removeTaxonomy.bind(prefs),
		add: prefs.addTaxonomy.bind(prefs),
		changeField: 'hidetaxonomy'
	});
}

export { open };
