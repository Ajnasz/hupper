console.log('rq.js');

(function (win) {
	'use strict';

	var modules = new Map();

	var moduleOutput = new Map();

	function def(name, factory) {
		console.log('define', name);

		modules.set(name, factory);
	}

	function req(name) {
		console.log('request', name);

		if (!moduleOutput.has(name)) {
			moduleOutput.set(name, modules.get(name)());
		}

		return moduleOutput.get(name);
	}

	win.def = def;
	win.req = req;
}(window));
