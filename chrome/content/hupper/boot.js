/**
 * Initialization function, runs when the page is loaded
 * @param {Event} e window load event object
 */
Hupper.boot = function(e) {
  try {
    var ww = e.originalTarget;
    var logger = new Hupper.Log();
    // logger.log(ww.location.hostname);
    if(ww && ww.location && typeof ww.location.hostname == 'string'
        && (ww.location.hostname == 'hup.hu' || ww.location.hostname == 'www.hup.hu' ||
        /http:\/\/(localhost\/hupper\/hg|hupper|hupperl)\/.+\.html/.test(ww.location.href))) {
      var isTestEnv = ww.location.hostname === 'hupperl';
      if (isTestEnv) {
      alert("O")
        Components.utils.import('resource://huppermodules/timer.jsm');
      alert("O")
        var TIMER = new Timer();
      }
      /**
      * A unique global object to store all global objects/array/... of the Hupper Extension
      */
      HUP = {};
      var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);  
      var newWindow = wm.getMostRecentWindow("navigator:browser");  
      var b = newWindow.getBrowser();
      // HUP document object
      HUP.w = ww;
      HUP.hp = new HP();
      // Logger
      HUP.L = new Hupper.Log();
      Hupper.postInstall();
      // Elementer
      var elementer = new Hupper.Elementer(ww);;
      HUP.El = elementer;
      HUP.Ev = new HUPEvents();
      // Lang stuffs
      HUP.Bundles = document.getElementById('hupper-bundles');
      // Hupper.addHupStyles();
      var hupMenu = new Hupper.Menu();
      HUP.BlockMenus = new Hupper.BlockMenus(hupMenu);
      // Stores the mark as read nodes
      HUP.markReadNodes = [];
      HUP.w.nextLinks = [];
      // if comments are available
      if(HUP.El.GetId('comments')) {
        var c = new Hupper.GetComments();
        var newComments = c.newComments;
        if(c.newComments.length && HUP.hp.get.showqnavbox()) {
          Hupper.appendNewNotifier(null, null, hupMenu);
        }
      } else {
        if(HUP.hp.get.insertnewtexttonode()) {
          var nodes = Hupper.getNodes();
          Hupper.parseNodes(nodes[0], nodes[1], new Hupper.NodeMenus(hupMenu));
          if(nodes[1].length > 0 && HUP.hp.get.showqnavbox()) {
            Hupper.appendNewNotifier('#node-' + nodes[1][0].id, true, hupMenu);
          }
        }
      }
      Hupper.setBlocks();
      Hupper.styles();
     //  if(HupperPrefs.hideads()) {
     //    Hupper.hideHupAds();
     //  }
     //  bindHUPKeys();
      Components.utils.import('resource://huppermodules/hupjumper.jsm');
      HUP.w.Jumps = new HupJumper(HUP.w, HUP.w.nextLinks);
      if (isTestEnv) {
        TIMER.stop();
        HUP.L.log('initialized', 'Run time: ' + TIMER.finish() + 'ms');
      }
    }
  } catch(e) {
    Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService).logStringMessage('HUPPER: ' + e.message + ', ' + e.lineNumber, + ', ' + e.fileName, + ', ' + e.toString());
  }
};
