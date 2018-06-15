const webExt = require('web-ext');
const assert = require('assert');
const AWS = require('aws-sdk');

// web-ext  sign -v --id=hupper-beta@ajnasz.hu --api-key=$AMO_JWT_ISSUER --api-secret=$AMO_JWT_SECRET --source-dir=build

const promisify = func => new Promise((resolve, reject) => func((err, data) => err ? reject(err) : resolve(data)));

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

function listFiles (config) {
	const s3 = new AWS.S3({
		accessKeyId: config.accessKeyId,
		secretAccessKey: config.secretAccessKey,
		endpoint: config.endpoint,
	});

	return promisify((cb) => s3.listObjects({
		Bucket: config.bucket,
		Prefix: config.prefix
	}, cb))
		.then(c => c.Contents.map(i => i.Key));
}

const createUpdateJSON = grunt => function () {
	const options = this.options({
		id: '',
		updateLink: '',
	});

	assert(options.id, 'id field is required');
	assert(options.updateLink, 'update_link field is required');
	assert(options.accessKeyId, 'accessKeyId field is required');
	assert(options.secretAccessKey, 'secretAccessKey field is required');
	assert(options.bucket, 'bucket field is required');
	assert(options.endpoint, 'endpoint field is required');
	assert(options.prefix, 'prefix field is required');

	const done = this.async();

	listFiles(options)
		.then(files => files
			.filter(f => f.endsWith('.xpi'))
			.reverse()
			.map(file => ({
				version: file.replace(/^.+[^\d]+(\d+\.\d+\.\dbeta\d+).+/, '$1'),
				/* eslint-disable camelcase */
				update_link: options.updateLink.replace('xFILEx', file),
				/* eslint-enable camelcase */
			}))
		)
		.then(updates => {
			const json = { addons: { [options.id]: { updates } } };

			grunt.file.write('meta/beta-updates.json', JSON.stringify(json, null, '\t'));
			done();
		});
};

module.exports = grunt => {
	grunt.registerMultiTask('webext', signWebExt);
	grunt.registerMultiTask('createUpdateJSON', createUpdateJSON(grunt));
};
