(function () {
    var Hupper = {},
        initialize;
    /**
    * If some data format has been changed, the postinstall
    * will convert the datas to the newer format
    * @method postInstall
    */
    function postInstall() {
        var HUPPER_VERSION = '###VERSION###',
            scope = {}, prefs, convertColors, convertBlockSettings,
            parseVersion, oldVerValue, version;
        Components.utils.import('resource://huppermodules/prefs.jsm', scope);
        prefs = new scope.HP();

        /**
        * !Previous < 0.0.5.3
        * adds the old huppers to the highlighted users with
        * the color of the huppers
        */
        convertColors = function () {
            var filterhuppers = prefs.get.filterhuppers(),
                huppers, color, colors;
            if (filterhuppers) {
                huppers = prefs.get.huppers().split(',');
                color = prefs.get.huppercolor();
                colors = prefs.get.highlightusers();
                huppers.forEach(function (hup_user) {
                    colors += ',' + hup_user + ':' + color;
                });
                prefs.set.highlightusers(colors);
                prefs.set.huppercolor('');
                prefs.set.huppers('');
            }
        };
        convertBlockSettings = function () {
            var blocks = JSON.parse(prefs.get.blocks()), output, block;
            output = {
                left: [],
                right: []
            };

            if (!blocks['block-blog-0']) {
                for (block in blocks) {
                    if (block.left) {
                        output.left.push(block);
                    } else {
                        block.right.push(block);
                    }
                }
                output.left.sort(function (a, b) {
                    return a.index > b.index;
                });
                output.right.sort(function (a, b) {
                    return a.index > b.index;
                });
            } else if (blocks.left || blocks.right) {
                output = blocks;
            }
            prefs.set.blocks(JSON.stringify(output));
        };

        /**
        * creates a float number from the ver param, which will
        * be comparable to decide which version is the newer
        * @param {String} ver the version number as a string
        * @returns a float number. 0 < NUMBER < 1
        * @type Float
        */
        parseVersion = function (ver) {
            return parseFloat('0.' + ver.replace(/\.|[^\d]/g, ''));
        };



        oldVerValue = 0; // previous version
        Components.utils.import('resource://huppermodules/log.jsm', scope);
        try {
            oldVerValue = parseVersion(prefs.M.getCharPref('extensions.hupper.version'));
        } catch (er) {
            scope.hupperLog('postinstallerror: ', er.message);
        }

        version = parseVersion(HUPPER_VERSION); // current version eg.: 0.0053
        if (!oldVerValue || oldVerValue < HUPPER_VERSION) {

            // after the v0.0.5.3 the huppers were removed
            if (oldVerValue < 0.0053) {
                try {
                    convertColors();
                } catch (e) {
                    scope.hupperLog('postinstallerror2', e.message, e.fileName, e.lineNumber);
                }
            } else if (oldVerValue < 0.0054) {
                convertBlockSettings();
            }
            scope.hupperLog('postinstall', version, oldVerValue);
            prefs.M.setCharPref('extensions.hupper.version', HUPPER_VERSION);
        }
    }

    function statusbarIconHandling(sites) {
        var scope = {};
        Components.utils.import('resource://huppermodules/prefs.jsm', scope);
        (new scope.HP()).get.showinstatusbar(function (response) {
            var showInStatusbar = response.pref.value,
                statusbar = document.getElementById('HUP-statusbar'),
                handler;
            statusbar.hidden = !showInStatusbar;
            if (showInStatusbar) {
                Components.utils.import('resource://huppermodules/statusclickhandler.jsm', scope);
                handler = new scope.StatusClickHandler(statusbar, sites);
            }
        });
    }

    function contextMenuHandling(sites) {
        var scope = {},
//            getSite,
            highilghtUser,
            markAsTroll;
        /*
        getSite = function () {
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
              .getService(Components.interfaces.nsIWindowMediator),
              browser, doc, site;
            if (wm) {
                browser = wm.getMostRecentWindow('navigator:browser');
                doc = browser.content.document;
                sites.forEach(function (s) {
                    if (s.doc === doc) {
                        site = s;
                    }
                });
                return site;
            }
            return null;
        };
        */
        markAsTroll = function (mark) {
            var user, trolls, isAdded, handlerMethod,
                element = document.popupNode;

            if (element) {
                Components.utils.import('resource://huppermodules/trollHandler.jsm', scope);
                user = element.innerHTML;
                handlerMethod = mark ? scope.trollHandler.addTroll : scope.trollHandler.removeTroll;
                handlerMethod.call(scope.trollHandler, user, function () {
                    sites.forEach(function (site) {
                        var comments;
                        if (!site) {
                            Components.utils.reportError('Site not found!');
                            return false;
                        }
                        if (site.comments && site.comments.comments) {
                            comments = site.comments.comments;
                            comments.forEach(function (comment) {
                                if (comment.user === user) {
                                    if (mark) {
                                        comment.setTroll();
                                    } else {
                                        comment.unsetTroll();
                                    }
                                }
                            });
                        }
                    });
                });
            }
        };
        document.getElementById('HUP-markAsTroll').addEventListener('command', function (e) {
            markAsTroll(true);
        }, false);
        document.getElementById('HUP-unmarkTroll').addEventListener('command', function (e) {
            markAsTroll(false);
        }, false);
        highilghtUser = function (highlight) {
            var element = document.popupNode;
            if (element) {
                var user;
                Components.utils.import('resource://huppermodules/trollHandler.jsm', scope);
                user = element.innerHTML;
                prefs.get.huppercolor(function (response) {
                    sites.forEach(function (site) {
                        var hlMethod, color, comments;
                        if (!site) {
                            Components.utils.reportError('Site not found!');
                            return false;
                        }
                        if (highlight) {
                            color = response.pref.value || '#B5D7BE';
                            scope.trollHandler.highlightUser(user, color, function () {
                                if (site.comments && site.comments.comments) {
                                    comments = site.comments.comments;
                                    comments.forEach(function (comment) {
                                        if (comment.user === user) {
                                            if (highlight) {
                                              comment.highLightComment(color);
                                            } else {
                                              comment.unhighLightComment(color);
                                            }
                                        }
                                    });
                                }
                            });
                        } else {
                            scope.trollHandler.unhighlightUser(user, function () {
                                if (site.comments && site.comments.comments) {
                                    comments = site.comments.comments;
                                    comments.forEach(function (comment) {
                                        if (comment.user === user) {
                                            comment.unhighLightComment();
                                        }
                                    });
                                }
                            });
                        }
                    });
                });
            }
        };
        document.getElementById('HUP-highilghtUser').addEventListener('command', function (e) {
            highilghtUser(true);
        }, false);
        document.getElementById('HUP-unhighilghtUser').addEventListener('command', function (e) {
            highilghtUser(false);
        }, false);

    };

    /**
    * Initialization function, runs when the page is loaded
    * @param {Event} e window load event object
    */
    function boot(e) {
        var doc = e.originalTarget,
            scope = {},
            elementer, hupMenu,
            isTestEnv, bench, c, newComments,
            prefs, site;
        try {
            if (doc && doc.location && typeof doc.location.hostname === 'string' &&
                (doc.location.hostname === 'hup.hu' || doc.location.hostname === 'doc.hup.hu' ||
                  /http:\/\/(localhost\/hupper\/hg|hupper|hupperl)\/.+\.html/.test(doc.location.href))) {

                isTestEnv = doc.location.hostname === 'hupperl';
                if (isTestEnv) {
                    Components.utils.import('resource://huppermodules/Bench.jsm', scope);
                    bench = new scope.Bench();
                }
                postInstall();
                Components.utils.import('resource://huppermodules/HupSite.jsm', scope);
                site = new scope.HupSite(doc);
                doc.defaultView.addEventListener('unload', function unl() {
                    site.destroy();
                    site = null;
                    doc.defaultView.removeEventListener('unload', unl, false);
                    Components.utils.reportError('unloaddd!!');
                }, false);
                site.init();
                return site;
                Components.utils.import('resource://huppermodules/hupjumper.jsm', scope);
                // Hupper.HUP.w.Jumps = new scope.HupJumper(Hupper.HUP.w, Hupper.HUP.w.nextLinks);
                if (isTestEnv) {
                    bench.stop();
                    Components.utils.import('resource://huppermodules/log.jsm', scope);
                    scope.hupperLog('initialized', 'Run time: ' + bench.finish() + 'ms');
                }
            }
        } catch (er) {
            Components.classes["@mozilla.org/consoleservice;1"]
              .getService(Components.interfaces.nsIConsoleService)
              .logStringMessage('HUPPER: INIT ' + er.message + ', ' + er.lineNumber +
                ', ' + er.fileName + ', ' + er.toString());
        }
        return site;
    }

    function init() {
        var appcontent = document.getElementById("appcontent"),
            scope = {},
            sites = [],
            showInStatusbar, handler;   // browser
        if (appcontent) {
            appcontent.addEventListener("DOMContentLoaded", function (e) {
                var site = boot(e),
                    index = sites.length;
                if (site) {
                    site.onDestroy = function () {
                        sites[index] = null;
                        delete sites[index];
                        site.onDestroy = null;
                        site = null;
                    };
                    sites.push(site);
                } else {
                    // Components.utils.reportError('The site variable is ' + typeof site);
                }
            }, true);
        }
        contextMenuHandling(sites);
        statusbarIconHandling(sites);
        document.getElementById('contentAreaContextMenu')
          .addEventListener('popupshowing', function () {
            var element = document.popupNode,
                parent = element.parentNode,
                user = element.innerHTML,
                isUsername = element.title === "Felhasználói profil megtekintése.";

            Components.utils.import('resource://huppermodules/trollHandler.jsm', scope);
            scope.trollHandler.isTroll(user, function (isTroll) {
                document.getElementById('HUP-markAsTroll').hidden = !isUsername || isTroll;
                document.getElementById('HUP-unmarkTroll').hidden = !isUsername || !isTroll;
                scope.trollHandler.isHighlighted(user, function (isHighlighted) {
                    var highlightUser = !isUsername || isTroll || isHighlighted,
                        unHighlightUser = !isUsername || isTroll || !isHighlighted;
                    document.getElementById('HUP-highilghtUser').hidden = highlightUser;
                    document.getElementById('HUP-unhighilghtUser').hidden = unHighlightUser;
                });
            });
        }, false);
    }
    window.addEventListener('load', function initialize() {
        init();
        window.removeEventListener('load', initialize, false);
    }, false);
}());
