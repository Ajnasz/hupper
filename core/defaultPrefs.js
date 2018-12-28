const defaultPrefs = Object.freeze([

	{
		'name': 'setunlimitedlinks',
		// 'title': 'Show as many comments as possible on a page',
		'title': 'A lehető legtöbb hozzászólás mutatása',
		'type': 'bool',
		'value': true,
		'group': 'comments'
	},

	{
		'name': 'replacenewcommenttext',
		// 'title': 'Replace the "új" text of new comments to a better searchable one',
		'title': 'Olvasatlan hozzászólásoknál az "új" szöveg lecserélése valami jobban kereshetőre',
		'type': 'bool',
		'value': true,
		'group': 'comments',
		'requiredBy': ['newcommenttext']
	},

	{
		'name': 'newcommenttext',
		// 'title': 'The text to show instead of \"új\"',
		'title': 'Szöveg az új hozzászólásokban "új" helyett',
		'type': 'string',
		'value': '[new]',
		'group': 'comments'
	},

	{
		'name': 'filtertrolls',
		// 'title': 'Enable trollfilter',
		'title': 'Trollszűrő engedélyezése',
		'type': 'bool',
		'value': true,
		'group': 'comments',
		'requiredBy': ['edittrolls']
	},

	{
		'name': 'edittrolls',
		// 'title': 'Edit trolls',
		'title': 'Trollok szerkesztése',
		'label': 'Click to edit trolls',
		'type': 'control',
		'group': 'comments'
	},

	{
		'name': 'trolls',
		// 'title': 'List of trolls',
		'title': 'Trollok listája',
		'type': 'array',
		'value': [],
		'hidden': true,
		'group': 'comments'
	},

	{
		'name': 'huppercolor',
		// 'title': 'Default color of highlighted user\'s comment header',
		'title': 'Kiemelt felhasználók alapértelmezett színe',
		'type': 'color',
		'value': '#B5D7BE',
		'group': 'comments'
	},

	{
		'name': 'edithighlightusers',
		// 'title': 'Edit highlighted users',
		'title': 'Kiemelt felhasználók szerkesztése',
		'label': 'Click to edit highlighted users',
		'type': 'control',
		'group': 'comments'
	},

	{
		'name': 'highlightusers',
		// 'title': 'Highlight comments of the users',
		'title': 'Kiemelt felhasználók listája',
		'type': 'array',
		'value': [
			{ name: 'username', color: '#fff999' },
			{ name: 'username2', color: '#999fff' }
		],
		'hidden': true,
		'group': 'comments'
	},

	{
		'name': 'hidetaxonomy',
		// 'title': 'Hidden article types',
		'title': 'Rejtett sikkek listája',
		'type': 'array',
		'value': [],
		'hidden': true,
		'group': 'articles'
	},

	{
		'name': 'edithidetaxonomy',
		// 'title': 'Edit hidden article types',
		'title': 'Rejtett cikkek szerkesztése',
		'type': 'control',
		'group': 'articles'
	},

	{
		'name': 'blocks',
		// 'title': 'Block settings',
		'title': 'Block beállítások',
		'type': 'array',
		'value': [],
		'hidden': true,
		'group': 'blocks'
	},
	{
		'name': 'parseblocks',
		// 'title': 'Parse blocks',
		'title': 'Blokkokhoz tartozó funkciók engedélyezése',
		'type': 'bool',
		'value': true,
		'group': 'blocks'

	},

	{
		'name': 'style_wider_sidebar',
		// 'title': 'Width of sidebars',
		'title': 'Oldalsó oszlopok szélessége',
		'type': 'integer',
		'value': 0,
		'group': 'styles'
	},

	{
		'name': 'style_min_fontsize',
		// 'title': 'Minimum font size',
		'title': 'Minimum betűméret',
		'type': 'integer',
		'value': 0,
		'group': 'styles'
	},

	{
		'name': 'style_min_comment_width',
		// 'title': 'Width of sidebars',
		'title': 'Hozzászólások minimum szélessége',
		'type': 'integer',
		'value': 0,
		'group': 'styles'
	},

	{
		'name': 'style_accessibility',
		// 'title': 'Load accessibility styles',
		'title': 'Használatot segítő stílusok betöltése',
		'type': 'bool',
		'value': true,
		'group': 'styles'
	},

	{
		'name': 'style_hide_left_sidebar',
		// 'title': 'Hide left sidebar',
		'title': 'Bal oldali oszlop elrejtése',
		'type': 'bool',
		'value': false,
		'group': 'styles'
	},

	{
		'name': 'style_hide_right_sidebar',
		// 'title': 'Hide right sidebar',
		'title': 'Jobb oldali oszlop elrejtése',
		'type': 'bool',
		'value': false,
		'group': 'styles'
	},

	{
		'name': 'hideboringcomments',
		// 'title': 'Hide boring comments',
		'title': 'Unalmas hozzászólások elrejtése',
		'type': 'bool',
		'value': true,
		'group': 'comments',
		'requiredBy': ['boringcommentcontents']
	},

	{
		'name': 'boringcommentcontents',
		// 'title': 'Regular expression to identify boring comments',
		'title': 'Reguláris kifejezés az unalmas hozzászólások megtalálásához',
		'type': 'string',
		'value': '^([-_.]|[-+]1|sub|subscribe)$',
		'group': 'comments'
	},

	{
		'name': 'alwaysshownewcomments',
		'title': 'Olvasatlan hozzászólások mindig jelenjenek meg',
		'type': 'bool',
		'value': false,
		'group': 'comments'
	},

	{
		'name': 'validateForms',
		'title': 'Hozzászólások formai ellenőrzése beküldés előtt',
		'type': 'bool',
		'value': true,
		'group': 'content_creation'
	},

	{
		'name': 'block-embed',
		'title': 'Embed blokkolás',
		'type': 'bool',
		'value': false,
		'group': 'styles'
	},

	{
		'name': 'logenabled',
		// 'title': 'Regular expression to identify boring comments',
		'title': 'Logolás engedélyezése',
		'type': 'bool',
		'value': false,
		'hidden': true,
		'group': null
	}
]);

export default defaultPrefs;
