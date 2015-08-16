/*jshint moz:true*/
/*global require, exports*/
var sdkSelf = require('sdk/self');
var pref = require('./pref');
var pageStyles = require('./core/pagestyles');

/**
 * @return Array
 */
function getPageStyleFiles() {
	'use strict';
	var output = [
		sdkSelf.data.url('core/css/hupper.css'),
		sdkSelf.data.url('core/css/indentstyles.css')
	];

	if (pref.getPref('style_accessibility')) {
		output.push(sdkSelf.data.url('css/accesibilitystyles.css'));
	}

	return output;
}

function getPageStyle() {
	'use strict';
	return pageStyles.getPageStyle({
		minFontSize: pref.getPref('style_min_fontsize'),
		minWidth: pref.getPref('style_wider_sidebar'),
		hideLeftSidebar: pref.getPref('style_hide_left_sidebar'),
		hideRightSidebar: pref.getPref('style_hide_right_sidebar')
	});
}

exports.getPageStyle = getPageStyle;
exports.getPageStyleFiles = getPageStyleFiles;
