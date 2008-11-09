/**
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
 * @licence General Public Licence v2
 */
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
  //document.getElementById('hupper-password').value = new _HUPPasswordManager().getPassword();
  //document.getElementById('hupper-username').value = hp.get.username();
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
  //hp.set.username(document.getElementById('hupper-username').value);
  //new _HUPPasswordManager().addPassword(document.getElementById('hupper-password').value);
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
