import * as dom from '../../core/dom';
import { log } from '../../core/log';
import modHupBlock from './hup-block';

const TEXT_HIDDEN_BLOCKS = 'Rejtett dobozok';

function addHupperBlock () {
	return modHupBlock.create('block-hupper', 'Hupper');
}

function getItemList () {
	const block = document.getElementById('block-hupper');
	return block.querySelector('.menu');
}

function addMenuItem (item, parent) {
	return modHupBlock.addMenuItem(item, parent || getItemList());
}

function addHiddenBlockContainer () {
	const container = getItemList().querySelector('.hidden-blocks');

	if (!container) {
		const li = addMenuItem({
			text: TEXT_HIDDEN_BLOCKS,
			href: '#'
		});

		dom.removeClass('leaf', li);
		['collapsed', 'hup-collapsed'].forEach(c => dom.addClass(c, li));

		const hiddenBlocks = dom.createElem('ul', null, ['hidden-blocks']);

		li.appendChild(hiddenBlocks);

		return hiddenBlocks;
	}

	return container;
}

function addHiddenBlock (block) {
	log.log('add hidden block', block);
	const container = addHiddenBlockContainer();

	const element = document.getElementById(block.id);

	if (!element) {
		return;
	}

	const menuItem = addMenuItem({
		href: '#restore-' + block.id,
		text: element.querySelector('h2').textContent.trim()
	}, container);

	const link = menuItem.firstChild;

	link.dataset.action = 'restore-block';
	link.dataset.sidebar = block.sidebar;
	link.dataset.blockid = block.id;
}

function removeHiddenBlock (block) {
	const container = addHiddenBlockContainer();
	const link = container.querySelector('[data-action="restore-block"][data-blockid="' + block.id + '"]');

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
