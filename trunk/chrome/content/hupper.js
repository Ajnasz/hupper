/**
 * hupper.js
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
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
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
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
   * @return {Array}the returned array contains the names of the huppers
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
  hilightForumLinsOnHover: function()
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
 * collects the elements, which are has the specified className (cn) and childNodes of the specified node (par)
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu 
 * @param {Object} par parent element node
 * @param {String} cn className
 * @param {String} el element type
 * @return {Array}
 */
var getElementsByClassName = function(par, cn, el)
{
    if(typeof el == 'undefined')
    {
        el = 'div';
    }
    var ts = par.getElementsByTagName(el), out = Array(), i;
    for(i = 0; i < ts.length; i++)
    {
      if(hasClass(ts[i],cn))
      {
        out.push(ts[i]);
      }
    }
    return out;
};
/**
 * collects the comment nodes and filter them into another 2 array too by their properties: comments, newComments, indentComments
 * the indenComments just contains an index which specify the comment index in the comments array
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
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
        footerLinks: footer.getElementsByTagName('ul')[0],
        id: ds[i].previousSibling.previousSibling.id,
        indent: getIndent(ds[i]),
        user: (typeof header.childNodes[1] != 'undefined') ?  header.childNodes[1].innerHTML : header.innerHTML.replace(/[^\(]+\( ([^ ]+).*/, '$1'),
        newComm: (newComm.length) ? newComm[0] : false
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
var getNodes = function()
{
  var c = w.getElementById('content-both');
  var ds = c.getElementsByTagName('div');
  var nodes = Array(), node = {}, dsl = ds.length, i, title, submitData, content, footer;
  for(i = 0; i < dsl; i++)
  {
    if(hasClass(ds[i], 'node'))
    {
      title = ds[i].childNodes[1];
      submitData = ds[i].childNodes[3];
      content = ds[i].childNodes[5];
      footer = ds[i].childNodes[7];
      node = {
        title: title,
        submitData: submitData,
        content: content,
        footer: footer,
        new: getElementsByClassName(footer,'comment_new_comments', 'li').length > 0 ? true : false
      }
      nodes.push(node);
    }
  }
  return nodes;
};
var parseNodes = function(nodes)
{
  
  var newCommentText = HupperPrefs.newcommenttext();
  var spa = document.createElement('span');
  spa.setAttribute('style', 'color:red;float:right;font-size:11px;margin-top:-16px;');
  /*
  var firstLinkText = hupperBundles.getString('FirstLinkText');
  var lastLinkText = hupperBundles.getString('LastLinkText');
  var prevLinkText = hupperBundles.getString('PrevLinkText');
  var nextLinkText = hupperBundles.getString('NextLinkText');

  var a = document.createElement('a');
  span.setAttribute('style', 'float:right;font-size:10px;color:red;');
  var fit = document.createTextNode(firstLinkText);
  var lat = document.createTextNode(lastLinkText);
  var prt = document.createTextNode(prevLinkText);
  var net = document.createTextNode(nextLinkText);
  */
  var newCt = document.createTextNode(newCommentText);

  /*
  var lia = a.cloneNode(true);
  var nea = a.cloneNode(true);
  nea.innerText = net;
  // nea.appendChild(net);
  var pra = a.cloneNode(true);
  pra.innerText = prt;
  */
  // pra.appendChild(prt);
  var sp, liaC, praC, neaC, fitC, latC;
  for(var i = 0; i < nodes.length; i++)
  {
    if(nodes[i].new)
    {
      sp = spa.cloneNode(true);
      /*
      liaC = lia.cloneNode(true);
      liaC.name = 'newhupnode'+i;
      sp.appendChild(liaC);

      if(i > 0)
      {
        praC = pra.cloneNode(true);
        praC.href = 'newhupnode' + (i-1);
        sp.appendChild(praC);
      }
      else
      {
        fitC = lat.cloneNode(true);
        sp.appendChild(fitC);
      }
      if(i < nodes.length-1)
      {
        neaC = nea.cloneNode(true);
        neaC.href = 'newhupnode' + (i+1);
        sp.appendChild(neaC);
      }
      else
      {
        latC = lat.cloneNode(true);
        sp.appendChild(latC);
      }
      */
      sp.appendChild(newCt.cloneNode(true));
      nodes[i].title.appendChild(sp);

      /*
      t = '<a name="#newnode'+ i +'"></a><span style="float:right;font-size: 10px;color:red;">'; 
      t += (i > 0) ? '<a href="#newnode'+(i-1) + '">' + prevLinkText + '</a>' : firstLinkText;
      t += (i < nodes.length-1) ? '<a href="#newnode'+(i+1) + '">' + nextLinkText + '</a>' : nextLinkText;
      t += newCommentText; 
      t += '</span>';
      nodes[i].title.innerHTML += t;
      */
    }
  }
}
/**
 * @param {String,Number,Array,Object} value
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
 *
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
 * parses all comment on the page and add class names, replaces the 'új' text, etc.
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
 */
