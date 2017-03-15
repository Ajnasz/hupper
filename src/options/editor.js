import * as dom from '../core/dom';
import * as color from '../core/color';
import * as tpl from '../core/tpl';

let editorTPL = `<form action="" method="" id="{formID}">
	{=fields}
	<footer>
		<button class="btn btn-cta" type="submit">Add</button>
	</footer>
</form>

<div class="hidden js-not-found"><h2>{notFoundTitle}</h2></div>

<table id="{tableID}" class="js-table js-found hidden"><thead>{=tableHead}</thead><tbody></tbody></table>`;

let controlGroupTPL = `<div class="field-group">
		<label for="{id}">{label}</label>
		<input type="{type}" name="{name}" id="{id}" value="{value}">
	</div>`;


let theadTPL = '<th>{name}</th>';

function isHEX (value) {
	return /^#[A-F0-9]{6}$/i.test(value);
}


function createBody (data) {
	data.fields = data.fields.map(field => tpl.template(controlGroupTPL, field)).join('');
	data.tableHead = data.tableHead.map(th => tpl.template(theadTPL, {name: th})).join('');
	return tpl.template(editorTPL, data);
}

function getRow (fields) {
	let tr = fields.reduce(function (acc, field) {
		let td = dom.createElem('td', null, null);

		if (isHEX(field)) {
			let colorSpan = dom.createElem('span', null, ['color']),
				textSpan = dom.createElem('span', null, ['color-text'], field);
			colorSpan.style.backgroundColor = field;
			textSpan.style.color = color.getContrastColor(field);
			colorSpan.appendChild(textSpan);
			td.appendChild(colorSpan);
		} else {
			td.textContent = field;
		}
		acc.appendChild(td);
		return acc;
	}, dom.createElem('tr'));

	let btn = dom.createElem('button', [
		{name: 'data-id', value: fields[0]},
		{name: 'data-action', value: 'delete'}
	], ['btn', 'btn-delete', 'btn-warn'], 'Delete');
	let td = dom.createElem('td');
	td.appendChild(btn);

	tr.appendChild(td);

	return tr;
}


export { createBody, getRow };
