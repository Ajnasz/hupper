/*jshint moz:true*/
/*global require, exports*/
var pref = require('./pref');
function createBlockPref(block) {
	'use strict';
	return {
		id: block.id,
		hidden: false,
		contentHidden: false
	};
}

function mergeBlockPrefsWithBlocks(blocks) {
	'use strict';
	let blocksPref = JSON.parse(pref.getPref('blocks'));

	if (!blocksPref.left) {
		blocksPref.left = blocks.left.map(createBlockPref);
	} else {
		blocksPref.left = blocksPref.left.concat(blocks.left.filter(function (block) {
			return !blocksPref.left.some(function (b) {
				return b.id === block.id;
			});
		}));
	}
	if (!blocksPref.right) {
		blocksPref.right = blocks.right.map(createBlockPref);
	} else {
		blocksPref.right = blocksPref.right.concat(blocks.right.filter(function (block) {
			return !blocksPref.right.some(function (b) {
				return b.id === block.id;
			});
		}));
	}

	return blocksPref;
}

function filterHidden(block) {
	'use strict';
	return block.hidden;
}

function filterContentHidden(block) {
	'use strict';
	return block.contentHidden;
}

function requestBlockHide(worker, block) {
	'use strict';
	emitBlockEvent(worker, 'block.hide', block);
	emitBlockEvent(worker, 'hupper-block.hide-block', block);
}

function requestBlockContentHide(worker, block) {
	'use strict';
	emitBlockEvent(worker, 'block.hide-content', block);
	emitBlockEvent(worker, 'hupper-block.show-block', block);
}

function emitBlockEvent(worker, event, block) {
	'use strict';
	worker.port.emit(event, {
		id: block.id,
		column: block.column
	});
}

function updateBlock(details, prefName, value) {
	'use strict';
	let blockPrefs = JSON.parse(pref.getPref('blocks')),
		columnBlocks = details.column === 'sidebar-right' ?
			blockPrefs.right :
			blockPrefs.left;

	let block = columnBlocks.filter(function (b) {
		return b.id === details.id;
	})[0];

	block[prefName] = value;

	pref.setPref('blocks', JSON.stringify(blockPrefs));

	return block;
}

function onBlockDelete(worker, details) {
	'use strict';

	let block = updateBlock(details, 'hidden', true);

	emitBlockEvent(worker, 'block.hide', block);
	emitBlockEvent(worker, 'hupper-block.hide-block', block);
}

function onBlockRestore(worker, details) {
	'use strict';

	console.log('on block restore', details);
	

	let block = updateBlock(details, 'hidden', false);

	emitBlockEvent(worker, 'block.show', block);
	emitBlockEvent(worker, 'hupper-block.show-block', block);
}

function onBlockHideContent(worker, details) {
	'use strict';

	let block = updateBlock(details, 'contentHidden', true);

	emitBlockEvent(worker, 'block.hide-content', block);
}

function onBlockShowContent(worker, details) {
	'use strict';

	let block = updateBlock(details, 'contentHidden', false);

	emitBlockEvent(worker, 'block.show-content', block);
}

function index(array, cb) {
	'use strict';
	for (let i = 0, al = array.length; i < al; i++) {
		if (cb(array[i])) {
			return i;
		}
	}

	return -1;
}

function findNotHiddenIndex(blocks, start, direction) {
	'use strict';
	if (!blocks[start].hidden) {
		return start;
	}
	if (direction === 'down') {
		for (let i = start, bl = blocks.length; i < bl; i++) {
			if (blocks[i].hidden) {
				continue;
			}

			return i + 1;
		}
	} else if (direction === 'up') {
		for (let i = start, bl = blocks.length; i < bl; i--) {
			if (blocks[i].hidden) {
				continue;
			}

			return i;
		}
	}

	return -1;
}

function onBlockChangeOrder(worker, details) {
	'use strict';
	let blockPrefs = JSON.parse(pref.getPref('blocks')),
		columnBlocks = details.column === 'sidebar-right' ?
			blockPrefs.right :
			blockPrefs.left;

	let blockIndex = index(columnBlocks, function (block) {
		return block.id === details.id;
	});

	if (blockIndex > -1) {
		let tmpBlock = columnBlocks.splice(blockIndex, 1);

		let newIndex = findNotHiddenIndex(columnBlocks, details.action === 'up' ?
			blockIndex - 1 :
			blockIndex + 1, details.action);


		console.log('new index', newIndex);

		columnBlocks.splice(newIndex, 0, tmpBlock[0]);
		pref.setPref('blocks', JSON.stringify(blockPrefs));

		worker.port.emit('block.change-order', {
			sidebar: details.column,
			blocks: columnBlocks
		});
	}

}

function onBlockChangeColumn(worker, details) {
	'use strict';
	let blockPrefs = JSON.parse(pref.getPref('blocks')),
		columnBlocks = details.column === 'sidebar-right' ?
			blockPrefs.right :
			blockPrefs.left;

	let blockIndex = index(columnBlocks, function (block) {
		return block.id === details.id;
	});

	if (blockIndex > -1) {
		let tmpBlock = columnBlocks.splice(blockIndex, 1);

		let otherColumn = details.column === 'sidebar-right' ?
			blockPrefs.left :
			blockPrefs.right;

		otherColumn.unshift(tmpBlock[0]);

		pref.setPref('blocks', JSON.stringify(blockPrefs));

		worker.port.emit('block.change-column', blockPrefs);
	}

}

/**
 * @param blockActionStruct action
 */
function onBlockAction(worker, details) {
	'use strict';

	switch (details.action) {
		case 'delete':
			onBlockDelete(worker, details);
		break;

		case 'restore':
			onBlockRestore(worker, details);
		break;

		case 'hide-content':
			onBlockHideContent(worker, details);
		break;

		case 'show-content':
			onBlockShowContent(worker, details);
		break;

		case 'up':
		case 'down':
			onBlockChangeOrder(worker, details);
		break;

		case 'right':
		case 'left':
			onBlockChangeColumn(worker, details);
		break;
	}
}

function getBlockTitles() {
	'use strict';
	return {
      'block-aggregator-feed-13': 'http://distrowatch.com',
      'block-aggregator-feed-19': 'http://www.freebsd.org',
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

exports.mergeBlockPrefsWithBlocks = mergeBlockPrefsWithBlocks;
exports.filterHidden = filterHidden;
exports.filterContentHidden = filterContentHidden;
exports.requestBlockHide = requestBlockHide;
exports.requestBlockContentHide = requestBlockContentHide;
exports.onBlockAction = onBlockAction;
exports.getBlockTitles = getBlockTitles;
