import * as dom from '../../core/dom';
import * as func from '../../core/func';
import * as modHupperBlock  from './hupper-block';

import { log } from '../../core/log';

const BLOCK_CLASS = 'block';
const SIDEBAR_CLASS = 'sidebar';
const SIDEBAR_LEFT_CLASS = 'sidebar-left';
const SIDEBAR_RIGHT_CLASS = 'sidebar-right';
const BLOCK_HEADER_ELEMENT = 'h2';

var blockDataStruct = {
	id: '',
	column: ''
};

var blockSturct = {
	node: null,
	header: null
};

function blockDataStructToBlockElement (blockObj) {
	return document.getElementById(blockObj.id);
}

/**
	* @param blockDataStruct
	* @return blockSturct
	*/
function blockDataStructToBlockSturct (block) {
	const output = Object.create(blockSturct);
	const node = blockDataStructToBlockElement(block);

	output.node = node;
	output.header = node ? node.querySelector(BLOCK_HEADER_ELEMENT) : null;
	// output.content = node.querySelector('.content');

	return output;
}

function getBlockElements (sidebar) {
	return func.toArray(sidebar.querySelectorAll('.' + BLOCK_CLASS));
}

/**
	* @param HTMLBlockElement block
	* @return string
	*/
function getBlockColumn (block) {
	const sidebar = dom.closest('.' + SIDEBAR_CLASS, block);

	return sidebar.getAttribute('id');
}

/**
	* @param HTMLBlockElement block
	* @return blockDataStruct
	*	id string
	*	column string
	*/
function blockElemToBlockDataStruct (block, index) {
	const output = Object.create(blockDataStruct);

	output.id = block.getAttribute('id');
	output.column = getBlockColumn(block);
	output.index = index;

	return output;
}

function getBlocks () {
	const leftBlocks = getBlockElements(document.getElementById(SIDEBAR_LEFT_CLASS))
		.map(blockElemToBlockDataStruct);
	const rightBlocks = getBlockElements(document.getElementById(SIDEBAR_RIGHT_CLASS))
		.map(blockElemToBlockDataStruct);

	return {
		left: leftBlocks,
		right: rightBlocks
	};
}

const ACTION_CLASS_NAMES = Object.freeze({
	right: 'arrow-right',
	left: 'arrow-left',
	up: 'arrow-up',
	down: 'arrow-down',
	delete: 'cross',
	'show-content': 'enlarge',
	'hide-content': 'shrink',
});

function createBlockButton (action) {
	const btn = dom.createElem('button');

	dom.addClasses(['hupper-button', `hupper-icon-${ACTION_CLASS_NAMES[action]}`, 'block-button', action + '-button'], btn);
	dom.data('action', action, btn);

	return btn;
}

function decorateBlock (block) {
	const blockStruct = blockDataStructToBlockSturct(block);

	if (blockStruct.header) {
		['delete', 'hide-content', 'show-content', 'right', 'left', 'down', 'up']
			// add button, if not added yet
			.filter(action => !blockStruct.header.querySelector(`button[data-action="${action}"]`))
			.map(createBlockButton)
			.forEach(function (btn) {
				blockStruct.header.appendChild(btn);
			});

		toggleBlock(block);
		if (block.title) {
			setBlockTitleLink(block.id, block.title);
		}
	}

}

function toggleBlock (block) {
	func.yesOrNo(block.hidden, hideBlock.bind(null, block), showBlock.bind(null, block));
	func.yesOrNo(block.hidden, modHupperBlock.addHiddenBlock.bind(null, block), modHupperBlock.removeHiddenBlock.bind(null, block));
	func.yesOrNo(block.contentHidden, hideBlockContent.bind(null, block), showBlockContent.bind(null, block));
}

function decorateBlocks (blocks) {
	blocks.forEach(decorateBlock);
}

function toggleBlockClass (block, cls, add) {
	const blockElem = blockDataStructToBlockElement(block);

	if (blockElem) {
		if (add) {
			dom.addClass(cls, blockElem);
		} else {
			dom.removeClass(cls, blockElem);
		}
	}
}

