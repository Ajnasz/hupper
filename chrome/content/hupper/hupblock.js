/**
 * @class HUPBlock
 * @constructor
 * @param {Element} block
 */
var HUPBlock = function(block, sides, blockMenus) {
  if(!block) return;
  this.block = block;
  this.id = this.block.getAttribute('id');
  this.blockMenus = blockMenus;
  this.titleNode = HUP.El.GetFirstTag('h2', this.block);
  var contents = HUP.El.GetByClass(this.block, 'content', 'div');
  this.contentNode = (contents.length) ? contents[0] : null;
  if(this.titleNode) {
    this.title = this.titleNode.innerHTML;
  }
  this.makeTitle();
  if(this.id != 'block-hupper-0') {
    this.addButtons();
  }
  this.addMoveButtons();
  var properties = HUPBlocksProperties.getBlock(this.id);
  if(properties) {
    this.side = properties.side;
    this.setIndex(properties.index);
    properties.hidden ? this.hide() : this.show();
    properties.contentHidden ? this.hideContent() : this.showContent();
  } else {
    this.side = /sidebar-right/.test(this.block.parentNode.getAttribute('id')) ? 'right' : 'left';
    this.setIndex(sides[this.side]);
    this.saveProperties();
    sides[this.side]++;
  }
};
HUPBlock.prototype = {
  hidden: false,
  contentHidden: false,
  blocks: new Array(),
  hide: function() {
    HUP.El.Hide(this.block);
    this.hidden = true;
    this.blockMenus.addBlockToMenu(this);
    this.saveProperties();
  },
  show: function() {
    HUP.El.Show(this.block);
    this.hidden = false;
    this.blockMenus.removeBlockFromMenu(this);
    this.saveProperties();
  },
  hideContent: function() {
    if(!this.contentNode) return;
    HUP.El.Hide(this.contentNode);
    HUP.El.Hide(this.hideButton);
    HUP.El.Show(this.showButton);
    this.contentHidden = true;
    this.saveProperties();
  },
  showContent: function() {
    if(!this.contentNode) return;
    HUP.El.Show(this.contentNode);
    HUP.El.Show(this.hideButton);
    HUP.El.Hide(this.showButton);
    this.contentHidden = false;
    this.saveProperties();
  },
  makeTitle: function() {
    var boxes = {
        'block-aggregator-feed-3': 'http://wiki.hup.hu',
        'block-blog-0': '/blog',
        'block-search-0': '/search',
        'block-poll-40': '/poll',
        'block-aggregator-feed-40': 'http://www.flickr.com/photos/h_u_p/',
        'block-tagadelic-1': '/temak',
        'block-comment-0': '/tracker'
    };
    if(boxes[this.id] && this.title && this.titleNode) {
      HUP.El.Update(HUP.El.CreateLink(this.title, boxes[this.id]), this.titleNode);
    }
  },
  moveUp: function() {
    var block = this.getUpBlock();
    while(!block.titleNode || block.hidden) {
      block = this.getUpBlock(block);
    }
    var newIndex = block.index;
    var thisIndex = this.index;
    this.blocks[this.blocks.indexOf(block)].index = thisIndex;
    this.index = newIndex;
    HUP.L.log('a: ', this.blocks[newIndex].index, 'b: ', this.index);
    HUPRearrangeBlocks(this.blocks);
    this.saveProperties();
  },
  moveDown: function() {
    var block = this.getDownBlock();
    while(!block.titleNode || block.hidden) {
      block = this.getDownBlock(block);
    }
    var thisIndex = this.index;
    var newIndex = block.index;
    HUP.L.log(newIndex, thisIndex);
    this.blocks[this.blocks.indexOf(block)].index = thisIndex;
    this.index = newIndex;
    HUP.L.log('a: ', this.blocks[newIndex].index, 'b: ', this.index);
    HUPRearrangeBlocks(this.blocks);
    this.saveProperties();
  },
  getDownBlock: function(refBlock) {
    if(!refBlock) refBlock = this;
    var thisIndex = this.blocks.indexOf(refBlock);
    var newIndex = thisIndex + 1;
    while(!this.blocks[newIndex] || this.blocks[newIndex].side != this.side && this.blocks[newIndex+1]) {
      newIndex++;
    }
    return this.blocks[newIndex];
  },
  getUpBlock: function(refBlock) {
    if(!refBlock) refBlock = this;
    var thisIndex = this.blocks.indexOf(refBlock);
    var newIndex = thisIndex - 1;
    while(!this.blocks[newIndex] && this.blocks[newIndex].side != this.side && this.blocks[newIndex-1]) {
      newIndex--;
    }
    return this.blocks[newIndex];
  },
  moveRight: function() {
    if(this.side == 'right') return;
    this.side = 'right';
    this.index = -1;
    this.saveProperties();
    HUPRearrangeBlocks(this.blocks);
  },
  moveLeft: function() {
    if(this.side == 'left') return;
    this.side = 'left';
    this.index = -1;
    this.saveProperties();
    HUPRearrangeBlocks(this.blocks);
  },
  setIndex: function(index) {
    this.index = index;
    this.saveProperties();
  },
  addButtons: function() {
    if(!this.titleNode) return;
    var _this = this;
    this.delButton = HUP.El.Button(), this.hideButton = HUP.El.Button(), this.showButton = HUP.El.Button();
    this.delButton.setAttribute('title', HUP.Bundles.getString('deleteBlock'));
    this.hideButton.setAttribute('title', HUP.Bundles.getString('hideBlockContent'));
    this.showButton.setAttribute('title', HUP.Bundles.getString('showBlockContent'));
    HUP.El.AddClass(this.delButton, 'hupper-button delete-button block-button');
    HUP.El.AddClass(this.hideButton, 'hupper-button hide-button block-button');
    HUP.El.AddClass(this.showButton, 'hupper-button show-button block-button');
    HUP.El.Hide(this.showButton);
    HUP.Ev.addEvent(this.delButton, 'click', function() {
      _this.hide();
    });
    HUP.Ev.addEvent(this.hideButton, 'click', function() {
      _this.hideContent();
    });
    HUP.Ev.addEvent(this.showButton, 'click', function() {
      _this.showContent();
    });
    HUP.El.Insert(this.showButton, this.titleNode.firstChild);
    HUP.El.Insert(this.hideButton, this.titleNode.firstChild);
    HUP.El.Insert(this.delButton, this.titleNode.firstChild);
  },
  addMoveButtons: function() {
    if(!this.titleNode) return;
    var _this = this;
    this.upButton = HUP.El.Button(), this.downButton = HUP.El.Button(), this.leftButton = HUP.El.Button(), this.rightButton = HUP.El.Button();
    this.upButton.setAttribute('title', HUP.Bundles.getString('moveBoxUp'));
    this.downButton.setAttribute('title', HUP.Bundles.getString('moveBoxDown'));
    this.leftButton.setAttribute('title', HUP.Bundles.getString('moveBoxLeft'));
    this.rightButton.setAttribute('title', HUP.Bundles.getString('moveBoxRight'));
    HUP.El.AddClass(this.upButton, 'hupper-button up-button block-move-button');
    HUP.El.AddClass(this.downButton, 'hupper-button down-button block-move-button');
    HUP.El.AddClass(this.leftButton, 'hupper-button left-button block-move-button');
    HUP.El.AddClass(this.rightButton, 'hupper-button right-button block-move-button');
    HUP.Ev.addEvent(this.upButton, 'click', function() {
      _this.moveUp();
    });
    HUP.Ev.addEvent(this.downButton, 'click', function() {
      _this.moveDown();
    });
    HUP.Ev.addEvent(this.leftButton, 'click', function() {
      _this.moveLeft();
    });
    HUP.Ev.addEvent(this.rightButton, 'click', function() {
      _this.moveRight();
    });
    HUP.El.Insert(this.upButton, this.titleNode.firstChild);
    HUP.El.Insert(this.downButton, this.titleNode.firstChild);
    HUP.El.Insert(this.leftButton, this.titleNode.firstChild);
    HUP.El.Insert(this.rightButton, this.titleNode.firstChild);
  },
  saveProperties: function() {
    var props = {
      hidden: this.hidden,
      contentHidden: this.contentHidden,
      index: this.index,
      side: this.side
    };
    HUPBlocksProperties.setBlock(this.id, props);
  }
};
HUPBlocksProperties = {
  set: function(blocks) {
    HUP.hp.set.blocks(HUPJson.encode(blocks));
  },
  get: function() {
    return HUPJson.decode(HUP.hp.get.blocks());
  },
  setBlock: function(block, props) {
    blocks = this.get();
    blocks[block] = props;
    this.set(blocks);
  },
  getBlock: function(block) {
    blocks = this.get();
    return blocks[block];
  }
};
HUPBlockMenus = function(hupMenu) {
  this.blocks = new Object();
  this.hupMenu = hupMenu;
};
HUPBlockMenus.prototype = {
  addMenu: function() {
    if(this.menu) return;
    this.menuitem = this.hupMenu.addMenuItem({name: 'Restore hidden blocks', click: function() {
      HUP.El.ToggleClass(this.parentNode, 'hide-submenu');
      HUP.El.ToggleClass(this.parentNode, 'collapsed');
      HUP.El.ToggleClass(this.parentNode, 'expanded');
    }});
    HUP.El.RemoveClass(this.menuitem, 'leaf');
    HUP.El.AddClass(this.menuitem, 'hide-submenu collapsed');
    this.menu = this.hupMenu.addMenu(this.menuitem);
  },
  removeMenu: function() {
    if(this.menuitem || this.menu) {
      this.hupMenu.removeMenu(this.menu);
      this.hupMenu.removeMenuItem(this.menuitem);
      this.menuitem = null;
      this.menu = null;
    }
  },
  addBlockToMenu: function(block) {
    if(!this.blocks[block.id]) {
      if(!this.menu) this.addMenu();
      var _this = this;
      this.blocks[block.id] = this.hupMenu.addMenuItem({name: block.title, click: function() {block.show()}}, _this.menu);
    }
  },
  removeBlockFromMenu: function(block) {
    if(this.blocks[block.id]) {
      HUP.El.Remove(this.blocks[block.id]);
      delete this.blocks[block.id];
    }
    var n = 0;
    for(var i in this.blocks) {n++;}
    if(n == 0) this.removeMenu();
  }
};
HUPRearrangeBlocks = function(blocks) {
  blocks.sort(function(a, b) {
    if((a.side == b.side && a.index < b.index) || (a.side == 'left' && b.side == 'right') || !a.titleNode) return -1;
    if((a.side == b.side && a.index > b.index) || (a.side == 'right' && b.side == 'left')) return 1;
  });
  var sides = {left:1, right:1};
  blocks.forEach(function(block, index) {
    if(blocks[index].side == 'left') {
      blocks[index].setIndex(sides.left);
      sides.left++;
    }  else {
      blocks[index].setIndex(sides.right);
      sides.right++;
    }
  });
  var left = HUP.El.GetId('sidebar-left');
  var right = HUP.El.GetId('sidebar-right');
  HUP.El.RemoveAll(left);
  HUP.El.RemoveAll(right);
  blocks.forEach(function(block, index){
    HUP.L.log(block.side, block.index);
    (block.side == 'left') ? HUP.El.Add(block.block, left) : HUP.El.Add(block.block, right);
    block.blocks = blocks;
  });
};
