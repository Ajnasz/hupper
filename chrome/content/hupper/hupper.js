/**
 * hupper.js
 * @fileoverview This file is part of the Hupper Firefox extension,
 * which adds some extra feature for the {@link http://hup.hu hup.hu} site
 * {@link http://ajnasz.hu/blog/20070616/hupper-extension Hupper Firefox Extension}
 *
 * Copyright (C) 2007-2008
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
 * @license General Public Licence v2
 * for more details see the licence.txt file
 */
/**
 * Namespace, to store the static variables
 * @final
 */
var HupperVars = {
  trollCommentHeaderClass: 'trollHeader',
  trollCommentClass: 'trollComment',
  trollCommentAnswersClass: 'trollCommentAnswer'
};
/**
 * Namespace, which is used to returns the preferences value
 */
var HupperPrefs = {
  /**
   * Prefernce mozilla service
   * pref types: BoolPref, CharPref, IntPref
   * {@link http://developer.mozilla.org/en/docs/Code_snippets:Preferences developer.mozilla.org}
   */
  prefManager: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch),
  /**
   * @return The returned array contains the names of the trolls
   * @type Array
   */
  trolls: function() {
    var trolls = this.prefManager.getCharPref('extensions.hupper.trolls');
    return trolls.split(',');
  },
  /**
   * @return Hexa code color
   * @type String
   */
  trollcolor: function() {
    return this.prefManager.getCharPref('extensions.hupper.trollcolor');
  },
  /**
   * @type {Boolean}
   */
  filtertrolls: function() {
    return this.prefManager.getBoolPref('extensions.hupper.filtertrolls');
  },
  /**
   * @return hide or hilight the trolls
   * @type String
   */
  trollfiltermethod: function() {
    // hide, hilight
    return this.prefManager.getCharPref('extensions.hupper.trollfiltermethod');
  },
  /**
   * @return also hide the answers of a troll comment
   * @type String
   */
  hidetrollanswers: function() {
    // hide, hilight
    return this.prefManager.getBoolPref('extensions.hupper.hidetrollanswers');
  },
  /**
   * @return The returned array contains the names of the huppers
   * @type Array
   */
  huppers: function() {
    var huppers = this.prefManager.getCharPref('extensions.hupper.huppers');
    return huppers.split(',');
  },
  /**
   * @return Hexa code color
   * @type String
   */
  huppercolor: function() {
    return this.prefManager.getCharPref('extensions.hupper.huppercolor');
  },
  /**
   * @type Boolean
   */
  filterhuppers: function() {
    return this.prefManager.getBoolPref('extensions.hupper.filterhuppers');
  },
  /**
   * @type Boolean
   */
  replacenewcommenttext: function() {
    return this.prefManager.getBoolPref('extensions.hupper.replacenewcommenttext');
  },
  /**
   * @type String
   */
  newcommenttext: function() {
    return this.prefManager.getCharPref('extensions.hupper.newcommenttext');
  },
  /**
   * @type Boolean
   */
  prevnextlinks: function() {
    return this.prefManager.getBoolPref('extensions.hupper.prevnextlinks');
  },
  /**
   * @type String
   */
  tags: function() {
    return this.prefManager.getCharPref('extensions.hupper.tags');
  },
  /**
   * @type Boolean
   */
  extraCommentLinks: function() {
    return this.prefManager.getBoolPref('extensions.hupper.extracommentlinks');
  },
  /**
   * @type Boolean
   */
  hilightForumLinesOnHover: function() {
    return this.prefManager.getBoolPref('extensions.hupper.hilightforumlinesonhover');
  },
  /**
   * @type Boolean
   */
  insertPermalink: function() {
    return this.prefManager.getBoolPref('extensions.hupper.insertpermalink');
  },
  /**
   * @type Boolean
   */
  insertnewtexttonode: function() {
    return this.prefManager.getBoolPref('extensions.hupper.insertnewtexttonode');
  },
  /**
   * @type Boolean
   */
  fadeparentcomment: function() {
    return this.prefManager.getBoolPref('extensions.hupper.fadeparentcomment');
  },
  /**
   * @type Boolean
   */
  showqnavbox: function() {
    return this.prefManager.getBoolPref('extensions.hupper.showqnavbox');
  },
  hideads: function() {
    return this.prefManager.getBoolPref('extensions.hupper.hideads');
  },
  highlightusers: function() {
    return this.prefManager.getCharPref('extensions.hupper.highlightusers');
  },
  hidetaxonomy: function() {
    return this.prefManager.getCharPref('extensions.hupper.hidetaxonomy');
  },
  hidetaxonomy: function() {
    return this.prefManager.getCharPref('extensions.hupper.hidetaxonomy');
  },
  showinstatusbar: function() {
    return this.prefManager.getBoolPref('extensions.hupper.showinstatusbar');
  }
};
/**
 * Namespace to build links, lists etc.
 * @class NodeHeaderBuilder Namespace to build links, lists etc.
 * @constructor
 */