parseComments = function(comments, newComments, indentComments)
{
  var newCommentText = HupperPrefs.newcommenttext();
  var replacenewcommenttext = HupperPrefs.replacenewcommenttext();

  var prevnextlinks = HupperPrefs.prevnextlinks();

  var trolls = HupperPrefs.trolls();
  var filtertrolls = HupperPrefs.filtertrolls();

  var huppers = HupperPrefs.huppers();
  var filterhuppers = HupperPrefs.filterhuppers();
  var extraCommentLinks = HupperPrefs.extraCommentLinks();
  var insertPermalink = HupperPrefs.insertPermalink();

  var firstLinkText = hupperBundles.getString('FirstLinkText');
  var lastLinkText = hupperBundles.getString('LastLinkText');
  var prevLinkText = hupperBundles.getString('PrevLinkText');
  var nextLinkText = hupperBundles.getString('NextLinkText');
  var topLinkText = hupperBundles.getString('TopLinkText');
  var backLinkText = hupperBundles.getString('BackLinkText');
  var parentLinkText = hupperBundles.getString('ParentLinkText');

  var cc = document.getElementById('comment_controls');

  var prevLink, nextLink;
  var newCT;
  
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
      var newLinks = '';
      if(extraCommentLinks)
      {
        newLinks += '<li><a href="#top">' + topLinkText + '</a></li><li><a href="javascript:history.back();">' + backLinkText + '</a></li>';
      }
      if(C.parent != -1)
      {
        newLinks += '<li><a href="#'+ C.parent +'">' + parentLinkText + '</a></li>';
      }
      if(insertPermalink)
      {
        newLinks += '<li><a href="#' + C.id + '">permalink</a></li>';
      }
      C.footerLinks.innerHTML += newLinks;
    }
  );
  if(replacenewcommenttext || prevnextlinks)
  {
    var ncl = newComments.length, i;
    for(i = 0; i < ncl; i++)
    {
      newCT = '<span class="hnav">';
      if(replacenewcommenttext)
      {
        newCT += '<span class="hnew">' + newCommentText + '</span>';
      }
      else
      {
        newCT += '<span class="hnew">' + newComments[i].newComm.innerHTML + '</span>';
      }
      if(prevnextlinks)
      {
        prevLink = (newComments[i-1]) ? ' <a href="#'+newComments[i-1].id+'">'+prevLinkText+'</a>' : ' ' + firstLinkText;
        nextLink = (newComments[i+1]) ? ' <a href="#'+newComments[i+1].id+'">'+nextLinkText+'</a>' : ' ' + lastLinkText;
        newCT += prevLink + nextLink;
      }
      newComments[i].comment.removeChild(newComments[i].newComm);
      newComments[i].comment.innerHTML = newCT + '</span>' + newComments[i].comment.innerHTML;
    }
  }
};
/**
 * adds the specified class to the element
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
 * @param {Object} el DOM element
 * @param {String} c class name
 */
