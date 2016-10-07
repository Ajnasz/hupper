/*jshint esnext: true*/
var hupperModules = Object.create(null);

function require(name) {
	'use strict';
	if (!hupperModules[name]) {
		throw new Error('unknown module: ' + name);
	}
	return hupperModules[name];
}

function define(name, fn) {
	'use strict';
	if (hupperModules[name]) {
		throw new Error('hupper module already defined: ' + name);
	}
	console.log('define %s', name);
	hupperModules[name] = {};
	fn(hupperModules[name]);
}
