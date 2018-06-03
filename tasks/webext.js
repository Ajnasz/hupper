const webExt = require('web-ext');
const assert = require('assert');
const fs = require('fs-extra');

// web-ext  sign -v --id=hupper-beta@ajnasz.hu --api-key=$AMO_JWT_ISSUER --api-secret=$AMO_JWT_SECRET --source-dir=build

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

const createUpdateJSON = grunt => function () {
	const options = this.options({
		id: '',
		json: '',
		version: '',
		updateLink: '',
	});

	assert(options.id, 'id field is required');
	assert(options.json, 'JSON field is required');
	assert(options.version, 'version field is required');
	assert(options.updateLink, 'update_link field is required');
	const json = grunt.file.readJSON(options.json);

	const data = {
		version: options.version,
		/* eslint-disable camelcase */
		update_link: options.updateLink,
		/* eslint-enable camelcase */
	};

	const currentIndex = json.addons[options.id].updates.findIndex(e => e.version === options.version);

	if (currentIndex === -1) {
		json.addons[options.id].updates = [data].concat(json.addons[options.id].updates);
	} else {
		const updates = [].concat(json.addons[options.id].updates);
		updates.splice(currentIndex, 1, data);
		json.addons[options.id].updates = updates;

	}

	const done = this.async();

	fs.writeFile(options.json, JSON.stringify(json, null, '\t')).then(done);
};

module.exports = grunt => {
	grunt.registerMultiTask('webext', signWebExt);
	grunt.registerMultiTask('createUpdateJSON', createUpdateJSON(grunt));
};
