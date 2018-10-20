const set = require('lodash.set');

module.exports = (grunt) => {
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-template');
	grunt.loadNpmTasks('grunt-aws-s3');
	grunt.loadNpmTasks('grunt-webpack');
	grunt.loadTasks('./tasks/');

	const webpackBrowserPath = 'module.rules[0].use.options.presets[0][1].targets.browsers[0]';

	const FILES = [
		{ src: 'images/icons/*.png', dest: '/', expand: true },
		{ src: 'fonts/*.woff', dest: '/', expand: true },
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


	grunt.initConfig({
		/* eslint-disable camelcase */
		aws_s3: {
		/* eslint-enable camelcase */
			options: {
				accessKeyId: process.env.AWS_ACCESS_KEY_ID,
				secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
				bucket: 'ajnasz',
				endpoint: 'ams3.digitaloceanspaces.com'
			},

			xpi: {
				files: [
					{
						src: '*.xpi',
						cwd: 'web-ext-artifacts',
						expand: true,
						dest: 'hupper/',
						action: 'upload'
					},
				],
			},
			updateJSON: {
				files: [
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
					updateLink: 'https://ajnasz.ams3.digitaloceanspaces.com/xFILEx',
					accessKeyId: process.env.AWS_ACCESS_KEY_ID,
					secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
					bucket: 'ajnasz',
					endpoint: 'ams3.digitaloceanspaces.com',
					prefix: 'hupper/',
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

		webpack: {
			chrome: set(Object.assign({}, require('./webpack.config')),
				webpackBrowserPath, 'last 5 Chrome versions'),
			firefox: set(Object.assign({}, require('./webpack.config')),
				webpackBrowserPath, 'Firefox 60'),
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

		fixCSSrules: {
			chrome: {
				options: {
					type: 'chrome',
				},
				files: [
					{ src: 'build/data/core/css/hupper.css' },
					{ src: 'build/data/core/css/icons.css' },
				],
			},
			firefox: {
				options: {
					type: 'moz',
				},
				files: [
					{ src: 'build/data/core/css/hupper.css' },
					{ src: 'build/data/core/css/icons.css' },
				],
			},
		},

		packageLock: {
			options: {
				file: 'package-lock.json',
				version: grunt.file.readJSON('./package.json').version,
			},

			all: {},
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
					updateURL: 'https://ams3.digitaloceanspaces.com/ajnasz/hupper/beta-updates.json',
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
		},
	});

	grunt.registerTask('firefoxBeta', [
		'clean:firefox',
		'webpack:firefox',
		'copy:manifestBackup',
		'manifest:firefoxBeta',
		'copy:manifestFirefoxBeta',
		'copy:optionsBackup',
		'template:optionsFirefox',
		'copy:build',
		'copy:manifestRestore',
		'copy:optionsRestore',
		'clean:manifestFirefoxBeta',
		'clean:optionsHtml',
	]);

	grunt.registerTask('firefox', [
		'clean:firefox',
		'webpack:firefox',
		'copy:manifestBackup',
		'manifest:firefox',
		'copy:manifestFirefox',
		'copy:optionsBackup',
		'template:optionsFirefox',
		'copy:build',
		'fixCSSrules:firefox',
		'compress:firefox',
		'copy:manifestRestore',
		'copy:optionsRestore',
		'clean:manifestFirefox',
		'clean:optionsHtml',
	]);

	grunt.registerTask('chrome', [
		'clean:chrome',
		'webpack:chrome',
		'copy:manifestBackup',
		'manifest:chrome',
		'copy:manifestChrome',
		'copy:optionsBackup',
		'template:optionsChrome',
		'copy:build',
		'fixCSSrules:chrome',
		'compress:chrome',
		'copy:manifestRestore',
		'copy:optionsRestore',
		'clean:manifestChrome',
		'clean:optionsHtml',
	]);

	grunt.registerTask('deployFirefoxBeta', [
		'firefoxBeta',
		'webext:beta',
		'aws_s3:xpi',
		'createUpdateJSON',
		'aws_s3:updateJSON',
	]),

	grunt.registerTask('bumpVersion', [
		'clean:chrome',
		'clean:firefox',
		'manifest:firefox',
		'packageLock',
		'copy:manifestFirefox',
		'clean:manifestFirefox',
	]);

	grunt.registerTask('build', ['concurrent:eslint', 'firefox', 'chrome']);
};
