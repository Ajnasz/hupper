import attachSubmitNowButton from '../../../data/modules/attach-submit-now-button';
import { setGlobals } from '../../domHelpers';

const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const test = require('tape');

test('data/modules/attachSubmitNowButton', (t) => {
	t.test('it should add submit button', t => {
		const window = new JSDOM(`
<form action="/comment/reply/161127" accept-charset="UTF-8" method="post" id="comment-form">
<div><div class="form-item">
 <label>Név: </label>
 <a href="/user/4419" title="Felhasználói profil megtekintése.">Ajnasz</a>
</div>
<div class="form-item" id="edit-comment-wrapper">
 <label for="edit-comment">Hozzászólás: <span class="form-required" title="Szükséges mező.">*</span></label>
 <div class="resizable-textarea"><span><textarea cols="60" rows="15"
 name="comment" id="edit-comment" class="form-textarea resizable required
 processed html"></textarea><div class="grippie" style="margin-right:
 -4px;"></div></span></div>
</div>
<input name="form_id" id="edit-comment-form" value="comment_form" type="hidden">
<input name="op" id="edit-preview" value="Előnézet" class="form-submit" type="submit">
</div></form>
	`).window;
		const { document } = window;
		setGlobals(window);

		t.equal(document.querySelectorAll('.form-submit').length, 1);
		attachSubmitNowButton();
		t.equal(document.querySelectorAll('.form-submit').length, 2);
		t.equal(document.querySelectorAll('.form-submit')[0].value, 'Beküldés');
		t.end();
	});

	t.test('it should not add button twice', t => {
		const window = new JSDOM(`
<form action="/comment/reply/161127" accept-charset="UTF-8" method="post" id="comment-form">
<div><div class="form-item">
 <label>Név: </label>
 <a href="/user/4419" title="Felhasználói profil megtekintése.">Ajnasz</a>
</div>
<div class="form-item" id="edit-comment-wrapper">
 <label for="edit-comment">Hozzászólás: <span class="form-required" title="Szükséges mező.">*</span></label>
 <div class="resizable-textarea"><span><textarea cols="60" rows="15"
 name="comment" id="edit-comment" class="form-textarea resizable required
 processed html"></textarea><div class="grippie" style="margin-right:
 -4px;"></div></span></div>
</div>
<input name="form_id" id="edit-comment-form" value="comment_form" type="hidden">
<input name="op" id="edit-submit" value="Beküldés" class="form-submit" type="submit">
<input name="op" id="edit-preview" value="Előnézet" class="form-submit" type="submit">
</div></form>
	`).window;
		const { document } = window;
		setGlobals(window);

		attachSubmitNowButton();
		t.equal(document.querySelectorAll('.form-submit').length, 2);
		t.end();
	});
});
