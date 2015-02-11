/*jshint moz:true*/
/*global require*/
var pageMod = require("sdk/page-mod");
var self = require("sdk/self");
var pref = require('./pref');
var pagestyles = require('./pagestyles');
let { partial } = require('sdk/lang/functional');

require('./context-menu').setContextMenu();
pageMod.PageMod({
	include: ['*.hup.lh', '*.hup.hu'],
	onAttach: function (worker) {
		'use strict';
		console.log('on attach');

		worker.port.emit('getComments', {
			// get content only if filtering boring comments
			content: pref.getPref('hideboringcomments')
		});
		worker.port.on('gotComments', function (comments) {
			require('./comments').parseComments(worker, comments);
		});

		worker.port.emit('getBlocks');
		console.log('sent get blocks');

		worker.port.on('gotBlocks', function (blocks) {
			var modBlocks = require('blocks'),
				blocksPref = modBlocks.mergeBlockPrefsWithBlocks(blocks);

			pref.setPref('blocks', JSON.stringify(blocksPref));

			worker.port.emit('enableBlockControls', blocks.left);
			worker.port.emit('enableBlockControls', blocks.right);

			blocksPref.left
					.filter(modBlocks.filterHidden)
					.forEach(partial(modBlocks.requestBlockHide, worker));
			blocksPref.right
					.filter(modBlocks.filterHidden)
					.forEach(partial(modBlocks.requestBlockHide, worker));

			worker.port.on('block.action', partial(modBlocks.onBlockAction, worker));
		});
	},
	contentStyle: pagestyles.getPageStyle(),
	contentStyleFile: pagestyles.getPageStyleFiles(),
	contentScriptFile: [
		self.data.url('rq.js'),
		self.data.url('dom.js'),
		self.data.url('comments.js'),
		self.data.url('blocks.js'),
		self.data.url('hupper.js')
	]
});
