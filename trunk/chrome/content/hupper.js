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
  }
};

getComments = function()
{
  var comments = Array(), newComments = Array(), comment;
  if(w.document)
  {
    var tables = w.document.getElementsByTagName('table');
  }
  else
  {
    var tables = w.getElementsByTagName('table');
  }
  for(var i = 0; i < tables.length; i++)
  {
    if(tables[i].className.match(/comment/))
    {
      // comments.push(tables[i]);
      comment = {
        table: tables[i],
        id: tables[i].previousSibling.previousSibling.id,
        header: tables[i].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[1],
        newComm: tables[i].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[2].getElementsByTagName('font')[0],
        user: tables[i].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[1].childNodes[1].innerHTML
      };
      comments.push(comment);
      if(comment.newComm)
      {
        newComments.push(comment);
      }
    }
  }
  return Array(comments, newComments);
};
/**
 * @param {Array} trolls
 * hilights trolls comments
 */
trollFilter = function(trolls)
{
 for(var i = 0; i < comments.length; i++)
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
  var writer;
  for(var i = 0; i < comments.length; i++)
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
  for(var i = 0; i < comments.length; i++)
  {
    if(comments[i].newComm)
    {
      comments[i].newComm.innerHTML = newCommentText;
    }
  }
};

parseComments = function()
{
  var newCommentText = HupperPrefs.newcommenttext();
  var replacenewcommenttext = HupperPrefs.replacenewcommenttext()

  var prevnextlinks = HupperPrefs.prevnextlinks();

  var trolls = HupperPrefs.trolls();
  var filtertrolls = HupperPrefs.filtertrolls()

  var huppers = HupperPrefs.huppers();
  var filterhuppers = HupperPrefs.filterhuppers();

  var prevLink, nextLink;
  HLog.log(newComments.length);
  for(var i = 0; i < newComments.length; i++)
  {
    if(replacenewcommenttext)
    {
      newComments[i].newComm.innerHTML = newCommentText;
    }
    if(prevnextlinks)
    {
      prevLink = (newComments[i-1]) ? '<a href="#'+newComments[i-1].id+'">'+hupperBundles.getString('PrevLinkText')+'</a>' : hupperBundles.getString('FirstLinkText');
      nextLink = (newComments[i+1]) ? '<a href="#'+newComments[i+1].id+'">'+hupperBundles.getString('NextLinkText')+'</a>' : hupperBundles.getString('LastLinkText');
      newComments[i].newComm.parentNode.innerHTML += ' '+prevLink+' '+nextLink;
    }
  }
  for(var i = 0; i < comments.length; i++)
  {
    if(filtertrolls)
    {
      if(trolls.inArray(comments[i].user))
      {
        comments[i].table.className += ' trollComment';
        comments[i].header.className += ' trollCommentHeader';
        continue;
      }
    }
    if(filterhuppers)
    {
      if(huppers.inArray(comments[i].user))
      {
        comments[i].table.className += ' hupperComment';
        comments[i].header.className += ' hupperCommentHeader';
        continue;
      }
    }
  }
}

/**
 * @param {Object} o event object
 */
addHupStyles = function(o)
{
  var styles = '<style type="text/css">';
  // Troll filter styles
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
  // Troll filter styles end
  styles += '</style>';
  w.getElementsByTagName('head')[0].innerHTML += styles;
};
/**
 *
 */
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
// INIT function
HUPPER = function(e)
{
  w = e.originalTarget;
  if(w.location.href.match(/^https?:\/\/(?:www|mirror\.)?hup\.hu/))
  {
    var c = getComments()
    comments = c[0];
    newComments = c[1];
    hupperBundles = document.getElementById('hupper-bundles');
    addHupStyles();
    parseComments();
    HLog.log('initialized');
  }
};
