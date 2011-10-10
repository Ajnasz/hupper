/**
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
 * @licence General Public Licence v2
 */
Hupper.setPrefWinVals = function() {
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

  document.getElementById('HUP-style-indent').checked = HUP.hp.get.styleIndent();
  document.getElementById('HUP-style-accessibility').checked = HUP.hp.get.styleAccessibility();
  document.getElementById('HUP-style-sidebar-width').value = HUP.hp.get.styleWiderSidebar();
  document.getElementById('HUP-style-min-fontsize').value = HUP.hp.get.styleMinFontsize();

  //document.getElementById('HUP-hupper-password').value = new _HUPPasswordManager().getPassword();
  //document.getElementById('HUP-hupper-username').value = HUP.hp.get.username();
};
Hupper.savePreferences = function() {
  if(!Hupper.checkHLUsers()) {return false;}
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

  HUP.hp.set.styleIndent(document.getElementById('HUP-style-indent').checked);
  HUP.hp.set.styleAccessibility(document.getElementById('HUP-style-accessibility').checked);
  HUP.hp.set.styleWiderSidebar(document.getElementById('HUP-style-sidebar-width').value);
  HUP.hp.set.styleMinFontsize(document.getElementById('HUP-style-min-fontsize').value);


  //HUP.hp.set.username(document.getElementById('HUP-hupper-username').value);
  //new _HUPPasswordManager().addPassword(document.getElementById('HUP-hupper-password').value);
  var hideIcon = !HUP.hp.get.showinstatusbar();
  Hupper.mapWindows(function(win) {
    win.document.getElementById('HUP-statusbar').hidden = hideIcon;
  })
  Hupper.styles();
  return true;
};
Hupper.disableFields = function() {
  document.getElementById('HUP-trollfilter-method').addEventListener('command', Hupper.onChangeFilterMethod, false);
};
Hupper.onChangeFilterMethod = function() {
  if(document.getElementById('HUP-trollfilter-method').value == 'hide') {
    document.getElementById('HUP-hide-troll-answers').disabled = false;
  } else {
    document.getElementById('HUP-hide-troll-answers').disabled = true;
  }
};
Hupper.checkHLUsers = function() {
  var hlUsers = document.getElementById('HUP-hupper-highlightusers').value.split(',');
  var trolls = document.getElementById('HUP-trolls').value.split(',');
  // var huppers = document.getElementById('HUP-huppers').value.split(',');
  var hlUsersObj = {};
  for(var i = 0, hl = hlUsers.length, hlUser; i < hl; i++) {
    hlUser = hlUsers[i].split(':');
    hlUsersObj[hlUser[0]] = hlUsers[1];
  }
  var used = new Array();
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
Hupper.mapWindows = function(onMap) {
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
  var enumerator = wm.getEnumerator('navigator:browser'), win;
  while(enumerator.hasMoreElements()) {
    win = enumerator.getNext();
    if(typeof win != 'undefined' && typeof onMap == 'function') {
      onMap(win);
    }
  }
};
Hupper.setUserManager = function (doc) {
  var scope = {},
      element = doc.getElementById('HUP-usermanagement'),
      hlUsers = HUP.hp.get.highlightusers().split(','),
      hlUsersObj = [], hlUser, hl, lastItem;
  for(i = 0, hl = hlUsers.length, hlUser; i < hl; i++) {
    hlUser = hlUsers[i].split(':');
    hlUsersObj.push({
        namecol: {text:hlUser[0], editable: true},
        colorcol: {text:hlUser[1].toUpperCase(), editable: true}
    });
  }
  lastItem = hlUsersObj[hlUsersObj.length - 1];

  if (lastItem.namecol.text !== '' && lastItem.colorcol.text) {
      hlUsersObj.push({
          namecol: {text:'', editable: true},
          colorcol: {text:'', editable: true}
      });
  }

  var log = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
  var isEmpty = function (item) {
      return item && item.namecol.text === '' && item.colorcol.text === '';
  };
  var isValidItem = function (colName, value) {
      var isDuplicate = false;
      if (colName === 'namecol') {
        isDuplicate = hlUsersObj.some(function (item) {
            return (value === item.namecol.text);
        });
      }
      return !isDuplicate;
  };
  var updateTree = function () {
    var output = [],
        lastItem = hlUsersObj[hlUsersObj.length - 1];

    // add extra row
    if (!isEmpty(lastItem)) {
        hlUsersObj.push({
            namecol: {text:'', editable: true},
            colorcol: {text:'', editable: true}
        });
    } else {
        // or remove the last one, because the one before the last is also empty
        while (hlUsersObj.length > 1 && isEmpty(hlUsersObj[hlUsersObj.length - 2])) {
            hlUsersObj.length = hlUsersObj.length - 1;
        }
    }
    hlUsersObj.forEach(function (item) {
        var name = item.namecol.text,
            color = item.colorcol.text;
        if (name || color) {
            output.push(name + ':' + color);
        }
    });

    var field = doc.getElementById('HUP-hupper-highlightusers');
    field.value = output.join(',');
    treeView = scope.treeView(hlUsersObj, element);
  };


  Components.utils.import('resource://huppermodules/TreeView.jsm', scope);
  var treeView = scope.treeView(hlUsersObj, element);
  treeView.on('setCellText', function (args) {
    var colName = args.col.id,
        value = args.text;
    //if (isValidItem(colName, value)) {
      hlUsersObj[args.row][colName].text = value;
    // }
    updateTree();
    if (element.view.selection) {
      element.view.selection.select(args.row);
    }
  });
  doc.getElementById('HUP-usermanagement-container').addEventListener('keypress', function (e) {
    if (e.keyCode == e.DOM_VK_DELETE || e.keyCode == e.DOM_VK_BACK_SPACE) {
        if (element.view.selection && element.editingRow === -1) {
          var index = element.view.selection.currentIndex;
          hlUsersObj.splice(element.view.selection.currentIndex, 1);
          updateTree();
          element.view.selection.select(index);
        }
    }
  }, false);
};
Hupper.resetBlocks = function() {
  if(confirm(HUP.Bundles.getString('confirmBlockReset'))) {
    HUP.hp.set.blocks('({})');
    alert(HUP.Bundles.getString('reloadHUPPlease'));
  }
};
Hupper.StartHupperPrefernces = function() {
  HUP = {};
  HUP.L = new Hupper.Log();
  HUP.hp = new HP();
  HUP.Bundles = document.getElementById('hupper-prefs-bundles');
  Hupper.disableFields();
  Hupper.setPrefWinVals();
  Hupper.onChangeFilterMethod();
  Hupper.setUserManager(document);
};
