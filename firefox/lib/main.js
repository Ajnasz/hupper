/*jshint moz:true*/
/*global require*/
var pageMod = require('sdk/page-mod');
var self = require('sdk/self');
var pref = require('./pref');
var pagestyles = require('./pagestyles');
let func = require('./func');

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

function eventEmitter(worker) {
	'use strict';
	function on(event, cb) {
		worker.port.on(event, cb);
	}

	function emit(event, args) {
		worker.port.emit(event, args);
	}
	return {
		on: on,
		emit: emit
	};
}

pageMod.PageMod({
	include: ['*.hup.lh', '*.hup.hu'],
	onAttach: function (worker) {
		'use strict';
		let events = eventEmitter(worker);
		console.log('on attach');

		function parseComments() {
			console.log('parse comments');

			events.emit('getComments', {
				// get content only if filtering boring comments
				content: pref.getPref('hideboringcomments')
			});
			events.on('gotComments', function (comments) {
				require('./comments').parseComments(events, comments);
			});
		}

		function parseArticles() {
			console.log('get articles');

			let modArticles = require('./articles');

			events.emit('getArticles');
			events.on('gotArticles', function (articles) {
				let newArticles = articles.filter(modArticles.filterNewArticles);
				console.log('articles', articles);
				events.emit('articles.mark-new', {
					text: pref.getPref('newcommenttext'),
					articles: newArticles
				});
				if (newArticles.length > 0) {
					events.emit('hupper-block.add-menu', {
						href: '#' + newArticles[0].id,
						text: TEXT_FIRST_ARTICLE_WITH_NEW_COMMENTS
					});

					modArticles.setNewArticles(newArticles, events);
				}

				events.emit('articles.add-category-hide-button', articles);

				events.on('article.hide-taxonomy', function (article) {
					let taxonomies = pref.getPref('hidetaxonomy').split(',').filter(function (i) {
						return i !== '';

					});

					if (taxonomies.indexOf(articles.cateogry) === -1) {
						taxonomies.push(article.category);
						pref.setPref('hidetaxonomy', taxonomies.join(','));

						modArticles.hideCategoryArticles(modArticles.filterHideableArticles(articles), events);
					}
				});
				modArticles.hideCategoryArticles(modArticles.filterHideableArticles(articles), events);
			});
		}

		function finishBlockSetup(blocks, blocksPref) {
			let modBlocks = require('blocks');
			events.emit('enableBlockControls', blocks.left);
			events.emit('enableBlockControls', blocks.right);
			events.emit('blocks.set-titles', modBlocks.getBlockTitles());

			modBlocks.parseBlocks(events, blocksPref);

			events.on('block.action', func.partial(modBlocks.onBlockAction, events));
		}

		function onGotBlocks(blocks) {
			let modBlocks = require('blocks'),
			blocksPref = modBlocks.mergeBlockPrefsWithBlocks(blocks);

			pref.setPref('blocks', JSON.stringify(blocksPref));

			events.on('blocks.change-order-all-done', function () {
				finishBlockSetup(blocks, blocksPref);

				parseComments();
				parseArticles();
			});

			events.emit('blocks.change-order-all', blocksPref);
		}

		if (pref.getPref('parseblocks')) {
			events.on('gotBlocks', onGotBlocks);

			events.emit('getBlocks');
		} else {
			parseComments();
			parseArticles();
		}

		if (pref.getPref('setunlimitedlinks')) {
			events.emit('setUnlimitedLinks');
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
