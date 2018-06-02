const webExt = require('web-ext');
const assert = require('assert');

// web-ext  sign -v --id=hupper-beta@ajnasz.hu --api-key=$AMO_JWT_ISSUER --api-secret=$AMO_JWT_SECRET --source-dir=build

module.exports = grunt => grunt.registerMultiTask('webext', function () {
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
		.catch((err) => {
			done(err)
		});
});
