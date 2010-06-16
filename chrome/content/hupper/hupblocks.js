(function() {
  var Blocks = (function() {
    var blocks = {left: [], right:[]};
    return {
      blockToLeft: function(sBlockID) {
        var block, blockIndex;
        block = this.getBlock(sBlockID, 'right');
        if(block) {
          blockIndex = blocks.right.indexOf(block);
          blocks.right.splice(blockIndex, 1);
          block.side = 'left';
          blocks.left.push(block);
          return true;
        }
        return false;
      },
      blockToRight: function(sBlockID) {
        var block, blockIndex;
        block = this.getBlock(sBlockID, 'left');
        if(block) {
          blockIndex = blocks.left.indexOf(block);
          blocks.left.splice(blockIndex, 1);
          block.side = 'right';
          blocks.right.push(block);
          return true;
        }
        return false;
      },
      blockToUp: function(sBlockID) {
        var block, blocksOfBlockSide, blockIndex, blockAbove, blockAboveIndex;
        block = this.getBlock(sBlockID);
        if(block) {
          blocksOfBlockSide = blocks[block.side];
          blockIndex = blocksOfBlockSide.indexOf(block);
          if(blockIndex > 0) {
            blockAboveIndex = blockIndex;
            do {
              blockAboveIndex = blockAboveIndex - 1;
            } while(blocksOfBlockSide[blockAboveIndex].hidden && blockAboveIndex - 1 > 0);
            blockAbove = blocksOfBlockSide[blockAboveIndex];
            blocksOfBlockSide[blockAboveIndex] = block;
            blocksOfBlockSide[blockIndex] = blockAbove;
            return true;
          }
        }
        return false;
      },
      blockToDown: function(sBlockID) {
        var block, blocksOfBlockSide, blockIndex, blockBelow, blockBelowIndex, blocksLength;
        block = this.getBlock(sBlockID);
        if(block) {
          blocksOfBlockSide = blocks[block.side];
          blocksLength = blocksOfBlockSide.length;
          blockIndex = blocksOfBlockSide.indexOf(block);
          if(blockIndex < blocksLength && blockIndex != -1) {
            blockBelowIndex = blockIndex;
            do {
              blockBelowIndex = blockBelowIndex + 1;
            } while(blocksOfBlockSide[blockBelowIndex].hidden && blockBelowIndex + 1 < blocksLength - 1);
            blockBelow = blocksOfBlockSide[blockBelowIndex];
            blocksOfBlockSide[blockBelowIndex] = block;
            blocksOfBlockSide[blockIndex] = blockBelow;
            return true;
          }
        }
        return false;
      },
      /**
      * @method registerBlock
      * @param {Hupper.Block} oBlock
      */
      registerBlock: function(oBlock) {
        var id, blockExists, side;

        id = oBlock.id;
        side = oBlock.side;
        blockExists = blocks.left.some(function(block) {
          return block.id == id;
        }) || blocks.right.some(function(block) {
          return block.id == id;
        });
        if(!blockExists) {
          blocks[side].push(oBlock);
          return true;
        }
        return false;
      },
      getBlocks: function() {
        return blocks;
      },
      getBlock: function(sBlockID, side) {
        var output;
        if(side) {
          output = blocks[side].filter(function(b) {
            return b.id == sBlockID;
          })[0];
        } else {
        output = blocks.left.filter(function(b) {
                    return b.id == sBlockID;
                  })[0]
                  ||
                  blocks.right.filter(function(b) {
                    return b.id == sBlockID;
                  })[0];
        }
        return output;
      }
    };
  })();
  Blocks.UI = (function() {
    return {
      rearrangeBlocks: function() {
        var left = HUP.El.GetId('sidebar-left');
        var right = HUP.El.GetId('sidebar-right');
        var blocks = Blocks.getBlocks();
        if(blocks.left.length && blocks.right.length) {
          HUP.El.RemoveAll(left);
          HUP.El.RemoveAll(right);
          blocks.left.forEach(function(block) {
            HUP.El.Add(block.block, left);
          });
          blocks.right.forEach(function(block) {
            HUP.El.Add(block.block, right);
          });
        }
      }
    }
  })();
  // exports.Blocks = Blocks;
  Hupper.Blocks = Blocks;
})();
