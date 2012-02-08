/**
 * @description Mozilla logging service, is a class to make the logging easier
 */
 /*global Components:true */
var hupperLog = function () {
    var service = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService),
      msg = [],
      i, al;
    for (i = 0, al = arguments.length; i < al; i += 1) {
        msg.push(arguments[i]);
    }
    try {
        service.logStringMessage('HUPPER: ' + msg.join(', '));
    } catch (er) {}
};

var EXPORTED_SYMBOLS = ['hupperLog'];