function hideBlock (block) {
	toggleBlockClass(block, 'hup-hidden', true);
}

function showBlock (block) {
	toggleBlockClass(block, 'hup-hidden', false);
}

function hideBlockContent (block) {
	toggleBlockClass(block, 'content-hidden', true);
}

function showBlockContent (block) {
	toggleBlockClass(block, 'content-hidden', false);
}

/**
	* @param {HTMLTElement} sidebar The sidebar where the blocks will be placed
	* @param {blockPref[]} blocks Array of blockpref objects (See
	* lib/blocks.js, has properties: id, hidden, contentHidden)
	* @param {[Element]} elementList List of block elements (ALL)
	*/
function renderSidebar (sidebar, blocks, elementList) {
	blocks.forEach(function (block) {
		const index = func.index(elementList, blockElem => blockElem.id === block.id);

		if (index > -1) {
			const elem = elementList.splice(index, 1)[0];
			sidebar.appendChild(elem);
		}
	});
}

function setBlockOrder (sidebar, blocks) {
	const sidebarElem = document.getElementById(sidebar);

	const blockElements = getBlockElements(sidebarElem);


	blockElements.forEach(function (element) {
		dom.remove(element);
	});

	renderSidebar(sidebarElem, blocks, blockElements);
}

function reorderBlocks (blocks) {
	log.log('reorder blocks', blocks);

	const sidebarLeft = document.getElementById(SIDEBAR_LEFT_CLASS);
	const sidebarRight = document.getElementById(SIDEBAR_RIGHT_CLASS);

	const elementList = getBlockElements(sidebarLeft)
		.concat(getBlockElements(sidebarRight));

	renderSidebar(sidebarLeft, func.sortBy(blocks.filter(i => i.column === 'left'), 'index'), elementList);
	renderSidebar(sidebarRight, func.sortBy(blocks.filter(i => i.column === 'right'), 'index'), elementList);
}

function setBlockTitleLink (blockId, href) {
	const block = document.getElementById(blockId);

	if (block) {
		const h2 = block.querySelector(BLOCK_HEADER_ELEMENT);
		if (h2 && !h2.querySelector('a')) {
			const title = h2.textContent;
			dom.emptyText(h2);
			h2.appendChild(dom.createElem('a', [{ name: 'href', value: href }], null, title));
		}
	}
}

function setTitles (titles) {
	Object.keys(titles).forEach(function (id) {
		setBlockTitleLink(id, titles[id]);
	});
}

const blockActionStruct = (function () {
	const obj = Object.create(null);

	obj.id = '';
	obj.action = '';
	obj.column = '';

	return obj;
}());

function onBlockControlClick (e) {
	if (e.target.dataset.action === 'restore-block') {
		const block = dom.closest('.block', e.target);
		const action = e.target.dataset.action;
		const event = Object.create(blockActionStruct);

		event.id = e.target.dataset.blockid;
		event.action = action;
		event.column = event.column || getBlockColumn(block);

		return event;
	}

	return false;
}

function onBlockButtonClick (e) {
	if (dom.is('.block-button', e.target)) {
		const block = dom.closest('.block', e.target);
		const action = e.target.dataset.action;
		const event = Object.create(blockActionStruct);

		event.id = block.getAttribute('id');
		event.action = action;
		event.column = getBlockColumn(block);

		return event;
	}

	return false;
}

function onEnableBlockControls (dispatch) {
	document.getElementById('content').addEventListener('click', function (e) {
		const event = onBlockButtonClick(e);

		if (event) {
			dispatch(event);
		}
	}, false);
}

export {
	getBlocks,
	decorateBlocks,
	blockDataStructToBlockElement,
	blockElemToBlockDataStruct,
	getBlockColumn,
	hideBlock as hide,
	showBlock as show,
	hideBlockContent as hideContent,
	showBlockContent as showContent,
	setBlockOrder,
	reorderBlocks,
	setTitles,
	onBlockControlClick,
	onBlockButtonClick,
	onEnableBlockControls,
	toggleBlock
};
