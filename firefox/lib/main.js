/*jshint moz:true, esnext: true*/
/*global require*/
var pageMod = require('sdk/page-mod');
var sdkSelf = require('sdk/self');
var pref = require('./pref').pref;
var pagestyles = require('./pagestyles');

require('./context-menu').setContextMenu();
require('sdk/simple-prefs').on('edittrolls', function () {
	'use strict';
	require('./edit-trolls').start();
});
require('sdk/simple-prefs').on('edithighlightusers', function () {
	'use strict';
	require('./edit-highlightedusers').start();
});

function eventEmitter(worker) {
	'use strict';
	function on(event, cb) {
		console.log('listen to', event);
		worker.port.on(event, cb);
	}

	function emit(event, args) {
		console.log('EMIT', event);
		worker.port.emit(event, args);
	}
	return {
		on: on,
		emit: emit
	};
}
function manageStyles() {
	'use strict';
	return Promise.all([
		pref.getPref('style_min_fontsize'),
		pref.getPref('style_wider_sidebar'),
		pref.getPref('style_hide_left_sidebar'),
		pref.getPref('style_hide_right_sidebar'),
		pagestyles.getPageStyleFiles()
	]).then((resp) => {
		let styles = pagestyles.getPageStyle({
			minFontSize: resp[0],
			minWidth: resp[1],
			hideLeftSidebar: resp[2],
			hideRightSidebar: resp[3]
		});

		return new Promise((resolve) => {
			resolve({styles: styles, files: resp[4]});
		});
	});
}

manageStyles().then((results) => {
	'use strict';
return new pageMod.PageMod({
	include: ['*.hup.lh', '*.hup.hu'],
	attachTo: ['top', 'existing'],
	onAttach: function (worker) {
		let events = eventEmitter(worker);
		console.log('on attach');

		let parseComments = require('./core/main').parseComments;
		let parseArticles = require('./core/main').parseArticles;
		let parseBlocks = require('./core/main').parseBlocks;

		pref.getPref('parseblocks').then((parse) => {
			if (parse) {
				events.on('gotBlocks', parseBlocks.bind(null, events, pref));
				events.emit('getBlocks');
			}
		});

		parseComments(events, pref);
		parseArticles(events, pref);

		pref.getPref('setunlimitedlinks').then((setLinks) => {
			if (setLinks) {
				events.emit('setUnlimitedLinks');
			}
		});
	},
	contentStyle: results.styles,
	contentStyleFile: results.files,
	contentScriptFile: [
		sdkSelf.data.url('core/rq.js'),
		sdkSelf.data.url('core/dom.js'),
		sdkSelf.data.url('core/func.js'),
		sdkSelf.data.url('core/commenttree.js'),
		sdkSelf.data.url('core/comments.js'),
		sdkSelf.data.url('core/articles.js'),
		sdkSelf.data.url('core/blocks.js'),
		sdkSelf.data.url('core/hupper-block.js'),
		sdkSelf.data.url('core/unlimitedlinks.js'),
		sdkSelf.data.url('hupper.js')
	]
});
});
