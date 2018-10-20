module.exports = (grunt) => grunt.registerMultiTask('fixCSSrules', function () {
	const { type } = this.options({});
	const typeRegexp = new RegExp(`${type}-extension`);

	this.files.forEach((file) => {
		file.src.forEach(filepath => {
			const f = grunt.file.read(filepath);
			const filtered = f.split('\n').filter((line) => {
				return (!/-extension:/.test(line) || typeRegexp.test(line));
			});

			grunt.file.write(filepath, filtered.join('\n'));
		});
	});
});
