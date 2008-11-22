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
  trollCommentAnswersClass: 'trollCommentAnswer',
  hupperCommentHeaderClass: 'hupperHeader',
  hupperCommentHeader: 'hupperComment'
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
/**
 * Parse the nodes to mark that the node have unread comment, adds prev and next links to the header
 * @3aram {Array} nodes
 */
var parseNodes = function(nodes, newNodes) {
  var spa = HUP.El.Span(), sp, builder = new NodeHeaderBuilder(), mread, next, prev;
  for(var i = 0, nl = nodes.length, node; i < nl; i++) {
    node = nodes[i];
    if(node.newc) {
      node.index = newNodes.indexOf(node);
      node.next = (node.index == newNodes.length - 1) ? false : newNodes[node.index + 1].id;
      node.previous = (node.index == 0) ? false : newNodes[node.index - 1].id;
      node.addNewNodeLinks();
      HUP.w.nextLinks.push('node-' + node.id);
    }
  }
  if(newNodes.length > 0 && HupperPrefs.showqnavbox()) {
    appendNewNotifier('#node-' + newNodes[0].id, true);
  }
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
  var n = e.target.markNodes;
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
  for(var i = 0, hl = highlightUsers.length; i < hl; i++) {
    bh = highlightUsers[i].split(':');
    hh[bh[0]] = bh[1];
  }
  var builder = new NodeHeaderBuilder(), ps;
  try {

  comments.map(function(C) {
    if(filtertrolls) {
      if(inArray(C.user, trolls)) {
        C.highlightTroll();
      }
    }
    if(filterhuppers) {
      if(inArray(C.user, huppers)) {
        C.highlightHupper();
      }
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
  } catch(e) {HUP.L.log(e.message, e.lineNumber)}
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
var appendNewNotifier = function(link, mark) {
  var hupperBlockId = 'block-hupper-0'; // newNotifier
  if(HUP.El.GetId(hupperBlockId)) {
    return;
  }
  var div = HUP.El.Div();
  var h2 = HUP.El.El('h2');
  var ul = HUP.El.Ul();
  var li = HUP.El.Li();
  var a1, a2, li1, li2;
  HUP.El.AddClass(li, 'leaf');

  HUP.El.Add(HUP.El.Txt('Hupper'), h2);

  a1 = HUP.El.CreateLink(HUP.Bundles.getString('firstNew'), link || '#new');
  li1 = li.cloneNode(true);
  HUP.El.Add(a1, li1);

  HUP.El.AddClass(ul, 'menu');
  HUP.El.Add(li1, ul);

  if(mark) {
    a2 = HUP.El.CreateLink(HUP.Bundles.getString('markAllRead'), 'javascript:void(0)');
    a2.addEventListener('click', markAllNodeAsRead, false);
    a2.markNodes = HUP.markReadNodes;

    li2 = li.cloneNode(true);
    HUP.El.Add(a2, li2);
    HUP.El.Add(li2, ul);
  }
  var blockDiv = div.cloneNode(div);
  var contentDiv = div.cloneNode(div);
  HUP.El.AddClass(contentDiv, 'content');
  HUP.El.Add(ul, contentDiv);

  HUP.El.Add(h2, blockDiv);
  HUP.El.Add(contentDiv, blockDiv);
  blockDiv.setAttribute('id', hupperBlockId);
  HUP.El.AddClass(blockDiv, 'block block-hupper');

  var googleBlock = HUP.El.GetId('block-user-1');
  HUP.El.Insert(blockDiv, googleBlock);
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
  styles += '.' + HupperVars.hupperCommentHeaderClass + ' {background-color: ' + HupperPrefs.huppercolor() + ' !important;}';
  styles += '#filteredhuppers, #filteredtrolls {display:block; !important;}';
  styles += '#tags {background-color:#F6F6EB; }';
  styles += '#tags h4 {margin: 0;padding:0; }';
  styles += '#tags ul {list-style:none;padding:0;margin:0;}#tags li {padding-left:5px;margin:0;}';
  if(HupperPrefs.hilightForumLinesOnHover()) {
    styles += 'tr.odd:hover td, tr.even:hover {background-color: #D8D8C4;}';
  }
  styles += '.hnew { color: red; font-weight: bold; }';
  styles += '.nnew { float:right; }';
  styles += '.nnew, .nnew a { font-size:10px; font-weight: normal; }';
  styles += '.nnew * { margin-left: 2px; margin-right: 2px; }';
  styles += '.hnav { float: right; padding-right: 5px; }';
  styles += '.hnav * { margin-left: 2px; margin-right: 2px; }';
  styles += '.submitted { padding: 2px !important; }';
  styles += '.mark { cursor: pointer; color: #000; }';
  styles += '.hidden {display: none;}';

  var st = HUP.El.El('style');
  st.setAttribute('type', 'text/css');
  HUP.El.Add(HUP.El.Txt(styles), st);
  HUP.El.Add(st, HUP.El.GetFirstTag('head'));
};
/**
 * Class to create and manipulate DOM elements
 * @constructor
 */
var Elementer = function() {
  this.doc = HUP.w;
  this.li = this.doc.createElement('li');
  this.ul = this.doc.createElement('ul');
  this.div = this.doc.createElement('div');
  this.span = this.doc.createElement('span')
  this.a = this.doc.createElement('a')
  this.img = this.doc.createElement('img')
  this.GetBody();
}
Elementer.prototype = {
  /**
    * Creates an 'li' element
    * @return Li element
    * @type Element
    */
  Li: function() {
    return this.li.cloneNode(true);
  },
  /**
    * Creates an 'ul' element
    * @return Ul element
    * @type Element
    */
  Ul: function() {
    return this.ul.cloneNode(true);
  },
  /**
    * Creates an 'div' element
    * @return Div element
    * @type Element
    */
  Div: function() {
    return this.div.cloneNode(true);
  },
  /**
    * Creates an 'span' element
    * @return Span element
    * @type Element
    */
  Span: function() {
    return this.span.cloneNode(true);
  },
  /**
    * Creates an 'a' element
    * @return A element
    * @type Element
    */
  A: function() {
    return this.a.cloneNode(true);
  },
  /**
    * Creates an 'img' element
    * @param {String} src source of the image
    * @param {String} alt image alternate text
    * @return Img element
    * @type Element
    */
  Img: function(src, alt) {
    var img = this.img.cloneNode(true);
    img.setAttribute('src', src);
    img.setAttribute('alt', alt);
    return img;
  },
  /**
    * Creates a specified element
    * @param {String} el type of element
    * @return Li element
    * @type Element
    */
  El: function(el) {
    return this.doc.createElement(el);
  },
  /**
    * Creates a text element
    * @return Text element
    * @type Element
    */
  Txt: function(text) {
    return this.doc.createTextNode(text);
  },
  /**
    * Adds a child element
    * @param {Element} elem addable element
    * @param {Element} parent Element, where the new element will appended
    * @return Returns the element
    * @type Element
    */
  Add: function(elem, parent) {
    parent.appendChild(elem);
    return elem;
  },
  /**
    * Inserts an element before another element
    * @param {Element} elem insertable element
    * @param {Element} before element before the new elem will inserted
    * @return Returns the elem
    * @type Element
    */
  Insert: function(elem, before) {
    before.parentNode.insertBefore(elem, before);
    return elem;
  },
  /**
    * Removes the specified element
    * @param {Element} elem removable childnode
    * @param {Element} parent
    */
  Remove: function(elem, parent) {
    (typeof parent == 'object') ? parent.removeChild(elem) : elem.parentNode.removeChild(elem);
  },
  /**
  * Removes all childnode of the element
  * @param {Element} element
  */
  RemoveAll: function(element) {
    while(element.firstChild) {
      this.Remove(element.firstChild, element);
    }
  },
  /**
    * @param {Element} inner the new content element
    * @param {Element} obj updatable element
    */
  Update: function(inner, obj) {
    this.RemoveAll(obj);
    this.Add(inner, obj);
  },
  /**
    * Collects the elements by their tag name
    * @param {String} tag the elements tag name
    * @param {Element} [parent] parent element
    * @return An array which contains the elements with the given tagname
    * @type {Array}
    */
  GetTag: function(tag, parent) {
    if(typeof parent == 'object') {
      return parent.getElementsByTagName(tag);
    }
    return this.doc.getElementsByTagName(tag);
  },
  /**
    * Returns the first matching tag
    * @see #GetTag
    * @param {String} tag the elements tag name
    * @param {Objecŧ} [parent] parent element
    * @return First element node
    * @type Element
    */
  GetFirstTag: function(tag, parent) {
    return this.GetTag(tag, parent)[0];
  },
  /**
    * Returns the document body
    * @type Element
    */
  GetBody: function() {
    if(this.body) {
      return this.body;
    }
    this.body = this.GetFirstTag('body');
    return this.body;
  },
  /**
    * Returns an element by it's id
    * @param {String} id Id of the element
    * @param {Element} [parent] parent element
    * @type Element
    */
  GetId: function(id, parent) {
    if(!this.elements) {
      this.elements = new Object();
    }
    if(!this.elements[id]) {
      if(typeof parent == 'object') {
        this.elements[id] = parent.getElementById(id);
      } else {
        this.elements[id] = this.doc.getElementById(id);
      }
    }
    return this.elements[id];
  },
  /**
  * Adds the specified class to the element
  * @param {Element} el DOM element
  * @param {String} c Class name
  */
  AddClass: function(el, c) {
    if(!el || !c) return false;
    var curClass = el.getAttribute('class');
    (curClass === null || Stringer.empty(curClass)) ? el.setAttribute('class', c) : el.setAttribute('class', curClass + ' ' + c);
  },
  /**
  * Removes the specified class from the element
  * @param {Element} el DOM element
  * @param {String} c Class name
  */
  RemoveClass: function(el, c) {
    if(!el || !c) return false;
    var cl =  new RegExp('\\b' + c + '\\b');
    el.setAttribute('class', el.getAttribute('class').replace(cl, ''));
  },
  /**
  * Checks that the element has the specified class or not
  * @param {Element} el Element
  * @param {String} c Class name
  * @type {Boolean}
  */
  HasClass: function(el, c) {
    if(!el || !c) return false;
    var cl = new RegExp('\\b' + c + '\\b');
    return cl.test(el.getAttribute('class'));
  },
  /**
  * Collects the elements, which has the specified className (cn) and childNodes of the specified node (par)
  * @param {Element} par parent element node
  * @param {String} cn The className
  * @param {String} el element type
  * @param {Boolean} [force] if the par attribute is false|undefined change the parent element to the body if the value of the variable is true
  * @return the elements which are childnodes of the parent and has the specified classname
  * @type {Array}
  */
  GetByClass: function(par, cn, el, force) {
    el = el ? el.toUpperCase() : el = '*';
    if(!par) {
      if(force == true) {
        par = this.GetBody();
      } else {
        return new Array();
      }
    }
    var out = new Array();
    // try to use the native getElementsByClassName method
    try {
      var ts = par.getElementsByClassName(cn);
      for(var i = 0, tsl = ts.length; i < tsl; i++) {
        if(ts[i].tagName == el) {
          out.push(ts[i]);
        }
      }
    } catch(e) {
      var ts = this.GetTag(el, par);
      for(var i = 0, tsl = ts.length; i < tsl; i++) {
        if(this.HasClass(ts[i], cn)) {
          out.push(ts[i]);
        }
      }
    }
    return out;
  },
  /**
   * @param {Element} par parent element node
   * @param {String} attr attribitue name
   * @param {String} [val] value of the attribute
   * @param {String} el element type
   * @param {Boolean} [force] if the par attribute is false|undefined change the parent element to the body if the value of the variable is true
   * @return the elements which are childnodes of the parent and has the specified attribute
   * @type Array
   */
  GetByAttrib: function(par, el, attr, val, force) {
    el = el ? el.toUpperCase() : el = '*';
    if(!par) {
      if(force == true) {
        par = this.GetBody();
      } else {
        return new Array();
      }
    }
    var out = new Array();
    var ts = this.GetTag(el, par);
    for(var i = 0, tsl = ts.length; i < tsl; i++) {
      if(this.HasAttr(ts[i], attr, val)) {
        out.push(ts[i]);
      }
    }
    return out;
  },
  /**
   * @param {Element} el an element
   * @param {String} attr name of the attribute
   * @param {String} [val] value of the attribute
   * @returns true if the element has the attribute (if value specified the attribute value also checked)
   * @type {Boolean}
   */
  HasAttr: function(el, attr, val) {
    var a = el.getAttribute(attr);
    if(typeof val == 'string') {
      return (typeof a != 'undefined' && a == val);
    } else {
      return (typeof a != 'undefined');
    }
  },
  /**
    * @param {String} text link content
    * @param {String} [href] url of the link
    * @return link object
    * @type Element
    */
  CreateLink: function(text, href) {
    var l = this.A();
    if(href) {
      l.setAttribute('href', href);
    }
    this.Add(this.Txt(text), l)
    return l;
  }
};
var Stringer = {
  trim: function(str) {
    return str.replace(/^\s+|\s+$/g, '');
  },
  empty: function(str) {
    return (this.trim(str) == '');
  }
}
/**
 * Make links from the block titles
 * @constructor
 */
var makeTitleLinks = function() {
  /**
   * Compose the title link
   * @param {String} contId Id of the title container div
   * @param {String} url the url of the title
   */
  var makeTitle = function(contId, url) {
    var titleCont = HUP.El.GetId(contId);
    if(titleCont) {
      var t = HUP.El.GetFirstTag('h2', titleCont);
      HUP.El.Update(HUP.El.CreateLink(t.innerHTML, url), t);
    }
  }
/**
   * Title creator functions
   */
  var boxes = {
    wiki: {
      id: 'block-aggregator-feed-3',
      url: 'http://wiki.hup.hu'
    },
    blog: {
      id: 'block-blog-0',
      url: '/blog'
    },
    search: {
      id: 'block-search-0',
      url: '/search'
    },
    poll: {
      id: 'block-poll-40',
      url: '/poll'
    },
    flickr: {
      id: 'block-aggregator-feed-40',
      url: 'http://www.flickr.com/photos/h_u_p/'
    },
    temak: {
      id: 'block-tagadelic-1',
      url: '/temak'
    },
    tracker: {
      id: 'block-comment-0',
      url: '/tracker'
    }
  };
  for(var box in boxes) {
    makeTitle(boxes[box].id, boxes[box].url);
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
var bindHUPKeys = function() {
  HUP.w.addEventListener('keyup', function(event) {
//  if(event.shiftKey && event.altKey) {
    switch(event.keyCode) {
      case 78: // n
        // next
        HUPJump.next();
        break;
      case 77: // m
        // prev
        HUPJump.prev();
        break;
    }
  },
    false);
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
  ids.map(function(ad) {
    if(ad) {
      HUP.El.AddClass(ad, 'hidden');
    }
  });
};
/**
 * @param {Object} event
 */
var HUPStatusClickHandling = function(ob) {
  this.statusBar = ob;
  if(!this.statusBar) { return; }
  this.observe();
};
HUPStatusClickHandling.prototype = {
  st: null,
  statusBar: null,
  /**
   * add the event handler to the statusbar icon
   */
  observe: function() {
    var _this = this;
    this.statusBar.addEventListener('click', function(event){_this.click(event)}, false);
    if(this.st == 2) {
      this.statusBar.addEventListener('dblclick', function(event){_this.click(event)}, false);
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
  if(/^https?:\/\/(?:www\.)?hup\.hu/.test(ww.location.href)) {
    var TIMER = new Timer();
    /**
     * A unique global object to store all global objects/array/... of the Hupper Extension
     */
    HUP = {};
    // HUP document object
    HUP.w = ww;
    // Elementer
    HUP.El = new Elementer();
    // Logger
    HUP.L = new HLog();
    // Lang stuffs
    HUP.Bundles = document.getElementById('hupper-bundles');
    // Stores the mark as read nodes
    HUP.markReadNodes = new Array();
    HUP.w.nextLinks = new Array();
    addHupStyles();
    // Create links from the titles
    makeTitleLinks();
    // if comments are available
    if(HUP.El.GetId('comments')) {
      var c = getComments();
      comments = c[0];
      newComments = c[1];
      indentComments = c[2];
      parseComments(comments, newComments, indentComments);
      if(newComments.length && HupperPrefs.showqnavbox()) {
        appendNewNotifier();
      }
    } else {
      if(HupperPrefs.insertnewtexttonode()) {
        var nodes = getNodes();
        parseNodes(nodes[0], nodes[1]);
      }
    }
    if(HupperPrefs.hideads()) {
      HideHupAds();
    }
//    bindHUPKeys();
    HUP.w.Jumps = new HUPJump(HUP.w, HUP.w.nextLinks);
    TIMER.stop();
    HUP.L.log('initialized', 'Run time: ' + TIMER.finish() + 'ms');
  }
  } catch(e) {
    Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService).logStringMessage('HUPPER: ' + e.message + ', ' + e.lineNumber);
  }
};
HUPPER.init = function() {
  var appcontent = document.getElementById("appcontent");   // browser
  if(appcontent) {
    appcontent.addEventListener("DOMContentLoaded", HUPPER, true);
  }
  new HUPStatusClickHandling(document.getElementById('HUP-statusbar'));
  if(document.getElementById('HUP-toolbar-button')) {
    new HUPStatusClickHandling(document.getElementById('HUP-toolbar-button'));
  }
};
window.addEventListener('load', function(){ HUPPER.init(); }, false);
