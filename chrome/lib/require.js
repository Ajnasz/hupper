/*jshint esnext: true*/
var hupperModules = {};

function require(name) {
	'use strict';
	if (!hupperModules[name]) {
		throw new Error('unknown block: ' + name);
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
