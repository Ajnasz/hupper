/*jshint node: true, esnext: true*/
/*global require*/
/*eslint-env node*/

var fs = require('fs');
var esprima = require('esprima');
var escodegen = require('escodegen');
var path = require('path');

// Executes visitor on the object and its children (recursively).
function traverse(object, visitor) {
	'use strict';
    var key, child;

    visitor.call(null, object);
    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null) {
                traverse(child, visitor);
            }
        }
    }
}

function walk(dir, done) {
	'use strict';
	var results = [];
	fs.readdir(dir, function (err, list) {
		if (err) {
			return done(err);
		}
		var i = 0;
		(function next() {
			var file = list[i++];
			if (!file) {
				return done(null, results);
			}
			file = dir + '/' + file;
			fs.stat(file, function (err, stat) {
				if (err) {
					throw err;
				}
				if (stat && stat.isDirectory()) {
					walk(file, function (err, res) {
						if (err) {
							throw err;
						}
						results = results.concat(res);
						next();
					});
				} else {
					results.push(file);
					next();
				}
			});
		}());
	});
}

function fixRequires(data) {
	'use strict';
	var syntax = esprima.parse(data.toString('utf8'), {
		raw: true,
		tokens: true,
		range: true,
		comment: true
	});

	traverse(syntax, function (node) {
		if (node.type === 'CallExpression') {
			if (node.callee.type === 'Identifier') {
				if ((node.callee.name === 'require' || node.callee.name === 'define') && node.arguments[0].value[0] === '.') {
					var moduleName = node.arguments[0].value, newName;
					if (moduleName.indexOf('./core') === 0) {
						return;

					}

					newName = './core' + moduleName.slice(1);
					console.log('fix module name', moduleName, newName);
					node.arguments[0].value = newName;
				}
			}
		}
	});

	return syntax;

}

walk(process.argv[2], function (err, results) {
	'use strict';
	if (err) {
		throw err;
	}
	results.filter(function (name) {
		return path.basename(name)[0] !== '.';
	}).forEach(function (result) {
		var f = escodegen.generate(fixRequires(fs.readFileSync(result)));
		fs.writeFileSync(result, f);
	});
});
