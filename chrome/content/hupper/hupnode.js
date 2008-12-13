var HUPNode = function(node) {
  var header = HUP.El.GetFirstTag('h2', node);
  var submitData = node.childNodes[3];
  var cont = node.childNodes[5];
  var footer = HUP.El.HasClass(node.childNodes[7], 'links') ? node.childNodes[7] : false;
  var sender = HUP.El.GetByAttrib(submitData, 'a', 'title', 'Felhasználói profil megtekintése.');
  var taxonomy = HUP.El.GetByAttrib(submitData, 'a', 'rel', 'tag');
  this.element = node;
  this.id = parseInt(node.id.replace('node-', ''));
  this.header = header;
  this.path = Stringer.trim(HUP.El.GetFirstTag('a', this.header).getAttribute('href'));
  this.submitData = submitData;
  this.cont = cont;
  this.footer = footer;
  this.newc = HUP.El.GetByClass(footer, 'comment_new_comments', 'li').length > 0 ? true : false;
  if(taxonomy.length > 0) {
    this.taxonomy = taxonomy[0].innerHTML;
    this.taxonomyNode = taxonomy[0];
  } else {
    this.taxonomy = null;
    this.taxonomyNode = null;
  }
  this.sender = sender.length ? {
    name: sender[0].innerHTML,
    id: parseInt(sender[0].href.replace('http://hup.hu/user/', '')),
    url: sender[0].href
  } : false;
  this.checkTaxonomy();
  this.builder = new NodeHeaderBuilder();
  this.addNnewSpan();
  if(this.taxonomy) this.addTaxonomyCloser();
};
HUPNode.prototype = {
  hidden: false,
  next: false,
  previous: false,
  hide: function() {
    HUP.El.AddClass(this.element, 'hidden');
    this.hidden = true;
    if(this.nodeMenu) {
      this.nodeMenu.addNodeToMenu(this);
    }
  },
  show: function() {
    HUP.El.RemoveClass(this.element, 'hidden');
    this.hidden = false;
    if(this.nodeMenu) {
      this.nodeMenu.removeNodeFromMenu(this);
    }
  },
  checkTaxonomy: function() {
    var hideTaxonomies = Stringer.trim(HUP.hp.get.hidetaxonomy());
    (hideTaxonomies.length && hideTaxonomies.indexOf(this.taxonomy) != -1) ? this.hide() : this.show();
  },
  addNnewSpan: function() {
    this.sp = HUP.El.Span();
    HUP.El.AddClass(this.sp, 'nnew');
    HUP.El.Insert(this.sp, this.header.firstChild);
  },
  /**
   * @param {Integer} i node index
   * @param {Integer} nl number of the nodes
   */
  addNewNodeLinks: function() {
    this.addNameLink();
    this.addMarkAsRead();
    this.addNewText();
    this.addPrev();
    this.addNext();
  },
  addMarkAsRead: function() {
    var mread = this.builder.buildMarker(this.path, this.id);
    HUP.markReadNodes.push(mread);
    HUP.El.Add(mread, this.sp);
  },
  addNewText: function() {
    HUP.El.Add(this.builder.buildNewText(), this.sp);
  },
  addNameLink: function() {
    // HUP.El.Insert(this.builder.buildNameLink('node-' + this.id), this.header);
    HUP.El.Insert(this.builder.buildNameLink(this.id, 'node'), this.header);
  },
  addNext: function() {
    this.next === false ? HUP.El.Add(this.builder.buildLastLink(), this.sp) : HUP.El.Add(this.builder.buildNextLink('node-' + this.next), this.sp);
  },
  addPrev: function() {
    this.previous === false ? HUP.El.Add(this.builder.buildFirstLink(), this.sp) : HUP.El.Add(this.builder.buildPrevLink('node-' + this.previous), this.sp);
  },
  addTaxonomyCloser: function() {
    this.taxonomyButton = HUP.El.Button();
    HUP.El.AddClass(this.taxonomyButton, 'hupper-button taxonomy-button delete-button');
    this.taxonomyButton.setAttribute('title', HUP.Bundles.getFormattedString('hideTaxonomy', [this.taxonomy]));
    var _this = this;
    HUP.Ev.addEvent(this.taxonomyButton, 'click', function(){
      _this.addToHide();
      HUPHideTaxonomyNodes(_this.nodes);
    });
    HUP.El.Add(this.taxonomyButton, this.taxonomyNode.parentNode);
  },
  addToHide: function() {
    var taxonomies = HUP.hp.get.hidetaxonomy();
    var rex = new RegExp('\\b' + this.taxonomy + '\\b');
    if(!rex.test(taxonomies)) {
      taxonomies = (Stringer.empty(taxonomies)) ? this.taxonomy : taxonomies += ',' + this.taxonomy;
    }
    HUP.hp.set.hidetaxonomy(taxonomies);
  },
  addNodes: function(nodes, nodeMenu) {
    this.nodes = nodes;
    this.nodeMenu = nodeMenu;
    if(this.hidden) {
      nodeMenu.addNodeToMenu(this);
    }
  }
};
HUPNodeMenus = function(hupMenu) {
  this.nodes = new Object();
  this.hupMenu = hupMenu;
};
HUPNodeMenus.prototype = {
  addMenu: function() {
    if(this.menu) return;
    this.menuitem = this.hupMenu.addMenuItem({name: HUP.Bundles.getString('restoreNodes'), click: function() {
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
  addNodeToMenu: function(node) {
    if(!this.nodes[node.taxonomy]) {
      if(!this.menu) this.addMenu();
      var _this = this;
      this.nodes[node.taxonomy] = this.hupMenu.addMenuItem({name: node.taxonomy, click: function() { node.show(); }}, _this.menu);
    }
  },
  removeNodeFromMenu: function(node) {
    if(this.nodes[node.taxonomy]) {
      HUP.El.Remove(this.nodes[node.taxonomy]);
      delete this.nodes[node.taxonomy];
      var taxonomies = HUP.hp.get.hidetaxonomy();
      var rex = new RegExp('\\b,?' + node.taxonomy + '\\b');
      taxonomies = taxonomies.replace(rex, '');
      HUP.hp.set.hidetaxonomy(taxonomies);
      HUPHideTaxonomyNodes(node.nodes);
    }
    var n = 0;
    for(var i in this.nodes) {n++;}
    if(n == 0) this.removeMenu();
  }
};
HUPHideTaxonomyNodes = function(nodes) {
  nodes.forEach(function(node) {
    node.checkTaxonomy();
  });
};
