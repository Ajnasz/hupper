import * as dom from '../../core/dom';
import modHupBlock from './hup-block';
import getPage from './get-page';
import userTrakcer from './tracker';

const BLOCK_ID = 'block-hupper-user-tracker';
const BLOCK_TITLE = 'User tracker';

function create (user) {
	return getPage(`/user/${user.id}/track`)
		.then(page => userTrakcer.getContents(page.querySelector('#tracker')))
		.then((f) => {
			const newAnswers = f.filter(f => f.answers.new > 0);
			if (newAnswers.length) {
				const block = modHupBlock.create(BLOCK_ID, BLOCK_TITLE);
				newAnswers.forEach(f => modHupBlock.addMenuItem({
					href: `${f.href}#new`,
					text: `${f.title} (${f.answers.new} új)`,
				}, dom.selectOne('.menu', block)));
			}
		});
}

export default { create };
