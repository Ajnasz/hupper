import * as dom from '../../core/dom';
import * as func from '../../core/func';

const hasCollapsedClass = func.curry(dom.hasClass, 'collapsed');
const hasExpandedClass = func.curry(dom.hasClass, 'expanded');

const collapseClasses = ['collapsed', 'hup-collapsed'];
const expandClasses = ['expanded', 'hup-expanded'];

function create (id, title, target = 'sidebar-right') {
	let block = document.getElementById(id);
	if (block) {
		return block;
	}

	block = dom.createElem('div', [{
		name: 'id',
		value: id
	}], ['block', 'block-block', 'hup-content-loading']);

	const h2 = dom.createElem('h2', null, null, title);
	const content = dom.createElem('div', null, ['content']);
	const ul = dom.createElem('ul', null, ['menu']);

	content.appendChild(ul);

	block.appendChild(h2);
	block.appendChild(content);

	const sidebar = document.getElementById(target);

	sidebar.insertBefore(block, sidebar.firstChild);

	ul.addEventListener('click', function (e) {
		const target = e.target.parentNode;

		const collapsed = hasCollapsedClass(target);

		const expanded = !collapsed && hasExpandedClass(target);

		if (collapsed || expanded) {
			e.preventDefault();

			if (collapsed) {
				collapseClasses.forEach(c => dom.removeClass(c, target));
				expandClasses.forEach(c => dom.addClass(c, target));
			} else {
				collapseClasses.forEach(c => dom.addClass(c, target));
				expandClasses.forEach(c => dom.removeClass(c, target));
			}
		}
	}, false);

	return block;
}

function addMenuItem (item, parent) {
	const id = func.toCamelCase(item.text);

	const current = parent.querySelector(`#${id}`);
	if (current) {
		dom.remove(current);
	}

	const li = dom.createElem('li', [{ name: 'id', value: id }], ['leaf']);
	const a = dom.createElem('a', [
		{ name: 'href', value: item.href }
	], null, item.text);

	li.appendChild(a);

	parent.appendChild(li);

	return li;
}

export default {
	create,
	addMenuItem,
};

