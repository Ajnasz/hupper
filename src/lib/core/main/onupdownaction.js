import { prefs } from '../../../core/prefs';
import * as func from '../../../core/func';
import * as modBlocks from '../blocks';

function getColumnName (column) {
	switch (column) {
		case 'right':
		case 'sidebar-right':
			return 'right';
		case 'left':
		case 'sidebar-left':
			return 'left';
		default:
			return null;
	}
}

export default function onUpDownAction (details, context) {
	return prefs.getBlocks().then(blocks => {
		let blockID = details.id;
		let blockPrefs = blocks;
		let cm = context.left.concat(context.right);
		let contextBlocks;

		let blockObjects = cm
			.map(b => modBlocks.createBlockPref(getColumnName(b.column), b))
			.map(c => func.first(blockPrefs, b => b.id === c.id) || c);

		let column = getColumnName(func.first(blockObjects, b => b.id === blockID).column);

		contextBlocks = blockObjects
			.filter(b => b.column === column)
			.filter(b => !b.hidden);

		func.sortBy(contextBlocks, 'index');

		let index = func.index(contextBlocks, o => o.id === blockID);

		if (index === -1) {
			return Promise.reject(new Error('Block not found'));
		}

		let relativeItem;

		if (details.action === 'up') {
			if (index === 0) { // no change
				return Promise.resolve(contextBlocks);
			}

			relativeItem = contextBlocks[index - 1];
		} else if (details.action === 'down') {
			if (index === contextBlocks.length - 1) { // no change
				return Promise.resolve(contextBlocks);
			}

			relativeItem = contextBlocks[index + 1];
		}

		let originalItem = contextBlocks[index],
			originalItemIndex = originalItem.index;

		originalItem.index = relativeItem.index;
		relativeItem.index = originalItemIndex;

		prefs.setPref('blocks', blockPrefs.map(b => {
			let alternateB = func.first(contextBlocks, x => x.id === b.id);

			if (alternateB) {
				return alternateB;
			}

			return b;
		}));

		return Promise.resolve(blockObjects);
	});
}


