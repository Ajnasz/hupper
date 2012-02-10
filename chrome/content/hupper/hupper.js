/**
 * Collects the content nodes like articles or blog posts from the page
 * @var {Array} nodes contains all node objects
 * @var {Array} newnodes contains only the new node objects
 * @var {Object} node a node object with all data of the node
 * @var {Object} node.header header node of the node - where are the titles of the nodes
 * @var {String} node.path the path to the node
 * @var {Object} node.submitData
 * @var {Object} node.cont
 * @var {Object} node.cont
 * @var {Boolean} node.newc true, if the node have unread comments
 * @return An arry with all nodes and only new nodes 0 => all node, 1 => only new nodes
 * @type Array
 */
 /*global Hupper:true */
Hupper.getNodes = function (doc) {
    var c = Hupper.HUP.El.GetId('content-both'),
        ds = Hupper.HUP.El.GetTag('div', c),
        nodes = [], newnodes = [],
        i, dsl, node;
    for (i = 0, dsl = ds.length; i < dsl; i += 1) {
        if (Hupper.HUP.El.HasClass(ds[i], 'node')) {
            node = new Hupper.Node(doc, ds[i]);
            if (node.newc && !node.hidden) {
                nodes.push(node);
                newnodes.push(node);
            } else {
                nodes.push(node);
            }
        }
    }
    return [nodes, newnodes];
};
Hupper.getBlocks = function() {
  return Hupper.HUP.El.GetByClass(Hupper.HUP.El.GetId('sidebar-left'), 'block', 'div').concat(Hupper.HUP.El.GetByClass(Hupper.HUP.El.GetId('sidebar-right'), 'block', 'div'));
};
Hupper.parseBlocks = function(doc, blockElements, blockMenus, elementer) {
  var hupperBlocks = new Hupper.Blocks(),
      processedBlocks, leftBlocksFromConf, rightBlocksFromConf;

  hupperBlocks.UI = Hupper.Blocks.UI(elementer, hupperBlocks);
  Hupper.HUP.hp.get.blocks(function(response) {
    var blocksFromConfig = Hupper.Json.decode(response.pref.value);
    if(blocksFromConfig && (blocksFromConfig.left || blocksFromConfig.right)) {
      leftBlocksFromConf = blocksFromConfig.left;
      rightBlocksFromConf = blocksFromConfig.right;

      var processedBlocks = leftBlocksFromConf.map(function(leftBlock) {
        var matched = false,
            blockElement,
            bl = blockElements.length;

        while(bl--) {
          blockElement = blockElements[bl];
          if(blockElement.id == leftBlock.id) {
            blockElements.splice(bl, 1);
            break;
          }
        }

        return new Hupper.Block(doc, {
          id: leftBlock.id,
          blockMenus: blockMenus,
          blocks: hupperBlocks,
          side: 'left',
          hidden: leftBlock.hidden,
          contentHidden: leftBlock.contentHidden,
        });
      }).concat(
        rightBlocksFromConf.map(function(rightBlock) {
          var blockElement,
              bl = blockElements.length;

          while(bl--) {
            blockElement = blockElements[bl];
            if(blockElement.id == rightBlock.id) {
              blockElements.splice(bl, 1);
              break;
            }
          }

          return new Hupper.Block(doc, {
            id: rightBlock.id,
            blockMenus: blockMenus,
            blocks: hupperBlocks,
            side: 'right',
            hidden: rightBlock.hidden,
            contentHidden: rightBlock.contentHidden,
          });
        })
      ).concat(
        blockElements.map(function(blockElement) {
          return new Hupper.Block(doc, {
            block: blockElement,
            blockMenus: blockMenus,
            blocks: hupperBlocks,
          });
        })
      );

    } else {
      processedBlocks = blockElements.map(function(blockElement) {
        return new Hupper.Block(doc, {
          block: blockElement,
          blockMenus: blockMenus,
          blocks: hupperBlocks,
        });
      });
    }
    processedBlocks.forEach(function(block, a, b) {
      hupperBlocks.registerBlock(block);
    });
    hupperBlocks.save();
    hupperBlocks.UI.rearrangeBlocks();
    hupperBlocks.save();
  });
};
/**
 * Parse the nodes to mark that the node have unread comment, adds prev and next links to the header
 * @param {Array} nodes
 * @param {Array} newNodes
 */
Hupper.parseNodes = function(doc, nodes, newNodes, nodeMenu) {
  var spa = Hupper.HUP.El.Span(),
      builder = new Hupper.NodeHeaderBuilder(doc),
      sp, node, mread, next, prev;
  for(var i = 0, nl = nodes.length; i < nl; i++) {
    node = nodes[i];
    if(node.newc) {
      node.index = newNodes.indexOf(node);
      node.next = (node.index == newNodes.length - 1) ? false : newNodes[node.index + 1].id;
      node.previous = (node.index == 0 || !newNodes[node.index - 1]) ? false : newNodes[node.index - 1].id;
      node.addNewNodeLinks();
      if(!node.hidden) Hupper.HUP.w.nextLinks.push('node-' + node.id);
    }
  }
  nodes.forEach(function(node) {
    node.addNodes(nodes, nodeMenu);
  });
};
/**
 * Send an AJAX HEAD request to the server, to remove the unread nodes
 * @param {Event} e Event object
 * @requires Hupper.Ajax
 * @see Hupper.Ajax
 */
