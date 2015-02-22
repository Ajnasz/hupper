/*jshint moz:true*/
/*global require, exports*/
var self = require("sdk/self");
var pref = require('./pref');

function createStyle(elements, rules) {
	'use strict';
	return elements.join(',') + '{' + rules.map(function (rule) {
		return rule.name + ':' + rule.value + ' !important;';
	}).join('') + '}';
}

/**
 * @return string
 */
function getPageStyle() {
	'use strict';
	let output = [];
	let minFontSize = pref.getPref('style_min_fontsize');
	let minWidth = pref.getPref('style_wider_sidebar');
	let hideLeftSidebar = pref.getPref('style_hide_left_sidebar');
	let hideRightSidebar = pref.getPref('style_hide_right_sidebar');

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

	if (hideLeftSidebar) {
		output.push(createStyle(['#sidebar-left'], [{name: 'display', value: 'none'}]));
	}

	if (hideRightSidebar) {
		output.push(createStyle(['#sidebar-right'], [{name: 'display', value: 'none'}]));
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

	if (pref.getPref('style_accessibility')) {
		output.push(self.data.url('accesibilitystyles.css'));
	}

	return output;
}

exports.getPageStyle = getPageStyle;
exports.getPageStyleFiles = getPageStyleFiles;
