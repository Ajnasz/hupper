/*jslint indent: 2*/
/**
 * @class Block
 * @constructor
 * @description Parses a block and adds buttons, hides them
 * @param {Object} cfg Configuration object, possible properties are:
 *  id: {String}, the id of the block,
 *  block: {HTMLElement} the block element
 *  blockMenus: {BlockMenus} a blockmenus instance
 *  blocks: {Blocks} a Blocks instance
 *  hidden: {Boolean} set to true if the element has to be hidden by default
 *  contentHidden: {Boolean} set to true if the element's content has to be hidden by default
 *  side: {String} left or right, use to set the side of the block
 */
var Block = function (doc, cfg) {
  // if (!block) return;
  if (typeof cfg !== 'object') {
    throw new Error('Config not defined');
  }
  if (cfg.block && cfg.block.nodeType === 1 && typeof cfg.id === 'string') {
    throw new Error('both block and id defined in config, which one should I use?');
  }
  if ((!cfg.block || cfg.block.nodeType !== 1) && typeof cfg.id !== 'string') {
    throw new Error('both block and id are invalid');
  }
  var blockElement, blockID, scope, contents;

  this.doc = doc;

  scope = {};
  Components.utils.import('resource://huppermodules/Elementer.jsm', scope);
  this.elementer = new scope.Elementer(this.doc);

  if (cfg.block && cfg.block.nodeType === 1) {
    blockElement = cfg.block;
    blockID = blockElement.getAttribute('id');
  } else {
    blockID = cfg.id;
    blockElement = this.elementer.GetId(blockID);
  }
  if (blockElement) {
    if (blockID !== blockElement.getAttribute('id')) {
      throw new Error('blockID is not the same as the block elements id!');
    }
  }
  Components.utils.import('resource://huppermodules/bundles.jsm', scope);
  this.bundles = scope.hupperBundles;
  this.block = blockElement;
  this.blocks = cfg.blocks;
  this.id = blockID;
  this.blockMenus = cfg.blockMenus;
  contents = this.elementer.GetByClass(this.block, 'content', 'div');
  this.contentNode = contents.length ? contents[0] : null;
  if (this.block) {
    this.titleNode = this.elementer.GetFirstTag('h2', this.block);
    if (this.titleNode) {
      this.blockTitle = this.titleNode.innerHTML;
    }
  }
  this.makeTitle();
  this.addMoveButtons();
  if (this.id !== 'block-hupper-0') { // exception for hup block
    this.addButtons();
  }
  this.setSide(cfg.side);
  if (cfg.hidden) {
    this.hide();
  } else {
    this.show();
  }
  if (cfg.contentHidden) {
    this.hideContent();
  } else {
    this.showContent();
  }
  // Blocks.save();
};
Block.prototype = {
  hidden: false,
  contentHidden: false,
  blocks: [],
  hide: function () {
    if (this.hidden) {
      return;
    }
    this.elementer.Hide(this.block);
    this.hidden = true;
    this.blockMenus.addBlockToMenu(this);
    this.blocks.save();
  },
  show: function () {
    if (!this.hidden) {
      return;
    }
    this.elementer.Show(this.block);
    this.hidden = false;
    this.blockMenus.removeBlockFromMenu(this);
    this.blocks.save();
  },
  hideContent: function (force) {
    if (!this.contentNode || (this.contentHidden && !force)) {
      return;
    }
    // this.elementer.Hide(this.contentNode);
    this.elementer.AddClass(this.block, 'content-hidden');
    this.elementer.Hide(this.hideButton);
    this.elementer.Show(this.showButton);
    this.contentHidden = true;
    this.blocks.save();
  },
  showContent: function (force) {
    if (!this.contentNode || (!this.contentHidden && !force)) {
      return;
    }
    // this.elementer.Show(this.contentNode);
    this.elementer.RemoveClass(this.block, 'content-hidden');
    this.elementer.Show(this.hideButton);
    this.elementer.Hide(this.showButton);
    this.contentHidden = false;
    this.blocks.save();
  },
  makeTitle: function () {
    if (!this.block) {
      return;
    }
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
      'block-block-7': 'http://www.google.com/custom?ie=UTF-8&' +
        'oe=UTF-8&domains=hup.hu&sa=Keres%C3%A9s&' +
        'cof=%22S%3Ahttp%3A%2F%2Fhup.hu%3BVLC%3A7a7a76%3BAH%3A' +
        'center%3BLH%3A74%3BLC%3A7a7a76%3BGFNT%3A7a7a76%3BL%3A' +
        'http%3A%2F%2Fhup.hu%2Fimages%2Fhup_search.png%3BLW%3A484%3' +
        'BT%3Ablack%3BAWFID%3Ab92ddab1875cce47%3B%22&sitesearch=hup.hu',
      'block-block-6': 'http://www.mozilla.com/firefox?from=sfx&uid=225821&t=308',
      'block-blog-0': '/blog',
      'block-comment-0': '/tracker',
      'block-poll-0': '/poll',
      'block-poll-40': '/poll',
      'block-search-0': '/search',
      'block-tagadelic-1': '/temak'
    };
    if (boxes[this.id] && this.blockTitle && this.titleNode) {
      this.elementer.Update(
        this.elementer.CreateLink(this.blockTitle, boxes[this.id]), this.titleNode);
    }
  },
  moveUp: function () {
    this.blocks.blockToUp(this.id);
    this.blocks.UI.rearrangeBlocks(this.blocks);
    this.blocks.save();
  },
  moveDown: function () {
    this.blocks.blockToDown(this.id);
    this.blocks.UI.rearrangeBlocks(this.blocks);
    this.blocks.save();
  },
  getDownBlock: function (refBlock) {
    if (!refBlock) {
      refBlock = this;
    }
    var thisIndex = this.blocks.indexOf(refBlock),
        newIndex = thisIndex + 1;
    while (this.blocks[newIndex + 1] && this.blocks[newIndex].side !== this.side) {
      newIndex += 1;
    }
    return this.blocks[newIndex];
  },
  getUpBlock: function (refBlock) {
    if (!refBlock) {
      refBlock = this;
    }
    var thisIndex = this.blocks.indexOf(refBlock),
        newIndex = thisIndex - 1;
    while (this.blocks[newIndex - 1] && this.blocks[newIndex].side !== this.side) {
      newIndex -= 1;
    }
    return this.blocks[newIndex];
  },
  moveRight: function () {
    this.blocks.blockToRight(this.id);
    this.blocks.UI.rearrangeBlocks(this.blocks);
    this.blocks.save();
  },
  moveLeft: function () {
    this.blocks.blockToLeft(this.id);
    this.blocks.UI.rearrangeBlocks(this.blocks);
    this.blocks.save();
  },
  addButtons: function () {
    if (!this.titleNode) {
      return;
    }
    var block = this, titleNode = this.titleNode,
        delButton = this.elementer.Btn(
          this.bundles.getString('deleteBlock'), 'hupper-button block-button delete-button'),
        hideButton = this.elementer.Btn(
          this.bundles.getString('hideBlockContent'), 'hupper-button block-button hide-button'),
        showButton = this.elementer.Btn(
          this.bundles.getString('showBlockContent'), 'hupper-button block-button show-button');
    this.elementer.subscribe(delButton, 'click', function () {
      block.hide();
    });
    this.elementer.subscribe(hideButton, 'click', function () {
      block.hideContent();
    });
    this.elementer.subscribe(showButton, 'click', function () {
      block.showContent();
    });
    this.elementer.Hide(showButton);
    this.elementer.Insert(showButton, titleNode.firstChild);
    this.elementer.Insert(hideButton, titleNode.firstChild);
    this.elementer.Insert(delButton, titleNode.firstChild);
    this.delButton = delButton;
    this.hideButton = hideButton;
    this.showButton = showButton;
  },
  addMoveButtons: function () {
    if (!this.titleNode) {
      return;
    }
    this.upButton = this.elementer.Btn(
      this.bundles.getString('moveBoxUp'), 'hupper-button up-button block-move-button');
    this.downButton = this.elementer.Btn(
      this.bundles.getString('moveBoxDown'), 'hupper-button down-button block-move-button');
    this.leftButton = this.elementer.Btn(
      this.bundles.getString('moveBoxLeft'), 'hupper-button left-button block-move-button');
    this.rightButton = this.elementer.Btn(
      this.bundles.getString('moveBoxRight'), 'hupper-button right-button block-move-button');
    var _this = this;
    this.elementer.subscribe(this.upButton, 'click', function () {
      _this.moveUp();
    });
    this.elementer.subscribe(this.downButton, 'click', function () {
      _this.moveDown();
    });
    this.elementer.subscribe(this.leftButton, 'click', function () {
      _this.moveLeft();
    }, false);
    this.elementer.subscribe(this.rightButton, 'click', function () {
      _this.moveRight();
    }, false);
    this.elementer.Insert(this.upButton, this.titleNode.firstChild);
    this.elementer.Insert(this.downButton, this.titleNode.firstChild);
    this.elementer.Insert(this.leftButton, this.titleNode.firstChild);
    this.elementer.Insert(this.rightButton, this.titleNode.firstChild);
  },
  setSide: function (side) {
    if (this.block) {
      this.side = side ?
          side :
          /sidebar-right/.test(this.block.parentNode.getAttribute('id')) ? 'right' : 'left';
    } else if (side) {
      this.side = side;
    } else {
      throw new Error('Can not set the side of block ' + this.id);
    }
  },
  updateUI: function () {
    if (this.hidden) {
      this.hide(true);
    } else {
      this.show(true);
    }
    if (this.contentHidden) {
      this.hideContent(true);
    } else {
      this.showContent(true);
    }
  },
  toString: function () {
    return 'Hupper.Block id: ' + this.id + ', side: ' + (this.left ? 'left' : 'right') +
        ', hidden: ' + (this.hidden ? 'true' : 'false') + ', contentHidden: ' +
        (this.contentHidden ? 'true' : 'false');
  },
  destroy: function () {
    this.elementer.destroy();
    this.elementer = null;
    this.bundles = null;
    this.block = null;
    this.blocks = null;
    this.id = null;
    this.blockMenus = null;
    this.contentNode = null;
  }
};

