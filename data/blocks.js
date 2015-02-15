/*jshint moz:true*/
(function (def, req) {
	'use strict';

	var dom = req('dom');
	var func = req('func');

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

			console.log(rightBlocks);

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

		function showBlock(block) {
			let blockElem = blockDataStructToBlockElement(block);
			if (blockElem) {
				blockElem.classList.remove('hup-hidden');
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

		function renderSidebar(sidebar, blocks, elementList) {
			blocks.forEach(function (block) {
				let index = func.index(elementList, function (blockElem) {
					return blockElem.id === block.id;
				});

				if (index > -1) {
					let  elem = elementList.splice(index, 1)[0];
					sidebar.appendChild(elem);
				}
			});
		}

		function setBlockOrder(sidebar, blocks) {
			let sidebarElem = document.getElementById(sidebar);

			let blockElements = getBlockElements(sidebarElem),
				elementList = [];


			elementList = blockElements.map(function (element) {
				return dom.remove(element);
			});

			renderSidebar(sidebarElem, blocks, elementList);
		}

		function reorderBlocks(blocks) {
			console.log('reorder blocks', blocks);
			
			let sidebarLeft = document.getElementById('sidebar-left');
			let sidebarRight = document.getElementById('sidebar-right');

			let elementList = getBlockElements(sidebarLeft).concat(getBlockElements(sidebarRight));

			console.log('reorder blocks please');

			renderSidebar(sidebarLeft, blocks.left, elementList);
			renderSidebar(sidebarRight, blocks.right, elementList);
		}

		return {
			getBlocks: getBlocks,
			decorateBlocks: decorateBlocks,
			blockDataStructToBlockElement: blockDataStructToBlockElement,
			blockElemToBlockDataStruct: blockElemToBlockDataStruct,
			getBlockColumn: getBlockColumn,
			hide: hideBlock,
			show: showBlock,
			hideContent: hideBlockContent,
			showContent: showBlockContent,
			setBlockOrder: setBlockOrder,
			reorderBlocks: reorderBlocks
		};
	});
}(window.def, window.req));
