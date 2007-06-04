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
  prefManager: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch),
  trolls: function()
  {
    var trolls = this.prefManager.getCharPref('extensions.hupper.trolls');
    return trolls.split(',');
  },
  filtertrolls: function()
  {
    return this.prefManager.getBoolPref('extensions.hupper.filtertrolls');
  }
};

// hilights trolls comments
trollFilter = function(trolls)
{
  if(w.document)
  {
    var tables = w.document.getElementsByTagName('table');
  }
  else
  {
    var tables = w.getElementsByTagName('table');
  }
  var comments = Array(), writer;
  for(var i = 0; i < tables.length; i++)
  {
    if(tables[i].className.match(/comment/))
    {
      comments.push(tables[i]);
    }
  }
  for(var i = 0; i < comments.length; i++)
  {
    writer = comments[i].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[1].childNodes[1].innerHTML;
    if(trolls.inArray(writer))
    {
      // comments[i].style.display = 'none';
      comments[i].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[1].className += ' troll';
    }
  }
};
addHupStyles = function(o)
{
  w.getElementsByTagName('head')[0].innerHTML += '<style type="text/css">'
  +'.troll {background-color:#ff826a !important;}'
  +'</style>';
}
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
  if(w.location.href.match(/^https?:\/\/(?:www\.)?hup\.hu/))
  {
    addHupStyles();
    if(HupperPrefs.filtertrolls())
    {
      trollFilter(HupperPrefs.trolls());
    }
  }
  else
  {
    // HLog.log(w.location.href);
  }
  HLog.log('initialized');
};
