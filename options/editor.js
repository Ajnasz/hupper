import * as dom from '../core/dom';
import * as color from '../core/color';
import * as tpl from '../core/tpl';

const editorTPL = `<form action="" method="" id="{formID}">
	{=fields}
	<footer class="dialog-footer">
		<button class="btn btn-cta" type="submit">Hozzáadás</button>
	</footer>
</form>

<div class="hidden js-not-found"><h2 class="panel-subtitle">{notFoundTitle}</h2></div>

<table id="{tableID}" class="js-table js-found hidden"><thead>{=tableHead}</thead><tbody></tbody></table>`;

const controlGroupTPL = `<div class="field-group">
		<label for="{id}">{label}</label>
		<input type="{type}" name="{name}" id="{id}" value="{value}">
	</div>`;


const theadTPL = '<th>{name}</th>';

function isHEX (value) {
	return /^#[A-F0-9]{6}$/i.test(value);
}


function createBody (data) {
	data.fields = data.fields.map(field => tpl.template(controlGroupTPL, field)).join('');
	data.tableHead = data.tableHead.map(th => tpl.template(theadTPL, { name: th })).join('');
	return tpl.template(editorTPL, data);
}

function getRow (fields) {
	const tr = fields.reduce(function (acc, field) {
		const td = dom.createElem('td');

		if (isHEX(field)) {
			const colorSpan = dom.createElem('span', null, ['color']);
			const textSpan = dom.createElem('span', null, ['color-text'], field);
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

	const btn = dom.createElem('button', null, ['btn', 'btn-delete', 'btn-warn'], 'Törlés');
	dom.data('id', fields[0], btn);
	dom.data('action', 'delete', btn);
	const td = dom.createElem('td');
	td.appendChild(btn);

	tr.appendChild(td);

	return tr;
}


export { createBody, getRow };
