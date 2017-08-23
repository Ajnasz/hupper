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

module.exports = (grunt) => {
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-concurrent');

	grunt.registerMultiTask('manifest', function () {
		const target = this.target;
		const options = this.options({
			beta: false,
		});

		const manifest = grunt.file.readJSON('./manifest.json');
		let { version } = grunt.file.readJSON('./package.json');

		const versionName = version;

		let manifestOverrides = {};

		if (typeof options.beta === 'number') {
			switch (options.versioning) {
				case 'chrome':
					manifestOverrides = Object.assign(manifestOverrides, {
						version: getChromeVersion(version),
						/* eslint-disable camelcase */
						version_name: versionName,
						/* eslint-enable camelcase */
					});
					manifestOverrides = Object.keys(manifestOverrides)
						.filter(key => key !== 'applications')
						.reduce((out, key) => out[key] = manifestOverrides[key], {});
					break;
				case 'firefox':
					manifestOverrides = Object.assign(manifestOverrides, {
						version: getFirefoxVersion(version),
						/* eslint-disable camelcase */
						version_name: versionName,
						/* eslint-enable camelcase */
						applications: {
							gecko: {
								id: 'hupper@ajnasz.hu'
							},
						},
					});
					break;
			}

			grunt.verbose.writeln(options.versioning, 'version', version, 'versionName', versionName);
		}

		grunt.file.write(`manifest_${target}.json`, JSON.stringify(Object.assign({}, manifest, manifestOverrides), null, '\t'));
	});

	const chromeConfig = {
		transform: [
			[
				'babelify', { presets: [ [
					'env', { targets: { browsers: ['last 5 Chrome versions'] }, },
				], ], },
			],
		],
	};

	const firefoxConfig = {
		transform: [
			[
				'babelify', { presets: [ [
					'env', { targets: { browsers: ['Firefox 52'] }, },
				], ], },
			],
		],
	};

	grunt.initConfig({
		clean: {
			firefox: 'hupper_firefox.zip',
			chrome: 'hupper_chrome.zip',
			manifestBackup: 'manifest.json.bak',
			manifestFirefox: [
				'manifest_firefox.json',
				'manifest.json.bak',
			],
			manifestChrome: [
				'manifest_chrome.json',
				'manifest.json.bak',
			],
		},

		copy: {
			manifestBackup: {
				files: {
					'./manifest.json.bak': './manifest.json',
				},
			},

			manifestChrome: {
				files: {
					'./manifest.json': './manifest_chrome.json',
				},
			},

			manifestFirefox: {
				files: {
					'./manifest.json': './manifest_firefox.json',
				},
			},

			manifestRestore: {
				files: {
					'./manifest.json': './manifest.json.bak',
				},
			},
		},

		browserify: {
			chromeOptions: {
				options: chromeConfig,
				files: { 'options/bundle.js': 'options/main.js', },
			},

			chromeLib: {
				options: chromeConfig,
				files: { 'lib/bundle.js': 'lib/main.js', },
			},

			chromeData: {
				options: chromeConfig,
				files: { 'data/bundle.js': 'data/main.js', },
			},

			firefoxOptions: {
				options: firefoxConfig,
				files: { 'options/bundle.js': 'options/main.js', },
			},

			firefoxLib: {
				options: firefoxConfig,
				files: { 'lib/bundle.js': 'lib/main.js', },
			},

			firefoxData: {
				options: firefoxConfig,
				files: { 'data/bundle.js': 'data/main.js', },
			},
		},

		eslint: {
			options: {
				ignorePattern: 'bundle\\.js',
				configFile: '.eslintrc',
			},
			opts: [ 'options/**/*.js', ],

			lib: [ 'lib/**/*.js', ],

			data: [ 'data/**/*.js', ],

			core: [ 'core/**/*.js', ]
		},

		compress: {
			chrome: {
				options: {
					archive: 'hupper_chrome.zip',
				},
				files: [
					{ src: 'images/icons/*.png', dest: '/', expand: true },
					{ src: 'data/bundle.js', dest: '/', expand: true },
					{ src: 'data/core/css/*.css', dest: '/', expand: true },
					{ src: 'lib/bundle.js', dest: '/', expand: true },
					{ src: 'options/bundle.js', dest: '/', expand: true },
					{ src: 'options/*.css', dest: '/', expand: true },
					{ src: 'options.html', dest: '/', expand: true },
					{ src: 'manifest.json', dest: '/', expand: true },
					{ src: 'icons/128.png', dest: '/', expand: true },
					{ src: 'icons/48.png', dest: '/', expand: true },
					{ src: 'icons/32.png', dest: '/', expand: true },
					{ src: 'icons/16.png', dest: '/', expand: true },
				],
			},

			firefox: {
				options: {
					archive: 'hupper_firefox.zip',
				},
				files: [
					{ src: 'images/icons/*.png', dest: '/', expand: true },
					{ src: 'data/bundle.js', dest: '/', expand: true },
					{ src: 'data/core/css/*.css', dest: '/', expand: true },
					{ src: 'lib/bundle.js', dest: '/', expand: true },
					{ src: 'options/bundle.js', dest: '/', expand: true },
					{ src: 'options/*.css', dest: '/', expand: true },
					{ src: 'options.html', dest: '/', expand: true },
					{ src: 'manifest.json', dest: '/', expand: true },
					{ src: 'icons/128.png', dest: '/', expand: true },
					{ src: 'icons/48.png', dest: '/', expand: true },
					{ src: 'icons/32.png', dest: '/', expand: true },
					{ src: 'icons/16.png', dest: '/', expand: true },
				],
			},
		},

		manifest: {
			options: {
				beta: 4,
			},
			chrome: {
				options: {
					versioning: 'chrome',
				},
			},

			firefox: {
				options: {
					versioning: 'firefox',
				},
			}
		},

		concurrent: {
			eslint: [
				'eslint:opts',
				'eslint:lib',
				'eslint:data',
				'eslint:core',
			],
			browserifyChrome: [
				'browserify:chromeOptions',
				'browserify:chromeLib',
				'browserify:chromeData',
			],
			browserifyFirefox: [
				'browserify:firefoxOptions',
				'browserify:firefoxLib',
				'browserify:firefoxData',
			],
		},
	});

	grunt.registerTask('firefox', [
		'clean:firefox',
		'concurrent:browserifyFirefox',
		'copy:manifestBackup',
		'manifest:firefox',
		'copy:manifestFirefox',
		'compress:firefox',
		'copy:manifestRestore',
		'clean:manifestFirefox',
	]);

	grunt.registerTask('chrome', [
		'clean:chrome',
		'concurrent:browserifyChrome',
		'copy:manifestBackup',
		'manifest:chrome',
		'copy:manifestChrome',
		'compress:chrome',
		'copy:manifestRestore',
		'clean:manifestChrome',
	]);

	grunt.registerTask('build', ['concurrent:eslint', 'firefox', 'chrome']);
};
