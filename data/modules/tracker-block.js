import { log } from '../../core/log';
import * as dom from '../../core/dom';
import modHupBlock from './hup-block';
import getPage from './get-page';
import userTrakcer from './tracker';

const BLOCK_ID = 'block-hupper-user-tracker';
const BLOCK_TITLE = 'User tracker';

function create () {
	return modHupBlock.create(BLOCK_ID, BLOCK_TITLE);
}

function fill (user) {
	return getPage(`https://hup.hu/user/${user.id}/track`)
		.then(page => userTrakcer.getContents(page.querySelector('#tracker')))
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
		.catch(err => log.error('tracker-block', err));
}

export default { create, fill };
