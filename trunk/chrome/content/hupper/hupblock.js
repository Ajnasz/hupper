var HUPBlock = function(block) {
  if(!block) return;
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
    HUP.El.AddClass(this.block, 'hidden');
    this.hidden = true;
    this.saveProperties();
  },
  show: function() {
    HUP.El.RemoveClass(this.block, 'hidden');
    this.hidden = false;
    this.saveProperties();
  },
  hideContent: function() {
    if(!this.contentNode) return;
    HUP.El.AddClass(this.contentNode, 'hidden');
    HUP.El.RemoveClass(this.showButton, 'hidden');
    HUP.El.AddClass(this.hideButton, 'hidden');
    this.contentHidden = true;
    this.saveProperties();
  },
  showContent: function() {
    if(!this.contentNode) return;
    HUP.El.RemoveClass(this.contentNode, 'hidden');
    HUP.El.RemoveClass(this.hideButton, 'hidden');
    HUP.El.AddClass(this.showButton, 'hidden');
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
    HUP.El.AddClass(this.showButton, 'show-button block-button hidden');
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
