import * as dom from '../../core/dom';

export default function attachSubmitNowButton () {
	dom.selectAll('#comment-form', document).forEach((form) => {
		const submits = dom.selectAll('.form-submit', form);

		if (submits.length === 1) {
			const previewButton = submits[0];
			const btn = previewButton.cloneNode();
			btn.id = btn.id.replace('preview', 'submit');
			btn.value = 'Beküldés';
			const textNode = document.createTextNode(' ');
			previewButton.parentNode.insertBefore(textNode, previewButton);
			previewButton.parentNode.insertBefore(btn, textNode);
		}
	});
}
