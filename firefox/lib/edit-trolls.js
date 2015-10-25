/*jshint esnext: true*/
/*global require, exports*/
function start() {
	'use strict';
	let self = require('sdk/self');
	let pref = require('./pref').pref;
	console.log('PPPPPPPPP;,', pref);

	let panel = require('sdk/panel').Panel({
		contentURL: self.data.url('panels/edit-trolls.html'),
		contentStyleFile: [
			self.data.url('panels/css/panels.css'),
			self.data.url('panels/css/edit-trolls.css')
		],
		contentScriptFile: [
			self.data.url('core/rq.js'),
			self.data.url('core/dom.js'),
			self.data.url('core/func.js'),
			self.data.url('panels/edit-trolls.js')
		]
	});

	function removeTroll(troll) {
		return pref.getCleanTrolls().then((trolls) => {
			let filteredTrolls = trolls.filter(function (n) {
				return n !== troll;
			});
			pref.setPref('trolls', filteredTrolls.join(','));

			return Promise.resolve(filteredTrolls);
		});
	}

	function addTroll(troll) {
		return pref.getCleanTrolls().then((trolls) => {
			trolls.push(troll);
			pref.setPref('trolls', trolls.join(','));

			return Promise.resolve(trolls);
		});
	}

	panel.port.on('getTrolls', function () {
		pref.getCleanTrolls().then((trolls) => {
			panel.port.emit('showTrolls', trolls);
		});
	});

	panel.port.on('untroll', function (name) {
		removeTroll(name).then((trolls) => {
			panel.port.emit('showTrolls', trolls);
		});
	});

	panel.port.on('addTroll', function (troll) {
		pref.getCleanTrolls().then((trolls) => {
			if (troll.trim() === '') {
				panel.port.emit('addTrollError', 'Troll name required');
			} else if (trolls.indexOf(troll.trim()) > -1) {
				panel.port.emit('addTrollError', 'Troll already added');
			} else {
				addTroll(troll).then(function (trolls) {
					panel.port.emit('addTrollSuccess');
					panel.port.emit('showTrolls', trolls);
				});
			}
		});
	});

	panel.show();
}

exports.start = start;
