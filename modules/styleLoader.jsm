var logger = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService)
Components.utils.import('resource://huppermodules/hupdb.jsm');
var bind = function(fn, context) {
  var args = [];
  for (var i = 2; i < arguments.length; i++) {
    args.push(arguments[i]);
  }
  return function() {
    for (var i = 0; i < arguments.length; i++) {
      args.unshift(arguments[i]);
    }
    fn.apply(context, args);
  };
};

var Storage = function() {
  this.db = new HupDB();
};
Storage.prototype = {
  addStyle_: function(styleURI, isActive, onFinish, onError) {
      var q = 'INSERT INTO styles (styleURI,isActive) VALUES (:styleURI, :isActive)';
      this.db.query(q, {styleURI: styleURI, isActive: isActive ? 1 : 0}, {
        onFinish: onFinish,
        onError: onError
      });
  },
  addStyle: function(styleURI, isActive, onFinish, onError) {
    this.styleAdded(styleURI, bind(function(added) {
      logger.logStringMessage('style is added: ' + added);
      logger.logStringMessage(styleURI);
      if(!added) {
        this.addStyle_(styleURI, isActive, onFinish, onError);
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
  styleIsActive: function(styleURI, onFinish, onError) {
    var q = 'SELECT isActive AS active FROM styles WHERE styleURI=:styleURI';
    this.db.query(q, {styleURI: styleURI}, {
      onFinish: onFinish,
      onError: onError
    });
  },
  styleAdded_: function(aResultSet, onSuccess) {
    var styleAdded = false;
    if(aResultSet) {
      for (var row = aResultSet.getNextRow(); row; row = aResultSet.getNextRow()) {
        var value = row.getResultByName("count");
        styleAdded = value > 0;
      }
    }
    logger.logStringMessage('style added: ' + styleAdded);
    onSuccess(styleAdded);
  },
  styleAdded: function(styleURI, onResult, onError) {
    logger.logStringMessage('ask style added: ' + styleURI)
    var q = 'SELECT count(*) AS count FROM styles WHERE styleURI=:styleURI';
    var _this = this;
    this.db.query(q, {styleURI: styleURI}, {
      onResult: function(aResultSet) {
        _this.styleAdded_(aResultSet, onResult);
      },
      onError: onError
    });
  },
  activateStyle_: function(styleURI, onFinish) {
    var q = 'UPDATE styles SET isActive=1 WHERE styleURI=:styleURI';
    this.db.query(q, {styleURI: styleURI}, {onFinish: onFinish});
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
  deactivateStyle_: function(styleURI, onFinish) {
    var q = 'UPDATE styles SET isActive=0 WHERE styleURI=:styleURI';
    this.db.query(q, {styleURI: styleURI}, {
      onFinish: onFinish,
      onSuccess: function() {
        logger.logStringMessage('deactivate failed');
      }
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

    logger.logStringMessage('start get styles');
    var styles = [];
    this.db.query(q, {}, {
      onFinish: function() {
        logger.logStringMessage('on finish');
        onSuccess(styles);
      },
      onResult: function(aResultSet) {
        logger.logStringMessage('get styles');
        if(aResultSet) {
          for (let row = aResultSet.getNextRow(); row; row = aResultSet.getNextRow()) {
            styles.push(row.getResultByName("styleURI"));
          }
        }
      },
      onError: function () {
        logger.logStringMessage('get styles error');
      }
    });
  },
  getStyle: function(styleURI, callback) {
    var q = 'SELECT * FROM styles WHERE styleURI=:styleURI';
    var style = null;
    this.db.query(q, {styleURI: styleURI}, {
      onFinish: function() {
        callback(style);
      },
      onResult: function(aResultSet) {
        if(aResultSet) {
          for (let row = aResultSet.getNextRow(); row; row = aResultSet.getNextRow()) {
            style = {
              isActive: row.getResultByName('isActive'),
              styleURI: row.getResultByName('styleURI')
            }
          }
        }
      },
      onError: function () {
        logger.logStringMessage('get a style error');
      }
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
      logger.logStringMessage('load style:' + styleURI);
      if(!sss.sheetRegistered(uri, sss.AGENT_SHEET)) {
      logger.logStringMessage('load style!!:' + styleURI);
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
    unloadAll: function(callback,except) {
      var _this = this;
      logger.logStringMessage('call unload all');
      callback = typeof callback === 'function' ? callback : function() {};
      storage.getStyles(function(styles) {
        var unloadedStyles = 0;
        var onUnload = function() {
          unloadedStyles += 1;
          logger.logStringMessage('hupper unload: ' + unloadedStyles + ' !! ' + styles.length);
          if(unloadedStyles >= styles.length) {
            logger.logStringMessage('styles: ' + styles.toSource());
            callback();
          }
        };
        if(styles.length) {
          styles.forEach(function(style) {
            logger.logStringMessage('try to unload');
            if(!except.some(function(s){return s == style})) {
              _this.unLoad(style, onUnload);
            } else {
              onUnload();
            }
          });
        } else {
          callback();
        }
      });
    },
  };
};
let EXPORTED_SYMBOLS = ['StyleLoader'];
