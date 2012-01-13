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
            isTestEnv, bench, c, newComments;
        // logger.log(ww.location.hostname);
        if (ww && ww.location && typeof ww.location.hostname === 'string'
            && (ww.location.hostname === 'hup.hu' || ww.location.hostname === 'www.hup.hu' ||
              /http:\/\/(localhost\/hupper\/hg|hupper|hupperl)\/.+\.html/.test(ww.location.href))) {
            isTestEnv = ww.location.hostname === 'hupperl';
            if (isTestEnv) {
                Components.utils.import('resource://huppermodules/Bench.jsm', scope);
                bench = new scope.Bench();
            }
            /**
            * A unique global object to store all global objects/array/... of the Hupper Extension
            */
            Hupper.HUP = {};
            // Hupper.HUP document object
            Hupper.HUP.w = ww;
            Components.utils.import('resource://huppermodules/prefs.jsm', scope);
            Hupper.HUP.hp = new scope.HP();
            Components.utils.import('resource://huppermodules/hup-events.jsm', scope);
            Hupper.HUP.Ev = new scope.HUPEvents(Hupper.HUP.w);
            // Logger
            Hupper.HUP.L = new Hupper.Log();
            Hupper.postInstall();
            Hupper.styles();
            // Elementer
            elementer = new Hupper.Elementer(ww);
            Hupper.HUP.El = elementer;
            // Lang stuffs
            Hupper.HUP.Bundles = document.getElementById('hupper-bundles');
            // Hupper.addHupStyles();
            hupMenu = new Hupper.Menu();
            Hupper.HUP.BlockMenus = new Hupper.BlockMenus(hupMenu);
            // Stores the mark as read nodes
            Hupper.HUP.markReadNodes = [];
            Hupper.HUP.w.nextLinks = [];
            // if comments are available
            if (Hupper.HUP.El.GetId('comments')) {
                c = new Hupper.GetComments();
                newComments = c.newComments;
                Hupper.HUP.hp.get.showqnavbox(function (response) {
                    if (c.newComments.length && response.pref.value) {
                        Hupper.appendNewNotifier(null, null, hupMenu);
                    }
                });
            } else {
                Hupper.HUP.hp.get.insertnewtexttonode(function (response) {
                    if (response.pref.value) {
                        var nodes = Hupper.getNodes();
                        Hupper.parseNodes(nodes[0], nodes[1], new Hupper.NodeMenus(hupMenu));
                        Hupper.HUP.hp.get.showqnavbox(function (response) {
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
                    Hupper.HUP.hp.get.huppercolor(function (response) {
                        var color = response.pref.value || '#B5D7BE';
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
            Hupper.HUP.w.Jumps = new scope.HupJumper(Hupper.HUP.w, Hupper.HUP.w.nextLinks);
            if (isTestEnv) {
                bench.stop();
                Hupper.HUP.L.log('initialized', 'Run time: ' + bench.finish() + 'ms');
            }
            Hupper.HUP.hp.get.setunlimitedlinks(function (response) {
                if (response.pref.value) {
                    var linkParams = [
                        '/cikkek',
                        '/node',
                        '/szavazasok',
                        '/promo'
                    ], callStr = [];
                    linkParams.forEach(function (link) {
                        callStr.push('a[href^="' + link + '"]');
                        callStr.push('a[href^="' + link + '"]');
                        callStr.push('a[href^="' + link + '"]');
                        callStr.push('a[href^=" ' + link + '"]');
                        callStr.push('a[href^=" ' + link + '"]');
                        callStr.push('a[href^=" ' + link + '"]');
                        callStr.push('a[href^="http://hup.hu' + link + '"]');
                        callStr.push('a[href^="http://hup.hu' + link + '"]');
                        callStr.push('a[href^="http://hup.hu' + link + '"]');
                        callStr.push('a[href^=" http://hup.hu' + link + '"]');
                        callStr.push('a[href^=" http://hup.hu' + link + '"]');
                        callStr.push('a[href^=" http://hup.hu' + link + '"]');
                        callStr.push('a[href^="http://www.hup.hu' + link + '"]');
                        callStr.push('a[href^="http://www.hup.hu' + link + '"]');
                        callStr.push('a[href^="http://www.hup.hu' + link + '"]');
                        callStr.push('a[href^=" http://www.hup.hu' + link + '"]');
                        callStr.push('a[href^=" http://www.hup.hu' + link + '"]');
                        callStr.push('a[href^=" http://www.hup.hu' + link + '"]');
                    });
                    Array.prototype.slice
                        .call(Hupper.HUP.w.querySelectorAll(callStr.join(',')))
                        .forEach(function (elem) {
                        var link = elem.href,
                            parts = link.split('#');
                        if (parts[0].indexOf('?') > -1) {
                            parts[0] += '&';
                        } else {
                            parts[0] += '?';
                        }
                        parts[0] += 'comments_per_page=9999';
                        elem.href = parts.join('#');
                    });
                }
            });
        }
    } catch(e) {
        Components.classes["@mozilla.org/consoleservice;1"]
          .getService(Components.interfaces.nsIConsoleService)
          .logStringMessage('HUPPER: INIT ' + e.message + ', ' + e.lineNumber +
            ', ' + e.fileName + + ', ' + e.toString());
    }
};
