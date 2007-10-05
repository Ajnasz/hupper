/**
 * hupper.js
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu 
 * @version 0.0.4.7
 * @licence General Public Licence v2
 */
HLog = {
  // mozilla log service
  serv: Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService),
  /**
   * @param {String} message
   */
  log: function(message)
  {
    this.serv.logStringMessage('HUPPER: '+message);
  }
};
/**
 * Namespace, which is used to returns the preferences value
 */
HupperPrefs = {
  // pref types: BoolPref, CharPref, IntPref
  // http://developer.mozilla.org/en/docs/Code_snippets:Preferences
  prefManager: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch),
  /**
   * @return {Array} the returned array contains the names of the trolls
   */
  trolls: function()
  {
    var trolls = this.prefManager.getCharPref('extensions.hupper.trolls');
    return trolls.split(',');
  },
  /**
   * @return {String} hexa code color
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
   * @return {Array} the returned array contains the names of the huppers
   */
  huppers: function()
  {
    var huppers = this.prefManager.getCharPref('extensions.hupper.huppers');
    return huppers.split(',');
  },
  /**
   * @return {String} hexa code color
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
  }
};
/**
 * Namespace to build links, lists etc.
 */
var nodeHeaderBuilder = function()
{
  var spa = w.createElement('span');
  var listItem = w.createElement('li');
  var a = w.createElement('a');

  var firstLinkText = hupperBundles.getString('FirstLinkText');
  var lastLinkText = hupperBundles.getString('LastLinkText');
  var prevLinkText = hupperBundles.getString('PrevLinkText');
  var nextLinkText = hupperBundles.getString('NextLinkText');
  var topLinkText = hupperBundles.getString('TopLinkText');
  var backLinkText = hupperBundles.getString('BackLinkText');
  var parentLinkText = hupperBundles.getString('ParentLinkText');

  var parentTextItem = w.createTextNode(parentLinkText);
  var permaTextItem = w.createTextNode('permalink');
  var topTextItem = w.createTextNode(topLinkText);
  var backTextItem = w.createTextNode(backLinkText);

  var fit = w.createTextNode(firstLinkText);
  var lat = w.createTextNode(lastLinkText);
  var prt = w.createTextNode(prevLinkText);
  var net = w.createTextNode(nextLinkText);
  var newCt = w.createTextNode(HupperPrefs.newcommenttext());

  var markR = a.cloneNode(true);
  markR.appendChild(w.createTextNode(hupperBundles.getString('markingText')));
  markR.setAttribute('class', 'marker');

  return {
    /**
     * Builds a link node
     * @param {Object} tn a textNode
     * @param {String} path path to point the link
     * @return {Object}
     */
    buildLink: function(tn, path)
    {
      var l = a.cloneNode(true);
      l.appendChild(tn);
      l.setAttribute('href', path);
      return l;
    },
    /**
     * Builds a link which points to the specified path with the next link str
     * @param {String} path Path for the next node
     * @return {Object}
     */
    buildNextLink: function(path)
    {
      return this.buildLink(net.cloneNode(true), '#' + path);
    },
    /**
     * Builds a link which points to the specified path with the prev link text 
     * @param {String} path Path for the next node
     * @return {Object}
     */
    buildPrevLink: function(path)
    {
      return this.buildLink(prt.cloneNode(true), '#' + path);
    },
    /**
     * Builds a text node with the first text
     * @return {Object}
     */
    buildFirstLink: function()
    {
      var nsp = spa.cloneNode(true);
      nsp.appendChild(fit);
      return nsp;
    },
    /**
     * Builds a text node with the last text
     * @return {Object}
     */
    buildLastLink: function()
    {
      var nsp = spa.cloneNode(true);
      nsp.appendChild(lat);
      return nsp;
    },
    /**
     * Builds a mark as read linknode
     * @return {Object}
     */
    buildMarker: function(path)
    {
      var mr = markR.cloneNode(true);
      mr.setAttribute('path', path);
      mr.addEventListener('click', markNodeAsRead, true);
      return mr;
    },
    /**
     * Builds a text node with [new] text
     * @return {Object}
     */
    buildNewText: function()
    {
      var nsp = spa.cloneNode(true);
      nsp.setAttribute('class', 'hnew');
      nsp.appendChild(newCt.cloneNode(true));
      return nsp;
    },
    /**
     * Builds an invisible link with a name attribute
     * @param {Number} i id of the node
     * @return {Object}
     */
    buildNameLink: function(i)
    {
      var liaC = a.cloneNode(true);
      liaC.setAttribute('name', 'newhupnode'+i);
      return liaC;
    },
    /**
     * Builds a link node which points to the top of the page
     * @return {Object}
     */
    buildComExtraTop: function()
    {
      var tmpList = listItem.cloneNode(true);
      tmpList.appendChild(this.buildLink(topTextItem.cloneNode(true), '#top'));
      return tmpList;
    },
    /**
     * Builds a link node which points to the previous page
     * @return {Object}
     */
    buildComExtraBack: function()
    {
      var tmpList = listItem.cloneNode(true);
      tmpList.appendChild(this.buildLink(backTextItem.cloneNode(true), 'javascript:history.back();'));
      return tmpList;
    },
    /**
     * Builds a link node which points to its parent node
     * @param {String} parent the parent comment id
     * @return {Object}
     */
    buildComExtraParent: function(parent)
    {
      var tmpList = listItem.cloneNode(true);
      tmpList.appendChild(this.buildLink(parentTextItem.cloneNode(true), '#' + parent));
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
      tmpList.appendChild(this.buildLink(permaTextItem.cloneNode(true), '#' + cid));
      return tmpList;
    }
  }
};
/**
 * Collects the elements, which are has the specified className (cn) and childNodes of the specified node (par)
 * @param {Object} par parent element node
 * @param {String} cn className
 * @param {String} el element type
 * @param {Boolean} [force] if the par attribute is false|undefined change the parent element to the body if the value of the variable is true
 * @return {Array}
 */
