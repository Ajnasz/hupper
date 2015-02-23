/*jshint moz:true*/
/*global require*/
var pageMod = require('sdk/page-mod');
var self = require('sdk/self');
var pref = require('./pref');
var pagestyles = require('./pagestyles');
let { partial } = require('sdk/lang/functional');

require('./context-menu').setContextMenu();
require('sdk/simple-prefs').on('edittrolls', function () {
	'use strict';
	require('./edit-trolls').start();
});
require('sdk/simple-prefs').on('edithighlightusers', function () {
	'use strict';
	require('./edit-highlightedusers').start();
});

const TEXT_FIRST_ARTICLE_WITH_NEW_COMMENTS = 'Olvasatlan hozzászólások';

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

			let modArticles = require('./articles');

			worker.port.emit('getArticles');
			worker.port.on('gotArticles', function (articles) {
				let newArticles = articles.filter(modArticles.filterNewArticles);
				console.log('articles', articles);
				worker.port.emit('articles.mark-new', {
					text: pref.getPref('newcommenttext'),
					articles: newArticles
				});
				if (newArticles.length > 0) {
					worker.port.emit('hupper-block.add-menu', {
						href: '#' + newArticles[0].id,
						text: TEXT_FIRST_ARTICLE_WITH_NEW_COMMENTS
					});

					modArticles.setNewArticles(newArticles, worker);
				}

				worker.port.emit('articles.add-category-hide-button', articles);

				worker.port.on('article.hide-taxonomy', function (article) {
					let taxonomies = pref.getPref('hidetaxonomy').split(',').filter(function (i) {
						return i !== '';

					});

					if (taxonomies.indexOf(articles.cateogry) === -1) {
						taxonomies.push(article.category);
						pref.setPref('hidetaxonomy', taxonomies.join(','));

						modArticles.hideCategoryArticles(modArticles.filterHideableArticles(articles), worker);
					}
				});
				modArticles.hideCategoryArticles(modArticles.filterHideableArticles(articles), worker);
			});
		}

		function finishBlockSetup(blocks, blocksPref) {
			let modBlocks = require('blocks');
			worker.port.emit('enableBlockControls', blocks.left);
			worker.port.emit('enableBlockControls', blocks.right);
			worker.port.emit('blocks.set-titles', modBlocks.getBlockTitles());

			modBlocks.parseBlocks(worker, blocksPref);

			worker.port.on('block.action', partial(modBlocks.onBlockAction, worker));
		}

		function onGotBlocks(blocks) {
			let modBlocks = require('blocks'),
			blocksPref = modBlocks.mergeBlockPrefsWithBlocks(blocks);

			pref.setPref('blocks', JSON.stringify(blocksPref));

			worker.port.on('blocks.change-order-all-done', function () {
				finishBlockSetup(blocks, blocksPref);

				parseComments();
				parseArticles();
			});

			worker.port.emit('blocks.change-order-all', blocksPref);
		}

		if (pref.getPref('parseblocks')) {
			worker.port.on('gotBlocks', onGotBlocks);

			worker.port.emit('getBlocks');
		} else {
			parseComments();
			parseArticles();
		}

		if (pref.getPref('setunlimitedlinks')) {
			worker.port.emit('setUnlimitedLinks');
		}
	},
	contentStyle: pagestyles.getPageStyle(),
	contentStyleFile: pagestyles.getPageStyleFiles(),
	contentScriptFile: [
		self.data.url('core/rq.js'),
		self.data.url('core/dom.js'),
		self.data.url('core/func.js'),
		self.data.url('core/commenttree.js'),
		self.data.url('core/comments.js'),
		self.data.url('core/articles.js'),
		self.data.url('core/blocks.js'),
		self.data.url('core/hupper-block.js'),
		self.data.url('core/unlimitedlinks.js'),
		self.data.url('hupper.js')
	]
});
