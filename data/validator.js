import * as func from  '../core/func';
import * as dom from  '../core/dom';

const CLASS_NAMES = {
	ERROR_LABEL: 'hupper-error-message-label',
	ERROR_DESCRIPTION: 'hupper-error-description',
	ERROR_CONTAINER: 'hupper-error-message-container',
};

function createErrorMessage (message, description, field) {
	const msg = dom.createElem('div');
	dom.addClass(CLASS_NAMES.ERROR_CONTAINER, msg);

	const label = dom.createElem('label');
	dom.addClass(CLASS_NAMES.ERROR_LABEL, label);
	dom.attr('htmlFor', field.id, label);
	dom.text(message, label);

	const desc = dom.createElem('p');
	dom.addClass(CLASS_NAMES.ERROR_DESCRIPTION, desc);
	dom.text(description, desc);

	const appendToMsg = func.curry(dom.append, msg);

	[label, desc].forEach(appendToMsg);

	return msg;
}

function htmlFormatError (field, originalClickedButton, form) {
	const message = 'HTML formázási hibát találtam';
	const description = 'Valószínűleg egy vagy több HTML taget nem zártál le ' +
		'hozzászólásodban. Ez sok esetben az oldal helytelen megjelenéséhez ' +
		'vezethet. Kérlek ellenőrizd, hogy minden formázást jól alkalmaztál-e, ' +
		'esetleg próbáld ki az automatikus javítást!';

	const msg = createErrorMessage(message, description, field);

	const setButtonType = func.curry(dom.attr, 'type', 'button');

	const fixButton = dom.createElem('button');
	dom.text('Automatikus javítás', fixButton);

	const skipButton = dom.createElem('button');
	dom.text('Továbblépek, javitás nélkül', skipButton);

	[fixButton, skipButton].forEach(setButtonType);

	const appendToMsg = func.curry(dom.append, msg);

	[fixButton, document.createTextNode(' '), skipButton].forEach(appendToMsg);

	dom.addListener('click', () => {
		dom.val(dom.fixHTML(field.value), field);
		dom.remove(msg);
	}, fixButton);

	dom.addListener('click', () => {
		dom.addClass('novalidate', field);
		resubmitForm(originalClickedButton, form);
	}, skipButton);

	return msg;
}

function createRule (matcher, validator, message) {
	return { matcher, validator, message };
}

function validateElement (rules, element) {
	if (dom.is('.novalidate', element)) {
		return Promise.resolve(element);
	}

	const rulesToValidate = rules.filter(rule => dom.is(rule.matcher, element));
	const validations = rulesToValidate.map(rule => rule.validator(element).catch(error => Promise.reject({ error, message: rule.message })));
	return Promise.all(validations)
		.then(element => element)
		.catch(error => Promise.reject({ error: error.error, element, message: error.message }));
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
		if (dom.is('.novalidate', form)) {
			return;
		}

		e.preventDefault();

		let originalClickedButton;

		if (typeof e.explicitOriginalTarget !== 'undefined'){
			originalClickedButton = e.explicitOriginalTarget;
		} else if (typeof document.activeElement.value !== 'undefined') {
			originalClickedButton = document.activeElement;
		}

		validate(rules, form)
			.then(() => dom.selectAll('.hupper-error-message-container', form).forEach(dom.remove))
			.then(() => {
				const toNovalidate = func.curry(dom.addClass, 'novalidate');
				func.toArray(form.elements).concat([form]).forEach(toNovalidate);
			})
			.then(() => {
				setTimeout(() => {
					resubmitForm(originalClickedButton, form);
				});
			})
			.catch((err) => {
				const wrapper = dom.closest('.form-item', err.element);

				dom.selectAll('.hupper-error-message-container', wrapper).forEach(dom.remove);
				dom.append(wrapper, err.message(err.element, originalClickedButton, form));
			});
	}, form);
}

function resubmitForm (originalClickedButton, form) {
	if (originalClickedButton) {
		var click = new MouseEvent('click');
		originalClickedButton.dispatchEvent(click);
		return;
	}

	form.submit();
}

export {
	createRule,
	validate,
	validateElement,
	createErrorMessage,
	rules,
	attachValidator,
	resubmitForm,
	CLASS_NAMES,
};
