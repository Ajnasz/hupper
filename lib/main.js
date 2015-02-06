/*jshint moz:true*/
/*global require*/
var pageMod = require("sdk/page-mod");
var self = require("sdk/self");

function createStyle(elements, rules) {
	'use strict';
	return elements.join(',') + '{' + rules.map(function (rule) {
		return rule.name + ':' + rule.value + ' !important;';
	}).join('') + '}';
}

function getPref(pref) {
	'use strict';
	return require('sdk/simple-prefs').prefs[pref];
}

/**
 * @return string
 */
function getPageStyle() {
	'use strict';
	var output = [];
	var minFontSize = getPref('style_min_fontsize');
	var minWidth = getPref('style_wider_sidebar');

	if (minFontSize > 0) {
		output.push(createStyle([
			'body',
			'#all',
			'#top-nav',
			'#top-nav a',
			'.sidebar .block .content',
			'#footer',
			'.node .links'
		], [{name: 'font-size', value: minFontSize + 'px'}]));
	}

	if (minWidth > 0) {
		output.push(createStyle(['.sidebar'], [{name: 'width', value: minWidth + 'px'}]));
	}

	return output;
}

/**
 * @return Array
 */
function getPageStyleFiles() {
	'use strict';
	var output = [
		self.data.url('indentstyles.css'),
		self.data.url('hupper.css')
	];

	if (getPref('style_accessibility')) {
		output.push(self.data.url('accesibilitystyles.css'));
	}

	return output;
}

pageMod.PageMod({
	include: ['*.hup.lh', '*.hup.hu'],
	onAttach: function (worker) {
		'use strict';
		console.log('on attach');

		worker.port.emit('getComments');
		worker.port.on('gotComments', function (comments) {
			var newComments, newCommentsLength;

			newComments = comments.filter(function (comment) {
				return comment.isNew;
			});
			newCommentsLength = newComments.length;

			worker.port.emit('comment.setNew', {
				comments: newComments,
				text: getPref('newcommenttext')
			});

			if (getPref('prevnextlinks')) {
				if (newCommentsLength > 1) {
					newComments.forEach(function (comment, index) {
						var nextPrev = {
							id: comment.id
						};
						if (index + 1 < newCommentsLength) {
							nextPrev.nextId = newComments[index + 1].id;
						}

						if (index > 0) {
							nextPrev.prevId = newComments[index - 1].id;
						}

						worker.port.emit('comment.addNextPrev', nextPrev);
					});
				}
			}
		});
	},
	contentStyle: getPageStyle(),
	contentStyleFile: getPageStyleFiles(),
	contentScriptFile: [
		self.data.url('jquery-2.1.3.min.js'),
		self.data.url('rq.js'),
		self.data.url('comments.js'),
		self.data.url('hupper.js')
	]
});