Hupper.markNodeAsRead = function(e) {
  var scope = {}, bundles;
  Components.utils.import('resource://huppermodules/bundles.jsm', scope);
  bundles = scope.hupperBundles;
  var ajax = new Hupper.Ajax({
    method: 'get',
    url: 'http://hup.hu' + this.getAttribute('path').replace(/^\s*(.+)\s*$/, '$1'),
    successHandler: function() {
      this.el.innerHTML = bundles.getString('markingSuccess');
      if(this.el.nextSibling.getAttribute('class') == 'hnew') {
        Hupper.HUP.El.Remove(this.el.nextSibling, this.el.parentNode);
      }
      var el = this.el;
      setTimeout(function() {
        Hupper.HUP.El.Remove(el);
      }, 750);
    },
    loadHandler: function() {
      var img = Hupper.HUP.El.Img('chrome://hupper/skin/ajax-loader.gif', 'marking...');
      Hupper.HUP.El.RemoveAll(this.el);
      Hupper.HUP.El.Add(img, this.el);
    },
    errorHandler: function() {
      var t = Hupper.HUP.El.Txt(bundles.getString('markingError'));
      Hupper.HUP.El.RemoveAll(this.el);
      Hupper.HUP.El.Add(t, this.el);
    }
  }, e.target);
};
/**
 * Marks as read all nodes, which have unread items
 * @param {Event} e event object
 */
Hupper.markAllNodeAsRead = function(e) {
  var n = Hupper.HUP.markReadNodes;
  var d = document || Hupper.HUP.w;
  for(var i = 0, nl = n.length; i < nl; i++) {
    var click = d.createEvent("MouseEvents");
    click.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    n[i].dispatchEvent(click);
  }
};
/**
 * Checks that the arrray contains the specified element
 * @param {String,Number,Array,Object} value
 * @type {Boolean}
 */
Hupper.inArray = function(value, array) {
    return array.some(function (item) {
        return item === value;
    });
};
/**
 * Appends a new link to the top of the page, if there is new comment
 * @param {String} [link]
 */
Hupper.appendNewNotifier = function(link, mark, hupMenu) {
  var scope = {}, bundles;
  Components.utils.import('resource://huppermodules/bundles.jsm', scope);
  bundles = scope.hupperBundles;
  hupMenu.addMenuItem({name: bundles.getString('firstNew'), href: link || '#new'})
  if(mark) {
    hupMenu.addMenuItem({name: bundles.getString('markAllRead'), click: Hupper.markAllNodeAsRead})
  }
};
Hupper.setBlocks = function(doc) {
  Hupper.HUP.hp.get.parseblocks(function(response) {
    if (response.pref.value) {
      var blocks = Hupper.getBlocks();
      Hupper.parseBlocks(doc, blocks, Hupper.HUP.BlockMenus, Hupper.HUP.El);
    }
  });
};
Hupper.isTroll = function (user, cb) {
  Hupper.HUP.hp.get.trolls(function (response) {
      var trolls = response.pref.value.split(',');
      cb(trolls.some(function (troll) {
          return troll === user;
      }));
  });
};

Hupper.isHighlighted = function () {
};


Hupper.init = function() {
  var appcontent = document.getElementById("appcontent");   // browser
  if(appcontent) {
    appcontent.addEventListener("DOMContentLoaded", Hupper.boot, true);
  }
  var scope = {};
  Components.utils.import('resource://huppermodules/prefs.jsm', scope);
  var showInStatusbar = new scope.HP().get.showinstatusbar();
  var statusbar = document.getElementById('HUP-statusbar');
  statusbar.hidden = !showInStatusbar;
  if(showInStatusbar) {
      Components.utils.import('resource://huppermodules/statusclickhandler.jsm', scope);
      var handler = new scope.StatusClickHandler(statusbar);
  }
  document.getElementById('contentAreaContextMenu').addEventListener('popupshowing', function () {
      var element = document.popupNode,
          parent = element.parentNode,
          user = element.innerHTML,
          isUsername = element.title === "Felhasználói profil megtekintése.";

      Components.utils.import('resource://huppermodules/statusclickhandler.jsm', scope);
      Components.utils.import('resource://huppermodules/trollHandler.jsm', scope);
      scope.trollHandler.isTroll(user, function (isTroll) {
          document.getElementById('HUP-markAsTroll').hidden = !isUsername || isTroll;
          document.getElementById('HUP-unmarkTroll').hidden = !isUsername || !isTroll;
          scope.trollHandler.isHighlighted(user, function (isHighlighted) {
              document.getElementById('HUP-highilghtUser').hidden = !isUsername || isTroll || isHighlighted;
              document.getElementById('HUP-unhighilghtUser').hidden = !isUsername || isTroll || !isHighlighted;
          });
      });
  }, false);
};
Hupper.initialize = function () {
    // if (!Hupper.initialized) {
        Hupper.init();
        // Hupper.initialized = true;
    // }
    window.removeEventListener('unload', Hupper.initialize, false);
};
window.addEventListener('load', Hupper.initialize, false);
window.removeEventListener('unload', Hupper.initialize, false);
