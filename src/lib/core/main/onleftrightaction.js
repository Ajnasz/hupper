import { prefs } from '../../../core/prefs';
import * as func from '../../../core/func';

export default function onLeftRightAction (details) {
	return prefs.getBlocks().then(blocks => {
		let blockID = details.id;
		let blockPrefs = blocks;

		let block = func.first(blockPrefs, b => b.id === blockID);

		switch (details.action) {
			case 'left':
				if (block.column !== 'left') {
					block.column = 'left';
					block.index = -1;
				}
				break;

			case 'right':
				if (block.column !== 'right') {
					block.column = 'right';
					block.index = -1;
				}
				break;
		}

		func.sortBy(blockPrefs.filter(b => b.column === block.column), 'index').forEach((b, i) => b.index = i);

		prefs.setPref('blocks', blockPrefs);

		return Promise.resolve(blockPrefs);
	});
}
