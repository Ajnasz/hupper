import { log } from '../../core/log';
import * as dom from '../../core/dom';
import modHupBlock from './hup-block';
import getPage from './get-page';
import userTrakcer from './unread-collector';

const IS_UNREAD_BLOCK_ENABLED = false;

const BLOCK_TITLE = 'User tracker';
export const BLOCK_ID = 'block-hupper-user-tracker';

export function create () {
	return modHupBlock.create(BLOCK_ID, BLOCK_TITLE);
}

export function fill (user) {
	if (!IS_UNREAD_BLOCK_ENABLED) {
		log.info('HUPPER: unread-block function disabled');
		return Promise.resolve();
	}

	return getPage(`https://hup.hu/user/${user.id}/track`)
		.then(page => {
			const trackerElem = dom.selectOne('#tracker', page);
			if (!trackerElem) {
				return Promise.reject(new Error('Tracker elem not found'));
			}

			return userTrakcer.getContents(trackerElem);
		})
		.then((f) => {
			const newAnswers = f.filter(f => f.answers.new > 0);

			const block = modHupBlock.create(BLOCK_ID, BLOCK_TITLE);
			if (newAnswers.length) {
				newAnswers.forEach(f => modHupBlock.addMenuItem({
					href: `${f.href}#new`,
					text: `${f.title} (${f.answers.new} új)`,
				}, dom.selectOne('.menu', block)));

				dom.addClass('hup-content-loaded', block);
			} else {
				dom.addClass('hup-content-no-content', block);
			}

			dom.removeClass('hup-content-loading', block);
		})
		.catch(err => log.error('unread-block', err));
}
