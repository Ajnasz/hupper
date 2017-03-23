import * as dom from '../../core/dom';
import * as func from '../../core/func';
import { log } from '../../core/log';

const TEXT_HIDDEN_BLOCKS = 'Rejtett dobozok';

const hasCollapsedClass = func.curry(dom.hasClass, 'collapsed');
const hasExpandedClass = func.curry(dom.hasClass, 'expanded');

function addHupperBlock () {
	if (document.getElementById('block-hupper')) {
		return;
	}

	let block = dom.createElem('div', [{
		name: 'id',
		value: 'block-hupper'
	}], ['block', 'block-block']);

	let h2 = dom.createElem('h2', null, null, 'Hupper');
	let content = dom.createElem('div', null, ['content']);
	let ul = dom.createElem('ul', null, ['menu']);

	content.appendChild(ul);

	block.appendChild(h2);
	block.appendChild(content);

	let sidebar = document.getElementById('sidebar-right');

	sidebar.insertBefore(block, sidebar.firstChild);

	ul.addEventListener('click', function (e) {
		let target = e.target.parentNode;

		let collapsed = hasCollapsedClass(target);

		let expanded = !collapsed && hasExpandedClass(target);

		if (collapsed || expanded) {
			e.preventDefault();

			const collapseClasses = ['collapsed', 'hup-collapsed'];
			const expandClasses = ['expanded', 'hup-expanded'];

			if (collapsed) {
				collapseClasses.forEach(c => dom.removeClass(c, target));
				expandClasses.forEach(c => dom.addClass(c, target));
			} else {
				collapseClasses.forEach(c => dom.addClass(c, target));
				expandClasses.forEach(c => dom.removeClass(c, target));
			}
		}
	}, false);
}

function getItemList () {
	let block = document.getElementById('block-hupper');
	return block.querySelector('.menu');

}

function addMenuItem (item, parent) {
	parent = parent || getItemList();

	let id = func.toCamelCase(item.text);

	let current = parent.querySelector(`#${id}`);
	if (current) {
		dom.remove(current);
	}

	let li = dom.createElem('li', [{name: 'id', value: id}], ['leaf']);
	let a = dom.createElem('a', [
		{name: 'href', value: item.href}
	], null, item.text);

	li.appendChild(a);

	parent.appendChild(li);

	return li;
}

function addHiddenBlockContainer () {
	let container = getItemList().querySelector('.hidden-blocks');

	if (!container) {
		let li = addMenuItem({
			text: TEXT_HIDDEN_BLOCKS,
			href: '#'
		});

		dom.removeClass('leaf', li);
		['collapsed', 'hup-collapsed'].forEach(c => dom.addClass(c, li));

		let hiddenBlocks = dom.createElem('ul', null, ['hidden-blocks']);

		li.appendChild(hiddenBlocks);

		return hiddenBlocks;
	}

	return container;
}

function addHiddenBlock (block) {
	log.log('add hidden block', block);
	let container = addHiddenBlockContainer();

	let element = document.getElementById(block.id);

	if (!element) {
		return;
	}

	let menuItem = addMenuItem({
		href: '#restore-' + block.id,
		text: element.querySelector('h2').textContent.trim()
	}, container);

	let link = menuItem.firstChild;

	link.dataset.action = 'restore-block';
	link.dataset.sidebar = block.sidebar;
	link.dataset.blockid = block.id;
}

function removeHiddenBlock (block) {
	let container = addHiddenBlockContainer();
	let link = container.querySelector('[data-action="restore-block"][data-blockid="' + block.id + '"]');

	if (link) {
		dom.remove(link.parentNode);
	}
}

export {
	addHupperBlock,
	addMenuItem,
	addHiddenBlock,
	removeHiddenBlock
};
