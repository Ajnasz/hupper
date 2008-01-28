/**
 * hupper.js
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
 * @version 0.0.4.7
 * @licence General Public Licence v2
 */
var HLog = function()
{
  this.s = this.serv();
};
HLog.prototype = 
{
  // mozilla log service
  s: null,
  msg: null,
  serv: function()
  {
    return Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
  },
  /**
   * @param {String}
   */
  log: function()
  {
    this.msg = new String();
    for(var i = 0; i < arguments.length; i++) 
    {
      this.msg += ', ' + arguments[i];
    }
    try 
    {
      this.s.logStringMessage('HUPPER: ' + this.msg.replace(/^, /, ''));
    } 
    catch(e) 
    {
      // alert(this.msg.join(', '));
      // alert(this.msg);
    };
  }
};
/**
 * Namespace, to store the static variables
 */
var HupperVars =
{
  trollCommentHeaderClass: 'trollHeader',
  trollCommentClass: 'trollComment',
  hupperCommentHeaderClass: 'hupperHeader',
  hupperCommentHeader: 'hupperComment'
};
/**
 * Namespace, which is used to returns the preferences value
 */
var HupperPrefs = 
{
  // pref types: BoolPref, CharPref, IntPref
  // http://developer.mozilla.org/en/docs/Code_snippets:Preferences
  prefManager: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch),
  /**
   * @return {Array} The returned array contains the names of the trolls
   */
  trolls: function()
  {
    var trolls = this.prefManager.getCharPref('extensions.hupper.trolls');
    return trolls.split(',');
  },
  /**
   * @return {String} Hexa code color
   */
  trollcolor: function()
  {
    return this.prefManager.getCharPref('extensions.hupper.trollcolor');
  },
  /**
   * @return {Boolean}
   */
  filtertrolls: function()
  {
    return this.prefManager.getBoolPref('extensions.hupper.filtertrolls');
  },
  /**
   * @return {String} hide, hilight
   */
  trollfiltermethod: function()
  {
    // hide, hilight
    return this.prefManager.getCharPref('extensions.hupper.trollfiltermethod');
  },
  /**
   * @return {Array} The returned array contains the names of the huppers
   */
  huppers: function()
  {
    var huppers = this.prefManager.getCharPref('extensions.hupper.huppers');
    return huppers.split(',');
  },
  /**
   * @return {String} Hexa code color
   */
  huppercolor: function()
  {
    return this.prefManager.getCharPref('extensions.hupper.huppercolor');
  },
  /**
   * @return {Boolean}
   */
  filterhuppers: function()
  {
    return this.prefManager.getBoolPref('extensions.hupper.filterhuppers');
  },
  /**
   * @return {Boolean}
   */
  replacenewcommenttext: function()
  {
    return this.prefManager.getBoolPref('extensions.hupper.replacenewcommenttext');
  },
  /**
   * @return {String}
   */
  newcommenttext: function()
  {
    return this.prefManager.getCharPref('extensions.hupper.newcommenttext');
  },
  /**
   * @return {Boolean}
   */
  prevnextlinks: function()
  {
    return this.prefManager.getBoolPref('extensions.hupper.prevnextlinks');
  },
  /**
   * @return {String}
   */
  tags: function()
  {
    return this.prefManager.getCharPref('extensions.hupper.tags');
  },
  /**
   * @return {Boolean}
   */
  extraCommentLinks: function()
  {
    return this.prefManager.getBoolPref('extensions.hupper.extracommentlinks');
  },
  /**
   * @return {Boolean}
   */
  hilightForumLinesOnHover: function()
  {
    return this.prefManager.getBoolPref('extensions.hupper.hilightforumlinesonhover');
  },
  /**
   * @return {Boolean}
   */
  insertPermalink: function()
  {
    return this.prefManager.getBoolPref('extensions.hupper.insertpermalink');
  },
  /**
   * @return {Boolean}
   */
  insertnewtexttonode: function()
  {
    return this.prefManager.getBoolPref('extensions.hupper.insertnewtexttonode');
  },
  /**
   * @return {Boolean}
   */
  fadeparentcomment: function()
  {
    return this.prefManager.getBoolPref('extensions.hupper.fadeparentcomment');
  },
  /**
   * @return {Boolean}
   */
  showqnavbox: function()
  {
    return this.prefManager.getBoolPref('extensions.hupper.showqnavbox');
  }
};
/**
 * Namespace to build links, lists etc.
 */
