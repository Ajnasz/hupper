const semver = require('semver');

function getChromeVersion (version) {
	const ver = semver(version);

	if (ver.prerelease.length) {
		const prerelease = ver.prerelease[ver.prerelease.length - 1];
		ver.minor -= 1;

		ver.prerelease = [100 + prerelease];
	}

	return ver.format().replace(/-(\d+)$/, '.$1');
}

function getFirefoxVersion (version) {
	const ver = semver(version);

	if (ver.prerelease.length) {
		const prerelease = ver.prerelease[ver.prerelease.length - 1];

		ver.prerelease = ['beta', prerelease];
	} else {
		ver.prerelease = [];
	}

	return ver.format().replace(/(\d+)\.(\d+)\.(\d+)(-?([a-z]+)\.?(\d+))?/, function (match, major, minor, patch, pre, prename, preversion) {
		let output = `${major}.${minor}.${patch}`;
		if (pre) {
			output += `${prename}${preversion}`;
		}

		return output;
	});
}

function setVersionName (versionName) {
	return manifest => Object.assign({}, manifest, {
		/* eslint-disable camelcase */
		version_name: versionName,
		/* eslint-enable camelcase */
	});
}

function isBeta (version) {
	return semver(version).prerelease.length !== 0;
}

function setVersion (version) {
	const beta = isBeta(version);

	return {
		chrome: manifest => {
			if (beta) {
				return Object.assign({}, manifest, {
					version: getChromeVersion(version),
				});
			}

			return manifest;
		},
		firefox: manifest => {
			if (beta) {
				return Object.assign({}, manifest, {
					version: getFirefoxVersion(version),
				});
			}

			return manifest;
		},
	};
}

function setApplications (applicationID) {
	return {
		chrome: manifest => Object.keys(manifest)
			.filter(key => key !== 'applications')
			.reduce((out, key) => Object.assign(out, {[key]: manifest[key]}), {}),

		firefox: manifest => Object.assign({}, manifest, {
			applications: {
				gecko: {
					id: applicationID
				},
			},
		}),
	};
}

module.exports = (grunt) => grunt.registerMultiTask('manifest', function () {
	const options = this.options({});

	const { manifest, version } = options;
	const versionName = version;

	const reducers = [
		setVersionName(versionName),
		setVersion(version),
		setApplications(options.applicationID),
	];

	const manifestOverrides = reducers.reduce((out, reducer) =>
		(typeof reducer === 'function') ?
			reducer(out) :
			reducer[options.versioning](out), {});

	grunt.verbose.writeln(options.versioning, manifestOverrides);

	grunt.file.write(options.dest, JSON.stringify(Object.assign({}, manifest, manifestOverrides), null, '\t'));
});
