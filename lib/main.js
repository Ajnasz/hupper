/*jshint moz:true*/
/*global require*/
var pageMod = require("sdk/page-mod");
var self = require("sdk/self");

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
		output.push([
			'body',
			'#all',
			'#top-nav',
			'#top-nav a',
			'.sidebar .block .content',
			'#footer',
			'.node .links'
		].join(',') + ' {' +
			'font-size:' + minFontSize + 'px !important;' +
		'}');
	}

	if (minWidth > 0) {
          output.push('.sidebar {' +
            'width:' + minWidth + 'px !important;' +
          '}');
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
			worker.port.emit('setNew', {
				comments: comments.filter(function (comment) {
					return comment.isNew;
				}),
				text: getPref('newcommenttext')
			});
		});
	},
	contentStyle: getPageStyle(),
	contentStyleFile: [
		self.data.url('indentstyles.css'),
		self.data.url('hupper.css')
	],
	contentScriptFile: [
		self.data.url('jquery-2.1.3.min.js'),
		self.data.url('rq.js'),
		self.data.url('comments.js'),
		self.data.url('hupper.js')
	]
});
