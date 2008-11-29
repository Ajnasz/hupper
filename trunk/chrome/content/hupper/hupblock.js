var HUPBlock = function(block) {
  if(!block || block.id == 'block-hupper-0') return;
  this.block = block;
  this.titleNode = HUP.El.GetFirstTag('h2', this.block);
  var contents = HUP.El.GetByClass(this.block, 'content', 'div');
  this.contentNode = (contents.length) ? contents[0] : null;
  if(this.titleNode) {
    this.title = this.titleNode.innerHTML;
  }
  this.id = this.block.getAttribute('id');
  this.side = /sidebar-right/.test(this.block.parentNode.getAttribute('id')) ? 'right' : 'left';
  this.makeTitle();
  this.addButtons();
  var properties = HUPBlocksProperties.getBlock(this.id);
  if(properties) {
    properties.hidden ? this.hide() : this.show();
    properties.contentHidden ? this.hideContent() : this.showContent();
  }
};
HUPBlock.prototype = {
  hidden: false,
  contentHidden: false,
  hide: function() {
    HUP.El.Hide(this.block);
    this.hidden = true;
    HUPBlockMenus.addBlockToMenu(this);
    this.saveProperties();
  },
  show: function() {
    HUP.El.Show(this.block);
    this.hidden = false;
    HUPBlockMenus.removeBlockFromMenu(this);
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
  addButtons: function() {
    if(!this.titleNode) return;
    var _this = this;
    this.delButton = HUP.El.Button(), this.hideButton = HUP.El.Button(), this.showButton = HUP.El.Button();
    HUP.El.AddClass(this.delButton, 'delete-button block-button');
    HUP.El.AddClass(this.hideButton, 'hide-button block-button');
    HUP.El.AddClass(this.showButton, 'show-button block-button');
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
  saveProperties: function() {
    var props = {
      hidden: this.hidden,
      contentHidden: this.contentHidden
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
HUPBlockMenus = {
  blocks: {},
  addMenu: function() {
    if(this.menu) return;
    this.menuitem = HUP.menu.addMenuItem({name: 'Restore hidden blocks', click: function() {HUP.El.ToggleClass(this.parentNode, 'hide-submenu');}});
    HUP.El.AddClass(this.menuitem, 'hide-submenu');
    this.menu = HUP.menu.addMenu(this.menuitem);
  },
  removeMenu: function() {
    if(this.menuitem) {
      HUP.menu.removeMenu(this.menu);
      HUP.menu.removeMenuItem(this.menuitem);
      this.menuitem = null;
      this.menu = null;
    }
  },
  addBlockToMenu: function(block) {
    HUP.L.log(block.id, this.blocks[block.id]);
    if(!this.blocks[block.id]) {
      if(!this.menu) this.addMenu();
      var _this = this;
      this.blocks[block.id] = HUP.menu.addMenuItem({name: block.title, click: function() {block.show()}}, _this.menu);
    }
  },
  removeBlockFromMenu: function(block) {
    HUP.L.log(block.id, this.blocks[block.id]);
    if(this.blocks[block.id]) {
      HUP.El.Remove(this.blocks[block.id]);
      delete this.blocks[block.id];
    }
    var n = 0;
    for(var i in this.blocks) {n++;}
    if(n == 0) this.removeMenu();
  }
}
