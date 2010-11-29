var logger = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService)
Components.utils.import('resource://huppermodules/hupdb.jsm');
var bind = function(fn, context) {
  var args = [];
  for (var i = 2; i < arguments.length; i++) {
    args.push(arguments[i]);
  }
  logger.logStringMessage(args.toSource());
  return function() {
    fn.apply(context, args);
  };
};

var Storage = function() {
  this.db = new HupDB();
};
Storage.prototype = {
  addStyle_: function(styleURI, isActive, onSuccess, onError) {
      var q = 'INSERT INTO styles (styleURI,isActive) VALUES (:styleURI, :isActive)';
      this.db.query(q, {styleURI: styleURI, isActive: isActive ? 1 : 0}, onSuccess, onError);
  },
  addStyle: function(styleURI, isActive, onSuccess, onError) {
    this.styleAdded(styleURI, bind(function(added) {
      if(!added) {
        this.addStyle_(styleURI, isActive, onSuccess, onError);
      }
    }, this));
  },
  styleIsActive_: function(aResultSet, onSuccess) {
    var styleActive = false;
    onSuccess = typeof onSuccess === 'function' ? onSuccess : function() {
    }
    for (let row = aResultSet.getNextRow(); row; row = aResultSet.getNextRow()) {
      let value = row.getResultByName("active");
      styleActive = !!value;
    }
    logger.logStringMessage('hupper style active: '  + styleActive);
    onSuccess(styleActive);
  },
  styleIsActive: function(styleURI, onSuccess, onError) {
    var q = 'SELECT isActive AS active FROM styles WHERE styleURI=:styleURI';
    this.db.query(q, {styleURI: styleURI}, onSuccess, onError);
  },
  styleAdded_: function(aResultSet, onSuccess) {
    var styleAdded = false;
    for (let row = aResultSet.getNextRow(); row; row = aResultSet.getNextRow()) {
      let value = row.getResultByName("count");
      styleAdded = value > 0;
    }
    logger.logStringMessage('style added: ' + styleAdded);
    onSuccess(styleAdded);
  },
  styleAdded: function(styleURI, onSuccess, onError) {
    var q = 'SELECT count(*) AS count FROM styles WHERE styleURI=:styleURI';
    var _this = this;
    this.db.query(q, {styleURI: styleURI}, function(aResultSet) {
      _this.styleAdded_(aResultSet, onSuccess);
    }, onError);
  },
  activateStyle_: function(styleURI, onSuccess) {
    var q = 'UPDATE styles SET isActive=1 WHERE styleURI=:styleURI';
    this.db.query(q, {styleURI: styleURI}, onSuccess);
  },
  activateStyle: function(styleURI, onSuccess) {
    this.styleAdded(styleURI, bind(function(added) {
      if(added) {
        this.styleIsActive(styleURI, bind(function() {
          this.activateStyle_(styleURI, onSuccess);
        }, this, styleURI));
      }
    }, this));
  },
  deactivateStyle_: function(styleURI, onSuccess) {
    var q = 'UPDATE styles SET isActive=0 WHERE styleURI=:styleURI';
    this.db.query(q, {styleURI: styleURI}, onSuccess, function() {
      logger.logStringMessage('deactivate failed');
    });
  },
  deactiveateStyle: function(styleURI, onSuccess) {
    logger.logStringMessage('call deactivateStyle_');
    this.styleAdded(styleURI, bind(function(added) {
      logger.logStringMessage('DEACTIVATE STYLE' + styleURI + ' ' + added)
      if(added) {
        this.styleIsActive(styleURI, bind(function() {
          this.deactivateStyle_(styleURI, onSuccess);
        }, this));
      } else {
        onSuccess();
      }
    }, this));
  },
  getStyles: function(onSuccess) {
    var q = 'SELECT * FROM styles';
    this.db.query(q, {}, function(aResultSet) {
      var styles = [];
      for (let row = aResultSet.getNextRow(); row; row = aResultSet.getNextRow()) {
        styles.push(row.getResultByName("styleURI"));
      }
      onSuccess(styles);
    });
  },
};

var StyleLoader = function() {
  var sss, ios, getURI;
  var storage = new Storage();


  sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
                  .getService(Components.interfaces.nsIStyleSheetService);
  ios = Components.classes["@mozilla.org/network/io-service;1"]
                  .getService(Components.interfaces.nsIIOService);



  getURI = function(codeOrUri) {
    var output;
    var path = codeOrUri.indexOf('chrome://') == 0;
    if(!path) {
		  output = ios.newURI("data:text/css," + encodeURIComponent(codeOrUri), null, null);
    } else {
      output = ios.newURI(codeOrUri, null, null);
    }
    return output;
  };
  return {
    load: function(styleURI) {
      var uri = getURI(styleURI);
      if(!sss.sheetRegistered(uri, sss.AGENT_SHEET)) {
        sss.loadAndRegisterSheet(uri, sss.AGENT_SHEET);
        storage.addStyle(styleURI, true);
      }
    },
    unLoad: function(styleURI, callback) {
      var uri = getURI(styleURI);
      callback = typeof callback === 'function' ? callback : function() {
        logger.logStringMessage('hupper: dummy unload');
      };
      if(sss.sheetRegistered(uri, sss.AGENT_SHEET)) {
        sss.unregisterSheet(uri, sss.AGENT_SHEET);
        storage.deactiveateStyle(styleURI, callback);
      } else {
        callback();
      }
    },
    unloadAll: function(callback) {
      var _this = this;
      callback = typeof callback === 'function' ? callback : function() {};
      storage.getStyles(function(styles) {
        var unloadedStyles = 0;
        var onUnload = function() {
          unloadedStyles += 1;
          logger.logStringMessage('hupper unload: ' + unloadedStyles + ' !! ' + styles.length);
          if(unloadedStyles == styles.length) {
            logger.logStringMessage('styles: ' + styles.toSource());
            callback();
          }
        };
        styles.forEach(function(style) {
          logger.logStringMessage('try to unload');
          _this.unLoad(style, onUnload);
        });
      });
    },
  };
};
let EXPORTED_SYMBOLS = ['StyleLoader'];
