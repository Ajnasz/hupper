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
  }

};
/**
 * collects the comment nodes and filter them into another 2 array too by their properties: comments, newComments, indentComments
 * the indenComments just contains an index which specify the comment index in the comments array
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
 * @return {Array}
 */
getComments = function()
{
  var comments = Array(), newComments = Array(), indentComments = Array(Array()), comment, parentComment;
  if(w.document)
  {
    var tables = w.document.getElementsByTagName('table');
  }
  else
  {
    var tables = w.getElementsByTagName('table');
  }
  var tl = tables.length, username, ctb, userNameNode;
  for(var i = 0; i < tl; i++)
  {
    if(hasClass(tables[i], 'comment'))
    {
      ctb = tables[i].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1];
      userNameNode = ctb.childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[1];
      comment = {
        table: tables[i],
        id: tables[i].previousSibling.previousSibling.id,
        header: ctb.childNodes[0].childNodes[1],
        footer: ctb.childNodes[4].firstChild,
        indent: tables[i].parentNode.tagName.toLowerCase() == 'div' ? parseInt(tables[i].parentNode.style.marginLeft)/25 : 0,
        newComm: ctb.childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[2].getElementsByTagName('font')[0],
        user: (typeof userNameNode.childNodes[1] != 'undefined') ?  userNameNode.childNodes[1].innerHTML : userNameNode.innerHTML.replace(/Szerző:\s+([^\s]+).+/, '$1')

      };
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
 * hilights trolls comments
 * @param {Array} trolls array with trolls names
 */
trollFilter = function(trolls)
{
  var cl = comments.length;
  for(var i = 0; i < cl; i++)
  {
    if(trolls.inArray(comments[i].user))
    {
      addClass(comments[i].table, ' trollComment');
      addClass(comments[i].header, ' trollCommentHeader');
    }
  }
};
/**
 * hilights huppers comments
 * @param {Array} huppers array with huppers names
 */
hupperFilter = function(huppers)
{
  var cl = comments.length;
  for(var i = 0; i < cl; i++)
  {
    if(huppers.inArray(comments[i].user))
    {
      addClass(comments[i].table, ' hupperComment');
      addClass(comments[i].header, ' hupperCommentHeader');
    }
  }
};
/**
 * replaces the 'új' text in the new comments header
 */
newCommentTextReplacer = function()
{

  var newComment = null;
  var newCommentText = HupperPrefs.newcommenttext();
  var cl = comments.length;
  for(var i = 0; i < cl; i++)
  {
    if(comments[i].newComm)
    {
      comments[i].newComm.innerHTML = newCommentText;
    }
  }
};
/**
 * realises the tagger functionality for the hup.hu site
 * @note this Objcect isn't used
 */
var hupperTagger = function()
{
  var tagsTXT = HupperPrefs.tags();
  this.tags = eval('('+tagsTXT+')');
  this.showTags();
};

hupperTagger.prototype =
{
  tags: {},
  /**
   * shows the tags in the users box
   */
  showTags: function()
  {
    var out = '<div id="tags" class="content"><h2 class="title">Tags</h2>';
    var tagLinks, tl;
    for (tag in this.tags)
    {
      tagLinks = this.tags[tag];
      out += '<h4>'+tag+'</h4>';
      out += '<ul>';
      tl = tagLinks.length;
      for(var i = 0; i < tl; i++)
      {
        out += '<li><a href="http://hup.hu'+tagLinks[i].url+'">'+tagLinks[i].name+'</a></li>';
      }
    }
    out += '</div>';
    if(w.document)
    {
      w.document.getElementById('block-user-1').innerHTML += out;
    }
    else
    {
      w.getElementById('block-user-1').innerHTML += out;
    }
  }
};
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
  for(var i = 0; i < l; i++)
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
parseComments = function()
{
  var newCommentText = HupperPrefs.newcommenttext();
  var replacenewcommenttext = HupperPrefs.replacenewcommenttext();

  var prevnextlinks = HupperPrefs.prevnextlinks();

  var trolls = HupperPrefs.trolls();
  var filtertrolls = HupperPrefs.filtertrolls();
  var filteredtrolls = Array();

  var huppers = HupperPrefs.huppers();
  var filterhuppers = HupperPrefs.filterhuppers();
  var extraCommentLinks = HupperPrefs.extraCommentLinks();
  var filteredhuppers = Array();

  var firstLinkText = hupperBundles.getString('FirstLinkText');
  var lastLinkText = hupperBundles.getString('LastLinkText');
  var prevLinkText = hupperBundles.getString('PrevLinkText');
  var nextLinkText = hupperBundles.getString('NextLinkText');
  var topLinkText = hupperBundles.getString('TopLinkText');
  var backLinkText = hupperBundles.getString('BackLinkText');
  var parentLinkText = hupperBundles.getString('ParentLinkText');

  var cc = document.getElementById('comment_controls');

  var prevLink, nextLink;
  if(replacenewcommenttext || prevnextlinks)
  {
    var ncl = newComments.length;
    for(var i = 0; i < ncl; i++)
    {
      if(replacenewcommenttext)
      {
        newComments[i].newComm.innerHTML = newCommentText;
      }
      if(prevnextlinks)
      {
        prevLink = (newComments[i-1]) ? '<a href="#'+newComments[i-1].id+'">'+prevLinkText+'</a>' : firstLinkText;
        nextLink = (newComments[i+1]) ? '<a href="#'+newComments[i+1].id+'">'+nextLinkText+'</a>' : lastLinkText;
        newComments[i].newComm.parentNode.innerHTML += ' '+prevLink+' '+nextLink;
      }
    }
  }
  // filter trolls and huppers
  var cl = comments.length;
  for(var i = 0; i < cl; i++)
  {
    if(filtertrolls)
    {
      if(trolls.inArray(comments[i].user))
      {
        addClass(comments[i].table, ' trollComment');
        addClass(comments[i].header, ' trollCommentHeader');
        filteredtrolls.push(comments[i].user);
      }
    }
    if(filterhuppers)
    {
      if(huppers.inArray(comments[i].user))
      {
        addClass(comments[i].table, 'hupperComment');
        addClass(comments[i].header, 'hupperCommentHeader');
        filteredhuppers.push(comments[i].user);
      }
    }
    if(extraCommentLinks)
    {
      comments[i].footer.innerHTML += ' · <a href="#top">' + topLinkText + '</a> · <a href="javascript:history.back();">' + backLinkText + '</a>';
    }
    if(comments[i].parent != -1)
    {
      comments[i].footer.innerHTML += ' · <a href="#'+ comments[i].parent +'">' + parentLinkText + '</a>';
    }
  }
  if(filteredtrolls.length > 0)
  {
    filteredtrolls = filteredtrolls.unique();
    var ftdiv = document.createElement('div');
    ftdiv.id = 'filteredtrolls';
    ftdiv.innerHTML = filteredtrolls.toString();
    comments[0].table.parentNode.insertBefore(ftdiv, comments[0].table);
    // document.getElementById('filteredtrolls').innerHTML = filteredtrolls.toString();
    // comment[0].parentNode.insertBefore(ftdiv, comment[0]);
  }
  if(filteredhuppers.length > 0)
  {
    filteredhuppers = filteredhuppers.unique();
    var fhdiv = document.createElement('div');
    fhdiv.id = 'filteredhuppers';
    fhdiv.innerHTML = filteredhuppers.toString();
    comments[0].table.parentNode.insertBefore(fhdiv, comments[0].table);
    // document.getElementById('filteredhuppers').innerHTML = filteredhuppers.toString();
    // cc.parentNode.insertBefore(ftdiv, cc.nextSibling);
  }
};
/**
 * add an extra #new str to the forums links
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
 * @return {Boolean}
 */
var forumNewMessageLink = function()
{
  this.getForumTable();
  if(this.forumTable)
  {
    this.forumLinks = this.forumTable.getElementsByTagName('a');
    this.forumLines = this.forumTable.getElementsByTagName('tr');
    this.modifyLinks();
    if(HupperPrefs.hilightForumLinsOnHover())
    {
      this.addHoverToLines();
    }
    this.getForumTable();
    return true;
  }
  return false;
}
forumNewMessageLink.prototype =
{
  forumTable: null,
  forumLinks: null,
  /**
   * adds the #new string to the link
   */
  modifyLinks: function()
  {
    var fll = this.forumLinks.length;
    for(var i = 0; i < fll; i+=3)
    {
      this.forumLinks[i].href += '#new';
    }
  },
  /**
   * adds hilight effect to the lines of the table
   */
  addHoverToLines: function()
  {
    var fll = this.forumLines.length;
    for(var i = 0; i < fll; i++)
    {
      this.forumLines[i].addEventListener('mouseover', function()
          {
            addClass(this, 'forumHover');
          }, false);
      this.forumLines[i].addEventListener('mouseout', function()
          {
            removeClass(this, 'forumHover');
          }, false);
    }
  },
  /**
   * @return {Boolean}
   */
  getForumTable: function()
  {
    var t = w.getElementsByTagName('table')[5];
    if(th = t.getElementsByTagName('th')[0])
    {
      this.forumTable = t;
      return true;
    }
    return false;
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
}
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
 * adds my own styles to the hup.hu header
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
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
  styles += 'tr.forumHover td {background-color: #D8D8C4;}';
  styles += 'input, textarea { border: 1px solid #999 !important; padding: 2px !important; margin-bottom: 5px !important; }';
  styles += 'input:focus, textarea:focus { border-color: #000 !important; }';
  // hupper styles end
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
  if(w.location.href.match(/^https?:\/\/(?:www|mirror\.)?hup\.hu/))
  {
    if(w.document)
    {
      var body = w.document.getElementsByTagName('body')[0];
    }
    else
    {
      var body = w.getElementsByTagName('body')[0];
    }
    body.innerHTML = '<a name="top"></a>' + body.innerHTML;
    hupperBundles = document.getElementById('hupper-bundles');
    var c = getComments()
    comments = c[0];
    newComments = c[1];
    indentComments = c[2];
    addHupStyles();
    parseComments();
    // new hupperTagger();
    new forumNewMessageLink();
    HLog.log('initialized');
  }
};