var NodeHeaderBuilder = function() {
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
  this.newCt = HUP.El.Txt(HupperPrefs.newcommenttext());

  // Mark as read node
  this.markR = HUP.El.CreateLink(HUP.Bundles.getString('markingText'));
  HUP.El.AddClass(this.markR, 'mark');
};
NodeHeaderBuilder.prototype = {
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
    mr.addEventListener('click', markNodeAsRead, true);
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
    var tmpList = HUP.El.Li();
    var link = HUP.El.CreateLink(this.parentLinkText, '#' + parent.id);
    // if fading enabled, add an event listener, which will fades the parent node
    if(HupperPrefs.fadeparentcomment()) {
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
 * Collects the comment nodes and filter them into another 2 array too by their
 * roperties: comments, newComments, indentComments the indenComments just contains
 * an index which specify the comment index in the comments array
 * @return Array with the comments and new comments: 0 => comments object, 1 => only new comments,
 * @type Array
 */
var getComments = function() {
  var coms = HUP.El.GetId('comments');
  if(!coms) {
    return false;
  }
  var ds = HUP.El.GetTag('div', coms);
  var comments = new Array(), newComm, indentComments = new Array(), newComments = new Array();
  for(var i = 0, dsl = ds.length; i < dsl; i++) {
    if(HUP.El.HasClass(ds[i], 'comment')) {
      comment = new HUPComment(ds[i], indentComments, comments);
      if(typeof indentComments[comment.indent] == 'undefined') {
        indentComments[comment.indent] = new Array();
      }
      indentComments[comment.indent].push(comments.length);
      comments.push(comment);
      if(comment.newComm) {
        newComments.push(comment);
      }
    }
  }
  return new Array(comments, newComments, indentComments);
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
var getNodes = function() {
  var c = HUP.El.GetId('content-both');
  var ds = HUP.El.GetTag('div', c);
  var nodes = new Array(), newnodes = new Array();
  for(var i = 0, dsl = ds.length; i < dsl; i++) {
    if(HUP.El.HasClass(ds[i], 'node')) {
      node = new HUPNode(ds[i]);
      node.newc && !node.hidden ? nodes.push(node) && newnodes.push(node) : nodes.push(node);
    }
  }
  return new Array(nodes, newnodes);
};
var getBlocks = function() {
  return HUP.El.GetByClass(HUP.El.GetId('sidebar-left'), 'block', 'div').concat(HUP.El.GetByClass(HUP.El.GetId('sidebar-right'), 'block', 'div'));
};
var parseBlocks = function(blocks, blockMenus) {
  var blockObjetcs =  new Array();
  var sides = {right: 0, left: 0};
  blocks.forEach(function(block) {
    blockObjetcs.push(new HUPBlock(block, sides, blockMenus));
  });
  HUPRearrangeBlocks(blockObjetcs);
}
/**
 * Parse the nodes to mark that the node have unread comment, adds prev and next links to the header
 * @param {Array} nodes
 * @param {Array} newNodes
 */
var parseNodes = function(nodes, newNodes, nodeMenu) {
  var spa = HUP.El.Span(), sp, builder = new NodeHeaderBuilder(), mread, next, prev;
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
var markNodeAsRead = function(e) {
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
var markAllNodeAsRead = function(e) {
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
var inArray = function(value, array) {
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
 * Parses all comment on the page and add class names, replaces the 'új' text, etc.
 * @param {Array} comments
 * @param {Array} newComments
 * @param {Array} indentComments
 */
var parseComments = function(comments, newComments, indentComments) {
  var replacenewcommenttext = HupperPrefs.replacenewcommenttext();
  var prevnextlinks = HupperPrefs.prevnextlinks();
  var trolls = HupperPrefs.trolls();
  var filtertrolls = HupperPrefs.filtertrolls();
  var huppers = HupperPrefs.huppers();
  var filterhuppers = HupperPrefs.filterhuppers();
  var extraCommentLinks = HupperPrefs.extraCommentLinks();
  var insertPermalink = HupperPrefs.insertPermalink();
  var highlightUsers = HupperPrefs.highlightusers().split(',');
  var hh = {}, bh;
  highlightUsers.forEach(function(hluser){
    bh = hluser.split(':');
    hh[bh[0]] = bh[1];
  });
  var builder = new NodeHeaderBuilder(), ps;
  try {
    comments.forEach(function(C) {
      if(filtertrolls && inArray(C.user, trolls)) {
        C.highlightTroll();
      }
      if(filterhuppers && inArray(C.user, huppers)) {
        C.highlightHupper();
      }
      if(extraCommentLinks) {
        C.addExtraLinks(builder);
      }
      if(C.parent != -1) {
        C.addComExtraParent(builder);
      }
      if(insertPermalink) {
        HUP.El.Add(builder.buildComExtraPerma(C.id), C.footerLinks);
      }
      C.highlightComment(hh);
    });
  } catch(e) {HUP.L.log(e.message, e.lineNumber, e.fileName)}
  if(replacenewcommenttext || prevnextlinks) {
    var spanNode = HUP.El.Span(), tmpSpan1;
    for(var i = 0, ncl = newComments.length; i < ncl; i++) {
      tmpSpan1 = spanNode.cloneNode(true);
      HUP.El.AddClass(tmpSpan1, 'hnav');
      if(prevnextlinks) {
        (i > 0) ? HUP.El.Add(builder.buildPrevLink(newComments[i - 1].id), tmpSpan1) : HUP.El.Add(builder.buildFirstLink(), tmpSpan1);
        (i < ncl - 1) ? HUP.El.Add(builder.buildNextLink(newComments[i + 1].id), tmpSpan1) : HUP.El.Add(builder.buildLastLink(), tmpSpan1);
        HUP.w.nextLinks.push(newComments[i].id);
      }
      if(replacenewcommenttext) {
        newComments[i].replaceNewCommentText(builder, tmpSpan1)
      }
      HUP.El.Insert(tmpSpan1, newComments[i].header.firstChild);
    }
  }
};
/**
 * Appends a new link to the top of the page, if there is new comment
 * @param {String} [link]
 */
var appendNewNotifier = function(link, mark, hupMenu) {
  hupMenu.addMenuItem({name: HUP.Bundles.getString('firstNew'), href: link || '#new'})
  if(mark) {
    hupMenu.addMenuItem({name: HUP.Bundles.getString('markAllRead'), click: markAllNodeAsRead})
  }
};
/**
 * Adds my own styles to the hup.hu header
 * @param {Event} e event object
 */
var addHupStyles = function(e) {
  var styles = '';
  switch(HupperPrefs.trollfiltermethod()) {
    case 'hide':
      styles += '.' + HupperVars.trollCommentClass + ' {display:none !important;}';
      if(HupperPrefs.hidetrollanswers()) {
        styles += '.' + HupperVars.trollCommentAnswersClass + ' {display:none !important;}';
      }
      break;
    case 'hilight':
    default:
      styles += '.' + HupperVars.trollCommentHeaderClass + ' {background-color:' + HupperPrefs.trollcolor() + ' !important;}';
      break;
  };
  if(HupperPrefs.hilightForumLinesOnHover()) {
    styles += 'tr.odd:hover td, tr.even:hover {background-color: #D8D8C4;}';
  }
  var head = HUP.El.GetFirstTag('head');
  var st = HUP.El.El('style');
  HUP.El.Add(HUP.El.Txt(styles), st);
  HUP.El.Add(st, head);

  var sti = HUP.El.El('link');
  st.setAttribute('type', 'text/css');
  sti.setAttribute('rel', 'stylesheet');
  sti.setAttribute('media', 'all');
  sti.setAttribute('href', 'chrome://hupper/skin/hupper.css');
  HUP.El.Add(sti, head);
};
var Stringer = {
  trim: function(str) {
    return str.replace(/^\s+|\s+$/g, '');
  },
  empty: function(str) {
    return (this.trim(str) == '');
  }
};
/**
 * @class Timer is small bencmark utility
 * @constructor
 */
var Timer = function() {
  this.start();
};
Timer.prototype = {
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
var HUPJump = function(win, nextLinks) {
  this.window = win;
  this.nextLinks = nextLinks;
}
HUPJump.prototype = {
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
var HideHupAds = function() {
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
var HUPStatusClickHandling = function(ob) {
  this.ob = ob;
  if(!this.ob) { return; }
  this.observe();
};
HUPStatusClickHandling.prototype = {
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
  },
  /**
   * event handler runs when user click on the statusbar icon
   * event.button:
   *   0 = left click
   *   1 = middle click
   *   2 = right click
   * @param {Object} event
   */
  click: function(event) {
    var currentTab = this.openHUP();
    if(currentTab.contentDocument.Jumps) {
      switch(event.button) {
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
/**
 * Initialization function, runs when the page is loaded
 * @param {Event} e window load event object
 */
var HUPPER = function(e) {
  try {
    var ww = e.originalTarget;
    if(/^https?:\/\/(?:www\.)?hup\.hu/.test(ww.location.href) || /^http:\/\/localhost\/hupper\/hg/.test(ww.location.href)) {
      var TIMER = new Timer();
      /**
      * A unique global object to store all global objects/array/... of the Hupper Extension
      */
      HUP = {};
      // HUP document object
      HUP.w = ww;
      HUP.hp = new HP();
      // Logger
      HUP.L = new HLog();
      HUP_postInstall();
      // Elementer
      HUP.El = new HUPElementer();
      HUP.Ev = new HUPEvents();
      // Lang stuffs
      HUP.Bundles = document.getElementById('hupper-bundles');
      addHupStyles();
      var hupMenu = new HUPMenu();
      // Stores the mark as read nodes
      HUP.markReadNodes = new Array();
      HUP.w.nextLinks = new Array();
      // if comments are available
      if(HUP.El.GetId('comments')) {
        var c = getComments();
        var comments = c[0];
        var newComments = c[1];
        var indentComments = c[2];
        parseComments(comments, newComments, indentComments);
        if(newComments.length && HupperPrefs.showqnavbox()) {
          appendNewNotifier(null, null, hupMenu);
        }
      } else {
        if(HupperPrefs.insertnewtexttonode()) {
          var nodes = getNodes();
          parseNodes(nodes[0], nodes[1], new HUPNodeMenus(hupMenu));
          if(nodes[1].length > 0 && HupperPrefs.showqnavbox()) {
            appendNewNotifier('#node-' + nodes[1][0].id, true, hupMenu);
          }
        }
      }
      if(HUP.hp.get.parseblocks()) {
        var blocks = getBlocks();
        parseBlocks(blocks, new HUPBlockMenus(hupMenu), hupMenu);
      }
     //  if(HupperPrefs.hideads()) {
     //    HideHupAds();
     //  }
     //  bindHUPKeys();
      HUP.w.Jumps = new HUPJump(HUP.w, HUP.w.nextLinks);
      TIMER.stop();
      HUP.L.log('initialized', 'Run time: ' + TIMER.finish() + 'ms');
    }
  } catch(e) {
    Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService).logStringMessage('HUPPER: ' + e.message + ', ' + e.lineNumber, + ', ' + e.fileName);
  }
};
HUPPER.init = function() {
  var appcontent = document.getElementById("appcontent");   // browser
  if(appcontent) {
    appcontent.addEventListener("DOMContentLoaded", HUPPER, true);
  }
  var showInStatusbar = HupperPrefs.showinstatusbar();
  var statusbar = document.getElementById('HUP-statusbar');
  statusbar.hidden = !showInStatusbar;
  if(showInStatusbar) {
    new HUPStatusClickHandling(statusbar);
  }
};
window.addEventListener('load', function(){ HUPPER.init(); }, false);
