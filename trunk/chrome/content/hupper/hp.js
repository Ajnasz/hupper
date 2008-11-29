HP = function() {
  this.M = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
  this.get.M = this.set.M = this.M;
};
HP.prototype = {
  M: null, // Manager
  get: {
    trolls: function() {
      return this.M.getCharPref('extensions.hupper.trolls');
    },
    /**
    * @return {Boolean}
    */
    filtertrolls: function() {
      return this.M.getBoolPref('extensions.hupper.filtertrolls');
    },
    trollcolor: function() {
      return this.M.getCharPref('extensions.hupper.trollcolor');
    },
    /**
    * @return hide, hilight
    */
    trollfiltermethod: function() {
      // hide, hilight
      return this.M.getCharPref('extensions.hupper.trollfiltermethod');
    },
    /**
    * @return {String}
    */
    huppers: function() {
      return this.M.getCharPref('extensions.hupper.huppers');
    },
    filterhuppers: function() {
      return this.M.getBoolPref('extensions.hupper.filterhuppers');
    },
    huppercolor: function() {
      return this.M.getCharPref('extensions.hupper.huppercolor');
    },
    replacenewcommenttext: function() {
      return this.M.getBoolPref('extensions.hupper.replacenewcommenttext');
    },
    newcommenttext: function() {
      return this.M.getCharPref('extensions.hupper.newcommenttext');
    },
    extracommentlinks: function() {
      return this.M.getBoolPref('extensions.hupper.extracommentlinks');
    },
    hilightforumlinesonhover: function() {
      return this.M.getBoolPref('extensions.hupper.hilightforumlinesonhover');
    },
    insertpermalink: function() {
      return this.M.getBoolPref('extensions.hupper.insertpermalink');
    },
    insertnewtexttonode: function() {
      return this.M.getBoolPref('extensions.hupper.insertnewtexttonode');
    },
    fadeparentcomment: function() {
      return this.M.getBoolPref('extensions.hupper.fadeparentcomment');
    },
    showqnavbox: function() {
      return this.M.getBoolPref('extensions.hupper.showqnavbox');
    },
    hidetrollanswers: function() {
      return this.M.getBoolPref('extensions.hupper.hidetrollanswers');
    },
    hideads: function() {
      return this.M.getBoolPref('extensions.hupper.hideads');
    },
    highlightusers: function() {
      return this.M.getCharPref('extensions.hupper.highlightusers');
    },
    username: function() {
      return this.M.getCharPref('extensions.hupper.username');
    },
    hidetaxonomy: function() {
      return this.M.getCharPref('extensions.hupper.hidetaxonomy');
    },
    showinstatusbar: function() {
      return this.M.getBoolPref('extensions.hupper.showinstatusbar');
    },
    blocks: function() {
      return this.M.getCharPref('extensions.hupper.blocks');
    }
  },
  set: {
    M: this.M,
    trolls: function(value) {
      this.M.setCharPref('extensions.hupper.trolls', value);
    },
    /**
    * @return {Boolean}
    */
    filtertrolls: function(value) {
      this.M.setBoolPref('extensions.hupper.filtertrolls', value);
    },
    /**
    * @return hide, hilight
    */
    trollfiltermethod: function(value) {
      // hide, hilight
      this.M.setCharPref('extensions.hupper.trollfiltermethod', value);
    },
    trollcolor: function(value) {
      this.M.setCharPref('extensions.hupper.trollcolor', value);
    },
    /**
    * @return {String}
    */
    huppers: function(value) {
      this.M.setCharPref('extensions.hupper.huppers', value);
    },
    filterhuppers: function(value) {
      this.M.setBoolPref('extensions.hupper.filterhuppers', value);
    },
    huppercolor: function(value) {
      this.M.setCharPref('extensions.hupper.huppercolor', value);
    },
    replacenewcommenttext: function(value) {
      this.M.setBoolPref('extensions.hupper.replacenewcommenttext', value);
    },
    newcommenttext: function(value) {
      this.M.setCharPref('extensions.hupper.newcommenttext', value);
    },
    extracommentlinks: function(value) {
      this.M.setBoolPref('extensions.hupper.extracommentlinks', value);
    },
    hilightforumlinesonhover: function(value) {
      this.M.setBoolPref('extensions.hupper.hilightforumlinesonhover', value);
    },
    insertpermalink: function(value) {
      this.M.setBoolPref('extensions.hupper.insertpermalink', value);
    },
    insertnewtexttonode: function(value) {
      this.M.setBoolPref('extensions.hupper.insertnewtexttonode', value);
    },
    fadeparentcomment: function(value) {
      this.M.setBoolPref('extensions.hupper.fadeparentcomment', value);
    },
    showqnavbox: function(value) {
      this.M.setBoolPref('extensions.hupper.showqnavbox', value);
    },
    hidetrollanswers: function(value) {
      this.M.setBoolPref('extensions.hupper.hidetrollanswers', value);
    },
    hideads: function(value) {
      this.M.setBoolPref('extensions.hupper.hideads', value);
    },
    highlightusers: function(value) {
      this.M.setCharPref('extensions.hupper.highlightusers', value);
    },
    username: function(value) {
      return this.M.setCharPref('extensions.hupper.username', value);
    },
    hidetaxonomy: function(value) {
      return this.M.setCharPref('extensions.hupper.hidetaxonomy', value);
    },
    showinstatusbar: function(value) {
      return this.M.setBoolPref('extensions.hupper.showinstatusbar', value);
    },
    blocks: function(value) {
      return this.M.setCharPref('extensions.hupper.blocks', value);
    }
  }
};
