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
			var output = Object.create(blockSturct),
				node = blockDataStructToBlockElement(block);

			output.node = node;
			output.header = node.querySelector('h2');

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
			var sidebar = dom.closest(block, '.' + SIDEBAR_CLASS);

			return sidebar.getAttribute('id');
		}

		/**
		 * @param HTMLBlockElement block
		 * @return blockDataStruct
		 *	id string
		 *	column string
		 */
		function blockElemToBlockDataStruct(block) {
			var output = Object.create(blockDataStruct);

			output.id = block.getAttribute('id');
			output.column = getBlockColumn(block);

			return output;
		}

		function getBlocks() {
			var leftBlocks = getBlockElements(document.getElementById('sidebar-left')).map(blockElemToBlockDataStruct);
			var rightBlocks = getBlockElements(document.getElementById('sidebar-right')).map(blockElemToBlockDataStruct);

			return {
				left: leftBlocks,
				right: rightBlocks
			};
		}

		function createBlockButton(action) {
			var btn = dom.createElem('button',
				[{ name: 'data-action', value: action }],
				['hupper-button', 'block-button', action + '-button']
			);

			return btn;
		}

		function decorateBlock(block) {
			var blockStruct = blockDataStructToBlockSturct(block);

			if (blockStruct.header) {
				['delete', 'hide', 'show', 'right', 'left', 'down', 'up']
					.map(createBlockButton).forEach(function (btn) {
						blockStruct.header.appendChild(btn);
					});
			}

		}

		function decorateBlocks(blocks) {
			blocks.forEach(decorateBlock);
		}

		return {
			getBlocks: getBlocks,
			decorateBlocks: decorateBlocks,
			blockDataStructToBlockElement: blockDataStructToBlockElement,
			blockElemToBlockDataStruct: blockElemToBlockDataStruct,
			getBlockColumn: getBlockColumn
		};
	});
}(window.def, window.req));
