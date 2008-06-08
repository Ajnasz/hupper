/**
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu 
 * @licence General Public Licence v2 
 */
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
  }
};
setPrefWinVals = function() {
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
  document.getElementById('insert-permalink').checked = hp.get.insertpermalink();
  document.getElementById('insert-new-text-to-node').checked = hp.get.insertnewtexttonode();
  document.getElementById('fade-parent-comment').checked = hp.get.fadeparentcomment();
  document.getElementById('show-quick-nav-box').checked = hp.get.showqnavbox();
  document.getElementById('hide-troll-answers').checked = hp.get.hidetrollanswers();
  document.getElementById('hupper-highlightusers').value = hp.get.highlightusers();
};
savePreferences = function() {
  if(!checkHLUsers()) {return false;}
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
  hp.set.insertpermalink(document.getElementById('insert-permalink').checked);
  hp.set.insertnewtexttonode(document.getElementById('insert-new-text-to-node').checked);
  hp.set.fadeparentcomment(document.getElementById('fade-parent-comment').checked);
  hp.set.showqnavbox(document.getElementById('show-quick-nav-box').checked);
  hp.set.hidetrollanswers(document.getElementById('hide-troll-answers').checked);
  hp.set.highlightusers(document.getElementById('hupper-highlightusers').value);
  return true;
};
var disableFields = function() {
  document.getElementById('trollfilter-method').addEventListener('command', onChangeFilterMethod, false);
};
var onChangeFilterMethod = function() {
  if(document.getElementById('trollfilter-method').value == 'hide') {
    document.getElementById('hide-troll-answers').disabled = false;
  } else {
    document.getElementById('hide-troll-answers').disabled = true;
  }
};
var checkHLUsers = function() {
  var hlUsers = document.getElementById('hupper-highlightusers').value.split(',');
  var trolls = document.getElementById('troll-color').value.split(',');
  var huppers = document.getElementById('huppers').value.split(',');
  var hlUsersObj = {};
  for(var i = 0, hlUser; i < hlUsers.length; i++) {
    hlUser = hlUsers[i].split(':');
    hlUsersObj[hlUser[0]] = hlUsers[1];
  }
  var used = new Array();
  for(i = 0; i < huppers.length; i++) {
    if(hlUsersObj[huppers[i]]) {
      used.push(huppers[i]);
    }
  }
  for(i = 0; i < trolls.length; i++) {
    if(hlUsersObj[huppers[i]]) {
      used.push(huppers[i]);
    }
  }
  if(used.length > 0) {
    return confirm(used.join(',') + ' already highlighted as hupper or troll')
  }
  return true;
};
var StartHupperPrefernces = function() {
  HUP = {};
  HUP.L = new HLog();
  hp = new HP();
  disableFields();
  setPrefWinVals();
  onChangeFilterMethod();
};
