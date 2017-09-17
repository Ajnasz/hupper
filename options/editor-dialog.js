import * as editor from './editor';
import * as panel from './core/panel';
import { prefs } from '../core/prefs';

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

	function onChange (...args) {
		drawLines(...args);
	}

	prefs.events.on(config.changeField, onChange);

	function onClick (e) {
		let target = e.target;
		if (target.dataset.action === 'delete') {
			config.remove(target.dataset.id);
		}
	}

	function onSubmit (e) {
		e.preventDefault();
		let form = dialog.panel.querySelector('form');
		let values = config.formValueMap.map(name => form.querySelector(`[name="${name}"]`).value);
		config.add.apply(null, values);
		form.reset();
		form.querySelector('input').focus();
	}

	dialog.events.on('click', onClick);
	dialog.events.on('submit', onSubmit);
	dialog.events.once('close', function onClose () {
		dialog.events.off('click', onClick);
		dialog.events.off('submit', onSubmit);
		prefs.events.off(config.changeField, onChange);
	});

	return drawLines().then(() => dialog.show()).then(() => {
		dialog.panel.querySelector('input').focus();

		return dialog;
	});
}

export { open };
