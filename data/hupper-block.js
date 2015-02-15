/*jshint moz:true*/
(function (def, req) {
	'use strict';

	var dom = req('dom');

	def('hupper-block', function () {
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

		function getItemList() {
			let block = document.getElementById('block-hupper');
			return block.querySelector('.item-list > ul');

		}

		function addMenuItem(item, parent) {
			parent = parent || getItemList();
			let li = dom.createElem('li');
			let a = dom.createElem('a', [
				{name: 'href', value: item.href}
			], null, item.text);

			li.appendChild(a);

			parent.appendChild(li);

			return li;
		}

		function addHiddenBlockContainer() {
			let container = getItemList().querySelector('.hidden-blocks');

			if (!container) {
				let li = addMenuItem({
					text: 'Hidden blocks',
					href: '#'
				});

				let hiddenBlocks = dom.createElem('ul', null, ['hidden-blocks']);

				li.appendChild(hiddenBlocks);

				return hiddenBlocks;
			}

			return container;
		}

		function addHiddenBlock(block) {
			let container = addHiddenBlockContainer();

			let element = document.getElementById(block.id);

			let menuItem = addMenuItem({
				href: '#restore-' + block.id,
				text: element.querySelector('h2').textContent.trim()
			}, container);

			let link = menuItem.firstChild;

			link.dataset.action = 'restore-block';
			link.dataset.blockid = block.id;
		}

		function removeHiddenBlock(block) {
			let container = addHiddenBlockContainer();
			let link = container.querySelector('[data-action="restore-block"][data-blockid="' + block.id + '"]');

			if (link) {
				dom.remove(link.parentNode);
			}
		}

		return {
			addHupperBlock: addHupperBlock,
			addMenuItem: addMenuItem,
			addHiddenBlock: addHiddenBlock,
			removeHiddenBlock: removeHiddenBlock
		};
	});


}(window.def, window.req));
