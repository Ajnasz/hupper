(function () {
    var Hupper = {},
        postInstall, getBlocks,
        getNodes, parseNodes,
        setBlocks,
        appendNewNotifier,
        markAllNodeAsRead,
        initialize,
        init,
        boot;
    /**
    * If some data format has been changed, the postinstall
    * will convert the datas to the newer format
    * @method postInstall
    */
    postInstall = function () {
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
    };
    ;
    /**
    * Appends a new link to the top of the page, if there is new comment
    * @param {String} [link]
    */
    appendNewNotifier = function (link, mark, hupMenu) {
        var scope = {}, bundles;
        Components.utils.import('resource://huppermodules/bundles.jsm', scope);
        bundles = scope.hupperBundles;
        hupMenu.addMenuItem({
            name: bundles.getString('firstNew'),
            href: link || '#new'
        });
        if (mark) {
            hupMenu.addMenuItem({
                name: bundles.getString('markAllRead'),
                click: markAllNodeAsRead
            });
        }
    };

    /**
    * Initialization function, runs when the page is loaded
    * @param {Event} e window load event object
    */
    boot = function (e, win) {
        try {
            var doc = e.originalTarget,
                scope = {},
                elementer, hupMenu,
                markAsTroll, isTestEnv, bench, c, newComments,
                prefs;

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
                var site = new scope.HupSite(doc);
                site.init();
                doc.defaultView.addEventListener('unload', function unl () {
                    site.destroy();
                    doc.defaultView.removeEventListener('unload', unl, false);
                }, false);
                return;
                // setBlocks(doc);
                markAsTroll = function (element) {
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
                        prefs.get.huppercolor(function (response) {
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
    };

    init = function () {
        var appcontent = document.getElementById("appcontent"),
            scope = {},
            showInStatusbar, statusbar, handler;   // browser
        if (appcontent) {
            appcontent.addEventListener("DOMContentLoaded", function (e) {
                boot(e, window);
            }, true);
        }
        Components.utils.import('resource://huppermodules/prefs.jsm', scope);
        showInStatusbar = new scope.HP().get.showinstatusbar();
        statusbar = document.getElementById('HUP-statusbar');
        statusbar.hidden = !showInStatusbar;
        if (showInStatusbar) {
            Components.utils.import('resource://huppermodules/statusclickhandler.jsm', scope);
            handler = new scope.StatusClickHandler(statusbar);
        }
        document.getElementById('contentAreaContextMenu')
          .addEventListener('popupshowing', function () {
            var element = document.popupNode,
                parent = element.parentNode,
                user = element.innerHTML,
                isUsername = element.title === "Felhasználói profil megtekintése.";

            Components.utils.import('resource://huppermodules/statusclickhandler.jsm', scope);
            Components.utils.import('resource://huppermodules/trollHandler.jsm', scope);
            scope.trollHandler.isTroll(user, function (isTroll) {
                document.getElementById('HUP-markAsTroll').hidden = !isUsername || isTroll;
                document.getElementById('HUP-unmarkTroll').hidden = !isUsername || !isTroll;
                scope.trollHandler.isHighlighted(user, function (isHighlighted) {
                    document.getElementById('HUP-highilghtUser').hidden = !isUsername || isTroll || isHighlighted;
                    document.getElementById('HUP-unhighilghtUser').hidden = !isUsername || isTroll || !isHighlighted;
                });
            });
        }, false);
    };
    initialize = function () {
        // if (!Hupper.initialized) {
            init();
            // Hupper.initialized = true;
        // }
        window.removeEventListener('load', initialize, false);
    };
    window.addEventListener('load', initialize, false);
    // window.removeEventListener('unload', initialize, false);
}());
