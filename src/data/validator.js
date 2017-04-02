import * as func from  '../core/func';
import * as dom from  '../core/dom';

function createErrorMessage (message, description, field) {
	const msg = dom.createElem('div');
	dom.addClass('hupper-error-message-container', msg);

	const label = dom.createElem('label');
	dom.addClass('hupper-error-message-label', label);
	dom.attr('htmlFor', field.id, label);
	dom.text(message, label);

	const desc = dom.createElem('p');
	dom.addClass('hupper-error-description', desc);
	dom.text(description, desc);

	const appendToMsg = func.curry(dom.append, msg);

	[label, desc].forEach(appendToMsg);

	return msg;
}

function htmlFormatError (field, originalClickedButton) {
	const message = 'HTML formázási hibát találtam';
	const description = 'Valószínűleg egy vagy több HTML taget nincs lezárva a' +
		'hozzászólásban. Ez sok esetben az oldal helytelen megjelenéséhez vezethet.' +
		'Kérlek ellenőrizd, hogy minden formázást jól alkalmaztál-e, esetleg' +
		'próbáld ki az automatikus javítást!';
	const msg = createErrorMessage(message, description, field);

	const setButtonType = func.curry(dom.attr, 'type', 'button');

	const fixButton = dom.createElem('button');
	dom.text('Automatikus javítás', fixButton);

	const skipButton = dom.createElem('button');
	dom.text('Nem, baj, tovább', skipButton);

	[fixButton, skipButton].forEach(setButtonType);

	const appendToMsg = func.curry(dom.append, msg);

	[fixButton, document.createTextNode(' '), skipButton].forEach(appendToMsg);

	dom.addListener('click', () => {
		dom.val(dom.fixHTML(field.value), field);
		dom.remove(msg);
	}, fixButton);

	dom.addListener('click', () => {
		dom.addClass('novalidate', field);
		const click = new MouseEvent('click', {view: window, cancellable: true, bubbles: true});
		if (originalClickedButton) {
			originalClickedButton.dispatchEvent(click);
		}
	}, skipButton);

	return msg;
}

function createRule (matcher, validator, message) {
	return { matcher, validator, message };
}

function validateElement (rules, element) {
	const rulesToValidate = rules.filter(rule => dom.is(rule.matcher, element));
	const validations = rulesToValidate.map(rule => rule.validator(element).catch(error => Promise.reject({error, message: rule.message})));
	return Promise.all(validations)
		.then(element => element)
		.catch(error => Promise.reject({error: error.error, element, message: error.message}));
}

const rules = [
	createRule('.html', (element) => {
		if (dom.isHTMLValid(element.value)) {
			return Promise.resolve();
		} else {
			return Promise.reject(new Error('Invalid HTML'));
		}
	}, htmlFormatError)
];

function validate (rules, form) {
	const elements = func.toArray(form.elements);
	return Promise.all(elements.map(func.curry(validateElement, rules)));
}

function attachValidator (form) {
	dom.addListener('submit', e => {
		let originalClickedButton;

		if (typeof e.explicitOriginalTarget !== 'undefined'){
			originalClickedButton = e.explicitOriginalTarget;
		} else if (typeof document.activeElement.value !== 'undefined') {
			originalClickedButton = document.activeElement;
		}


		validate(rules, form)
			.then(() => dom.selectAll('.hupper-error-message-container', form).forEach(dom.remove))
			.catch((err) => {
				e.preventDefault();
				const wrapper = dom.closest('.form-item', err.element);

				dom.selectAll('.hupper-error-message-container', wrapper).forEach(dom.remove);
				dom.append(wrapper, err.message(err.element, originalClickedButton));
			});
	}, form);
}

export {
	createRule,
	validate,
	validateElement,
	createErrorMessage,
	rules,
	attachValidator
};
