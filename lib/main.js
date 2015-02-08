/*jshint moz:true*/
/*global require*/
var pageMod = require("sdk/page-mod");
var self = require("sdk/self");
var pref = require('./pref');
var pagestyles = require('./pagestyles');

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
			var blocksPref = JSON.parse(pref.getPref('blocks'));

			if (!blocksPref.left) {
				blocks.left.forEach(function (block) {
					block.hidden = false;
					block.contentHidden = false;
				});

				blocksPref.left = blocks.left;
			}
			if (!blocksPref.right) {
				blocks.left.forEach(function (block) {
					block.hidden = false;
					block.contentHidden = false;
				});

				blocksPref.right = blocks.right;
			}
			pref.setPref('blocks', JSON.stringify(blocksPref));

			worker.port.emit('enableBlockControls', blocks.left);
			worker.port.emit('enableBlockControls', blocks.right);

			/**
			* @param blockActionStruct action
			*/
			function onBlockAction(details) {
				console.log(details);
				var blockPrefs = JSON.parse(pref.getPref('blocks')),
					block;

				if (details.action === 'delete') {
					var columnBlocks = details.column === 'sidebar-right' ?
							blockPrefs.right :
							blockPrefs.left;

					block = columnBlocks.filter(function (b) {
						return b.id === details.id;
					})[0];

					block.hidden = true;

					pref.setPref('blocks', JSON.stringify(blockPrefs));
				}
			}

			worker.port.on('block.action', onBlockAction);
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
