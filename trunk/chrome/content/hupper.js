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
  log: function(message){
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
   * @return the names of the trolls as array
   */
  trolls: function()
  {
    var trolls = this.prefManager.getCharPref('extensions.hupper.trolls');
    return trolls.split(',');
  },
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
   * @return hide, hilight
   */
  trollfiltermethod: function()
  {
    // hide, hilight
    return this.prefManager.getCharPref('extensions.hupper.trollfiltermethod');
  },
  /**
   * @return {String}
   */
  huppers: function()
  {
    var huppers = this.prefManager.getCharPref('extensions.hupper.huppers');
    return huppers.split(',');
  },
  huppercolor: function()
  {
    return this.prefManager.getCharPref('extensions.hupper.huppercolor');
  },
  filterhuppers: function()
  {
    return this.prefManager.getBoolPref('extensions.hupper.filterhuppers');
  },
  replacenewcommenttext: function()
  {
    return this.prefManager.getBoolPref('extensions.hupper.replacenewcommenttext');
  },
  newcommenttext: function()
  {
    return this.prefManager.getCharPref('extensions.hupper.newcommenttext');
  },
  prevnextlinks: function()
  {
    return this.prefManager.getBoolPref('extensions.hupper.prevnextlinks');
  },
  tags: function()
  {
    return this.prefManager.getCharPref('extensions.hupper.tags');
  },
  extraCommentLinks: function()
  {
    return this.prefManager.getBoolPref('extensions.hupper.extracommentlinks');
  },
  hilightForumLinsOnHover: function()
  {
    return this.prefManager.getBoolPref('extensions.hupper.hilightforumlinesonhover');
  }

};
/**
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
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
  var i = 0, tl = tables.length, username;
  for(; i < tl; i++)
  {
    if(tables[i].className.match(/comment/))
    {
      // comments.push(tables[i]);
      username = (typeof tables[i].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[1].childNodes[1] != 'undefined') ? tables[i].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[1].childNodes[1].innerHTML : tables[i].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[1].innerHTML.replace(/Szerző:\s+([^\s]+).+/, '$1');
      comment = {
        table: tables[i],
        id: tables[i].previousSibling.previousSibling.id,
        header: tables[i].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[1],
        footer: tables[i].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[4].firstChild,
        indent: tables[i].parentNode.tagName.toLowerCase() == 'div' ? parseInt(tables[i].parentNode.style.marginLeft)/25 : 0,
        newComm: tables[i].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[2].getElementsByTagName('font')[0],
        // user: tables[i].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[1].childNodes[1].innerHTML
        user: username
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
 * @param {Array} trolls
 * hilights trolls comments
 */
trollFilter = function(trolls)
{
  var i = 0; cl = comments.length;
  for(; i < cl; i++)
  {
    if(trolls.inArray(comments[i].user))
    {
      comments[i].table.className += ' trollComment';
      comments[i].header.className += ' trollCommentHeader';
    }
  }
};
hupperFilter = function(huppers)
{
  var writer, i = 0; i < cl;
  for(; i < cl; i++)
 //  for(var i = 0; i < comments.length; i++)
  {
    if(huppers.inArray(comments[i].user))
    {
      comments[i].table.className += ' hupperComment';
      comments[i].header.className += ' hupperCommentHeader';
    }
  }
};
newCommentTextReplacer = function()
{

  var newComment = null;
  var newCommentText = HupperPrefs.newcommenttext();
  var i = 0, cl = comments.length;
  for(; i < cl; i++)
  {
    if(comments[i].newComm)
    {
      comments[i].newComm.innerHTML = newCommentText;
    }
  }
};
var hupperTagger = function()
{
  var tagsTXT = HupperPrefs.tags();
  this.tags = eval('('+tagsTXT+')');
  this.showTags();
};

hupperTagger.prototype =
{
  tags: {},
  showTags: function()
  {
    var out = '<div id="tags" class="content"><h2 class="title">Tags</h2>';
    var tagLinks;
    for (tag in this.tags)
    {
      tagLinks = this.tags[tag];
      out += '<h4>'+tag+'</h4>';
      out += '<ul>';
      for(var i = 0; i < tagLinks.length; i++)
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
Array.prototype.inArray = function(value)
{
  var i, al = this.length;
  for(i = 0; i < al; i++)
  {
    if(this[i] === value)
    {
      return true;
    }
  }
  return false;
};
Array.prototype.unique = function(b)
{
 var a = Array(), i, l = this.length;
 for(i = 0; i < l; i++)
 {
  if( a.indexOf(this[i], 0, b) < 0) {
    a.push(this[i]);
  }
 }
 return a;
};
/**
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
 */
parseComments = function()
{
  var newCommentText = HupperPrefs.newcommenttext();
  var replacenewcommenttext = HupperPrefs.replacenewcommenttext()

  var prevnextlinks = HupperPrefs.prevnextlinks();

  var trolls = HupperPrefs.trolls();
  var filtertrolls = HupperPrefs.filtertrolls()
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
    var i = 0; ncl = newComments.length;
    for(; i < ncl; i++)
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
  var i = 0; cl = comments.length;
  for(; i < cl; i++)
  {
    if(filtertrolls)
    {
      if(trolls.inArray(comments[i].user))
      {
        comments[i].table.className += ' trollComment';
        comments[i].header.className += ' trollCommentHeader';
        filteredtrolls.push(comments[i].user);
        // continue;
      }
    }
    if(filterhuppers)
    {
      if(huppers.inArray(comments[i].user))
      {
        comments[i].table.className += ' hupperComment';
        comments[i].header.className += ' hupperCommentHeader';
        filteredhuppers.push(comments[i].user);
        // continue;
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
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
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
  modifyLinks: function()
  {
    var fll = this.forumLinks.length, i = 0;
    for(; i < fll; i+=3)
    {
      this.forumLinks[i].href += '#new';
    }
  },
  addHoverToLines: function()
  {
    var fll = this.forumLines.length; i = 0;
    for(; i < fll; i++)
    {
      this.forumLines[i].addEventListener('mouseover', function(){ addClass(this, 'forumHover');}, false)
      this.forumLines[i].addEventListener('mouseout', function(){ removeClass(this, 'forumHover');}, false)
    }
  },
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
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu 
 * @param {Object} element
 * @param {String} className
 */
var addClass = function(element, className)
{
  var cl = new RegExp(className);
  if(!cl.test(element.className))
  {
    element.className += ' '+className;
  }
};
/**
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu 
 * @param {Object} element
 * @param {String} className
 */
var removeClass = function(element, className)
{
  var cl = new RegExp(className);
  element.className = element.className.replace(cl, '');
};
/**
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu 
 * @param {Array} indentedComments
 * @param {Object} comment
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
// INIT function
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

    var c = getComments()
    comments = c[0];
    newComments = c[1];
    indentComments = c[2];
    hupperBundles = document.getElementById('hupper-bundles');
    addHupStyles();
    parseComments();
    // new hupperTagger();
    new forumNewMessageLink();
    HLog.log('initialized');
  }
};
