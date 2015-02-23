/*jshint moz:true*/
/*global require, exports*/
function start() {
	'use strict';
	let self = require('sdk/self');
	let pref = require('./pref');
	let panel = require('sdk/panel').Panel({
		contentURL: self.data.url('panels/edit-trolls.html'),
		contentStyleFile: [
			self.data.url('panels/panels.css'),
			self.data.url('panels/edit-trolls.css'),
		],
		contentScriptFile: [
			self.data.url('rq.js'),
			self.data.url('dom.js'),
			self.data.url('func.js'),
			self.data.url('panels/edit-trolls.js'),
		]
	});

	function removeTroll(troll) {
		pref.setPref('trolls', pref.getCleanTrolls().filter(function (n) {
			return n !== troll;
		}).join(','));
	}

	function addTroll(troll) {
		let trolls = pref.getCleanTrolls();
		trolls.push(troll);
		pref.setPref('trolls', trolls.join(','));
	}

	panel.port.on('getTrolls', function () {
		panel.port.emit('showTrolls', pref.getCleanTrolls());
	});

	panel.port.on('untroll', function (name) {
		removeTroll(name);
		panel.port.emit('showTrolls', pref.getCleanTrolls());
	});

	panel.port.on('addTroll', function (troll) {
		if (troll.trim() === '') {
			panel.port.emit('addTrollError', 'Troll name required');
		} else if (pref.getCleanTrolls().indexOf(troll.trim()) > -1) {
			panel.port.emit('addTrollError', 'Troll already added');
		} else {
			addTroll(troll);
			panel.port.emit('addTrollSuccess');
			panel.port.emit('showTrolls', pref.getCleanTrolls());
		}
	});

	panel.show();
}

exports.start = start;
