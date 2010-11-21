var StyleLoader = function() {
  var sss, ios, getURI, loadedStyles = [];


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
        loadedStyles.push(styleURI);
      }
    },
    unLoad: function(styleURI) {
      var uri = getURI(styleURI);
      if(sss.sheetRegistered(uri, sss.AGENT_SHEET)) {
        sss.unregisterSheet(uri, sss.AGENT_SHEET);
        for (var i = 0; i < loadedStyles.length; i++) {
          if(loadedStyles[i] === styleURI) {
            loadedStyles.slice(i, 1);
            break;
          }
        }
      }
    },
    getLoadedStyles: function() {
      return loadedStyles;
    },
  };
};
let EXPORTED_SYMBOLS = ['StyleLoader'];
