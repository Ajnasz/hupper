/*jshint moz:true*/
(function (def, req) {
	'use strict';

	var dom = req('dom');

	def('blocks', function () {
		const BLOCK_CLASS = 'block';
		const SIDEBAR_CLASS = 'sidebar';

		var blockDataStruct = {
			id: '',
			column: ''
		};

		var blockSturct = {
			node: null,
			header: null
		};

		/**
		 * @param blockDataStruct
		 * @return blockSturct
		 */
		function blockDataStructToBlockSturct(block) {
			let output = Object.create(blockSturct),
				node = blockDataStructToBlockElement(block);

			output.node = node;
			output.header = node.querySelector('h2');
			// output.content = node.querySelector('.content');

			return output;
		}

		function blockDataStructToBlockElement(blockObj) {
			return document.getElementById(blockObj.id);
		}

		function toArray(list) {
			return Array.prototype.slice.call(list);
		}

		function getBlockElements(sidebar) {
			return toArray(sidebar.querySelectorAll('.' + BLOCK_CLASS));
		}

		/**
		 * @param HTMLBlockElement block
		 * @return string
		 */
		function getBlockColumn(block) {
			let sidebar = dom.closest(block, '.' + SIDEBAR_CLASS);

			return sidebar.getAttribute('id');
		}

		/**
		 * @param HTMLBlockElement block
		 * @return blockDataStruct
		 *	id string
		 *	column string
		 */
		function blockElemToBlockDataStruct(block) {
			let output = Object.create(blockDataStruct);

			output.id = block.getAttribute('id');
			output.column = getBlockColumn(block);

			return output;
		}

		function getBlocks() {
			let leftBlocks = getBlockElements(document.getElementById('sidebar-left')).map(blockElemToBlockDataStruct);
			let rightBlocks = getBlockElements(document.getElementById('sidebar-right')).map(blockElemToBlockDataStruct);

			return {
				left: leftBlocks,
				right: rightBlocks
			};
		}

		function createBlockButton(action) {
			let btn = dom.createElem('button',
				[{ name: 'data-action', value: action }],
				['hupper-button', 'block-button', action + '-button']
			);

			return btn;
		}

		function decorateBlock(block) {
			let blockStruct = blockDataStructToBlockSturct(block);

			if (blockStruct.header) {
				['delete', 'hide-content', 'show-content', 'right', 'left', 'down', 'up']
					.map(createBlockButton).forEach(function (btn) {
						blockStruct.header.appendChild(btn);
					});
			}

		}

		function decorateBlocks(blocks) {
			blocks.forEach(decorateBlock);
		}

		function hideBlock(block) {
			let blockElem = blockDataStructToBlockElement(block);
			if (blockElem) {
				blockElem.classList.add('hup-hidden');
			}
		}

		function hideBlockContent(block) {
			let blockElem = blockDataStructToBlockElement(block);
			if (blockElem) {
				blockElem.classList.add('content-hidden');
			}
		}

		function showBlockContent(block) {
			let blockElem = blockDataStructToBlockElement(block);
			if (blockElem) {
				blockElem.classList.remove('content-hidden');
			}
		}

		function first(array, cb) {
			for (let i = 0, al = array.length; i < al; i++) {
				if (cb(array[i])) {
					return array[i];
				}
			}

			return null;
		}

		function setBlockOrder(sidebar, blocks) {
			let sidebarElem = document.getElementById(sidebar);

			let blockElements = getBlockElements(sidebarElem),
				elementList = [];

			blockElements.forEach(function (element) {
				elementList.push(dom.remove(element));
			});

			blocks.forEach(function (block) {
				let  elem = first(elementList, function (blockElem) {
					return blockElem.id === block.id;
				});

				if (elem !== null) {
					sidebarElem.appendChild(elem);
				}
			});
		}

		function addHupperBlock() {
			if (document.getElementById('block-hupper')) {
				return;
			}

			let block = dom.createElem('div', [{
				name: 'id',
				value: 'block-hupper'
			}], ['block', 'block-block']);

			let h2 = dom.createElem('h2', null, null, 'Hupper');
			let content = dom.createElem('div', null, ['content']);
			let itemList = dom.createElem('div', null, ['item-list']);
			let ul = dom.createElem('ul');

			itemList.appendChild(ul);
			content.appendChild(itemList);

			block.appendChild(h2);
			block.appendChild(content);

			let sidebar = document.getElementById('sidebar-right');

			sidebar.insertBefore(block, sidebar.firstChild);
		}

		return {
			getBlocks: getBlocks,
			decorateBlocks: decorateBlocks,
			blockDataStructToBlockElement: blockDataStructToBlockElement,
			blockElemToBlockDataStruct: blockElemToBlockDataStruct,
			getBlockColumn: getBlockColumn,
			hide: hideBlock,
			hideContent: hideBlockContent,
			showContent: showBlockContent,
			setBlockOrder: setBlockOrder,
			addHupperBlock: addHupperBlock
		};
	});
}(window.def, window.req));
