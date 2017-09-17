import * as func from '../../core/func';
import { log } from '../../core/log';

function createBlockPref (column, block) {
	return {
		id: block.id,
		hidden: false,
		contentHidden: false,
		index: block.index,
		column
	};
}
function mergeBlockPrefsWithBlocks (blocks, blocksPref) {
	log.log('blocks pref', blocksPref);

	if (!blocksPref || !blocksPref.length) {
		blocksPref = blocks.left.map(func.partial(createBlockPref, 'left')).concat(
			blocks.right.map(func.partial(createBlockPref, 'right')));
	} else {
		if (blocksPref.items) {
			blocksPref = blocksPref.items;
		}

		blocksPref = blocksPref.concat(blocks.left.map(func.partial(createBlockPref, 'left')).filter(block => {
			return !blocksPref.some(p => p.id === block.id);
		})).concat(blocks.right.map(func.partial(createBlockPref, 'right')).filter(block => {
			return !blocksPref.some(p => p.id === block.id);
		}));

		func.sortBy(blocksPref.filter(b => b.column === 'left'), 'index').forEach((b, i) => b.index = i);
		func.sortBy(blocksPref.filter(b => b.column === 'right'), 'index').forEach((b, i) => b.index = i);
	}


	return blocksPref;
}

function filterHidden (block) {
	return block.hidden;
}

function filterContentHidden (block) {
	return block.contentHidden;
}

function updateBlock (details, prefName, value, blockPrefs) {
	let block = func.first(blockPrefs, b => b.id === details.id);

	block[prefName] = value;

	return block;
}

function getBlockTitles () {
	return {
		'block-aggregator-feed-13': 'http://distrowatch.com',
		'block-aggregator-feed-19': 'http://www.freebsd.org',
		'block-aggregator-feed-48': 'http://www.netbsd.org',
		'block-aggregator-feed-2': 'http://www.kernel.org',
		'block-aggregator-feed-3': 'http://wiki.hup.hu',
		'block-aggregator-feed-4': 'http://lwn.net',
		'block-aggregator-feed-40': 'http://www.flickr.com/photos/h_u_p/',
		'block-aggregator-feed-41': 'http://blogs.sun.com',
		'block-aggregator-feed-44': 'http://hwsw.hu',
		'block-aggregator-feed-46': 'http://www.linuxdevices.com',
		'block-aggregator-feed-47': 'http://undeadly.org',
		'block-aggregator-feed-50': '/allasajanlatok',
		'block-aggregator-feed-51': 'http://blogs.sun.com/sunhu/',
		'block-block-15': 'irc://irc.freenode.net/hup.hu',
		'block-block-12': '/tamogatok',
		'block-block-7': 'http://www.google.com/custom?ie=UTF-8&' +
			'oe=UTF-8&domains=hup.hu&sa=Keres%C3%A9s&' +
			'cof=%22S%3Ahttp%3A%2F%2Fhup.hu%3BVLC%3A7a7a76%3BAH%3A' +
			'center%3BLH%3A74%3BLC%3A7a7a76%3BGFNT%3A7a7a76%3BL%3A' +
			'http%3A%2F%2Fhup.hu%2Fimages%2Fhup_search.png%3BLW%3A484%3' +
			'BT%3Ablack%3BAWFID%3Ab92ddab1875cce47%3B%22&sitesearch=hup.hu',
		'block-block-6': 'http://www.mozilla.com/firefox?from=sfx&uid=225821&t=308',
		'block-blog-0': '/blog',
		'block-comment-0': '/tracker',
		'block-poll-0': '/poll',
		'block-poll-40': '/poll',
		'block-search-0': '/search',
		'block-tagadelic-1': '/temak'
	};
}

function getBlockTitle (block) {
	return getBlockTitles()[block.id];
}

export {
	mergeBlockPrefsWithBlocks,
	filterHidden,
	filterContentHidden,
	getBlockTitles,
	updateBlock,
	getBlockTitle,
	createBlockPref
};
