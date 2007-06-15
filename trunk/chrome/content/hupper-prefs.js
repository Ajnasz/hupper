HP = function()
{
  this.M = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
  this.get.M = this.set.M = this.M;
};
HP.prototype = {
  M: null, // Manager
  get: {
    trolls: function()
    {
      return this.M.getCharPref('extensions.hupper.trolls');
    },
    /**
    * @return {Boolean}
    */
    filtertrolls: function()
    {
      return this.M.getBoolPref('extensions.hupper.filtertrolls');
    },
    /**
    * @return hide, hilight
    */
    trollfiltermethod: function()
    {
      // hide, hilight
      return this.M.getCharPref('extensions.hupper.trollfiltermethod');
    },
    /**
    * @return {String}
    */
    huppers: function()
    {
      return this.M.getCharPref('extensions.hupper.huppers');
    },
    filterhuppers: function()
    {
      return this.M.getBoolPref('extensions.hupper.filterhuppers');
    },
    replacenewcommenttext: function()
    {
      return this.M.getBoolPref('extensions.hupper.replacenewcommenttext');
    },
    newcommenttext: function()
    {
      return this.M.getCharPref('extensions.hupper.newcommenttext');
    }
  },
  set: {
    M: this.M,
    trolls: function(value)
    {
      this.M.setCharPref('extensions.hupper.trolls', value);
    },
    /**
    * @return {Boolean}
    */
    filtertrolls: function(value)
    {
      this.M.setBoolPref('extensions.hupper.filtertrolls', value);
    },
    /**
    * @return hide, hilight
    */
    trollfiltermethod: function(value)
    {
      // hide, hilight
      this.M.setCharPref('extensions.hupper.trollfiltermethod', value);
    },
    /**
    * @return {String}
    */
    huppers: function(value)
    {
      this.M.setCharPref('extensions.hupper.huppers', value);
    },
    filterhuppers: function(value)
    {
      this.M.setBoolPref('extensions.hupper.filterhuppers', value);
    },
    replacenewcommenttext: function(value)
    {
      this.M.setBoolPref('extensions.hupper.replacenewcommenttext', value);
    },
    newcommenttext: function(value)
    {
      this.M.setCharPref('extensions.hupper.newcommenttext', value);
    }
  }
};
setPrefWinVals = function()
{
  document.getElementById('enable-trollfilter').checked = hp.get.filtertrolls();
  document.getElementById('trolls').value = hp.get.trolls();
  document.getElementById('trollfilter-method').value = hp.get.trollfiltermethod();
  document.getElementById('enable-hupperfilter').checked = hp.get.filterhuppers();
  document.getElementById('huppers').value = hp.get.huppers();
  document.getElementById('enable-new-comment-changer').checked = hp.get.replacenewcommenttext();
  document.getElementById('new-comment-text').value = hp.get.newcommenttext();
};
savePreferences = function()
{
  hp.set.filtertrolls(document.getElementById('enable-trollfilter').checked);
  hp.set.trolls(document.getElementById('trolls').value);
  hp.set.trollfiltermethod(document.getElementById('trollfilter-method').value);
  hp.set.filterhuppers(document.getElementById('enable-hupperfilter').checked);
  hp.set.huppers(document.getElementById('huppers').value);
  hp.set.replacenewcommenttext(document.getElementById('enable-new-comment-changer').checked);
  hp.set.newcommenttext(document.getElementById('new-comment-text').value);
};
StartHupperPrefernces = function()
{
  hp = new HP();
  setPrefWinVals();
};
