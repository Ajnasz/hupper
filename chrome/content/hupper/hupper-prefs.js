/**
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
 * @licence General Public Licence v2
 */
setPrefWinVals = function() {
  document.getElementById('HUP-enable-trollfilter').checked = HUP.hp.get.filtertrolls();
  document.getElementById('HUP-trolls').value = HUP.hp.get.trolls();
  document.getElementById('HUP-troll-color').value = HUP.hp.get.trollcolor();
  document.getElementById('HUP-trollfilter-method').value = HUP.hp.get.trollfiltermethod();
  // document.getElementById('HUP-enable-hupperfilter').checked = HUP.hp.get.filterhuppers();
  // document.getElementById('HUP-huppers').value = HUP.hp.get.huppers();
  // document.getElementById('HUP-hupper-color').value = HUP.hp.get.huppercolor();
  document.getElementById('HUP-enable-new-comment-changer').checked = HUP.hp.get.replacenewcommenttext();
  document.getElementById('HUP-new-comment-text').value = HUP.hp.get.newcommenttext();
  document.getElementById('HUP-enable-extra-comment-links').checked = HUP.hp.get.extracommentlinks();
  document.getElementById('HUP-hilight-forum-lines-onhover').checked = HUP.hp.get.hilightforumlinesonhover();
  document.getElementById('HUP-insert-permalink').checked = HUP.hp.get.insertpermalink();
  document.getElementById('HUP-insert-new-text-to-node').checked = HUP.hp.get.insertnewtexttonode();
  document.getElementById('HUP-fade-parent-comment').checked = HUP.hp.get.fadeparentcomment();
  document.getElementById('HUP-show-quick-nav-box').checked = HUP.hp.get.showqnavbox();
  document.getElementById('HUP-hide-troll-answers').checked = HUP.hp.get.hidetrollanswers();
  document.getElementById('HUP-hupper-highlightusers').value = HUP.hp.get.highlightusers();
  document.getElementById('HUP-hide-taxonomy').value = HUP.hp.get.hidetaxonomy();
  document.getElementById('HUP-show-in-statusbar').checked = HUP.hp.get.showinstatusbar();
  document.getElementById('HUP-parseblocks').checked = HUP.hp.get.parseblocks();
  //document.getElementById('HUP-hupper-password').value = new _HUPPasswordManager().getPassword();
  //document.getElementById('HUP-hupper-username').value = HUP.hp.get.username();
};
savePreferences = function() {
  if(!checkHLUsers()) {return false;}
  HUP.hp.set.filtertrolls(document.getElementById('HUP-enable-trollfilter').checked);
  HUP.hp.set.trolls(document.getElementById('HUP-trolls').value);
  HUP.hp.set.trollcolor(document.getElementById('HUP-troll-color').value);
  HUP.hp.set.trollfiltermethod(document.getElementById('HUP-trollfilter-method').value);
  // HUP.hp.set.filterhuppers(document.getElementById('HUP-enable-hupperfilter').checked);
  // HUP.hp.set.huppers(document.getElementById('HUP-huppers').value);
  // HUP.hp.set.huppercolor(document.getElementById('HUP-hupper-color').value);
  HUP.hp.set.replacenewcommenttext(document.getElementById('HUP-enable-new-comment-changer').checked);
  HUP.hp.set.newcommenttext(document.getElementById('HUP-new-comment-text').value);
  HUP.hp.set.extracommentlinks(document.getElementById('HUP-enable-extra-comment-links').checked);
  HUP.hp.set.hilightforumlinesonhover(document.getElementById('HUP-hilight-forum-lines-onhover').checked);
  HUP.hp.set.insertpermalink(document.getElementById('HUP-insert-permalink').checked);
  HUP.hp.set.insertnewtexttonode(document.getElementById('HUP-insert-new-text-to-node').checked);
  HUP.hp.set.fadeparentcomment(document.getElementById('HUP-fade-parent-comment').checked);
  HUP.hp.set.showqnavbox(document.getElementById('HUP-show-quick-nav-box').checked);
  HUP.hp.set.hidetrollanswers(document.getElementById('HUP-hide-troll-answers').checked);
  HUP.hp.set.highlightusers(document.getElementById('HUP-hupper-highlightusers').value);
  HUP.hp.set.hidetaxonomy(document.getElementById('HUP-hide-taxonomy').value);
  HUP.hp.set.showinstatusbar(document.getElementById('HUP-show-in-statusbar').checked);
  HUP.hp.set.parseblocks(document.getElementById('HUP-parseblocks').checked);
  //HUP.hp.set.username(document.getElementById('HUP-hupper-username').value);
  //new _HUPPasswordManager().addPassword(document.getElementById('HUP-hupper-password').value);
  var hideIcon = !HUP.hp.get.showinstatusbar();
  HUP_mapWindows(function(win) {
    win.document.getElementById('HUP-statusbar').hidden = hideIcon;
  })
  return true;
};
var disableFields = function() {
  document.getElementById('HUP-trollfilter-method').addEventListener('command', onChangeFilterMethod, false);
};
var onChangeFilterMethod = function() {
  if(document.getElementById('HUP-trollfilter-method').value == 'hide') {
    document.getElementById('HUP-hide-troll-answers').disabled = false;
  } else {
    document.getElementById('HUP-hide-troll-answers').disabled = true;
  }
};
var checkHLUsers = function() {
  var hlUsers = document.getElementById('HUP-hupper-highlightusers').value.split(',');
  var trolls = document.getElementById('HUP-trolls').value.split(',');
  // var huppers = document.getElementById('HUP-huppers').value.split(',');
  var hlUsersObj = {};
  for(var i = 0, hl = hlUsers.length, hlUser; i < hl; i++) {
    hlUser = hlUsers[i].split(':');
    hlUsersObj[hlUser[0]] = hlUsers[1];
  }
  var used = new Array();
  /*
  for(var i = 0, hl = huppers.length; i < hl; i++) {
    if(hlUsersObj[huppers[i]]) {
      used.push(huppers[i]);
    }
  }
  */
  for(var i = 0, tl= trolls.length; i < tl; i++) {
    if(hlUsersObj[trolls[i]]) {
      used.push(trolls[i]);
    }
  }
  if(used.length > 0) {
    return confirm(HUP.Bundles.getFormattedString('userIsTroll', [used.join(', ')]));
  }
  return true;
};
/**
 * Run the given parameter for every window
 * @param {Function} onMap A function which should run for every opened window
 */
var HUP_mapWindows = function(onMap) {
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
  var enumerator = wm.getEnumerator('navigator:browser'), win, grid, tt;
  while(enumerator.hasMoreElements()) {
    win = enumerator.getNext();
    if(typeof win != 'undefined' && typeof onMap == 'function') {
      onMap(win);
    }
  }
};
var StartHupperPrefernces = function() {
  HUP = {};
  HUP.L = new HLog();
  HUP.hp = new HP();
  HUP.Bundles = document.getElementById('hupper-prefs-bundles');
  disableFields();
  setPrefWinVals();
  onChangeFilterMethod();
};
