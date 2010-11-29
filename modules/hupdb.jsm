var HupDB = function() {}
HupDB.prototype = {
  dbSchema: {
     tables: {
       styles: "styleURI TEXT NOT NULL PRIMARY KEY," +
                "isActive INTEGER"
    }
  },

  connect: function() {
    var Cc = Components.classes,
        Ci= Components.interfaces;
    var dirService = Cc["@mozilla.org/file/directory_service;1"].
      getService(Ci.nsIProperties);

    var dbFile = dirService.get("ProfD", Ci.nsIFile);
    dbFile.append("hupper.sqlite");

    var dbService = Cc["@mozilla.org/storage/service;1"].
      getService(Ci.mozIStorageService);

    var dbConnection;

    if (!dbFile.exists())
      dbConnection = this._dbCreate(dbService, dbFile);
    else {
      dbConnection = dbService.openDatabase(dbFile);
    }
    this.dbConnection = dbConnection;
  },

  query: function(query, params, onSuccess, onError) {
    this.connect();

    var statement = this.dbConnection.createStatement(query);

    onSuccess = typeof onSuccess === 'function' ? onSuccess : function() {};
    onError = typeof onError === 'function' ? onError : function() {};
    params = typeof params === 'object' && params ? params : {};
    for(var name in params) {
      if(params.hasOwnProperty(name)) {
        statement.params[name] = params[name];
      }
    }
    statement.executeAsync({
      handleResult: onSuccess,
      handleError: onError,
      handleCompletion: function(aReason) {
        if (aReason != Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED) {
        }
      },
    });
    this.close();
  },
  close: function() {
    if(this.dbConnection) {
      this.dbConnection.asyncClose();
      this.dbConnection = null;
    }
  },

  _dbCreate: function(aDBService, aDBFile) {
    var dbConnection = aDBService.openDatabase(aDBFile);
    this._dbCreateTables(dbConnection);
    return dbConnection;
  },

  _dbCreateTables: function(aDBConnection) {
    for(var name in this.dbSchema.tables)
      aDBConnection.createTable(name, this.dbSchema.tables[name]);
  },
};
let EXPORTED_SYMBOLS = ['HupDB'];
