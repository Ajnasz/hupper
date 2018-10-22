const webExt = require('web-ext');
const assert = require('assert');

function signWebExt () {
	const options = this.options({
		id: '',
		apiSecret: '',
		apiKey: '',
		sourceDir: '',
		artifactsDir: ''
	});

	assert(options.id, 'id field is required');
	assert(options.apiSecret, 'apiSecret is required');
	assert(options.apiKey, 'apiKey is required');
	assert(options.sourceDir, 'sourceDir is required');
	assert(options.artifactsDir, 'artifactsDir is required');

	const done = this.async();

	webExt.default.cmd.sign(options, { shouldExitProgram: false })
		.then(() => {
			done();
		})
		.catch(done);
}

module.exports = grunt => {
	grunt.registerMultiTask('webext', signWebExt);
};
