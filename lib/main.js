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

		function parseComments() {
			console.log('parse comments');
			
			worker.port.emit('getComments', {
				// get content only if filtering boring comments
				content: pref.getPref('hideboringcomments')
			});
			worker.port.on('gotComments', function (comments) {
				require('./comments').parseComments(worker, comments);
			});
		}

		function parseArticles() {
			console.log('get articles');

			worker.port.emit('getArticles');
			worker.port.on('gotArticles', function (articles) {
				console.log('articles', articles);
			});
		}

		if (pref.getPref('parseblocks')) {
			worker.port.emit('getBlocks');
		}

		function finishBlockSetup(blocks, blocksPref) {
			let modBlocks = require('blocks');
			worker.port.emit('enableBlockControls', blocks.left);
			worker.port.emit('enableBlockControls', blocks.right);
			worker.port.emit('blocks.set-titles', modBlocks.getBlockTitles());

			modBlocks.parseBlocks(worker, blocksPref);

			worker.port.on('block.action', partial(modBlocks.onBlockAction, worker));

			parseComments();
			parseArticles();
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
		self.data.url('func.js'),
		self.data.url('comments.js'),
		self.data.url('articles.js'),
		self.data.url('blocks.js'),
		self.data.url('hupper-block.js'),
		self.data.url('hupper.js')
	]
});
