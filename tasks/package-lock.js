const assert = require('assert');

module.exports = (grunt) => grunt.registerMultiTask('packageLock', function () {
	const options = this.options({
		version: null,
		file: '',
	});

	const { file, version } = options;

	assert(version, 'version');
	assert(file, 'file');

	const packageLock = grunt.file.readJSON(file);

	grunt.file.write(file, JSON.stringify(Object.assign({}, packageLock, { version }), null, '  '));
});
