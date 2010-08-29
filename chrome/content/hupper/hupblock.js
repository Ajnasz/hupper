/**
 * @class Block
 * @namespace Hupper
 * @constructor
 * @description Parses a block and adds buttons, hides them
 * @param {Object} cfg Configuration object, possible properties are:
 *  id: {String}, the id of the block,
 *  block: {HTMLElement} the block element
 *  blockMenus: {Hupper.BlockMenus} a blockmenus instance
 *  blocks: {Hupper.Blocks} a Blocks instance
 *  hidden: {Boolean} set to true if the element has to be hidden by default
 *  contentHidden: {Boolean} set to true if the element's content has to be hidden by default
 *  side: {String} left or right, use to set the side of the block
 */
Hupper.Block = function(cfg) {
  // if(!block) return;
  if(typeof cfg != 'object') {
    throw new Error('Config not defined');
  }
  if(cfg.block && cfg.block.nodeType == 1 && typeof cfg.id == 'string') {
    throw new Error('both block and id defined in config, which one should I use?');
  }
  if((!cfg.block || cfg.block.nodeType != 1) && typeof cfg.id != 'string') {
    throw new Error('both block and id are invalid');
  }
  var blockElement, blockID;
  if(cfg.block && cfg.block.nodeType == 1) {
    blockElement = cfg.block;
    blockID = blockElement.getAttribute('id');
  } else {
    blockID = cfg.id;
    blockElement = HUP.El.GetId(blockID);
  }
  if(blockElement) {
    if(blockID != blockElement.getAttribute('id')) {
      throw new Error('blockID is not the same as the block elements id!');
    }
  }
  this.block = blockElement;
  this.blocks = cfg.blocks;
  this.id = blockID;
  this.blockMenus = cfg.blockMenus;
  var contents = HUP.El.GetByClass(this.block, 'content', 'div');
  this.contentNode = contents.length ? contents[0] : null;
  if(this.block) {
    this.titleNode = HUP.El.GetFirstTag('h2', this.block);
    if(this.titleNode) {
      this.title = this.titleNode.innerHTML;
    }
  }
  this.makeTitle();
  this.addMoveButtons();
  if(this.id != 'block-hupper-0') { // exception for hup block
    this.addButtons();
  }
  this.setSide(cfg.side);
  cfg.hidden ? this.hide() : this.show();
  cfg.contentHidden ? this.hideContent() : this.showContent();
  // Hupper.Blocks.save();
};
Hupper.Block.prototype = {
  hidden: false,
  contentHidden: false,
  blocks: new Array(),
  hide: function() {
    if(this.hidden) return;
    HUP.L.log('call hide');
    HUP.El.Hide(this.block);
    this.hidden = true;
    this.blockMenus.addBlockToMenu(this);
    this.blocks.save();
  },
  show: function() {
    if(!this.hidden) return;
    HUP.L.log('call show');
    HUP.El.Show(this.block);
    this.hidden = false;
    this.blockMenus.removeBlockFromMenu(this);
    this.blocks.save();
  },
  hideContent: function(force) {
    if(!this.contentNode || (this.contentHidden && !force)) return;
    // HUP.El.Hide(this.contentNode);
    HUP.El.AddClass(this.block, 'content-hidden');
    HUP.El.Hide(this.hideButton);
    HUP.El.Show(this.showButton);
    this.contentHidden = true;
    this.blocks.save();
  },
  showContent: function(force) {
    if(!this.contentNode || (!this.contentHidden && !force)) return;
    // HUP.El.Show(this.contentNode);
    HUP.El.RemoveClass(this.block, 'content-hidden');
    HUP.El.Show(this.hideButton);
    HUP.El.Hide(this.showButton);
    this.contentHidden = false;
    this.blocks.save();
  },
  makeTitle: function() {
    if(!this.block) return;
    var boxes = {
        'block-aggregator-feed-13': 'http://distrowatch.com',
        'block-aggregator-feed-19': 'http://www.freebsd.org',
        'block-aggregator-feed-2': 'http://www.kernel.org',
        'block-aggregator-feed-3': 'http://wiki.hup.hu',
        'block-aggregator-feed-4': 'http://lwn.net',
        'block-aggregator-feed-40': 'http://www.flickr.com/photos/h_u_p/',
        'block-aggregator-feed-41': 'http://blogs.sun.com',
        'block-aggregator-feed-44': 'http://hwsw.hu',
        'block-aggregator-feed-46': 'http://www.linuxdevices.com',
        'block-aggregator-feed-47': 'http://undeadly.org',
        'block-aggregator-feed-50': '/allasajanlatok',
        'block-aggregator-feed-51': 'http://blogs.sun.com/sunhu/',
        'block-block-15': 'irc://irc.freenode.net/hup.hu',
        'block-block-12': '/tamogatok',
        'block-block-7': 'http://www.google.com/custom?ie=UTF-8&oe=UTF-8&domains=hup.hu&sa=Keres%C3%A9s&cof=\%22S%3Ahttp%3A%2F%2Fhup.hu%3BVLC%3A7a7a76%3BAH%3Acenter%3BLH%3A74%3BLC%3A7a7a76%3BGFNT%3A7a7a76%3BL%3Ahttp%3A%2F%2Fhup.hu%2Fimages%2Fhup_search.png%3BLW%3A484%3BT%3Ablack%3BAWFID%3Ab92ddab1875cce47%3B\%22&sitesearch=hup.hu',
        'block-block-6': 'http://www.mozilla.com/firefox?from=sfx&uid=225821&t=308',
        'block-blog-0': '/blog',
        'block-comment-0': '/tracker',
        'block-poll-0': '/poll',
        'block-poll-40': '/poll',
        'block-search-0': '/search',
        'block-tagadelic-1': '/temak'

    };
    if(boxes[this.id] && this.title && this.titleNode) {
      HUP.L.log('set title: ' + this.id + ' ' + boxes[this.id] + ' ' + this.titleNode.parentNode.id);
      HUP.El.Update(HUP.El.CreateLink(this.title, boxes[this.id]), this.titleNode);
    }
  },
  moveUp: function() {
    this.blocks.blockToUp(this.id);
    this.blocks.UI.rearrangeBlocks(this.blocks);
    this.blocks.save();
  },
  moveDown: function() {
    this.blocks.blockToDown(this.id);
    this.blocks.UI.rearrangeBlocks(this.blocks);
    this.blocks.save();
  },
  getDownBlock: function(refBlock) {
    if(!refBlock) refBlock = this;
    var thisIndex = this.blocks.indexOf(refBlock);
    var newIndex = thisIndex + 1;
    while(this.blocks[newIndex+1] && this.blocks[newIndex].side != this.side) {
      newIndex++;
    }
    return this.blocks[newIndex];
  },
  getUpBlock: function(refBlock) {
    if(!refBlock) refBlock = this;
    var thisIndex = this.blocks.indexOf(refBlock);
    var newIndex = thisIndex - 1;
    while(this.blocks[newIndex-1] && this.blocks[newIndex].side != this.side) {
      newIndex--;
    }
    return this.blocks[newIndex];
  },
  moveRight: function() {
    this.blocks.blockToRight(this.id);
    this.blocks.UI.rearrangeBlocks(this.blocks);
    this.blocks.save();
  },
  moveLeft: function() {
    this.blocks.blockToLeft(this.id);
    this.blocks.UI.rearrangeBlocks(this.blocks);
    this.blocks.save();
  },
  addButtons: function() {
    if(!this.titleNode) {return;}
    var block = this, titleNode = this.titleNode,
        delButton = HUP.El.Button(HUP.Bundles.getString('deleteBlock'), 'hupper-button block-button delete-button'),
        hideButton = HUP.El.Button(HUP.Bundles.getString('hideBlockContent'), 'hupper-button block-button hide-button'),
        showButton = HUP.El.Button(HUP.Bundles.getString('showBlockContent'), 'hupper-button block-button show-button');
    HUP.Ev.addEvent(delButton, 'click', function() {
      block.hide();
    });
    HUP.Ev.addEvent(hideButton, 'click', function() {
      block.hideContent();
    });
    HUP.Ev.addEvent(showButton, 'click', function() {
      block.showContent();
    });
    // HUP.L.log('add buttons = ' + this.id, delButton, hideButton, showButton);
    HUP.El.Hide(showButton);
    HUP.El.Insert(showButton, titleNode.firstChild);
    HUP.El.Insert(hideButton, titleNode.firstChild);
    HUP.El.Insert(delButton, titleNode.firstChild);
    this.delButton = delButton;
    this.hideButton = hideButton;
    this.showButton = showButton;
  },
  addMoveButtons: function() {
    if(!this.titleNode) return;
    this.upButton = HUP.El.Button(HUP.Bundles.getString('moveBoxUp'), 'hupper-button up-button block-move-button');
    this.downButton = HUP.El.Button(HUP.Bundles.getString('moveBoxDown'), 'hupper-button down-button block-move-button');
    this.leftButton = HUP.El.Button(HUP.Bundles.getString('moveBoxLeft'), 'hupper-button left-button block-move-button');
    this.rightButton = HUP.El.Button(HUP.Bundles.getString('moveBoxRight'), 'hupper-button right-button block-move-button');
    var _this = this;
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
  setSide: function(side) {
    HUP.L.log(this.id, side);
    if(this.block) {
      this.side = side ? side : /sidebar-right/.test(this.block.parentNode.getAttribute('id')) ? 'right' : 'left';
    } else if(side) {
      this.side = side;
    } else {
      throw new Error('Can not set the side of block ' + this.id);
    }
  },
  updateUI: function() {
    if(this.hidden) {
      this.hide(true);
    } else {
      this.show(true);
    }
    if(this.contentHidden) {
      this.hideContent(true);
    } else {
      this.showContent(true);
    }
  },
  toString: function() {
    return 'Hupper.Block id: ' + this.id + ', side: ' + (this.left ? 'left' : 'right') + ', hidden: ' + (this.hidden ? 'true' : 'false') + ', contentHidden: ' + (this.contentHidden ? 'true' : 'false');
  },
};

/**
 * @class BlockMenus
 * @namespace Hupper
 * @constructor
 * @param {Hupper.Menu} hupMenu
 */
Hupper.BlockMenus = function(hupMenu) {
  this.blocks = new Object();
  this.hupMenu = hupMenu;
};
Hupper.BlockMenus.prototype = {
  addMenu: function() {
    if(this.menu) return;
    this.menuitem = this.hupMenu.addMenuItem({name:  HUP.Bundles.getString('restoreBlocks'), click: function() {
      HUP.El.ToggleClass(this.parentNode, 'hide-submenu');
      HUP.El.ToggleClass(this.parentNode, 'collapsed');
      HUP.El.ToggleClass(this.parentNode, 'expanded');
    }}, null, true);
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
    if(!this.blocks[block.id] && block.block) {
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
