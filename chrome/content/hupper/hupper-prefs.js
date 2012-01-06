/*global Hupper: true, HUP: true*/
/**
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
 * @licence General Public Licence v2
 */
Hupper.prefItems = [
    {id: 'HUP-enable-trollfilter', prefName: 'filtertrolls'},
    {id: 'HUP-trolls', prefName: 'trolls'},
    {id: 'HUP-troll-color', prefName: 'trollcolor'},
    {id: 'HUP-trollfilter-method', prefName: 'trollfiltermethod'},
    // {id: 'HUP-enable-hupperfilter', prefName: 'filterhuppers'},
    // {id: 'HUP-huppers', prefName: 'huppers'},
    // {id: 'HUP-hupper-color', prefName: 'huppercolor'},
    {id: 'HUP-enable-new-comment-changer', prefName: 'replacenewcommenttext'},
    {id: 'HUP-new-comment-text', prefName: 'newcommenttext'},
    {id: 'HUP-enable-extra-comment-links', prefName: 'extracommentlinks'},
    {id: 'HUP-hilight-forum-lines-onhover', prefName: 'hilightforumlinesonhover'},
    {id: 'HUP-insert-permalink', prefName: 'insertpermalink'},
    {id: 'HUP-insert-new-text-to-node', prefName: 'insertnewtexttonode'},
    {id: 'HUP-fade-parent-comment', prefName: 'fadeparentcomment'},
    {id: 'HUP-show-quick-nav-box', prefName: 'showqnavbox'},
    {id: 'HUP-hide-troll-answers', prefName: 'hidetrollanswers'},
    {id: 'HUP-hupper-highlightusers', prefName: 'highlightusers'},
    {id: 'HUP-hide-taxonomy', prefName: 'hidetaxonomy'},
    {id: 'HUP-show-in-statusbar', prefName: 'showinstatusbar'},
    {id: 'HUP-parseblocks', prefName: 'parseblocks'},
    {id: 'HUP-style-indent', prefName: 'styleIndent'},
    {id: 'HUP-style-accessibility', prefName: 'styleAccessibility'},
    {id: 'HUP-style-sidebar-width', prefName: 'styleWiderSidebar'},
    {id: 'HUP-style-min-fontsize', prefName: 'styleMinFontsize'},
    {id: 'HUP-set-unlimited-links', prefName: 'setunlimitedlinks'},
    {id: 'HUP-boring-comment-contents', prefName: 'boringcommentcontents'}
    // {id: 'HUP-hupper-password', prefName: 'getPassword'},
    // {id: 'HUP-hupper-username', prefName: 'username'}
];
Hupper.setPrefWinVals = function () {
    Hupper.prefItems.forEach(function (item) {
        var elem = document.getElementById(item.id);
        Hupper.HUP.hp.get[item.prefName](function (response) {
            var value = response.pref.value;
            if (elem.nodeName.toLowerCase() === 'checkbox') {
                elem.checked = value;
            } else {
                elem.value = value;
            }
        });
    });
};
Hupper.savePreferences = function () {
    if (!Hupper.checkHLUsers()) {
        return false;
    }
    Hupper.prefItems.forEach(function (item) {
        var elem = document.getElementById(item.id),
            value;
        if (elem.nodeName.toLowerCase() === 'checkbox') {
            value = elem.checked;
        } else {
            value = elem.value;
        }
        value = Hupper.HUP.hp.set[item.prefName](value);
    });
    var hideIcon = !Hupper.HUP.hp.get.showinstatusbar();
    Hupper.mapWindows(function (win) {
        win.document.getElementById('HUP-statusbar').hidden = hideIcon;
    });
    Hupper.styles();
    return true;
};
Hupper.disableFields = function () {
    document.getElementById('HUP-trollfilter-method')
      .addEventListener('command', Hupper.onChangeFilterMethod, false);
};
Hupper.onChangeFilterMethod = function () {
    if (document.getElementById('HUP-trollfilter-method').value === 'hide') {
        document.getElementById('HUP-hide-troll-answers').disabled = false;
    } else {
        document.getElementById('HUP-hide-troll-answers').disabled = true;
    }
};
Hupper.checkHLUsers = function () {
    var hlUsers = document.getElementById('HUP-hupper-highlightusers').value.split(','),
        trolls = document.getElementById('HUP-trolls').value.split(','),
    // var huppers = document.getElementById('HUP-huppers').value.split(',');
        hlUsersObj = {}, i, hl, hlUser, tl, used;
    for (i = 0, hl = hlUsers.length; i < hl; i += 1) {
        hlUser = hlUsers[i].split(':');
        hlUsersObj[hlUser[0]] = hlUsers[1];
    }
    used = [];
    for (i = 0, tl = trolls.length; i < tl; i += 1) {
        if (hlUsersObj[trolls[i]]) {
            used.push(trolls[i]);
        }
    }
    if (used.length > 0) {
        return confirm(Hupper.HUP.Bundles.getFormattedString('userIsTroll', [used.join(', ')]));
    }
    return true;
};
/**
 * Run the given parameter for every window
 * @param {Function} onMap A function which should run for every opened window
 */
