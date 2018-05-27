import * as dom from '../../core/dom';
import modHupBlock from './hup-block';
import getPage from './get-page';
import userTrakcer from './tracker';

function create (user) {
	return getPage(`/user/${user.id}/track`)
		.then(page => userTrakcer.getContents(page.querySelector('#tracker')))
		.then((f) => {
			const block = modHupBlock.create('block-hupper-user-tracker', 'User tracker');
			f.filter(f => f.answers.new > 0).forEach(f => modHupBlock.addMenuItem({
				href: f.href,
				text: `${f.title} (${f.answers.new} új)`,
			}, dom.selectOne('.menu', block)));
		});
}

export default { create };
