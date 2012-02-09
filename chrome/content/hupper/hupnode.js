/**
 * @class Node
 * @description class to parse a node and make changes on it
 * @param {Element} node an article node
 */
Hupper.Node = function (node) {
  var scope = {};
  var header = Hupper.HUP.El.GetFirstTag('h2', node),
    submitData = node.childNodes[3],
    cont = node.childNodes[5],
    footer = Hupper.HUP.El.HasClass(node.childNodes[7], 'links') ? node.childNodes[7] : false,
    sender = Hupper.HUP.El.GetByAttrib(submitData, 'a', 'title', 'Felhasználói profil megtekintése.'),
    taxonomy = Hupper.HUP.El.GetByAttrib(submitData, 'a', 'rel', 'tag');
  this.element = node;
  this.id = parseInt(node.id.replace('node-', ''), 10);
  this.header = header;
  Components.utils.import('resource://huppermodules/hupstringer.jsm', scope);
  this.path = scope.HupStringer.trim(Hupper.HUP.El.GetFirstTag('a', this.header).getAttribute('href'));
  this.submitData = submitData;
  this.cont = cont;
  this.footer = footer;
  this.newc = Hupper.HUP.El.GetByClass(footer, 'comment_new_comments', 'li').length > 0 ? true : false;
  if (taxonomy.length > 0) {
    this.taxonomy = taxonomy[0].innerHTML;
    this.taxonomyNode = taxonomy[0];
  } else {
    this.taxonomy = null;
    this.taxonomyNode = null;
  }
  this.sender = sender.length ? {
    name: sender[0].innerHTML,
    id: parseInt(sender[0].href.replace('http://hup.hu/user/', ''), 10),
    url: sender[0].href
  } : false;
  this.checkTaxonomy();
  this.builder = new Hupper.NodeHeaderBuilder();
  this.addNnewSpan();
  if (this.taxonomy) {
    this.addTaxonomyCloser();
  }
};
Hupper.Node.prototype = {
  hidden: false,
  next: false,
  previous: false,
  hide: function () {
    Hupper.HUP.El.AddClass(this.element, 'hup-hidden');
    this.hidden = true;
    if (this.nodeMenu) {
      this.nodeMenu.addNodeToMenu(this);
    }
  },
  show: function () {
    Hupper.HUP.El.RemoveClass(this.element, 'hup-hidden');
    this.hidden = false;
    if (this.nodeMenu) {
      this.nodeMenu.removeNodeFromMenu(this);
    }
  },
  checkTaxonomy: function () {
    var _this = this;
    var scope = {};
    Components.utils.import('resource://huppermodules/hupstringer.jsm', scope);
    Hupper.HUP.hp.get.hidetaxonomy(function(response) {
      var hideTaxonomies = scope.HupStringer.trim(response.pref.value);
      if (hideTaxonomies.length && hideTaxonomies.indexOf(_this.taxonomy) !== -1) {
        _this.hide();
      } else {
        _this.show();
      }
    });
  },
  addNnewSpan: function () {
    this.sp = Hupper.HUP.El.Span();
    Hupper.HUP.El.AddClass(this.sp, 'nnew');
    Hupper.HUP.El.Insert(this.sp, this.header.firstChild);
  },
  /**
   * @param {Integer} i node index
   * @param {Integer} nl number of the nodes
   */
  addNewNodeLinks: function () {
    this.addNameLink();
    this.addMarkAsRead();
    this.addNewText();
    this.addPrev();
    this.addNext();
  },
  addMarkAsRead: function () {
    var mread = this.builder.buildMarker(this.path, this.id);
    Hupper.HUP.markReadNodes.push(mread);
    Hupper.HUP.El.Add(mread, this.sp);
  },
  addNewText: function () {
    Hupper.HUP.El.Add(this.builder.buildNewText(), this.sp);
  },
  addNameLink: function () {
    // Hupper.HUP.El.Insert(this.builder.buildNameLink('node-' + this.id), this.header);
    Hupper.HUP.El.Insert(this.builder.buildNameLink(this.id, 'node'), this.header);
  },
  addNext: function () {
    if (this.next === false) {
      Hupper.HUP.El.Add(this.builder.buildLastLink(), this.sp);
    } else {
      Hupper.HUP.El.Add(this.builder.buildNextLink('node-' + this.next), this.sp);
    }
  },
  addPrev: function () {
    if (this.previous === false) {
      Hupper.HUP.El.Add(this.builder.buildFirstLink(), this.sp);
    } else {
      Hupper.HUP.El.Add(this.builder.buildPrevLink('node-' + this.previous), this.sp);
    }
  },
  addTaxonomyCloser: function () {
    this.taxonomyButton = Hupper.HUP.El.Btn();
    Hupper.HUP.El.AddClass(this.taxonomyButton, 'hupper-button taxonomy-button delete-button');
    this.taxonomyButton.setAttribute('title',
      Hupper.HUP.Bundles.getFormattedString('hideTaxonomy', [this.taxonomy]));
    var _this = this;
    Hupper.HUP.Ev.addEvent(this.taxonomyButton, 'click', function () {
      _this.addToHide();
      Hupper.HideTaxonomyNodes(_this.nodes);
    });
    Hupper.HUP.El.Add(this.taxonomyButton, this.taxonomyNode.parentNode);
  },
  addToHide: function () {
    var _this = this;
    Hupper.HUP.hp.get.hidetaxonomy(function (response) {
      var taxonomies = response.pref.value.split(';');
      if (taxonomies.indexOf(_this.taxonomy) === -1) {
        taxonomies.push(_this.taxonomy);
      }
      Hupper.HUP.hp.set.hidetaxonomy(taxonomies.join(';'));
    });
  },
  addNodes: function (nodes, nodeMenu) {
    this.nodes = nodes;
    this.nodeMenu = nodeMenu;
    if (this.hidden) {
      nodeMenu.addNodeToMenu(this);
    }
  }
};
/**
 * @class NodeMenus
 * @namesapce Hupper
 */