Hupper.mapWindows = function(onMap) {
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator),
        enumerator = wm.getEnumerator('navigator:browser'), win;

    while (enumerator.hasMoreElements()) {
        win = enumerator.getNext();
        if (typeof win !== 'undefined' && typeof onMap === 'function') {
            onMap(win);
        }
    }
};

Hupper.treeviewer = function (doc, options) {
    var scope = {},
        element = doc.getElementById(options.treeId),
        rows = options.rows,
        rowsObject,
        lastItem, view;

    Components.utils.import('resource://huppermodules/TreeView.jsm', scope);
    // create a treeview, it will create the events too
    view = scope.TreeView();

    rowsObject = options.rowsToTree(rows);

    var updateTree = function () {
        var output = [],
            lastItem = rowsObject[rowsObject.length - 1];

        // add extra row
        if (!options.isEmpty(lastItem)) {
            rowsObject.push(options.getEmptyRow());
        } else {
            // or remove the last one, because the one before the last is also empty
            while (rowsObject.length > 1 && options.isEmpty(rowsObject[rowsObject.length - 2])) {
                rowsObject.length = rowsObject.length - 1;
            }
        }

        output = options.treeObjectToRow(rowsObject);
        var field = doc.getElementById(options.storageFieldId);
        field.value = options.rowsToVal(output);
        view.treeView(rowsObject, element);
    };

    view.events.on('setCellText', function (args) {
        var colName = args.col.id,
            value = args.text;
        rowsObject[args.row][colName].text = value;
        updateTree();
        if (element.view.selection) {
            element.view.selection.select(args.row);
        }
    });
    doc.getElementById(options.treeContainerId).addEventListener('keypress', function (e) {
        if (e.keyCode == e.DOM_VK_DELETE || e.keyCode == e.DOM_VK_BACK_SPACE) {
            if (element.view.selection && element.editingRow === -1) {
                var index = element.view.selection.currentIndex;
                rowsObject.splice(element.view.selection.currentIndex, 1);
                updateTree();
                element.view.selection.select(index);
            }
        }
    }, false);
    updateTree();
};

Hupper.setTrollManager = function (doc) {
  Hupper.treeviewer(doc, {
      rows: Hupper.HUP.hp.get.trolls().split(','),
      treeId: 'HUP-trollmanagement',
      treeContainerId: 'HUP-trollmanagement-container',
      storageFieldId: 'HUP-trolls',
      isEmpty: function (row) {
          return row && row.namecol.text === '';
      },
      getEmptyRow: function () {
          return {namecol: {text: '', editable: true}};
      },
      rowsToTree: function (rows) {
          return rows.map(function (row) {
              return {namecol: {text: row, editable: true}};
          });
      },
      treeObjectToRow: function (rows) {
          var output = [];
          rows.forEach(function (row) {
              if (row) {
                  output.push(row.namecol.text);
              }
          });
          return output;
      },
      rowsToVal: function (rows) {
          return rows.join(',');
      }
  });
};