var nodeHeaderBuilder = function()
{
  var spa = HUP.El.Span();
  var listItem = HUP.El.Li();
  var a = HUP.El.A();
  
  // Localized strings
  var firstLinkText = HUP.Bundles.getString('FirstLinkText');
  var lastLinkText = HUP.Bundles.getString('LastLinkText');
  var prevLinkText = HUP.Bundles.getString('PrevLinkText');
  var nextLinkText = HUP.Bundles.getString('NextLinkText');
  var topLinkText = HUP.Bundles.getString('TopLinkText');
  var backLinkText = HUP.Bundles.getString('BackLinkText');
  var parentLinkText = HUP.Bundles.getString('ParentLinkText');
  
  // Footer text nodes
  var parentTextItem = HUP.El.Txt(parentLinkText);
  var permaTextItem = HUP.El.Txt('permalink');
  var topTextItem = HUP.El.Txt(topLinkText);
  var backTextItem = HUP.El.Txt(backLinkText);
  
  // Title text nodes
  var fit = HUP.El.Txt(firstLinkText);
  var lat = HUP.El.Txt(lastLinkText);
  var prt = HUP.El.Txt(prevLinkText);
  var net = HUP.El.Txt(nextLinkText);
  var newCt = HUP.El.Txt(HupperPrefs.newcommenttext());
  
  // Mark as read node
  var markR = a.cloneNode(true);
  HUP.El.Add(HUP.El.Txt(HUP.Bundles.getString('markingText')), markR);
  HUP.El.AddClass(markR, 'marker');
  
  return {
    /**
     * Builds a link node
     * 
     * @param {Object} tn A textNode
     * @param {String} path Path to point the link
     * @return {Object}
     */
    buildLink: function(tn, path)
    {
      var l = a.cloneNode(true);
      HUP.El.Add(tn, l);
      l.setAttribute('href', path);
      return l;
    },
    /**
     * Builds a link which points to the specified path with the next link str
     * 
     * @param {String} path Path for the next node
     * @return {Object}
     */
    buildNextLink: function(path)
    {
      return this.buildLink(net.cloneNode(true), '#' + path);
    },
    /**
     * Builds a link which points to the specified path with the prev link text
     * 
     * @param {String} path Path for the next node
     * @return {Object}
     */
    buildPrevLink: function(path)
    {
      return this.buildLink(prt.cloneNode(true), '#' + path);
    },
    /**
     * Builds a text node with the first text
     * 
     * @return {Object} Span element within first link text
     */
    buildFirstLink: function()
    {
      var nsp = spa.cloneNode(true);
      HUP.El.Add(fit, nsp);
      return nsp;
    },
    /**
     * Builds a text node with the last text
     * 
     * @return {Object} Span element with within last link text
     */
    buildLastLink: function()
    {
      var nsp = spa.cloneNode(true);
      HUP.El.Add(lat, nsp);
      return nsp;
    },
    /**
     * Builds a mark as read linknode
     * @return {Object} Link (a) element
     */
    buildMarker: function(path, i)
    {
      var mr = markR.cloneNode(true);
      mr.setAttribute('path', path);
      mr.setAttribute('id', 'marker-' + i);
      mr.addEventListener('click', markNodeAsRead, true);
      return mr;
    },
    /**
     * Builds a text node with [new] text
     * @return {Object} Span element, within a next link
     */
    buildNewText: function()
    {
      var nsp = spa.cloneNode(true);
      HUP.El.AddClass(nsp, 'hnew');
      HUP.El.Add(newCt.cloneNode(true), nsp);
      return nsp;
    },
    /**
     * Builds an invisible link with a name attribute
     * @param {Number} i id of the node
     * @return {Object} Link (a) element
     */
    buildNameLink: function(i)
    {
      var liaC = a.cloneNode(true);
      liaC.setAttribute('name', 'n-' + i);
      return liaC;
    },
    /**
     * Builds a link node which points to the top of the page
     * @return {Object} Li element, within a link which points to the top of the page
     */
    buildComExtraTop: function()
    {
      var tmpList = listItem.cloneNode(true);
      HUP.El.Add(this.buildLink(topTextItem.cloneNode(true), '#top'), tmpList);
      return tmpList;
    },
    /**
     * Builds a link node which points to the previous page
     * @return {Object} Li element, which point to the previous history page
     */
    buildComExtraBack: function()
    {
      var tmpList = listItem.cloneNode(true);
      HUP.El.Add(this.buildLink(backTextItem.cloneNode(true), 'javascript:history.back();'), tmpList);
      return tmpList;
    },
    /**
     * Builds a link node which points to the comment's parent comment
     * @param {String} parent The parent comment id
     * @return {Object} Li element, which points to the parent comment
     */
    buildComExtraParent: function(parent)
    {
      var tmpList = listItem.cloneNode(true);
      var link = this.buildLink(parentTextItem.cloneNode(true), '#' + parent.id);
      // if fading enabled, add an event listener, which will fades the parent node
      if(HupperPrefs.fadeparentcomment()) 
      {
        link.addEventListener('click', function(e)
        {
          new Transform(e.target.n.comment);
        }, false);
        link.n = parent;
      }
      HUP.El.Add(link, tmpList);
      return tmpList;
    },
    /**
     * Builds a link with a permalink text
     * @param {String} cid
     * @return {Object}
     */
    buildComExtraPerma: function(cid)
    {
      var tmpList = listItem.cloneNode(true);
      HUP.El.Add(this.buildLink(permaTextItem.cloneNode(true), '#' + cid), tmpList);
      return tmpList;
    }
  };
};
/**
 * Collects the comment nodes and filter them into another 2 array too by their properties: comments, newComments, indentComments the indenComments just contains an index which specify the comment index in the comments array
 * @var {Array} comments an array, which conatains all comment
 * @var {Array} indentComments an array, which contains only the indented comments
 * @var {Array} newComments an array, which contains only the unread comments
 * @var {Object} comment an object which contains all data of the comment
 * @var {Object} comment.comment the whole node which contains the comment
 * @var {Object} comment.header comment node first childNode with 'submitted' className
 * @var {Object} comment.footer comment node first childnode with 'link' className
 * @var {Object} comment.cont content node of the comment
 * @var {Array} comment.newComm an array with the node which contains the 'új' string (if exists, else empty array)
 * @var {Object, Array} comment.footerLinks a node which contains the links in the footer
 * @var {Number} comment.id id of the comment
 * @var {Number} comment.indent indetion level of the comment
 * @var {String} comment.user the name of the user who sent the comment
 * @var {Object} comment.parent parent node of the comment
 * @return {Array}
 */
