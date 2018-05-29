module.exports = {
	mode: 'production',
	entry: {
		data: './data/main.js',
		lib: './lib/main.js',
		options: './options/main.js',
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [['babel-preset-env', {
							targets: {
								browsers: ['Firefox 52']
							}
						}]]
					}
				},
			}
		]
	},
	output: {
		path: __dirname,
		filename: '[name]/bundle.js'
	},
	// devtool: 'source-map'
};
