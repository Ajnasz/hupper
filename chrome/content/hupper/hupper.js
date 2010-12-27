/**
 * Namespace to build links, lists etc.
 * @class NodeHeaderBuilder
 * @namespace Hupper
 * @description Namespace to build links, lists etc.
 * @constructor
 */
Hupper.NodeHeaderBuilder = function() {
  /**
   * @final
   */
  this.firstLinkText = HUP.Bundles.getString('FirstLinkText');
  /**
   * @final
   */
  this.lastLinkText = HUP.Bundles.getString('LastLinkText');
  /**
   * @final
   */
  this.prevLinkText = HUP.Bundles.getString('PrevLinkText');
  /**
   * @final
   */
  this.nextLinkText = HUP.Bundles.getString('NextLinkText');
  /**
   * @final
   */
  this.topLinkText = HUP.Bundles.getString('TopLinkText');
  /**
   * @final
   */
  this.backLinkText = HUP.Bundles.getString('BackLinkText');
  /**
   * @final
   */
  this.parentLinkText = HUP.Bundles.getString('ParentLinkText');

  // Title text nodes
  this.fit = HUP.El.Txt(this.firstLinkText);
  this.lat = HUP.El.Txt(this.lastLinkText);
  this.newCt = HUP.El.Txt(HUP.hp.get.newcommenttext());

  // Mark as read node
  this.markR = HUP.El.CreateLink(HUP.Bundles.getString('markingText'));
  HUP.El.AddClass(this.markR, 'mark');
};
Hupper.NodeHeaderBuilder.prototype = {
  /**
    * Builds a link which points to the specified path with the next link str
    * @param {String} path Path for the next node
    * @return A DOM link (a) object within the ~Next~ text
    * @type Element
    */
  buildNextLink: function(path) {
    return HUP.El.CreateLink(this.nextLinkText, '#' + path);
  },
  /**
    * Builds a link which points to the specified path with the prev link text
    * @param {String} path Path for the next node
    * @return A DOM link (a) object within the ~Prev~ text
    * @type Element
    */
  buildPrevLink: function(path) {
    return HUP.El.CreateLink(this.prevLinkText, '#' + path);
  },
  /**
    * Builds a text node with the first text
    * @return Span element within first link text
    * @type Element
    */
  buildFirstLink: function() {
    var nsp = HUP.El.Span();
    HUP.El.Add(this.fit, nsp);
    return nsp;
  },
  /**
    * Builds a text node with the last text
    * @return Span element with within last link text
    * @type Element
    */
  buildLastLink: function() {
    var nsp = HUP.El.Span();
    HUP.El.Add(this.lat, nsp);
    return nsp;
  },
  /**
    * Builds a mark as read linknode
    * @return Link (a) element
    * @param {String} path the path to the node
    * @param {Int} i marker id
    * @type Element
    */
  buildMarker: function(path, i) {
    var mr = this.markR.cloneNode(true);
    mr.setAttribute('path', path);
    mr.setAttribute('id', 'marker-' + i);
    mr.addEventListener('click', Hupper.markNodeAsRead, true);
    return mr;
  },
  /**
    * Builds a text node with [new] text
    * @return Span element, within a next link
    * @type Element
    */
  buildNewText: function() {
    var nsp = HUP.El.Span();
    HUP.El.AddClass(nsp, 'hnew');
    HUP.El.Add(this.newCt.cloneNode(true), nsp);
    return nsp;
  },
  /**
    * Builds an invisible link with a name attribute
    * @param {Int} i id of the node
    * @return Link (a) element only with name attribute
    * @type Element
    */
  buildNameLink: function(i, type) {
    var liaC = HUP.El.A();
    if(!type) type = 'n';
    liaC.setAttribute('name', type + '-' + i);
    return liaC;
  },
  /**
    * Builds a link node which points to the top of the page
    * @return Li element, within a link which points to the top of the page
    * @type Element
    */
  buildComExtraTop: function() {
    var tmpList = HUP.El.Li();
    HUP.El.Add(HUP.El.CreateLink(this.topLinkText, '#'), tmpList);
    return tmpList;
  },
  /**
    * Builds a link node which points to the previous page
    * @return Li element with a link, which point to the previous history page
    * @type Element
    */
  buildComExtraBack: function() {
    var tmpList = HUP.El.Li();
    HUP.El.Add(HUP.El.CreateLink(this.backLinkText, 'javascript:history.back();'), tmpList);
    return tmpList;
  },
  /**
    * Builds a link node which points to the comment's parent comment
    * @param {String} parent The parent comment id
    * @return Li element with a link, which points to the parent comment
    * @type Element
    */
  buildComExtraParent: function(parent) {
    var tmpList = HUP.El.Li(),
    link = HUP.El.CreateLink(this.parentLinkText, '#' + parent.id);
    // if fading enabled, add an event listener, which will fades the parent node
    if(HUP.hp.get.fadeparentcomment()) {
      link.addEventListener('click', function(e) {
        new Transform(e.target.n.comment, 'FadeIn');
      }, false);
      link.n = parent;
    }
    HUP.El.Add(link, tmpList);
    return tmpList;
  },
  /**
    * Builds a link with a permalink text
    * @param {String} cid
    * @return Li element, with a link, which points to exactly to the comment
    * @type Element
    */
  buildComExtraPerma: function(cid) {
    var tmpList = HUP.El.Li();
    HUP.El.Add(HUP.El.CreateLink('permalink', '#' + cid), tmpList);
    return tmpList;
  }
};
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
  new HupAjax( {
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
Hupper.Stringer = {
  trim: function(str) {
    return str.replace(/^\s+|\s+$/g, '');
  },
  empty: function(str) {
    return (this.trim(str) == '');
  }
};
/**
 * @class Timer
 * @namespace Hupper
 * @description is small bencmark utility
 * @constructor
 */
Hupper.Timer = function() {
  this.start();
};
Hupper.Timer.prototype = {
  /**
   * Start the timer
   */
  start: function() {
    this.startTime = new Date();
  },
  /**
   * Stop the timer
   */
  stop: function() {
    this.endTime = new Date();
  },
  /**
   * Finish the run and return the result
   * @return The difference between the start and the and in ms
   * @type Int
   */
  finish: function() {
    return this.endTime.getTime() - this.startTime.getTime();
  }
};
Hupper.Jump = function(win, nextLinks) {
  this.window = win;
  this.nextLinks = nextLinks;
}
Hupper.Jump.prototype = {
  next: function() {
    if(/^#/.test(HUP.w.location.hash)) {
      var curIndex = this.nextLinks.indexOf(this.window.location.hash.replace(/^#/, ''));
      if(this.nextLinks[curIndex+1]) {
        this.window.location.hash = this.nextLinks[curIndex+1];
      } else if(this.nextLinks[0]) {
        this.window.location.hash = this.nextLinks[0];
      }
    } else if(this.nextLinks.length) {
      this.window.location.hash = this.nextLinks[0];
    }
  },
  prev: function() {
    if(/^#/.test(this.window.location.hash)) {
      var curIndex = this.nextLinks.indexOf(this.window.location.hash.replace(/^#/, ''));
      if(curIndex != 0) {
        this.window.location.hash = this.nextLinks[curIndex-1];
      } else if(this.nextLinks[this.nextLinks.length-1]) {
        this.window.location.hash = this.nextLinks[HUP.w.nextLinks.length-1];
      }
    } else if(this.nextLinks.length) {
      this.window.location.hash = this.nextLinks[this.nextLinks.length-1];
    }
  }
};
Hupper.HideHupAds = function() {
  var ids = new Array();
  ids.push(HUP.El.GetId('block-block-18'));
  ids.forEach(function(ad) {
    if(ad) {
      HUP.El.AddClass(ad, 'hidden');
    }
  });
};
/**
 * @param {Element} ob
 */
Hupper.StatusClickHandling = function(ob) {
  this.ob = ob;
  if(!this.ob) { return; }
  this.observe();
};
Hupper.StatusClickHandling.prototype = {
  st: null,
  ob: null,
  /**
   * add the event handler to the statusbar icon
   */
  observe: function() {
    var _this = this;
    this.ob.addEventListener('click', function(event){_this.click(event)}, false);
    if(this.st == 2) {
      this.ob.addEventListener('dblclick', function(event){_this.click(event)}, false);
    }
    this.ob.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      e.stopPropagation();
    }, false);
  },
  /**
   * event handler runs when user click on the statusbar icon
   * event.button:
   *   0 = left click
   *   1 = middle click
   *   2 = right click
   * @param {Object} event
   */
  click: function(e) {
    var currentTab = this.openHUP();
    if(currentTab.contentDocument.Jumps) {
      switch(e.button) {
        case 0:
          currentTab.contentDocument.Jumps.next();
        break;

      case 2:
          currentTab.contentDocument.Jumps.prev();
        break;

      case 1:
        // HupAccountManager.logIn();
        // var currentTab = _this.openHUP();
        break;
      }
    }
  },
  getOpenedHUP: function() {
    var brl = gBrowser.browsers.length;
    var outObj = {hupTab: false, blankPage: false};
    var r = new RegExp('^https?://(?:www\.)?hup.hu');
    for(var i = 0 ; i < brl; i++) {
      if(r.test(gBrowser.getBrowserAtIndex(i).currentURI.spec)) {
        outObj.hupTab = i;
        return outObj;
      } else if(gBrowser.getBrowserAtIndex(i).currentURI.spec == 'about:blank' && outObj.blankPage === false) {
        outObj.blankPage = i;
      }
    }
    return outObj;
  },
  openHUP: function() {
    var currentTab = gBrowser.getBrowserAtIndex(gBrowser.mTabContainer.selectedIndex);
    if(!/^https?:\/\/(?:www\.)?hup\.hu/.test(currentTab.currentURI.spec)) {
      var openedHUP = this.getOpenedHUP();
      if(openedHUP.hupTab === false) {
        if(openedHUP.blankPage === false) {
            currentTab = gBrowser.selectedTab = gBrowser.addTab('http://hup.hu');
        } else {
          gBrowser.mTabContainer.selectedIndex = openedHUP.blankPage;
          gBrowser.loadURI('http://hup.hu');
          gBrowser.getBrowserAtIndex(gBrowser.mTabContainer.selectedIndex).contentWindow.focus();
        }
        gBrowser
      } else {
        gBrowser.mTabContainer.selectedIndex = openedHUP.hupTab;
      }
      currentTab = gBrowser.getBrowserAtIndex(gBrowser.mTabContainer.selectedIndex);
    }
    return currentTab;
  }
};
Hupper.setBlocks = function() {
  if(HUP.hp.get.parseblocks()) {
    var blocks = Hupper.getBlocks();
    Hupper.parseBlocks(blocks, HUP.BlockMenus, HUP.El);
  }
};

/**
 * Initialization function, runs when the page is loaded
 * @param {Event} e window load event object
 */
Hupper.start = function(e) {
  try {
    var ww = e.originalTarget;
    var logger = new Hupper.Log();
    // logger.log(ww.location.hostname);
    if(ww && ww.location && typeof ww.location.hostname == 'string'
        && (ww.location.hostname == 'hup.hu' || ww.location.hostname == 'www.hup.hu' ||
        /http:\/\/(localhost\/hupper\/hg|hupper|hupperl)\/.+\.html/.test(ww.location.href))) {
      var TIMER = new Hupper.Timer();
      /**
      * A unique global object to store all global objects/array/... of the Hupper Extension
      */
      HUP = {};
      var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);  
      var newWindow = wm.getMostRecentWindow("navigator:browser");  
      var b = newWindow.getBrowser();
      // HUP document object
      HUP.w = ww;
      HUP.hp = new HP();
      // Logger
      HUP.L = new Hupper.Log();
      Hupper.postInstall();
      // Elementer
      var elementer = new Hupper.Elementer(ww);;
      HUP.El = elementer;
      HUP.Ev = new HUPEvents();
      // Lang stuffs
      HUP.Bundles = document.getElementById('hupper-bundles');
      // Hupper.addHupStyles();
      var hupMenu = new Hupper.Menu();
      HUP.BlockMenus = new Hupper.BlockMenus(hupMenu);
      // Stores the mark as read nodes
      HUP.markReadNodes = [];
      HUP.w.nextLinks = [];
      // if comments are available
      if(HUP.El.GetId('comments')) {
        var c = new Hupper.GetComments();
        var comments = c.comments;
        var newComments = c.newComments;
        var indentComments = c.indentComments;
        if(c.newComments.length && HUP.hp.get.showqnavbox()) {
          Hupper.appendNewNotifier(null, null, hupMenu);
        }
      } else {
        if(HUP.hp.get.insertnewtexttonode()) {
          var nodes = Hupper.getNodes();
          Hupper.parseNodes(nodes[0], nodes[1], new Hupper.NodeMenus(hupMenu));
          if(nodes[1].length > 0 && HUP.hp.get.showqnavbox()) {
            Hupper.appendNewNotifier('#node-' + nodes[1][0].id, true, hupMenu);
          }
        }
      }
      Hupper.setBlocks();
      Hupper.styles();
     //  if(HupperPrefs.hideads()) {
     //    Hupper.HideHupAds();
     //  }
     //  bindHUPKeys();
      HUP.w.Jumps = new Hupper.Jump(HUP.w, HUP.w.nextLinks);
      TIMER.stop();
      HUP.L.log('initialized', 'Run time: ' + TIMER.finish() + 'ms');
    }
  } catch(e) {
    Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService).logStringMessage('HUPPER: ' + e.message + ', ' + e.lineNumber, + ', ' + e.fileName, + ', ' + e.toString());
  }
};
Hupper.init = function() {
  var appcontent = document.getElementById("appcontent");   // browser
  if(appcontent) {
    appcontent.addEventListener("DOMContentLoaded", Hupper.start, true);
  }
  var showInStatusbar = new HP().get.showinstatusbar();
  var statusbar = document.getElementById('HUP-statusbar');
  statusbar.hidden = !showInStatusbar;
  if(showInStatusbar) {
    new Hupper.StatusClickHandling(statusbar);
  }
};
window.addEventListener('load', function(){ Hupper.init(); }, false);
window.removeEventListener('unload', function(){ Hupper.init(); }, false);
