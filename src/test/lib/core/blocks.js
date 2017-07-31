import * as modBlocks from '../../../lib/core/blocks';
import * as func from '../../../core/func';

const test = require('tape');

function createTestData () {
	const block = createBlockMock();

	const column = `column-${Math.round(Math.random() * 1000)}`;

	return { column, block };
}

function createBlockMock () {
	return {
		id: `block-${Math.round(Math.random() * 1000)}`,
		index: Math.round(Math.random() * 1000)
	};
}

test('lib/core/blocks', (t) => {
	t.test('createBlockPref', (t) => {
		const { column, block } = createTestData();

		const pref = modBlocks.createBlockPref(column, block);

		t.equal(pref.id, block.id, 'id set');
		t.equal(pref.index, block.index, 'index set');
		t.equal(pref.column, column, 'column set');
		t.equal(pref.hidden, false, 'hidden set');
		t.equal(pref.contentHidden, false, 'contentHidden set');
		t.end();
	});

	t.test('updateBlock', (t) => {
		const blocks = Array.from(new Array(10)).map(() => {
			const { column, block } = createTestData();

			return modBlocks.createBlockPref(column, block);
		});

		const block0 = modBlocks.updateBlock({ id: blocks[0].id }, 'hidden', true, blocks);

		t.equal(blocks[0].hidden, true, 'hidden state updated');
		t.equal(block0, blocks[0], 'returned block is the same what in the blocks array');

		modBlocks.updateBlock({ id: blocks[1].id }, 'contentHidden', true, blocks);
		t.equal(blocks[1].contentHidden, true, 'contentHidden state updated');
		t.end();
	});

	t.test('getBlockTitle', (t) => {
		const pairs = [
			['block-aggregator-feed-13', 'http://distrowatch.com'],
			['block-aggregator-feed-19', 'http://www.freebsd.org'],
			['block-aggregator-feed-48', 'http://www.netbsd.org'],
			['block-aggregator-feed-2', 'http://www.kernel.org'],
			['block-aggregator-feed-3', 'http://wiki.hup.hu'],
			['block-aggregator-feed-4', 'http://lwn.net'],
			['block-aggregator-feed-40', 'http://www.flickr.com/photos/h_u_p/'],
			['block-aggregator-feed-41', 'http://blogs.sun.com'],
			['block-aggregator-feed-44', 'http://hwsw.hu'],
			['block-aggregator-feed-46', 'http://www.linuxdevices.com'],
			['block-aggregator-feed-47', 'http://undeadly.org'],
			['block-aggregator-feed-50', '/allasajanlatok'],
			['block-aggregator-feed-51', 'http://blogs.sun.com/sunhu/'],
			['block-block-15', 'irc://irc.freenode.net/hup.hu'],
			['block-block-12', '/tamogatok'],
			['block-block-7', 'http://www.google.com/custom?ie=UTF-8&' +
				'oe=UTF-8&domains=hup.hu&sa=Keres%C3%A9s&' +
				'cof=%22S%3Ahttp%3A%2F%2Fhup.hu%3BVLC%3A7a7a76%3BAH%3A' +
				'center%3BLH%3A74%3BLC%3A7a7a76%3BGFNT%3A7a7a76%3BL%3A' +
				'http%3A%2F%2Fhup.hu%2Fimages%2Fhup_search.png%3BLW%3A484%3' +
				'BT%3Ablack%3BAWFID%3Ab92ddab1875cce47%3B%22&sitesearch=hup.hu'],
			['block-block-6', 'http://www.mozilla.com/firefox?from=sfx&uid=225821&t=308'],
			['block-blog-0', '/blog'],
			['block-comment-0', '/tracker'],
			['block-poll-0', '/poll'],
			['block-poll-40', '/poll'],
			['block-search-0', '/search'],
			['block-tagadelic-1', '/temak']
		];

		pairs.forEach((b) => {
			t.equal(modBlocks.getBlockTitle({ id: b[0]}), b[1], `block title equal ${b[0]}`);
		});
		t.end();
	});

	t.test('mergeBlockPrefsWithBlocks', (t) => {
		const blocks = modBlocks.mergeBlockPrefsWithBlocks({
			left: [],
			right: [],
		});
		t.ok(Array.isArray(blocks), 'return empty array');
		t.equal(blocks.length, 0, 'return empty array');

		const blocks2 = modBlocks.mergeBlockPrefsWithBlocks({
			left: [ createBlockMock() ],
			right: [],
		});
		t.equal(blocks2.length, 1, 'adds element to array');
		t.equal(blocks2[0].column, 'left', 'sets left column');

		const blocks3 = modBlocks.mergeBlockPrefsWithBlocks({
			left: [],
			right: [ createBlockMock() ],
		});
		t.equal(blocks3.length, 1, 'adds element to array');
		t.equal(blocks3[0].column, 'right', 'sets right column');

		const blocks4 = modBlocks.mergeBlockPrefsWithBlocks({
			left: [ createBlockMock() ],
			right: [ createBlockMock() ],
		});
		t.equal(blocks4.length, 2, 'adds element to array');
		t.equal(blocks4[0].column, 'left', 'sets left column');
		t.equal(blocks4[1].column, 'right', 'sets right column');

		t.test('merging blockprefs', (t) => {
			const leftBlocks = Array.from(new Array(3)).map((item, index) => Object.assign(createBlockMock(), { column: 'left', index }));
			const rightBlocks = Array.from(new Array(3)).map((item, index) => Object.assign(createBlockMock(), { column: 'right', index }));

			rightBlocks[0].index = 10;
			rightBlocks[1].index = 21;
			leftBlocks[1].index = 22;
			leftBlocks[0].index = 9;
			const blockPrefs = leftBlocks.concat(rightBlocks);
			const blocks = modBlocks.mergeBlockPrefsWithBlocks({
				left: [ createBlockMock() ],
				right: [ createBlockMock() ],
			}, blockPrefs);


			t.equal(blocks.length, 8, 'adds element to array');
			t.equal(blocks[0].column, 'left', 'sets left column');
			t.equal(blocks[1].column, 'left', 'sets left column');
			t.equal(blocks[2].column, 'left', 'sets left column');
			t.equal(blocks[3].column, 'left', 'sets left column');
			t.equal(blocks[4].column, 'right', 'sets right column');
			t.equal(blocks[5].column, 'right', 'sets right column');
			t.equal(blocks[6].column, 'right', 'sets right column');
			t.equal(blocks[7].column, 'right', 'sets right column');

			const sortedLeftBlocks = func.sortBy(blocks.filter(b => b.column === 'left'), 'index');
			const sortedRightBlocks = func.sortBy(blocks.filter(b => b.column === 'right'), 'index');

			t.ok(sortedLeftBlocks.every((item, index) => item.index === index), 'indexes normalized for left blocks');
			t.ok(sortedRightBlocks.every((item, index) => item.index === index), 'indexes normalized for right blocks');

			const blocks2 = modBlocks.mergeBlockPrefsWithBlocks({
				left: [ createBlockMock(), leftBlocks[0] ],
				right: [ createBlockMock(), rightBlocks[0] ],
			}, blockPrefs);
			t.equal(blocks2.length, 8, 'did not add an elemnet twice');

			const blocks3 = modBlocks.mergeBlockPrefsWithBlocks({
				left: [ createBlockMock() ],
				right: [ createBlockMock() ],
			}, { items: blockPrefs });

			t.equal(blocks3.length, 8, 'can use the items property of blockPrefs');

			t.end();
		});

		t.end();
	});

	t.end();
});