Hupper.NodeMenus = function (hupMenu) {
  this.nodes = {};
  this.hupMenu = hupMenu;
};
Hupper.NodeMenus.prototype = {
  addMenu: function () {
    if (this.menu) {
      return;
    }
    this.menuitem = this.hupMenu.addMenuItem({
      name: Hupper.HUP.Bundles.getString('restoreNodes'),
      click: function () {
        Hupper.HUP.El.ToggleClass(this.parentNode, 'hide-submenu');
        Hupper.HUP.El.ToggleClass(this.parentNode, 'collapsed');
        Hupper.HUP.El.ToggleClass(this.parentNode, 'expanded');
      }
    }, null, true);
    Hupper.HUP.El.RemoveClass(this.menuitem, 'leaf');
    Hupper.HUP.El.AddClass(this.menuitem, 'hide-submenu collapsed');
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
  addNodeToMenu: function (node) {
    if (!this.nodes[node.taxonomy]) {
      if (!this.menu) {
        this.addMenu();
      }
      var _this = this;
      this.nodes[node.taxonomy] = this.hupMenu.addMenuItem({
        name: node.taxonomy,
        click: function () {
          node.show();
        }
      }, _this.menu);
    }
  },
  removeNodeFromMenu: function (node) {
    if (this.nodes[node.taxonomy]) {
      Hupper.HUP.El.Remove(this.nodes[node.taxonomy]);
      delete this.nodes[node.taxonomy];
      Hupper.HUP.hp.get.hidetaxonomy(function (response) {
        var taxonomies = response.pref.value.split(';'),
            i, tl;
        for (i = 0, tl = taxonomies.length; i < tl; i += 1) {
          if (taxonomies[i] === node.taxonomy) {
            taxonomies.splice(i, 1);
            break;
          }
        }
        Hupper.HUP.hp.set.hidetaxonomy(taxonomies.join(';'));
        Hupper.HideTaxonomyNodes(node.nodes);
      });
    }
    var n = 0, i;
    for (i in this.nodes) {
      if (this.nodes.hasOwnProperty(i)) {
        n += 1;
      }
    }
    if (n === 0) {
      this.removeMenu();
    }
  }
};
Hupper.HideTaxonomyNodes = function (nodes) {
  nodes.forEach(function (node) {
    node.checkTaxonomy();
  });
};
