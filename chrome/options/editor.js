let editorTPL = `<h1>{title}</h1>

<form action="" method="" id="">
	{fields}
	<footer>
		<button type="submit">Add</button>
	</footer>
</form>

<table class="js-table"><tbody></tbody></table>`;

let controlGroupTPL = `<div class="field-group">
		<label for="{id}">{label}</label>
		<input type="{type}" name="{name}" id="{id}">
	</div>`;

function replace (tpl, data) {
	return tpl.replace(/\{([^}]+)\}/g, function (match, item) {
		return data[item] || item;
	});
}

function createFragment (data) {

	let fragment = document.createDocumentFragement();

	fragment.innerHTML = editorTPL.replace(/\{([^}]+)\}/g, function (match, item) {
		switch (item) {
		case 'fields':
			return data.fields.map(field => replace(controlGroupTPL, field));
		default:
			return data[item] || item;
		}
	});

}

export { createFragment };