/**
 * @class BlockMenus
 * @namespace Hupper
 * @constructor
 * @param {Hupper.Menu} hupMenu
 */
var BlockMenus = function (doc, hupMenu) {
  this.blocks = {};
  this.hupMenu = hupMenu;
  this.doc = doc;
  var scope = {};
  Components.utils.import('resource://huppermodules/Elementer.jsm', scope);
  this.elementer = new scope.Elementer(this.doc);
  Components.utils.import('resource://huppermodules/bundles.jsm', scope);
  this.bundles = scope.hupperBundles;
};
BlockMenus.prototype = {
  addMenu: function () {
    if (this.menu) {
      return;
    }
    this.menuitem = this.hupMenu.addMenuItem({
      name: this.bundles.getString('restoreBlocks'),
      click: function () {
        this.elementer.ToggleClass(this.parentNode, 'hide-submenu');
        this.elementer.ToggleClass(this.parentNode, 'collapsed');
        this.elementer.ToggleClass(this.parentNode, 'expanded');
      }
    }, null, true);
    this.elementer.RemoveClass(this.menuitem, 'leaf');
    this.elementer.AddClass(this.menuitem, 'hide-submenu collapsed');
    this.menu = this.hupMenu.addMenu(this.menuitem);
  },
  removeMenu: function () {
    if (this.menuitem || this.menu) {
      this.hupMenu.removeMenu(this.menu);
      this.hupMenu.removeMenuItem(this.menuitem);
      this.menuitem = null;
      this.menu = null;
    }
  },
  addBlockToMenu: function (block) {
    if (!this.blocks[block.id] && block.block) {
      if (!this.menu) {
        this.addMenu();
      }
      var _this = this;
      this.blocks[block.id] = this.hupMenu.addMenuItem({
        name: block.blockTitle,
        click: function () {
          block.show();
        }
      }, _this.menu);
    }
  },
  removeBlockFromMenu: function (block) {
    if (this.blocks[block.id]) {
      this.elementer.Remove(this.blocks[block.id]);
      delete this.blocks[block.id];
    }
    var n = 0, i;
    for (i in this.blocks) {
      if (i) {
        n += 1;
      }
    }
    if (n === 0) {
      this.removeMenu();
    }
  },
  destroy: function () {
    this.elementer.destroy();
    this.elementer = null;
  }
};

var EXPORTED_SYMBOLS = ['Block', 'BlockMenus'];
