/*jshint esnext: true*/
/*global chrome, require*/

let pref = require('./pref');

const TEXT_FIRST_ARTICLE_WITH_NEW_COMMENTS = 'Olvasatlan hozzászólások';

var eventEmitter = (function () {
	'use strict';
	var tabs = {};
	chrome.tabs.onRemoved.addListener(function (tabId) {
		tabs[tabId] = null;
	});
	chrome.runtime.onMessage.addListener(function (request, sender) {
		console.log('runtimemessage', sender);

		let tabId = sender.tab.id;

		let event = request.event;

		if (event === 'unload') {
			tabs[tabId] = null;
		} else {
			if (tabs[tabId] && tabs[tabId][event]) {
				tabs[tabId][event].forEach(function (cb) {
					cb(request.data);
				});
			}
		}
	});

	return function eventEmitter(tabId) {

		function on(event, cb) {
			if (!tabs[tabId]) {
				tabs[tabId] = {};
			}

			if (!tabs[tabId][event]) {
				tabs[tabId][event] = [];
			}

			console.log('register callback', event);

			tabs[tabId][event].push(cb);
		}

		function emit(event, args) {
			console.log('emit event', event, tabId);
			chrome.tabs.sendMessage(tabId, {event: event, data: args});
		}

		return {
			on: on,
			emit: emit
		};
	};
}());

function manageArticles(events) {
	'use strict';
	let modArticles = require('./core/articles');

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

			let nextPrev = modArticles.setNewArticles(newArticles, events);

			if (nextPrev) {
				nextPrev.forEach(function (item) {
					events.emit('articles.addNextPrev', item);
				});
			}
		}

		events.emit('articles.add-category-hide-button', articles);

		events.on('article.hide-taxonomy', function (article) {
			let taxonomies = pref.getCleanTaxonomies();

			if (taxonomies.indexOf(articles.cateogry) === -1) {
				taxonomies.push(article.category);
				pref.setPref('hidetaxonomy', taxonomies.join(','));

				let hideableArticles = modArticles.filterHideableArticles(articles, taxonomies);
				events.emit('articles.hide', hideableArticles);
			}
		});
		let hideableArticles = modArticles.filterHideableArticles(articles, pref.getCleanTaxonomies());
		events.emit('articles.hide', hideableArticles);
	});
	events.emit('getArticles');
}


chrome.runtime.onMessage.addListener(function (request, sender) {
	'use strict';
	console.log('runtime message', request, sender);
	let event = request.event;

	if (event === 'DOMContentLoaded') {
		let events = eventEmitter(sender.tab.id);

		manageArticles(events);

		/*
		events.on('gotBlocks', function (data) {
			onGotBlocks(data);
		});

		events.emit('getBlocks');
		*/
	}
});