var addClass = function(el, c)
{
  el.className += ' ' + c;
};
/**
 * removes the specified class from the element
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
 * @param {Object} el DOM element
 * @param {String} c class name
 */
var removeClass = function(el, c)
{
  el.className = el.className.replace(c, '');
};
/**
 * checks that the element has the specified class or not
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
 * @param {Object} el
 * @param {String} c
 * @return {Boolean}
 */
var hasClass = function(el, c)
{
 cl = new RegExp(c);
  return cl.test(el.className);
};
/**
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
 * @param {Array} indentedComments
 * @param {Object} comment
 * @return {Number,Boolean} returns an array index number or false
 */
var getParentComment = function(indentedComments, comment)
{
  if(comment.indent > 0)
  {
    return indentedComments[comment.indent-1][indentedComments[comment.indent-1].length-1];
  }
  else
  {
    return false;
  }
};
/**
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
 * @param {Object} el
 * @return how indented the comment
 */
var getIndent = function(el)
{
  var indent = 0;
  while(hasClass(el.parentNode, 'indent'))
  {
    indent++;
    el = el.parentNode;
  }
  return indent;
};

/**
 * adds my own styles to the hup.hu header
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu *
 * @param {Object} o event object
 */
addHupStyles = function(o)
{
  var styles = '<style type="text/css">';
  // hupper styles
  switch(HupperPrefs.trollfiltermethod())
  {
    case 'hide':
      styles += '.trollComment {display:none !important;}';
    break;
    case 'hilight':
      styles += '.trollCommentHeader {background-color:'+HupperPrefs.trollcolor()+' !important;}';
    break;
    default:
      styles += '.trollCommentHeader {background-color:'+HupperPrefs.trollcolor()+' !important;}';
  }
  styles += '.hupperCommentHeader {background-color: '+HupperPrefs.huppercolor()+' !important;}';
  styles += '#filteredhuppers, #filteredtrolls {display:block; !important;}';
  styles += '#tags {background-color:#F6F6EB; }';
  styles += '#tags h4 {margin: 0;padding:0; }';
  styles += '#tags ul {list-style:none;padding:0;margin:0;}#tags li {padding-left:5px;margin:0;}';
  if(HupperPrefs.hilightForumLinsOnHover())
  {
    styles += 'tr.odd:hover td, tr.even:hover {background-color: #D8D8C4;}';
  }
  styles += 'input, textarea { border: 1px solid #999 !important; padding: 2px !important; margin-bottom: 5px !important; }';
  styles += 'input:focus, textarea:focus { border-color: #000 !important; }';
  styles += '.hnew { color: red; font-weight: bold; }';
  styles += '.hnav { float: right; padding-right: 5px; padding-top: 2px; }';
  styles += '.submitted { padding: 2px !important;';
  styles += '</style>';
  w.getElementsByTagName('head')[0].innerHTML += styles;
};
/**
 * initialization function, runs when the page is loaded
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
 * @param {Object} e window load event object
 */
HUPPER = function(e)
{
  w = e.originalTarget;
  if(w.location.href.match(/^https?:\/\/(?:www\.)?hup\.hu/))
  {
    addHupStyles();
    var body = w.getElementsByTagName('body')[0];
    var p = w.getElementById('primary');
    p.getElementsByTagName('a')[0].name = 'top';
    hupperBundles = document.getElementById('hupper-bundles');
    if(document.getElementById('comments'))
    {
      var c = getComments();
      comments = c[0];
      newComments = c[1];
      indentComments = c[2];
      parseComments(comments, newComments, indentComments);
    }
    else if(HupperPrefs.insertnewtexttonode())
    {
      parseNodes(getNodes());
    }

    HLog.log('initialized');
  }
};
