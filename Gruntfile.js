const path = require('path');

module.exports = (grunt) => {
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-template');
	grunt.loadNpmTasks('grunt-aws-s3');
	grunt.loadTasks('./tasks/');

	const FILES = [
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
	];

	const chromeConfig = {
		transform: [
			[
				'babelify', { presets: [[
					'env', { targets: { browsers: ['last 5 Chrome versions'] }, },
				]], },
			],
		],
	};

	const firefoxConfig = {
		transform: [
			[
				'babelify', { presets: [[
					'env', { targets: { browsers: ['Firefox 52'] }, },
				]], },
			],
		],
	};

	grunt.initConfig({
		aws_s3: {
			options: {
				accessKeyId: process.env.AWS_ACCESS_KEY_ID,
				secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
				bucket: 'ajnasz',
				endpoint: 'ams3.digitaloceanspaces.com'
			},

			push: {
				files: [
					{
						get src () {
							const { version } = require('./build/manifest.json');
							return path.join(`hupper-${version}*`)
						},
						cwd: 'web-ext-artifacts',
						expand: true,
						dest: 'hupper/',
						action: 'upload'
					},
					{
						src: 'beta-updates.json',
						cwd: 'meta',
						expand: true,
						dest: 'hupper/',
						action: 'upload'
					}
				]
			}
		},
		createUpdateJSON: {
			beta: {
				options: {
					id: 'hupper_beta@koszti.hu',
					json: './meta/beta-updates.json',
					updateLink: 'https://ajnasz.ams3.digitaloceanspaces.com/hupper/xFILEx',
					get version () {
						const manifest = require('./build/manifest.json');
						return manifest.version;
					}
				}
			}
		},
		webext: {
			beta: {
				options: {
					id: 'hupper_beta@koszti.hu',
					apiSecret: process.env.AMO_JWT_SECRET,
					apiKey: process.env.AMO_JWT_ISSUER,
					sourceDir: 'build',
					artifactsDir: 'web-ext-artifacts'
				},
			}
		},
		template: {
			options: {
				delimiters: 'handlebars-like-delimiters'
			},
			'optionsChrome': {
				options: {
					data: {
						platform: 'chrome'
					}
				},
				files: {
					'options.html': 'options.html.bak',
				},
			},
			'optionsFirefox': {
				options: {
					data: {
						platform: 'firefox'
					}
				},
				files: {
					'options.html': 'options.html.bak',
				},
			}
		},
		clean: {
			firefox: 'hupper_firefox.zip',
			chrome: 'hupper_chrome.zip',
			manifestBackup: 'manifest.json.bak',
			manifestFirefox: [
				'manifest_firefox.json',
				'manifest.json.bak',
			],
			manifestFirefoxBeta: [
				'manifest_firefox_beta.json',
				'manifest.json.bak',
			],
			manifestChrome: [
				'manifest_chrome.json',
				'manifest.json.bak',
			],
			optionsHtml: [
				'options.html.bak',
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

			manifestFirefoxBeta: {
				files: {
					'./manifest.json': './manifest_firefox_beta.json',
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

			optionsBackup: {
				files: {
					'./options.html.bak': './options.html',
				}
			},

			optionsRestore: {
				files: {
					'./options.html': './options.html.bak',
				},
			},

			build: {
				files: FILES.map(f => Object.assign({}, f, { dest: 'build/' }))
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
				configFile: '.eslintrc.json',
			},
			opts: ['options/**/*.js',],
			lib: ['lib/**/*.js',],
			data: ['data/**/*.js',],
			core: ['core/**/*.js',]
		},

		compress: {
			chrome: {
				options: {
					archive: 'hupper_chrome.zip',
				},
				files: [
					{ src: ['**'], cwd: 'build/', dest: '/', expand: true },
				],
			},

			firefoxBeta: {
				options: {
					archive: 'hupper_firefox.zip',
				},
				files: [
					{ src: ['**'], cwd: 'build/', dest: '/', expand: true },
				],
			},

			firefox: {
				options: {
					archive: 'hupper_firefox.zip',
				},
				files: [
					{ src: ['**'], cwd: 'build/', dest: '/', expand: true },
				],
			},
		},

		manifest: {
			options: {
				manifest: grunt.file.readJSON('./manifest.json'),
				version: grunt.file.readJSON('./package.json').version,
			},
			chrome: {
				options: {
					versioning: 'chrome',
					dest: 'manifest_chrome.json',
					applicationID: 'hupper@ajnasz.hu',
				},
			},

			firefoxBeta: {
				options: {
					versioning: 'firefox',
					dest: 'manifest_firefox_beta.json',
					applicationID: null,
				},
			},

			firefox: {
				options: {
					versioning: 'firefox',
					dest: 'manifest_firefox.json',
					applicationID: 'hupper@ajnasz.hu',
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

	grunt.registerTask('firefoxBeta', [
		'clean:firefox',
		'concurrent:browserifyFirefox',
		'copy:manifestBackup',
		'manifest:firefoxBeta',
		'copy:manifestFirefoxBeta',
		'copy:optionsBackup',
		'template:optionsFirefox',
		'copy:build',
		'webext:beta',
		'copy:manifestRestore',
		'copy:optionsRestore',
		'clean:manifestFirefoxBeta',
		'clean:optionsHtml',
		'aws_s3:push',
	]);

	grunt.registerTask('firefox', [
		'clean:firefox',
		'concurrent:browserifyFirefox',
		'copy:manifestBackup',
		'manifest:firefox',
		'copy:manifestFirefox',
		'copy:optionsBackup',
		'template:optionsFirefox',
		'copy:build',
		'compress:firefox',
		'copy:manifestRestore',
		'copy:optionsRestore',
		'clean:manifestFirefox',
		'clean:optionsHtml',
	]);

	grunt.registerTask('chrome', [
		'clean:chrome',
		'concurrent:browserifyChrome',
		'copy:manifestBackup',
		'manifest:chrome',
		'copy:manifestChrome',
		'copy:optionsBackup',
		'template:optionsChrome',
		'copy:build',
		'compress:chrome',
		'copy:manifestRestore',
		'copy:optionsRestore',
		'clean:manifestChrome',
		'clean:optionsHtml',
	]);

	grunt.registerTask('bumpVersion', [
		'clean:chrome',
		'clean:firefox',
		'manifest:firefox',
		'copy:manifestFirefox',
		'clean:manifestFirefox',
	]);

	grunt.registerTask('build', ['concurrent:eslint', 'firefox', 'chrome']);
};