Hupper.setUserManager = function (doc) {
  Hupper.treeviewer(doc, {
      rows: Hupper.HUP.hp.get.highlightusers().split(','),
      treeId: 'HUP-usermanagement',
      treeContainerId: 'HUP-usermanagement-container',
      storageFieldId: 'HUP-hupper-highlightusers',
      isEmpty: function (row) {
          return row && row.namecol.text === '' && row.colorcol.text === '';
      },
      getEmptyRow: function () {
          return {namecol: {text: '', editable: true}, colorcol: {text: '', editable: true}};
      },
      rowsToTree: function (rows) {
          return rows.map(function (row) {
              var hlUser = row.split(':');
              return {
                namecol: {text:hlUser[0], editable: true},
                colorcol: {text:hlUser[1].toUpperCase(), editable: true}
              };
          });
      },
      treeObjectToRow: function (rows) {
          var output = [];
          rows.forEach(function (row) {
              var name = row.namecol.text,
                  color = row.colorcol.text;
              if (name || color) {
                  output.push(row.namecol.text + ':' + row.colorcol.text);
              }
          });
          return output;
      },
      rowsToVal: function (rows) {
          return rows.join(',');
      }
  });
  return;
  var scope = {},
      treeId = 'HUP-usermanagement',
      treeParentId = 'HUP-hupper-highlightusers',
      element = doc.getElementById(treeId),
      hlUsers = Hupper.HUP.hp.get.highlightusers().split(','),
      hlUsersObj = [],
      emptyRow = {
          namecol: {text:'', editable: true},
          colorcol: {text:'', editable: true}
      },
      isEmpty, isValidItem, updateTree,
      hlUser, hl, lastItem;

  Components.utils.import('resource://huppermodules/TreeView.jsm', scope);
  scope.treeView = scope.TreeView();

  hlUsersObj = hlUsers.map(function (item) {
      var hlUser = item.split(':');
      return {
        namecol: {text:hlUser[0], editable: true},
        colorcol: {text:hlUser[1].toUpperCase(), editable: true}
    };
  });

  lastItem = hlUsersObj[hlUsersObj.length - 1];

  if (lastItem.namecol.text !== '' && lastItem.colorcol.text) {
      hlUsersObj.push(emptyRow);
  }

  isEmpty = function (item) {
      return item && item.namecol.text === '' && item.colorcol.text === '';
  };
  isValidItem = function (colName, value) {
      var isDuplicate = false;
      if (colName === 'namecol') {
        isDuplicate = hlUsersObj.some(function (item) {
            return (value === item.namecol.text);
        });
      }
      return !isDuplicate;
  };
  updateTree = function () {
      var output = [],
          lastItem = hlUsersObj[hlUsersObj.length - 1];

      // add extra row
      if (!isEmpty(lastItem)) {
          hlUsersObj.push(emptyRow);
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

      var field = doc.getElementById(treeParentId);
      field.value = output.join(',');
      treeView = scope.treeView(hlUsersObj, element);
  };


  scope.treeView(hlUsersObj, element);
  scope.treeView.events.on('setCellText', function (args) {
    var colName = args.col.id,
        value = args.text;
    if (isValidItem(colName, value)) {
      hlUsersObj[args.row][colName].text = value;
    }
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
  if(confirm(Hupper.HUP.Bundles.getString('confirmBlockReset'))) {
    Hupper.HUP.hp.set.blocks('({})');
    alert(Hupper.HUP.Bundles.getString('reloadHUPPlease'));
  }
};
Hupper.StartHupperPrefernces = function() {
  var scope = {};
  Components.utils.import('resource://huppermodules/prefs.jsm', scope);
  Hupper.HUP = {};
  Hupper.HUP.hp = new scope.HP();
  Hupper.HUP.L = new Hupper.Log();
  Hupper.HUP.Bundles = document.getElementById('hupper-prefs-bundles');
  Hupper.disableFields();
  Hupper.setPrefWinVals();
  Hupper.onChangeFilterMethod();
  Hupper.setUserManager(document);
  Hupper.setTrollManager(document);
};
