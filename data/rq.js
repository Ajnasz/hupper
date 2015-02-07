console.log('rq.js');

(function (win) {
	'use strict';

	var modules = {};

	var moduleOutput = {};

	function def(name, factory) {
		console.log('define', name);

		modules[name] = factory;
	}

	function req(name) {
		console.log('request', name);

		if (!moduleOutput[name]) {
			moduleOutput[name] = modules[name]();
		}

		return moduleOutput[name];
	}

	win.def = def;
	win.req = req;
}(window));
