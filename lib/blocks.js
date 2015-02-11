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
	var blocksPref = JSON.parse(pref.getPref('blocks'));

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
}

function requestBlockContentHide(worker, block) {
	'use strict';
	emitBlockEvent(worker, 'block.hide-content', block);
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

	console.log('details', details, prefName, value, blockPrefs);
	
	pref.setPref('blocks', JSON.stringify(blockPrefs));

	return block;
}

function onBlockDelete(worker, details) {
	'use strict';

	let block = updateBlock(details, 'hidden', true);

	emitBlockEvent(worker, 'block.hide', block);
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

/**
 * @param blockActionStruct action
 */
function onBlockAction(worker, details) {
	'use strict';

	switch (details.action) {
		case 'delete':
			onBlockDelete(worker, details);
		break;

		case 'hide-content':
			onBlockHideContent(worker, details);
		break;

		case 'show-content':
			onBlockShowContent(worker, details);
		break;
	}
}

exports.mergeBlockPrefsWithBlocks = mergeBlockPrefsWithBlocks;
exports.filterHidden = filterHidden;
exports.filterContentHidden = filterContentHidden;
exports.requestBlockHide = requestBlockHide;
exports.requestBlockContentHide = requestBlockContentHide;
exports.onBlockAction = onBlockAction;