var getElementsByClassName = function(par, cn, el, force)
{
  if(!el)
  {
      el = 'div';
  }
  if(!par)
  {
    if(force == true)
    {
      par = w.getElementsByTagName('body')[0];
    }
    else
    {
      return Array();
    }
  }
  var ts = par.getElementsByTagName(el), out = Array(), i, tsl = ts.length;;
  for(i = 0; i < tsl; i++)
  {
    if(hasClass(ts[i], cn))
    {
      out.push(ts[i]);
    }
  }
  return out;
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
  var COMS = w.getElementById('comments');
  if(!COMS)
  {
    return false;
  }
  var ds = COMS.getElementsByTagName('div');
  var header, footer, el, comments = Array(), newComm, parentComment, indentComments = Array(), newComments = Array(), dsl = ds.length, i;
  for(i = 0; i < dsl; i++)
  {
    if(hasClass(ds[i], 'comment'))
    {
      header = getElementsByClassName(ds[i],'submitted', 'div')[0];
      footer = getElementsByClassName(ds[i], 'link', 'div')[0];
      newComm = getElementsByClassName(ds[i], 'new', 'span');
      comment = {
        comment: ds[i],
        header: header,
        footer: footer,
        newComm: (newComm.length) ? newComm[0] : false,
        footerLinks: footer.getElementsByTagName('ul')[0],
        id: ds[i].previousSibling.previousSibling.id,
        indent: getIndent(ds[i]),
        user: (typeof header.childNodes[1] != 'undefined') ?  header.childNodes[1].innerHTML : header.innerHTML.replace(/[^\(]+\( ([^ ]+).*/, '$1')
      }
      parentComment = getParentComment(indentComments, comment);
      comment.parent = (typeof parentComment != 'undefined' && parentComment !== false) ? comments[parentComment].id : -1;
      if(typeof indentComments[comment.indent] == 'undefined')
      {
        indentComments[comment.indent] = Array();
      }
      indentComments[comment.indent].push(comments.length);
      comments.push(comment);
      if(comment.newComm)
      {
        newComments.push(comment);
      }
    }
  }
  return Array(comments, newComments, indentComments);
};
/**
 * Collects the content nodes like articles or blog posts from the page
 * @var {Array} nodes contains all node objects
 * @var {Array} newnodes contains only the new node objects
 * @var {Object} node a node object with all data of the node
 * @var {Object} node.header header node of the node - where are the titles of the nodes
 * @var {String} node.path the path to the node
 * @var {Object} node.submitData
 * @var {Object} node.content
 * @var {Object} node.content
 * @var {Boolean} node.newc true, if the node have unread comments
 * @return {Array}
 */
var getNodes = function()
{
  var c = w.getElementById('content-both');
  var ds = c.getElementsByTagName('div');
  var nodes = Array(), newnodes = Array(), node = {}, dsl = ds.length, i, header, submitData, content, footer;
  for(i = 0; i < dsl; i++)
  {
    if(hasClass(ds[i], 'node'))
    {
      header = ds[i].childNodes[1];
      submitData = ds[i].childNodes[3];
      content = ds[i].childNodes[5];
      footer = hasClass(ds[i].childNodes[7], 'links') ? ds[i].childNodes[7] : false;
      node = {
        header: header,
        path: header.firstChild.getAttribute('href'),
        submitData: submitData,
        content: content,
        footer: footer,
        newc: getElementsByClassName(footer,'comment_new_comments', 'li').length > 0 ? true : false
      }
      nodes.push(node);
      if(node.newc)
      {
        newnodes.push(node);
      }
    }
  }
  return Array(nodes, newnodes);
};
/**
 * Parse the nodes to mark that the node have unread comment, adds prev and next links to the header
 * @param {Array} nodes
 */
var parseNodes = function(nodes)
{
  var spa = w.createElement('span'), sp, builder = new nodeHeaderBuilder();
  for(var i = 0; i < nodes.length; i++)
  {
    if(nodes[i].newc)
    {
      sp = spa.cloneNode(true);
      sp.setAttribute('class', 'nnew');
      sp.appendChild(builder.buildMarker(nodes[i].path));
      sp.appendChild(builder.buildNewText());
      nodes[i].header.parentNode.insertBefore(builder.buildNameLink(i), nodes[i].header);

      if(i > 0)
      {
        sp.appendChild(builder.buildPrevLink('newhupnode' + (i-1)));
      }
      else
      {
        sp.appendChild(builder.buildFirstLink());
      }
      if(i < nodes.length-1)
      {
        sp.appendChild(builder.buildNextLink('newhupnode' +(i+1)));
      }
      else
      {
        sp.appendChild(builder.buildLastLink());
      }
      nodes[i].header.insertBefore(sp, nodes[i].header.firstChild);
    }
  }
};
/**
 * Send an AJAX HEAD request to the server, to remove the unread nodes
 * @param {Object} e event object
 * @see HupAjax
 */
var markNodeAsRead = function(e)
{
  new HupAjax(
    {
      method: 'head',
      url: 'http://hup.hu'+this.getAttribute('path').replace(/^\s*(.+)\s*$/, '$1'),
      successHandler: function()
      {
        this.el.innerHTML = hupperBundles.getString('markingSuccess');
        if(this.el.nextSibling.getAttribute('class') == 'hnew')
        {
          this.el.parentNode.removeChild(this.el.nextSibling);
        }
      },
      loadHandler: function()
      {
        this.el.innerHTML = '<img src="chrome://hupper/skin/ajax-loader.gif" alt="marking..." />';
      },
      errorHandler: function()
      {
        this.el.innerHTML = hupperBundles.getString('markingError');
      }
    },
    e.target
  );
};
/**
 * Checks that the arrray contains the specified element
 * @param {String,Number,Array,Object} value
 * @return {Boolean}
 */
Array.prototype.inArray = function(value)
{
  var i, l = this.length;
  for(i = 0; i < l; i++)
  {
    if(this[i] === value)
    {
      return true;
    }
  }
  return false;
};
/**
 * @return {Array}
 */
Array.prototype.unique = function(b)
{
  var a = Array(), i, l = this.length;
  for(i = 0; i < l; i++)
  {
    if(a.indexOf(this[i], 0, b) < 0)
    {
      a.push(this[i]);
    }
  }
  return a;
};
/**
 * Parses all comment on the page and add class names, replaces the 'új' text, etc.
 * @param {Array} comments
 * @param {Array} newComments
 * @param {Array} indentComments
 */
parseComments = function(comments, newComments, indentComments)
{
  var replacenewcommenttext = HupperPrefs.replacenewcommenttext();
  var prevnextlinks = HupperPrefs.prevnextlinks();
  var trolls = HupperPrefs.trolls();
  var filtertrolls = HupperPrefs.filtertrolls();
  var huppers = HupperPrefs.huppers();
  var filterhuppers = HupperPrefs.filterhuppers();
  var extraCommentLinks = HupperPrefs.extraCommentLinks();
  var insertPermalink = HupperPrefs.insertPermalink();

  var builder = new nodeHeaderBuilder();
  comments.map(
    function(C)
    {
      if(filtertrolls)
      {
        if(trolls.inArray(C.user))
        {
          addClass(C.comment, ' trollComment');
          addClass(C.header, ' trollCommentHeader');
        }
      }
      if(filterhuppers)
      {
        if(huppers.inArray(C.user))
        {
          addClass(C.comment, 'hupperComment');
          addClass(C.header, 'hupperCommentHeader');
        }
      }
      if(extraCommentLinks)
      {
        C.footerLinks.appendChild(builder.buildComExtraTop());
        C.footerLinks.appendChild(builder.buildComExtraBack());
      }
      if(C.parent != -1)
      {
        C.footerLinks.appendChild(builder.buildComExtraParent(C.parent));
      }
      if(insertPermalink)
      {
        C.footerLinks.appendChild(builder.buildComExtraPerma(C.id));
      }
    }
  );
  if(replacenewcommenttext || prevnextlinks)
  {
    var spanNode = w.createElement('span');
    
    var tmpSpan1;
    var ncl = newComments.length, i;
    for(i = 0; i < ncl; i++)
    {
      tmpSpan1 = spanNode.cloneNode(true);
      tmpSpan1.setAttribute('class', 'hnav');
      if(prevnextlinks)
      {

        if(newComments[i-1])
        {
          tmpSpan1.appendChild(builder.buildPrevLink(newComments[i-1].id));
        }
        else
        {
          tmpSpan1.appendChild(builder.buildFirstLink());
        }


        if(newComments[i+1])
        {
          tmpSpan1.appendChild(builder.buildNextLink(newComments[i+1].id));
        }
        else
        {
          tmpSpan1.appendChild(builder.buildLastLink());
        }
      }
      newComments[i].comment.removeChild(newComments[i].newComm);
      tmpSpan1.appendChild(builder.buildNewText());
      newComments[i].header.insertBefore(tmpSpan1, newComments[i].header.firstChild);
    }
  }
};
/**
 * Adds the specified class to the element
 * @param {Object} el DOM element
 * @param {String} c class name
 */
var addClass = function(el, c)
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
};
/**
 * Removes the specified class from the element
 * @param {Object} el DOM element
 * @param {String} c class name
 */
var removeClass = function(el, c)
{
  el.setAttribute('class', el.getAttribute('class').replace(c, ''));
};
/**
 * Checks that the element has the specified class or not
 * @param {Object} el
 * @param {String} c
 * @return {Boolean}
 */
var hasClass = function(el, c)
{
  if(!el || !c)
  {
    return false;
  }
  cl = new RegExp(c);
  return cl.test(el.getAttribute('class'));
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
    return indentedComments[(comment.indent-1)][(indentedComments[(comment.indent-1)].length-1)];
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
  while(hasClass(el.parentNode, 'indent'))
  {
    el = el.parentNode;
    indent++;
  }
  return indent;
};

/**
 * Adds my own styles to the hup.hu header
 * @param {Object} o event object
 */
addHupStyles = function(o)
{
  var styles = '';
  switch(HupperPrefs.trollfiltermethod())
  {
    case 'hide':
      styles += '.trollComment {display:none !important;}';
    break;
    case 'hilight':
    default:
      styles += '.trollCommentHeader {background-color:' + HupperPrefs.trollcolor() + ' !important;}';
    break;
  }
  styles += '.hupperCommentHeader {background-color: '+HupperPrefs.huppercolor() + ' !important;}';
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

  var st = w.createElement('style');
  var sti = w.createTextNode(styles);
  st.setAttribute('type', 'text/css');
  st.appendChild(sti);
  w.getElementsByTagName('head')[0].appendChild(st);
};
/**
 * Initialization function, runs when the page is loaded
 * @param {Object} e window load event object
 */
var HUPPER = function(e)
{
  w = e.originalTarget;
  if(w.location.href.match(/^https?:\/\/(?:www\.)?hup\.hu/))
  {
    addHupStyles();
    var body = w.getElementsByTagName('body')[0];
    var p = w.getElementById('primary');
    p.getElementsByTagName('a')[0].name = 'top';
    hupperBundles = document.getElementById('hupper-bundles');
    if(w.getElementById('comments'))
    {
      var c = getComments();
      comments = c[0];
      newComments = c[1];
      indentComments = c[2];
      parseComments(comments, newComments, indentComments);
    }
    else if(HupperPrefs.insertnewtexttonode())
    {
      parseNodes(getNodes()[1]);
    }
    HLog.log('initialized');
  }
};
