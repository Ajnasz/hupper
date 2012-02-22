var Blocks = function () {
    var blocks = {
        left: [],
        right: []
    };
    return {
        blockToLeft: function (sBlockID) {
            var block, blockIndex;
            block = this.getBlock(sBlockID, 'right');
            if (block) {
                blockIndex = blocks.right.indexOf(block);
                blocks.right.splice(blockIndex, 1);
                block.setSide('left');
                blocks.left.push(block);
                return true;
            }
            return false;
        },
        blockToRight: function (sBlockID) {
            var block, blockIndex;
            block = this.getBlock(sBlockID, 'left');
            if (block) {
                blockIndex = blocks.left.indexOf(block);
                blocks.left.splice(blockIndex, 1);
                block.setSide('right');
                blocks.right.push(block);
                return true;
            }
            return false;
        },
        blockToUp: function (sBlockID) {
            var block, blocksOfBlockSide, blockIndex, blockAbove, blockAboveIndex;
            block = this.getBlock(sBlockID);
            if (block) {
                // blocksOfBlockSide = blocks[block.side];
                blockIndex = blocks[block.side].indexOf(block);
                if (blockIndex > 0) {
                    blockAboveIndex = blockIndex;
                    do {
                        blockAboveIndex = blockAboveIndex - 1;
                    } while (blocks[block.side][blockAboveIndex].hidden && blockAboveIndex - 1 > 0);
                    blockAbove = blocks[block.side][blockAboveIndex];
                    blocks[block.side][blockAboveIndex] = block;
                    blocks[block.side][blockIndex] = blockAbove;
                    return true;
                }
            }
            return false;
        },
        blockToDown: function (sBlockID) {
            var block, blocksOfBlockSide, blockIndex, blockBelow, blockBelowIndex, blocksLength;
            block = this.getBlock(sBlockID);
            if (block) {
                // blocksOfBlockSide = blocks[block.side];
                blocksLength = blocks[block.side].length;
                blockIndex = blocks[block.side].indexOf(block);
                if (blockIndex < blocksLength && blockIndex !== -1) {
                    blockBelowIndex = blockIndex;
                    do {
                        blockBelowIndex = blockBelowIndex + 1;
                    } while (blocks[block.side][blockBelowIndex].hidden &&
                             blockBelowIndex + 1 < blocksLength - 1);
                    blockBelow = blocks[block.side][blockBelowIndex];
                    blocks[block.side][blockBelowIndex] = block;
                    blocks[block.side][blockIndex] = blockBelow;
                    return true;
                }
            }
            return false;
        },
        /**
        * @method registerBlock
        * @param {Hupper.Block} oBlock
        */
        registerBlock: function (oBlock) {
            // if (!(oBlock instanceof Hupper.Block)) {
            if (typeof oBlock !== 'object') {
                throw new Error('can not register block, oBlock type is ' + typeof oBlock);
            }

            var id, blockExists, side;
            id = oBlock.id;
            side = oBlock.side;
            blockExists = (blocks.left.some(function (block) {
                return block.id === id;
            }) || blocks.right.some(function (block) {
                return block.id === id;
            }));
            if (!blockExists) {
                blocks[side].push(oBlock);
            }
            return !blockExists;
        },
        getBlocks: function () {
            return blocks;
        },
        getBlock: function (sBlockID, side) {
            var output;
            if (side) {
                output = blocks[side].filter(function (b) {
                    return b.id === sBlockID;
                })[0];
            } else {
                output = blocks.left.filter(function (b) {
                    return b.id === sBlockID;
                })[0] ||
                blocks.right.filter(function (b) {
                    return b.id === sBlockID;
                })[0];
            }
            return output;
        },
        save: function () {
            var json = {left: [], right: []},
                scope = {}, hp;
            blocks.left.forEach(function (block) {
                json.left.push({
                    id: block.id,
                    hidden: block.hidden,
                    contentHidden: block.contentHidden
                });
            });
            blocks.right.forEach(function (block) {
                json.right.push({
                    id: block.id,
                    hidden: block.hidden,
                    contentHidden: block.contentHidden
                });
            });
            Components.utils.import('resource://huppermodules/prefs.jsm', scope);
            hp = new scope.HP();
            hp.set.blocks(JSON.stringify(json));
        },
        destroy: function () {
            blocks.left.forEach(function (block) {
                block.destroy();
                block = null;
            });
            blocks.right.forEach(function (block) {
                block.destroy();
                block = null;
            });
            blocks.left = null;
            blocks.right = null;
            blocks = null;
        }
    };
};
Blocks.UI = function (doc, hupperBlocks) {
    var scope = {},
        timeout, elementer;
    Components.utils.import('resource://huppermodules/Elementer.jsm', scope);
    elementer = new scope.Elementer(doc);
    return {
        rearrangeBlocks: function () {
            Components.utils.import('resource://huppermodules/timer.jsm', scope);
            if (timeout) {
                scope.never(timeout);
            }
            timeout = scope.later(function () {
                var left = elementer.GetId('sidebar-left'),
                    right = elementer.GetId('sidebar-right'),
                    blocks = hupperBlocks.getBlocks(),
                    scope = {};
                if (blocks.left.length && blocks.right.length) {
                    elementer.RemoveAll(left);
                    elementer.RemoveAll(right);
                    blocks.left.forEach(function (block) {
                        elementer.Add(block.block, left);
                    });
                    blocks.right.forEach(function (block) {
                        elementer.Add(block.block, right);
                    });
                } else {
                    Components.utils.import('resource://huppermodules/log.jsm', scope);
                    scope.hupperLog('no blocks are defined');
                }
            }, 10);
        },
        destroy: function () {
            elementer.destroy();
            elementer = null;
            doc = null;
            timeout = null;
            hupperBlocks = null;
        }
    };
};

var EXPORTED_SYMBOLS = ['Blocks'];
