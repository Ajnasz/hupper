/**
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
 * @licence General Public Licence v2
 */
setPrefWinVals = function() {
  document.getElementById('HUP-enable-trollfilter').checked = hp.get.filtertrolls();
  document.getElementById('HUP-trolls').value = hp.get.trolls();
  document.getElementById('HUP-troll-color').value = hp.get.trollcolor();
  document.getElementById('HUP-trollfilter-method').value = hp.get.trollfiltermethod();
  document.getElementById('HUP-enable-hupperfilter').checked = hp.get.filterhuppers();
  document.getElementById('HUP-huppers').value = hp.get.huppers();
  document.getElementById('HUP-hupper-color').value = hp.get.huppercolor();
  document.getElementById('HUP-enable-new-comment-changer').checked = hp.get.replacenewcommenttext();
  document.getElementById('HUP-new-comment-text').value = hp.get.newcommenttext();
  document.getElementById('HUP-enable-extra-comment-links').checked = hp.get.extracommentlinks();
  document.getElementById('HUP-hilight-forum-lines-onhover').checked = hp.get.hilightforumlinesonhover();
  document.getElementById('HUP-insert-permalink').checked = hp.get.insertpermalink();
  document.getElementById('HUP-insert-new-text-to-node').checked = hp.get.insertnewtexttonode();
  document.getElementById('HUP-fade-parent-comment').checked = hp.get.fadeparentcomment();
  document.getElementById('HUP-show-quick-nav-box').checked = hp.get.showqnavbox();
  document.getElementById('HUP-hide-troll-answers').checked = hp.get.hidetrollanswers();
  document.getElementById('HUP-hupper-highlightusers').value = hp.get.highlightusers();
  document.getElementById('HUP-hide-taxonomy').value = hp.get.hidetaxonomy();
  document.getElementById('HUP-show-in-statusbar').checked = hp.get.showinstatusbar();
  //document.getElementById('HUP-hupper-password').value = new _HUPPasswordManager().getPassword();
  //document.getElementById('HUP-hupper-username').value = hp.get.username();
};
savePreferences = function() {
  if(!checkHLUsers()) {return false;}
  hp.set.filtertrolls(document.getElementById('HUP-enable-trollfilter').checked);
  hp.set.trolls(document.getElementById('HUP-trolls').value);
  hp.set.trollcolor(document.getElementById('HUP-troll-color').value);
  hp.set.trollfiltermethod(document.getElementById('HUP-trollfilter-method').value);
  hp.set.filterhuppers(document.getElementById('HUP-enable-hupperfilter').checked);
  hp.set.huppers(document.getElementById('HUP-huppers').value);
  hp.set.huppercolor(document.getElementById('HUP-hupper-color').value);
  hp.set.replacenewcommenttext(document.getElementById('HUP-enable-new-comment-changer').checked);
  hp.set.newcommenttext(document.getElementById('HUP-new-comment-text').value);
  hp.set.extracommentlinks(document.getElementById('HUP-enable-extra-comment-links').checked);
  hp.set.hilightforumlinesonhover(document.getElementById('HUP-hilight-forum-lines-onhover').checked);
  hp.set.insertpermalink(document.getElementById('HUP-insert-permalink').checked);
  hp.set.insertnewtexttonode(document.getElementById('HUP-insert-new-text-to-node').checked);
  hp.set.fadeparentcomment(document.getElementById('HUP-fade-parent-comment').checked);
  hp.set.showqnavbox(document.getElementById('HUP-show-quick-nav-box').checked);
  hp.set.hidetrollanswers(document.getElementById('HUP-hide-troll-answers').checked);
  hp.set.highlightusers(document.getElementById('HUP-hupper-highlightusers').value);
  hp.set.hidetaxonomy(document.getElementById('HUP-hide-taxonomy').value);
  hp.set.showinstatusbar(document.getElementById('HUP-show-in-statusbar').checked);
  //hp.set.username(document.getElementById('HUP-hupper-username').value);
  //new _HUPPasswordManager().addPassword(document.getElementById('HUP-hupper-password').value);
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
  var trolls = document.getElementById('HUP-troll-color').value.split(',');
  var huppers = document.getElementById('HUP-huppers').value.split(',');
  var hlUsersObj = {};
  for(var i = 0, hl = hlUsers.length, hlUser; i < hl; i++) {
    hlUser = hlUsers[i].split(':');
    hlUsersObj[hlUser[0]] = hlUsers[1];
  }
  var used = new Array();
  for(var i = 0, hl = huppers.length; i < hl; i++) {
    if(hlUsersObj[huppers[i]]) {
      used.push(huppers[i]);
    }
  }
  for(var i = 0,tl= trolls.length; i < tl; i++) {
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
