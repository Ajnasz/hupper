let editorTPL = `<form action="" method="" id="{formID}">
	{fields}
	<footer>
		<button class="btn btn-cta" type="submit">Add</button>
	</footer>
</form>
<table id="{tableID}" class="js-table"><thead>{tableHead}</thead><tbody></tbody></table>`;

let controlGroupTPL = `<div class="field-group">
		<label for="{id}">{label}</label>
		<input type="{type}" name="{name}" id="{id}">
	</div>`;


let theadTPL = '<th>{name}</th>';

function replace (tpl, data) {
	return tpl.replace(/\{([^}]+)\}/g, function (match, item) {
		return data[item] || item;
	});
}

function createBody (data) {
	return editorTPL.replace(/\{([^}]+)\}/g, function (match, item) {
		switch (item) {
		case 'fields':
			return data.fields.map(f => replace(controlGroupTPL, f)).join('');

		case 'tableHead':
			return '<tr>' + data.tableHead.map(t => replace(theadTPL, {name: t})).join('') + '</tr>';

		default:
			return data[item] || item;
		}
	});

}


export { createBody };
