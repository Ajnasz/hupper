/*jslint indent:2*/
/*global Components:true*/
var HupDB = function () {};
HupDB.prototype = {
  dbSchema: {
    tables: {
      styles: "styleURI TEXT NOT NULL PRIMARY KEY," +
                "isActive INTEGER"
    }
  },

  connect: function () {
    var Cc = Components.classes,
        Ci = Components.interfaces,
        dirService = Cc["@mozilla.org/file/directory_service;1"]
          .getService(Ci.nsIProperties),
        dbFile, dbService, dbConnection;

    dbFile = dirService.get("ProfD", Ci.nsIFile);
    dbFile.append("hupper.sqlite");

    dbService = Cc["@mozilla.org/storage/service;1"]
      .getService(Ci.mozIStorageService);

    if (!dbFile.exists()) {
      dbConnection = this._dbCreate(dbService, dbFile);
    } else {
      dbConnection = dbService.openDatabase(dbFile);
    }
    this.dbConnection = dbConnection;
  },

  query: function (query, params, callbacks) {
    var onFinish, onResult, onError, statement;
    this.connect();

    statement = this.dbConnection.createStatement(query);
    callbacks = typeof callbacks === 'object' && callbacks !== null ? callbacks : {};

    onFinish = typeof callbacks.onFinish === 'function' ? callbacks.onFinish : function () {};
    onResult = typeof callbacks.onResult === 'function' ? callbacks.onResult : function () {};
    onError = typeof callbacks.onError === 'function' ? callbacks.onError : function () {};
    params = typeof params === 'object' && params !== null ? params : {};

    for(let name in params) {
      if(params.hasOwnProperty(name)) {
        statement.params[name] = params[name];
      }
    }
    statement.executeAsync({
      handleResult: onResult,
      handleError: onError,
      handleCompletion: function (aReason) {
        if (aReason != Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED) {
          onError();
        } else {
          onFinish();
        }
      },
    });
    this.close();
  },
  close: function () {
    if(this.dbConnection) {
      if (typeof this.dbConnection.asyncClose === 'function') {
        this.dbConnection.asyncClose();
        this.dbConnection = null;
      } else {
        try {
          this.dbConnection.close();
          if (this.timer) {
            this.timer.cancel();
            this.timer = null;
          }
          this.dbConnection = null;
        } catch (e) {
          this.timer = Components.classes["@mozilla.org/timer;1"]
                  .createInstance(Components.interfaces.nsITimer),
              _this = this;

          this.timer.initWithCallback({notify: function () {
            _this.close();
          }}, 300, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
        }
      }
    }
  },

  _dbCreate: function (aDBService, aDBFile) {
    var dbConnection = aDBService.openDatabase(aDBFile);
    this._dbCreateTables(dbConnection);
    return dbConnection;
  },

  _dbCreateTables: function (aDBConnection) {
    for(var name in this.dbSchema.tables)
      aDBConnection.createTable(name, this.dbSchema.tables[name]);
  },
};
let EXPORTED_SYMBOLS = ['HupDB'];
