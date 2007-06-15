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
  }
};

getComments = function()
{
  var comments = Array();
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
      comments.push(tables[i]);
    }
  }
  return comments;
};
/**
 * @param {Array} trolls
 * hilights trolls comments
 */
trollFilter = function(trolls)
{
  var writer;
 for(var i = 0; i < comments.length; i++)
  {
    writer = comments[i].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[1].childNodes[1].innerHTML;
    if(trolls.inArray(writer))
    {
      comments[i].className += ' trollComment';
      comments[i].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[1].className += ' trollCommentHeader';
    }
  }
};
hupperFilter = function(huppers)
{
  var writer;
  for(var i = 0; i < comments.length; i++)
  {
    writer = comments[i].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[1].childNodes[1].innerHTML;
    if(huppers.inArray(writer))
    {
      comments[i].className += ' hupperComment';
      comments[i].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[1].className += ' hupperCommentHeader';
    }
  }
};

newCommentTextReplacer = function()
{
  
  var newComment = null;
  var newCommentText = HupperPrefs.newcommenttext();
  for(var i = 0; i < comments.length; i++)
  {
    newComment = comments[i].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[2].getElementsByTagName('font')[0];
    if(newComment)
    {
      newComment.innerHTML = newCommentText;
    }
  }
};

parseComments = function()
{
  for(var i = 0; i < comments.length; i++)
  {

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
      styles += '.trollCommentHeader {background-color:#ff826a !important;}';
    break;
    default:
      styles += '.trollCommentHeader {background-color:#ff826a !important;}';
  }
  styles += '.hupperCommentHeader {background-color: #ffff99 !important;}';
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
    comments = getComments();
    addHupStyles();
    if(HupperPrefs.filtertrolls())
    {
      trollFilter(HupperPrefs.trolls());
    }
    if(HupperPrefs.filterhuppers())
    {
      hupperFilter(HupperPrefs.huppers());
    }
    if(HupperPrefs.replacenewcommenttext())
    {
      newCommentTextReplacer();
    }
    HLog.log('initialized');
  }
};
