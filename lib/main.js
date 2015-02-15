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

		function finishBlockSetup(blocks, blocksPref) {
			let modBlocks = require('blocks');
			worker.port.emit('enableBlockControls', blocks.left);
			worker.port.emit('enableBlockControls', blocks.right);

			blocksPref.left.concat(blocksPref.right)
					.filter(modBlocks.filterHidden)
					.forEach(partial(modBlocks.requestBlockHide, worker));

			blocksPref.left.concat(blocksPref.right)
					.filter(modBlocks.filterContentHidden)
					.forEach(partial(modBlocks.requestBlockContentHide, worker));

			worker.port.on('block.action', partial(modBlocks.onBlockAction, worker));
		}

		worker.port.on('gotBlocks', function (blocks) {
			let modBlocks = require('blocks'),
				blocksPref = modBlocks.mergeBlockPrefsWithBlocks(blocks);

			pref.setPref('blocks', JSON.stringify(blocksPref));

			worker.port.on('blocks.change-order-all-done', function () {
				finishBlockSetup(blocks, blocksPref);
			});

			worker.port.emit('blocks.change-order-all', blocksPref);

		});
	},
	contentStyle: pagestyles.getPageStyle(),
	contentStyleFile: pagestyles.getPageStyleFiles(),
	contentScriptFile: [
		self.data.url('rq.js'),
		self.data.url('dom.js'),
		self.data.url('comments.js'),
		self.data.url('blocks.js'),
		self.data.url('hupper-block.js'),
		self.data.url('hupper.js')
	]
});
