import attachSubmitNowButton from '../../../data/modules/attach-submit-now-button';
import { readPage } from '../../domHelpers';
const path = require('path');
const fixturesPath = path.resolve(__dirname, '../fixtures');

const test = require('tape');

test('data/modules/attachSubmitNowButton', (t) => {
	t.test('it should add submit button', t => {
		return readPage(path.join(fixturesPath, 'comment_form.html')).then(window => {
			const { document } = window;

			t.equal(document.querySelectorAll('.form-submit').length, 1);
			attachSubmitNowButton();
			t.equal(document.querySelectorAll('.form-submit').length, 2);
			t.equal(document.querySelectorAll('.form-submit')[0].value, 'Beküldés');
			t.end();
		});
	});
});
