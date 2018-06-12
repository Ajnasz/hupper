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

function setApplications (applicationID, updateURL) {
	const remove = manifest => Object.keys(manifest)
		.filter(key => key !== 'applications')
		.reduce((out, key) => Object.assign(out, { [key]: manifest[key] }), {});

	const set = manifest => {
		let gecko = {};

		if (applicationID) {
			gecko = Object.assign({}, gecko, { id: applicationID });
		}

		if (updateURL) {
			/* eslint-disable camelcase */
			gecko = Object.assign({}, gecko, { update_url: updateURL });
			/* eslint-enable camelcase */
		}

		return Object.assign({}, manifest, {
			applications: { gecko },
		});
	};

	return {
		chrome: remove,

		firefox: manifest => applicationID || updateURL ?
			set(manifest) :
			remove(manifest),
	};
}

function setPermissions (lh) {
	return manifest => Object.assign({}, manifest, {
		permissions: manifest.permissions.filter(perm => {
			return !/hup\.lh\/?$/.test(perm) || lh;
		}, [])
	});
}

function setContentScripts (lh) {
	return manifest => Object.assign({}, manifest, {
		/* eslint-disable camelcase */
		content_scripts: manifest.content_scripts.map((script) => {
		/* eslint-enable camelcase */
			return Object.assign({}, script, {
				matches: script.matches.filter(match => {
					return !/hup\.lh\/?/.test(match) || lh;
				}),
			});
		}),
	});
}

module.exports = (grunt) => grunt.registerMultiTask('manifest', function () {
	const options = this.options({
		lhPermission: false,
	});

	const { manifest, version } = options;
	const versionName = version;


	const output = [
		setVersionName(versionName),
		setVersion(version),
		setApplications(options.applicationID, options.updateURL),
		setPermissions(options.lhPermission),
		setContentScripts(options.lhPermission),
		(o) => JSON.stringify(o, null, '\t')
	].reduce((out, reducer) => {
		return (typeof reducer === 'function') ?
			reducer(out) :
			reducer[options.versioning](out);
	}, Object.assign({}, manifest));

	grunt.verbose.writeln(output);

	grunt.file.write(options.dest, output);
});
