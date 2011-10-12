var HUP;
/*global Hupper: true*/
/**
 * Initialization function, runs when the page is loaded
 * @param {Event} e window load event object
 */
Hupper.boot = function (e) {
    try {
        var ww = e.originalTarget,
            logger = new Hupper.Log(),
            scope = {},
            elementer, hupMenu,
            isTestEnv, timer, c, newComments;
        // logger.log(ww.location.hostname);
        if (ww && ww.location && typeof ww.location.hostname === 'string'
            && (ww.location.hostname === 'hup.hu' || ww.location.hostname === 'www.hup.hu' ||
              /http:\/\/(localhost\/hupper\/hg|hupper|hupperl)\/.+\.html/.test(ww.location.href))) {
            isTestEnv = ww.location.hostname === 'hupperl';
            if (isTestEnv) {
                Components.utils.import('resource://huppermodules/timer.jsm', scope);
                timer = new scope.Timer();
            }
            /**
            * A unique global object to store all global objects/array/... of the Hupper Extension
            */
            HUP = {};
            // HUP document object
            HUP.w = ww;
            Components.utils.import('resource://huppermodules/prefs.jsm', scope);
            HUP.hp = new scope.HP();
            Components.utils.import('resource://huppermodules/hup-events.jsm', scope);
            HUP.Ev = new scope.HUPEvents(HUP.w);
            // Logger
            HUP.L = new Hupper.Log();
            Hupper.postInstall();
            Hupper.styles();
            // Elementer
            elementer = new Hupper.Elementer(ww);
            HUP.El = elementer;
            // Lang stuffs
            HUP.Bundles = document.getElementById('hupper-bundles');
            // Hupper.addHupStyles();
            hupMenu = new Hupper.Menu();
            HUP.BlockMenus = new Hupper.BlockMenus(hupMenu);
            // Stores the mark as read nodes
            HUP.markReadNodes = [];
            HUP.w.nextLinks = [];
            // if comments are available
            if (HUP.El.GetId('comments')) {
                c = new Hupper.GetComments();
                newComments = c.newComments;
                HUP.hp.get.showqnavbox(function (response) {
                    if (c.newComments.length && response.pref.value) {
                        Hupper.appendNewNotifier(null, null, hupMenu);
                    }
                });
            } else {
                HUP.hp.get.insertnewtexttonode(function (response) {
                    if (response.pref.value) {
                        var nodes = Hupper.getNodes();
                        Hupper.parseNodes(nodes[0], nodes[1], new Hupper.NodeMenus(hupMenu));
                        HUP.hp.get.showqnavbox(function (response) {
                            if (nodes[1].length > 0 && response.pref.value) {
                                Hupper.appendNewNotifier('#node-' + nodes[1][0].id, true, hupMenu);
                            }
                        });
                    }
                });
            }
            Hupper.setBlocks();
            var markAsTroll = function (element) {
                var user, trolls, isAdded;
                if (element) {
                    Components.utils.import('resource://huppermodules/trollHandler.jsm', scope);
                    user = element.innerHTML;
                    scope.trollHandler.addTroll(user, function () {
                        if (c) {
                            c.comments.forEach(function (comment) {
                                if (comment.user === user) {
                                    comment.setTroll();
                                }
                            });
                        }
                    });
                  }
            };
            document.getElementById('HUP-markAsTroll').addEventListener('command', function (e) {
                var element = document.popupNode;
                markAsTroll(element);
            }, false);
            document.getElementById('HUP-unmarkTroll').addEventListener('command', function (e) {
                var element = document.popupNode, user, trolls, output, isAdded;
                if (element) {
                    Components.utils.import('resource://huppermodules/trollHandler.jsm', scope);
                    user = element.innerHTML;
                    scope.trollHandler.removeTroll(user, function () {
                        if (c) {
                            c.comments.forEach(function (comment) {
                                if (comment.user === user) {
                                    comment.unsetTroll();
                                }
                            });
                        }
                    });
                }
            }, false);
            document.getElementById('HUP-highilghtUser').addEventListener('command', function (e) {
                var element = document.popupNode, user, trolls, output, isAdded;
                if (element) {
                    Components.utils.import('resource://huppermodules/trollHandler.jsm', scope);
                    user = element.innerHTML;
                    HUP.hp.get.huppercolor(function (response) {
                        var color = response.pref.value || '#A5FF9F';
                        scope.trollHandler.highlightUser(user, color, function () {
                            if (c) {
                                c.comments.forEach(function (comment) {
                                    if (comment.user === user) {
                                        comment.highLightComment(color);
                                    }
                                });
                            }
                        });
                    });
                }
            }, false);
            document.getElementById('HUP-unhighilghtUser').addEventListener('command', function (e) {
                var element = document.popupNode, user, trolls, output, isAdded;
                if (element) {
                    Components.utils.import('resource://huppermodules/trollHandler.jsm', scope);
                    user = element.innerHTML;
                    scope.trollHandler.unhighlightUser(user, function () {
                        if (c) {
                            c.comments.forEach(function (comment) {
                                if (comment.user === user) {
                                    comment.unhighLightComment();
                                }
                            });
                        }
                    });
                }
            }, false);

            Components.utils.import('resource://huppermodules/hupjumper.jsm', scope);
            HUP.w.Jumps = new scope.HupJumper(HUP.w, HUP.w.nextLinks);
            if (isTestEnv) {
                timer.stop();
                HUP.L.log('initialized', 'Run time: ' + timer.finish() + 'ms');
            }
        }
    } catch(e) {
        Components.classes["@mozilla.org/consoleservice;1"]
          .getService(Components.interfaces.nsIConsoleService)
          .logStringMessage('HUPPER: ' + e.message + ', ' + e.lineNumber, +
            ', ' + e.fileName, + ', ' + e.toString());
    }
};
