import * as dom from './core/dom';

function getForm() {
	return document.getElementById('AddTrollForm');
}

function getList() {
	return document.getElementById('ListOfTrolls').querySelector('tbody');
}

function getTrollNameField() {
	return document.getElementById('TrollName');
}

function createTrollItem(name) {
	let tr = dom.createElem('tr');
	let nameCell = dom.createElem('td', null, null, name);
	let delCell = dom.createElem('td');

	let button = dom.createElem('button', [
		{name: 'type', value: 'button'}
	], ['delete-troll'], 'Delete');

	button.dataset.name = name;
	button.dataset.action = 'untroll';
	delCell.appendChild(button);

	tr.appendChild(nameCell);
	tr.appendChild(delCell);

	return tr;
}

function addTrollItem(name) {
	let container = getList();
	container.appendChild(createTrollItem(name));
}

function drawTrolls(trolls) {
	dom.empty(getList());
	trolls.forEach(addTrollItem);
}

var events = (function () {
	var events = {};

	return {
		on: function (name, cb) {
			if (!events[name]) {
				events[name] = [];
			}

			events[name].push(cb);
		},
		emit: function (name, args) {
			if (events[name]) {
				events.name.forEach((cb) => {
					cb.call(null, args);
				});
			}
		}
	};
}());


function init() {
	getList().addEventListener('click', (e) => {
		let target = e.target;

		if (target.dataset.action === 'untroll') {
			events.emit('untroll', target.dataset.name);
		}
	}, false);

	getForm().addEventListener('submit', (e) => {
		e.preventDefault();

		events.emit('untroll', getTrollNameField().value);
	});
}

export { init, drawTrolls, events };