var getComments = function()
{
  var COMS = HUP.El.GetId('comments');
  if(!COMS) 
  {
    return false;
  }
  var ds = HUP.El.Tag('div', COMS);
  var header, footer, el, comments = new Array(), newComm, parentComment, indentComments = new Array(), newComments = new Array(), dsl = ds.length, i, cont;
  for(i = 0; i < dsl; i++) 
  {
    if(HUP.El.HasClass(ds[i], 'comment')) 
    {
      header = HUP.El.GetByClass(ds[i], 'submitted', 'div')[0];
      footer = HUP.El.GetByClass(ds[i], 'link', 'div')[0];
      cont = HUP.El.GetByClass(ds[i], 'content', 'div')[0];
      newComm = HUP.El.GetByClass(ds[i], 'new', 'span');
      comment = 
      {
        comment: ds[i],
        header: header,
        footer: footer,
        cont: cont,
        newComm: (newComm.length) ? newComm[0] : false,
        footerLinks: HUP.El.Tag('ul', footer)[0],
        id: ds[i].previousSibling.previousSibling.id,
        indent: getIndent(ds[i]),
        user: (typeof header.childNodes[1] != 'undefined') ? header.childNodes[1].innerHTML : header.innerHTML.replace(/[^\(]+\( ([^ ]+).*/, '$1')
      };
      parentComment = getParentComment(indentComments, comment);
      comment.parent = (typeof parentComment != 'undefined' && parentComment !== false) ? comments[parentComment] : -1;
      if(typeof indentComments[comment.indent] == 'undefined') 
      {
        indentComments[comment.indent] = new Array();
      }
      indentComments[comment.indent].push(comments.length);
      comments.push(comment);
      if(comment.newComm) 
      {
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
 * @return {Array}
 */
var getNodes = function()
{
  var c = HUP.El.GetId('content-both');
  var ds = HUP.El.Tag('div', c);
  var nodes = new Array(), newnodes = new Array(), node = {}, dsl = ds.length, i, header, submitData, cont, footer;
  for(i = 0; i < dsl; i++) 
  {
    if(HUP.El.HasClass(ds[i], 'node')) 
    {
      header = ds[i].childNodes[1];
      submitData = ds[i].childNodes[3];
      cont = ds[i].childNodes[5];
      footer = HUP.El.HasClass(ds[i].childNodes[7], 'links') ? ds[i].childNodes[7] : false;
      node = 
      {
        header: header,
        path: header.firstChild.getAttribute('href'),
        submitData: submitData,
        cont: cont,
        footer: footer,
        newc: HUP.El.GetByClass(footer, 'comment_new_comments', 'li').length > 0 ? true : false
      };
      node.newc ? nodes.push(node) && newnodes.push(node) : nodes.push(node);
    }
  }
  return new Array(nodes, newnodes);
};
/**
 * Parse the nodes to mark that the node have unread comment, adds prev and next links to the header
 * @param {Array} nodes
 */
var parseNodes = function(nodes)
{
  var spa = HUP.El.Span(), sp, builder = new nodeHeaderBuilder(), nl = nodes.length, i, mread;
  for(i = 0; i < nl; i++) 
  {
    if(nodes[i].newc) 
    {
      sp = spa.cloneNode(true);
      HUP.El.AddClass(sp, 'nnew');
      mread = builder.buildMarker(nodes[i].path, i);
      HUP.markReadNodes.push(mread);
      HUP.El.Add(mread, sp);
      HUP.El.Add(builder.buildNewText(), sp);
      HUP.El.Insert(builder.buildNameLink(i), nodes[i].header);
      
      if(i > 0) 
      {
        HUP.El.Add(builder.buildPrevLink('n-' + (i - 1)), sp);
      }
      else 
      {
        HUP.El.Add(builder.buildFirstLink(), sp);
      }
      if(i < nl - 1) 
      {
        HUP.El.Add(builder.buildNextLink('n-' + (i + 1)), sp);
      }
      else 
      {
        HUP.El.Add(builder.buildLastLink(), sp);
      }
      HUP.El.Insert(sp, nodes[i].header.firstChild);
    }
  }
};
/**
 * Send an AJAX HEAD request to the server, to remove the unread nodes
 * @param {Object} e Event object
 * @see HupAjax
 */
var markNodeAsRead = function(e)
{
  new HupAjax(
  {
    method: 'head',
    url: 'http://hup.hu' + this.getAttribute('path').replace(/^\s*(.+)\s*$/, '$1'),
    successHandler: function()
    {
      this.el.innerHTML = HUP.Bundles.getString('markingSuccess');
      if(this.el.nextSibling.getAttribute('class') == 'hnew') 
      {
        HUP.El.Remove(this.el.nextSibling, this.el.parentNode);
      }
    },
    loadHandler: function()
    {
      var img = HUP.El.Img();
      img.setAttribute('src', 'chrome://hupper/skin/ajax-loader.gif');
      img.setAttribute('alt', 'marking...');
      HUP.El.RemoveAll(this.el);
      HUP.El.Add(img, this.el);
    },
    errorHandler: function()
    {
      var t = HUP.El.Txt(HUP.Bundles.getString('markingError'));
      HUP.El.RemoveAll(this.el);
      HUP.El.Add(t, this.el);
    }
  }, e.target);
};
var markAllNodeAsRead = function(e)
{
  var n = e.target.markNodes;
  var d = document || HUP.w;
  for(var i = 0; i < n.length; i++) 
  {
    var click = d.createEvent("MouseEvents");
    click.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    n[i].dispatchEvent(click);
  }
};
/**
 * Checks that the arrray contains the specified element
 * @param {String,Number,Array,Object} value
 * @return {Boolean}
 */
var inArray = function(value, array)
{
  var i = array.length - 1;
  while(array[i]) 
  {
    if(array[i] === value) 
    {
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
var parseComments = function(comments, newComments, indentComments)
{
  var replacenewcommenttext = HupperPrefs.replacenewcommenttext();
  var prevnextlinks = HupperPrefs.prevnextlinks();
  var trolls = HupperPrefs.trolls();
  var filtertrolls = HupperPrefs.filtertrolls();
  var huppers = HupperPrefs.huppers();
  var filterhuppers = HupperPrefs.filterhuppers();
  var extraCommentLinks = HupperPrefs.extraCommentLinks();
  var insertPermalink = HupperPrefs.insertPermalink();
  
  var builder = new nodeHeaderBuilder(), ps;
  comments.map(function(C)
  {
    if(filtertrolls) 
    {
      if(inArray(C.user, trolls)) 
      {
        HUP.El.AddClass(C.comment, HupperVars.trollCommentClass);
        HUP.El.AddClass(C.header, HupperVars.trollCommentHeaderClass);
      }
    }
    if(filterhuppers) 
    {
      if(inArray(C.user, huppers)) 
      {
        HUP.El.AddClass(C.comment, HupperVars.hupperCommentClass);
        HUP.El.AddClass(C.header, HupperVars.hupperCommentHeaderClass);
      }
    }
    if(extraCommentLinks) 
    {
      HUP.El.Add(builder.buildComExtraTop(), C.footerLinks);
      HUP.El.Add(builder.buildComExtraBack(), C.footerLinks);
    }
    if(C.parent != -1) 
    {
      var Bl = builder.buildComExtraParent(C.parent);
      HUP.El.Add(Bl, C.footerLinks);
    }
    if(insertPermalink) 
    {
      HUP.El.Add(builder.buildComExtraPerma(C.id), C.footerLinks);
    }
  });
  if(replacenewcommenttext || prevnextlinks) 
  {
    var spanNode = HUP.El.Span(), tmpSpan1, ncl = newComments.length, i;
    for(i = 0; i < ncl; i++) 
    {
      tmpSpan1 = spanNode.cloneNode(true);
      HUP.El.AddClass(tmpSpan1, 'hnav');
      if(prevnextlinks) 
      {
        if(i > 0) 
        {
          HUP.El.Add(builder.buildPrevLink(newComments[i - 1].id), tmpSpan1);
        }
        else 
        {
          HUP.El.Add(builder.buildFirstLink(), tmpSpan1);
        }
        if(i < ncl - 1) 
        {
          HUP.El.Add(builder.buildNextLink(newComments[i + 1].id), tmpSpan1);
        }
        else 
        {
          HUP.El.Add(builder.buildLastLink(), tmpSpan1);
        }
      }
      if(replacenewcommenttext) 
      {
        HUP.El.Remove(newComments[i].newComm, newComments[i].comment);
        HUP.El.Add(builder.buildNewText(), tmpSpan1);
      }
      HUP.El.Insert(tmpSpan1, newComments[i].header.firstChild);
    }
  }
};
/**
 * @param {Array} indentedComments
 * @param {Object} comment
 * @return {Number,Boolean} returns an array index number or false
 */
var getParentComment = function(indentedComments, comment)
{
  if(comment.indent > 0) 
  {
    return indentedComments[(comment.indent - 1)][(indentedComments[(comment.indent - 1)].length - 1)];
  }
  else 
  {
    return false;
  }
};
/**
 * @param {Object} el
 * @return {Number} how indented the comment
 */
var getIndent = function(el)
{
  var indent = 0;
  while(HUP.El.HasClass(el.parentNode, 'indented')) 
  {
    el = el.parentNode;
    indent++;
  }
  return indent;
};
/**
 * @param {Object} ob transformable object
 */
var Transform = function(ob)
{
  this.ob = ob;
  this.dur = 10;
  this.i = 0;
  this.run(this);
};
/**
 * make the transformation
 * @param {Object} THIS reference to the Transform.prototype object
 */
Transform.prototype.run = function(THIS)
{
  THIS.ob.style.opacity = 0.1 * THIS.i;
  if(THIS.i < THIS.dur) 
  {
    setTimeout(THIS.run, THIS.dur / 0.1, THIS);
    THIS.i++;
  }
};
/**
 * Appends a new link to the top of the page, if there is new comment
 * @param {String} [link]
 */
var appendNewNotifier = function(link, mark)
{
  var hupperBlockId = 'block-hupper-0'; // newNotifier
  if(HUP.El.GetId(hupperBlockId)) 
  {
    return;
  }
  var div = HUP.El.Div();
  var h2 = HUP.El.El('h2');
  var a = HUP.El.A();
  var ul = HUP.El.Ul();
  var li = HUP.El.Li();
  HUP.El.AddClass(li, 'leaf');
  
  HUP.El.Add(HUP.El.Txt('Hupper'), h2);

  a1 = a.cloneNode(a);
  a1.setAttribute('href', (link || '#new'));
  HUP.El.Add(HUP.El.Txt(HUP.Bundles.getString('firstNew')), a1);
  li1 = li.cloneNode(true);
  HUP.El.Add(a1, li1);

  HUP.El.AddClass(ul, 'menu');
  HUP.El.Add(li1, ul);

  if(mark) 
  {
    a2 = a.cloneNode(a);
    a2.addEventListener('click', markAllNodeAsRead, false);
    a2.markNodes = HUP.markReadNodes;
    a2.setAttribute('href', 'javascript:void(0);');
    HUP.El.Add(HUP.El.Txt(HUP.Bundles.getString('markAllRead')), a2);
  
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

  var googleBlock = HUP.El.GetId('block-block-8');
  HUP.El.Insert(blockDiv, googleBlock);
};
/**
 * Adds my own styles to the hup.hu header
 * @param {Object} e event object
 */
var addHupStyles = function(e)
{
  var styles = '';
  switch(HupperPrefs.trollfiltermethod())
  {
    case 'hide':
      styles += '.' + HupperVars.trollCommentClass + ' {display:none !important;}';
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
  if(HupperPrefs.hilightForumLinesOnHover()) 
  {
    styles += 'tr.odd:hover td, tr.even:hover {background-color: #D8D8C4;}';
  }
  styles += 'input, textarea { border: 1px solid #999 !important; padding: 2px !important; margin-bottom: 5px !important; }';
  styles += 'input:focus, textarea:focus { border-color: #000 !important; }';
  styles += '.hnew { color: red; font-weight: bold; }';
  styles += '.nnew { float:right; }';
  styles += '.nnew, .nnew a { font-size:10px; font-weight: normal; }';
  styles += '.nnew * { margin-left: 2px; margin-right: 2px; }';
  styles += '.hnav { float: right; padding-right: 5px; }';
  styles += '.hnav * { margin-left: 2px; margin-right: 2px; }';
  styles += '.submitted { padding: 2px !important; }';
  styles += '.marker { cursor: pointer; color: #000; }';
  
  var st = HUP.El.El('style');
  st.setAttribute('type', 'text/css');
  HUP.El.Add(HUP.El.Txt(styles), st);
  HUP.El.Add(st, HUP.El.Tag('head')[0]);
};
/**
 * Namespace to create and manipulate DOM elements
 * @constructor
 */
var Elementer = function()
{
  var doc = HUP.w;
  var li = doc.createElement('li');
  var ul = doc.createElement('ul');
  var div = doc.createElement('div');
  var span = doc.createElement('span')
  var a = doc.createElement('a')
  var img = doc.createElement('img')
  return {
    /**
     * Creates an 'li' element
     * @return {Object} li element
     */
    Li: function()
    {
      return li.cloneNode(true);
    },
    /**
     * Creates an 'ul' element
     * @return {Object} ul element
     */
    Ul: function()
    {
      return ul.cloneNode(true);
    },
    /**
     * Creates an 'div' element
     * @return {Object} div element
     */
    Div: function()
    {
      return div.cloneNode(true);
    },
    /**
     * Creates an 'span' element
     * @return {Object} span element
     */
    Span: function()
    {
      return span.cloneNode(true);
    },
    /**
     * Creates an 'a' element
     * @return {Object} a element
     */
    A: function()
    {
      return a.cloneNode(true);
    },
    /**
     * Creates an 'img' element
     * @return {Object} img element
     */
    Img: function()
    {
      return img.cloneNode(true);
    },
    /**
     * Creates a specified element
     * @param {String} el type of element
     * @return {Object} li element
     */
    El: function(el)
    {
      return doc.createElement(el);
    },
    /**
     * Creates a text element
     * @return {Object} text element
     */
    Txt: function(text)
    {
      return doc.createTextNode(text);
    },
    /**
     * Adds a child element
     * @param {Object} elem addable element
     * @param {Object} parent Element, where the new element will appended
     * @return {Object} returns the element
     */

    Add: function(elem, parent)
    {
      parent.appendChild(elem);
      return elem;
    },
    /**
     * Inserts an element before another element
     * @param {Object} elem insertable element
     * @param {Object} before element before the new elem will inserted
     * @return {Object} returns the elem
     */
    Insert: function(elem, before)
    {
      before.parentNode.insertBefore(elem, before);
      return elem;
    },
    /**
     * Removes the specified element
     * @param {Object} elem removable childnode
     * @param {Object} parent
     */
    Remove: function(elem, parent)
    {
      if(typeof parent == 'object')
      {
        parent.removeChild(elem);
      }
      else
      {
        elem.parentNode.removeChild(elem);
      }
    },
    /**
    * Removes all childnode of the element
    * @param {Object} element
    */
    RemoveAll: function(element)
    {
      while(element.firstChild) 
      {
        this.Remove(element.firstChild, element);
      }
    },
    /**
     * @param {Object} inner the new content element
     * @param {Object} obj updatable element
     */
    Update: function(inner, obj)
    {
      this.RemoveAll(obj);
      this.Add(inner, obj);
    },
    /**
     * Collects the elements by their tag name
     * @param {String} tag the elements tag name
     * @param {Objecŧ} [parent] parent element
     * @return {Array}
     */
    Tag: function(tag, parent)
    {
      if(typeof parent == 'object')
      {
        return parent.getElementsByTagName(tag);
      }
      return doc.getElementsByTagName(tag);
    },

    /**
     * Returns the document body
     * @return {Object}
     */
    GetBody: function()
    {
      if(this.body)
      {
        return this.body;
      }
      this.body = this.Tag('body')[0];
      return this.body;
    },
    /**
     * Returns an element by it's id
     * @param {String} id Id of the element
     * @param {Object} [parent] parent element
     * @return {Object}
     */
    GetId: function(id, parent)
    {
      if(!this.elements)
      {
        this.elements = new Object();
      }
      if(!this.elements[id])
      {
        if(typeof parent == 'object')
        {
          this.elements[id] = parent.getElementById(id);
        }
        else
        {
          this.elements[id] = doc.getElementById(id);
        }
      }
      return this.elements[id];
    },
    /**
    * Adds the specified class to the element
    * @param {Object} el DOM element
    * @param {String} c Class name
    */
    AddClass: function(el, c)
    {
      var curClass = el.getAttribute('class');
      if(curClass === null) 
      {
        el.setAttribute('class', c);
      }
      else 
      {
        el.setAttribute('class', curClass + ' ' + c);
      }
    },
    /**
    * Removes the specified class from the element
    * @param {Object} el DOM element
    * @param {String} c Class name
    */
    RemoveClass: function(el, c)
    {
      el.setAttribute('class', el.getAttribute('class').replace(c, ''));
    },
    /**
    * Checks that the element has the specified class or not
    * @param {Object} el Element
    * @param {String} c Class name
    * @return {Boolean}
    */
    HasClass: function(el, c)
    {
      if(!el || !c) 
      {
        return false;
      }
      cl = new RegExp('\\b' + c + '\\b');
      return cl.test(el.getAttribute('class'));
    },

    /**
    * Collects the elements, which are has the specified className (cn) and childNodes of the specified node (par)
    * @param {Object} par parent element node
    * @param {String} cn className
    * @param {String} el element type
    * @param {Boolean} [force] if the par attribute is false|undefined change the parent element to the body if the value of the variable is true
    * @return {Array}
    */
    GetByClass: function(par, cn, el, force)
    {
      if(!el) 
      {
        el = '*';
      }
      if(!par) 
      {
        if(force == true) 
        {
          par = this.GetBody();
        }
        else 
        {
          return new Array();
        }
      }
      var ts = this.Tag(el, par), out = new Array(), i, tsl = ts.length;
      for(i = 0; i < tsl; i++) 
      {
        if(this.HasClass(ts[i], cn)) 
        {
          out.push(ts[i]);
        }
      }
      return out;
    },
    /**
     * @param {String} text link content
     * @param {String} href url of the link
     * @param {Object} [params] extra parameters. Format: {paramName: 'paramValue'[, ...]}
     * @return {Object} link object
     */
    createLink: function(text, href, params)
    {
      var l = this.A();
      l.setAttribute('href', href);
      if(typeof this.params == 'object')
      {
        for(par in params)
        {
          if(par == 'class')
          {
            this.AddClass(l, par.class);
          }
          else
          {
            l.setAttribute(par, params[par]);
          }
        }
      }
      this.Add(this.Txt(text), l)
      return l;
    }
  };
};
/**
 * Make links from the block titles
 * @constructor
 */
var makeTitleLinks = function()
{
  for(title in this.titles) {
    this.titles[title](this.makeTitle);
  }
};
makeTitleLinks.prototype = {
  titles: {
    /**
     * title for wiki block
     * @param {Function} makeTitle 
     */
    wiki: function(makeTitle)
    {
      makeTitle('block-aggregator-feed-3', 'http://wiki.hup.hu');
    },
    /**
     * title for blog block
     * @param {Function} makeTitle 
     */
    blog: function(makeTitle)
    {
      makeTitle('block-blog-0', '/blog');
    },
    /**
     * title for search block
     * @param {Function} makeTitle 
     */
    search: function(makeTitle)
    {
      makeTitle('block-search-0', '/search');
    },
    /**
     * title for poll block
     * @param {Function} makeTitle 
     */
    poll: function(makeTitle)
    {
      makeTitle('block-poll-40', '/poll');
    },
    /**
     * title for flickr block
     * @param {Function} makeTitle 
     */
    flickr: function(makeTitle)
    {
      makeTitle('block-aggregator-feed-40', 'http://www.flickr.com/photos/h_u_p/');
    },
    /**
     * title for tag cloud block
     * @param {Function} makeTitle 
     */
    temak: function(makeTitle)
    {
      makeTitle('block-tagadelic-1', '/temak');
    }
  },

  /**
   * Compose the title link
   * @constructor
   * @param {String} contId Id of the title container div
   * @param {String} url the url of the title
   */
  makeTitle: function(contId, url)
  {
    var titleCont = HUP.El.GetId(contId);
    if(titleCont)
    {
      var title = HUP.El.Tag('h2', titleCont)[0];
      HUP.El.Update(HUP.El.createLink(title.innerHTML, url), title);
    }
  }
};
/**
 * Initialization function, runs when the page is loaded
 * @param {Object} e window load event object
 */
var HUPPER = function(e)
{
  var ww = e.originalTarget;
  if(ww.location.href.match(/^https?:\/\/(?:www\.)?hup\.hu/)) 
  {
    HUP = {};
    // HUP document obj
    HUP.w = ww;
    // Elementer
    HUP.El = new Elementer();
    // Logger
    HUP.L = new HLog();
    // Lang stuffs
    HUP.Bundles = document.getElementById('hupper-bundles');
    HUP.markReadNodes = new Array();
    addHupStyles();
    var body = HUP.El.GetBody();
    var p = HUP.El.GetId('primary');
    HUP.El.Tag('a', p)[0].name = 'top';
    new makeTitleLinks();
    if(HUP.El.GetId('comments')) 
    {
      var c = getComments();
      comments = c[0];
      newComments = c[1];
      indentComments = c[2];
      parseComments(comments, newComments, indentComments);
      if(newComments.length && HupperPrefs.showqnavbox()) 
      {
        appendNewNotifier();
      }
    }
    else 
    {
      if(HupperPrefs.insertnewtexttonode()) 
      {
        var newNodes = getNodes()[1];
        parseNodes(newNodes);
        if(newNodes.length > 0 && HupperPrefs.showqnavbox()) 
        {
          appendNewNotifier('#n-0', true);
        }
      }
    }
    HUP.L.log('initialized');
  }
};
