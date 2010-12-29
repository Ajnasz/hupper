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
Hupper.getNodes = function() {
  var c = HUP.El.GetId('content-both');
  var ds = HUP.El.GetTag('div', c);
  var nodes = new Array(), newnodes = new Array();
  for(var i = 0, dsl = ds.length; i < dsl; i++) {
    if(HUP.El.HasClass(ds[i], 'node')) {
      node = new Hupper.Node(ds[i]);
      node.newc && !node.hidden ? nodes.push(node) && newnodes.push(node) : nodes.push(node);
    }
  }
  return new Array(nodes, newnodes);
};
Hupper.getBlocks = function() {
  return HUP.El.GetByClass(HUP.El.GetId('sidebar-left'), 'block', 'div').concat(HUP.El.GetByClass(HUP.El.GetId('sidebar-right'), 'block', 'div'));
};
Hupper.parseBlocks = function(blockElements, blockMenus, elementer) {
  var hupperBlocks = new Hupper.Blocks(),
      processedBlocks, leftBlocksFromConf, rightBlocksFromConf;

  hupperBlocks.UI = Hupper.Blocks.UI(elementer, hupperBlocks);
  var blocksFromConfig = HUPJson.decode(HUP.hp.get.blocks());
  if(blocksFromConfig.left || blocksFromConfig.right) {
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

      return new Hupper.Block({
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

        return new Hupper.Block({
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
        return new Hupper.Block({
          block: blockElement,
          blockMenus: blockMenus,
          blocks: hupperBlocks,
        });
      })
    );

  } else {
    processedBlocks = blockElements.map(function(blockElement) {
      return new Hupper.Block({
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
};
/**
 * Parse the nodes to mark that the node have unread comment, adds prev and next links to the header
 * @param {Array} nodes
 * @param {Array} newNodes
 */
Hupper.parseNodes = function(nodes, newNodes, nodeMenu) {
  var spa = HUP.El.Span(), sp, builder = new Hupper.NodeHeaderBuilder(), mread, next, prev;
  for(var i = 0, nl = nodes.length, node; i < nl; i++) {
    node = nodes[i];
    if(node.newc) {
      node.index = newNodes.indexOf(node);
      node.next = (node.index == newNodes.length - 1) ? false : newNodes[node.index + 1].id;
      node.previous = (node.index == 0 || !newNodes[node.index - 1]) ? false : newNodes[node.index - 1].id;
      node.addNewNodeLinks();
      if(!node.hidden) HUP.w.nextLinks.push('node-' + node.id);
    }
  }
  nodes.forEach(function(node) {
    node.addNodes(nodes, nodeMenu);
  });
};
/**
 * Send an AJAX HEAD request to the server, to remove the unread nodes
 * @param {Event} e Event object
 * @requires HupAjax
 * @see HupAjax
 */
Hupper.markNodeAsRead = function(e) {
  new HupAjax({
    method: 'get',
    url: 'http://hup.hu' + this.getAttribute('path').replace(/^\s*(.+)\s*$/, '$1'),
    successHandler: function() {
      this.el.innerHTML = HUP.Bundles.getString('markingSuccess');
      if(this.el.nextSibling.getAttribute('class') == 'hnew') {
        HUP.El.Remove(this.el.nextSibling, this.el.parentNode);
      }
    },
    loadHandler: function() {
      var img = HUP.El.Img('chrome://hupper/skin/ajax-loader.gif', 'marking...');
      HUP.El.RemoveAll(this.el);
      HUP.El.Add(img, this.el);
    },
    errorHandler: function() {
      var t = HUP.El.Txt(HUP.Bundles.getString('markingError'));
      HUP.El.RemoveAll(this.el);
      HUP.El.Add(t, this.el);
    }
  }, e.target);
};
/**
 * Marks as read all nodes, which have unread items
 * @param {Event} e event object
 */
Hupper.markAllNodeAsRead = function(e) {
  var n = HUP.markReadNodes;
  var d = document || HUP.w;
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
  var i = array.length - 1;
  while(array[i]) {
    if(array[i] === value) {
      return true;
    }
    i--;
  }
  return false;
};
/**
 * Appends a new link to the top of the page, if there is new comment
 * @param {String} [link]
 */
Hupper.appendNewNotifier = function(link, mark, hupMenu) {
  hupMenu.addMenuItem({name: HUP.Bundles.getString('firstNew'), href: link || '#new'})
  if(mark) {
    hupMenu.addMenuItem({name: HUP.Bundles.getString('markAllRead'), click: Hupper.markAllNodeAsRead})
  }
};
Hupper.hideHupAds = function() {
  var ids = new Array();
  ids.push(HUP.El.GetId('block-block-18'));
  ids.forEach(function(ad) {
    if(ad) {
      HUP.El.AddClass(ad, 'hidden');
    }
  });
};
Hupper.setBlocks = function() {
  if(HUP.hp.get.parseblocks()) {
    var blocks = Hupper.getBlocks();
    Hupper.parseBlocks(blocks, HUP.BlockMenus, HUP.El);
  }
};

Hupper.init = function() {
  var appcontent = document.getElementById("appcontent");   // browser
  if(appcontent) {
    appcontent.addEventListener("DOMContentLoaded", Hupper.boot, true);
  }
  var showInStatusbar = new HP().get.showinstatusbar();
  var statusbar = document.getElementById('HUP-statusbar');
  statusbar.hidden = !showInStatusbar;
  if(showInStatusbar) {
    Components.utils.import('resource://huppermodules/statusclickhandler.jsm');
    new StatusClickHandler(statusbar);
  }
};
window.addEventListener('load', function(){ Hupper.init(); }, false);
window.removeEventListener('unload', function(){ Hupper.init(); }, false);
