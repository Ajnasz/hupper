import * as editor from './editor';
import * as panel from './core/panel';

function draw (get, rowValueMap, dialog) {
	return get().then(items => {
		dialog.drawTable(items.map(rowValueMap));
	});
}

function open (config) {
	const {id, title} = config;

	let tpl = editor.createBody(config.tpl);
	let dialog = panel.create({id, title}, tpl);
	let drawLines = draw.bind(null, config.get, config.tableRowValueMap, dialog);

	function onClick (e) {
		let target = e.target;
		if (target.dataset.action === 'delete') {
			config.remove(target.dataset.id).then(drawLines);
		}
	}

	function onSubmit (e) {
		e.preventDefault();
		let form = dialog.panel.querySelector('form');
		let values = config.formValueMap.map(name => form.querySelector(`[name="${name}"]`).value);
		config.add.apply(null, values).then(drawLines);
	}

	dialog.events.on('click', onClick);
	dialog.events.on('submit', onSubmit);

	return dialog.show().then(drawLines).then(() => {
		dialog.panel.querySelector('input').focus();
	});
}

export { open };
