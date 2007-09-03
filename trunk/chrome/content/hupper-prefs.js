/**
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu 
 * @licence General Public Licence v2 
 */
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
    trollcolor: function()
    {
      return this.M.getCharPref('extensions.hupper.trollcolor');
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
    huppercolor: function()
    {
      return this.M.getCharPref('extensions.hupper.huppercolor');
    },

    replacenewcommenttext: function()
    {
      return this.M.getBoolPref('extensions.hupper.replacenewcommenttext');
    },
    newcommenttext: function()
    {
      return this.M.getCharPref('extensions.hupper.newcommenttext');
    },
    extracommentlinks: function()
    {
      return this.M.getBoolPref('extensions.hupper.extracommentlinks');
    },
    hilightforumlinesonhover: function()
    {
      return this.M.getBoolPref('extensions.hupper.hilightforumlinesonhover');
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
    trollcolor: function(value)
    {
      this.M.setCharPref('extensions.hupper.trollcolor', value);
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
    huppercolor: function(value)
    {
      this.M.setCharPref('extensions.hupper.huppercolor', value);
    },
    replacenewcommenttext: function(value)
    {
      this.M.setBoolPref('extensions.hupper.replacenewcommenttext', value);
    },
    newcommenttext: function(value)
    {
      this.M.setCharPref('extensions.hupper.newcommenttext', value);
    },
    extracommentlinks: function(value)
    {
      this.M.setBoolPref('extensions.hupper.extracommentlinks', value);
    },
    hilightforumlinesonhover: function(value)
    {
      this.M.setBoolPref('extensions.hupper.hilightforumlinesonhover', value);
    }
  }
};
setPrefWinVals = function()
{
  document.getElementById('enable-trollfilter').checked = hp.get.filtertrolls();
  document.getElementById('trolls').value = hp.get.trolls();
  document.getElementById('troll-color').value = hp.get.trollcolor();
  document.getElementById('trollfilter-method').value = hp.get.trollfiltermethod();
  document.getElementById('enable-hupperfilter').checked = hp.get.filterhuppers();
  document.getElementById('huppers').value = hp.get.huppers();
  document.getElementById('hupper-color').value = hp.get.huppercolor();
  document.getElementById('enable-new-comment-changer').checked = hp.get.replacenewcommenttext();
  document.getElementById('new-comment-text').value = hp.get.newcommenttext();
  document.getElementById('enable-extra-comment-links').checked = hp.get.extracommentlinks();
  document.getElementById('hilight-forum-lines-onhover').checked = hp.get.hilightforumlinesonhover();
};
savePreferences = function()
{
  hp.set.filtertrolls(document.getElementById('enable-trollfilter').checked);
  hp.set.trolls(document.getElementById('trolls').value);
  hp.set.trollcolor(document.getElementById('troll-color').value);
  hp.set.trollfiltermethod(document.getElementById('trollfilter-method').value);
  hp.set.filterhuppers(document.getElementById('enable-hupperfilter').checked);
  hp.set.huppers(document.getElementById('huppers').value);
  hp.set.huppercolor(document.getElementById('hupper-color').value);
  hp.set.replacenewcommenttext(document.getElementById('enable-new-comment-changer').checked);
  hp.set.newcommenttext(document.getElementById('new-comment-text').value);
  hp.set.extracommentlinks(document.getElementById('enable-extra-comment-links').checked);
  hp.set.hilightforumlinesonhover(document.getElementById('hilight-forum-lines-onhover').checked);
};
StartHupperPrefernces = function()
{
  hp = new HP();
  setPrefWinVals();
};
