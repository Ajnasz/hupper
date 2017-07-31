import { prefs } from '../../../core/prefs';
import * as modBlocks from '../blocks';
/**
 * @method updateBlock
 * @param {String} pref
 * @param {*} details
 */
export default function updateBlock (details, prefName, value) {
	return prefs.getBlocks().then(blocks => {
		let output = modBlocks.updateBlock(details, prefName, value, blocks);

		prefs.setPref('blocks', blocks);

		return output;
	});
}

