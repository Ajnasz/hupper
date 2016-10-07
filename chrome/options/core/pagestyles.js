/*jshint moz:true*/
/*global exports, define*/
(function () {
	'use strict';
function createStyle(elements, rules) {
	return elements.join(',') + '{' + rules.map(function (rule) {
		return rule.name + ':' + rule.value + ' !important;';
	}).join('') + '}';
}

/**
	* @return string
	*/
function getPageStyle(conf) {
	let output = [];

	if (conf.minFontSize > 0) {
		output.push(createStyle([
								'body',
								'#all',
								'#top-nav',
								'#top-nav a',
								'.sidebar .block .content',
								'#footer',
								'.node .links'
		], [{name: 'font-size', value: conf.minFontSize + 'px'}]));
	}

	if (conf.minWidth > 0) {
		output.push(createStyle(['.sidebar'], [{name: 'width', value: conf.minWidth + 'px'}]));
	}

	if (conf.hideLeftSidebar) {
		output.push(createStyle(['#sidebar-left'], [{name: 'display', value: 'none'}]));
	}

	if (conf.hideRightSidebar) {
		output.push(createStyle(['#sidebar-right'], [{name: 'display', value: 'none'}]));
	}

	return output;
}

if (typeof exports !== 'undefined') {
	exports.getPageStyle = getPageStyle;
} else {
	define('./core/pagestyles', function (exports) {
		exports.getPageStyle = getPageStyle;
	});
}
}());
