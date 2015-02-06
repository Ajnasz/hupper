console.log('rq.js');

(function (win) {
	'use strict';

	var modules = {};

	function def(name, factory) {
		console.log('define', name);

		modules[name] = factory;
	}

	function req(name) {
		console.log('request', name);

		return modules[name];
	}

	win.def = def;
	win.req = req;
}(window));
