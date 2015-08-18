/*jshint moz:true, esnext:true*/
/*global require, exports*/
var sdkSelf = require('sdk/self');
var pref = require('./pref').pref;
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
	return pref.getPref('style_accessibility').then((enabled) => {
		return new Promise((resolve) => {
			if (enabled) {
				output.push(sdkSelf.data.url('css/accesibilitystyles.css'));
			}

			resolve(output);
		});
	});

}

exports.getPageStyle = pageStyles.getPageStyle;
exports.getPageStyleFiles = getPageStyleFiles;
