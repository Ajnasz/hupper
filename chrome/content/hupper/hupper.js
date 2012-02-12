(function () {
    var Hupper = {},
        postInstall, parseBlocks, getBlocks,
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
    /**
    * Collects the content nodes like articles or blog posts from the page
    * @var {Array} nodes contains all node objects
    * @var {Array} newnodes contains only the new node objects
    * @var {Object} node a node object with all data of the node
    * @var {Object} node.header header node of the node - where are the titles of the nodes
    * @var {String} node.path the path to the node
    * @var {Object} node.submitData
    * @var {Object} node.cont
    * @var {Object} node.cont
    * @var {Boolean} node.newc true, if the node have unread comments
    * @return An arry with all nodes and only new nodes 0 => all node, 1 => only new nodes
    * @type Array
    */
    getNodes = function (doc) {
        var scope = {},
            c, ds, nodes, newnodes, i, dsl, node,
            elementer;
        Components.utils.import('resource://huppermodules/Elementer.jsm', scope);
        elementer = new scope.Elementer(doc);
        c = elementer.GetId('content-both');
        ds = elementer.GetTag('div', c);
        nodes = [];
        newnodes = [];
        Components.utils.import('resource://huppermodules/hupnode.jsm', scope);
        for (i = 0, dsl = ds.length; i < dsl; i += 1) {
            if (elementer.HasClass(ds[i], 'node')) {
                node = new scope.Node(doc, ds[i]);
                if (node.newc && !node.hidden) {
                    nodes.push(node);
                    newnodes.push(node);
                } else {
                    nodes.push(node);
                }
            }
        }
        return [nodes, newnodes];
    };
    getBlocks = function (doc) {
        var scope = {}, elementer;
        Components.utils.import('resource://huppermodules/Elementer.jsm', scope);
        elementer = new scope.Elementer(doc);
        return elementer.GetByClass(elementer.GetId('sidebar-left'), 'block', 'div').concat(elementer.GetByClass(elementer.GetId('sidebar-right'), 'block', 'div'));
    };
    parseBlocks = function (doc, blockElements, blockMenus, elementer) {
        var scope = {},
            processedBlocks, leftBlocksFromConf, rightBlocksFromConf,
            hupperBlocks, prefs;
        Components.utils.import('resource://huppermodules/prefs.jsm', scope);
        prefs = new scope.HP();
        Components.utils.import('resource://huppermodules/hupblocks.jsm', scope);
        hupperBlocks = new scope.Blocks();
        hupperBlocks.UI = scope.Blocks.UI(doc, hupperBlocks);
        Components.utils.import('resource://huppermodules/hupblock.jsm', scope);
        prefs.get.blocks(function (response) {
            var blocksFromConfig = JSON.parse(response.pref.value), processedBlocks;
            if (blocksFromConfig && (blocksFromConfig.left || blocksFromConfig.right)) {
                leftBlocksFromConf = blocksFromConfig.left;
                rightBlocksFromConf = blocksFromConfig.right;

                processedBlocks = leftBlocksFromConf.map(function (leftBlock) {
                    var matched = false,
                        blockElement,
                        bl = blockElements.length;

                    while (bl--) {
                        blockElement = blockElements[bl];
                        if (blockElement.id === leftBlock.id) {
                            blockElements.splice(bl, 1);
                            break;
                        }
                    }

                    return new scope.Block(doc, {
                        id: leftBlock.id,
                        blockMenus: blockMenus,
                        blocks: hupperBlocks,
                        side: 'left',
                        hidden: leftBlock.hidden,
                        contentHidden: leftBlock.contentHidden
                    });
                }).concat(rightBlocksFromConf.map(function (rightBlock) {
                    var blockElement,
                        bl = blockElements.length;

                    while (bl--) {
                        blockElement = blockElements[bl];
                        if (blockElement.id === rightBlock.id) {
                            blockElements.splice(bl, 1);
                            break;
                        }
                    }

                    return new scope.Block(doc, {
                        id: rightBlock.id,
                        blockMenus: blockMenus,
                        blocks: hupperBlocks,
                        side: 'right',
                        hidden: rightBlock.hidden,
                        contentHidden: rightBlock.contentHidden
                    });
                })).concat(
                  blockElements.map(function (blockElement) {
                    return new scope.Block(doc, {
                        block: blockElement,
                        blockMenus: blockMenus,
                        blocks: hupperBlocks
                    });
                }));
            } else {
                processedBlocks = blockElements.map(function (blockElement) {
                    return new scope.Block(doc, {
                        block: blockElement,
                        blockMenus: blockMenus,
                        blocks: hupperBlocks
                    });
                });
            }
            processedBlocks.forEach(function (block, a, b) {
                hupperBlocks.registerBlock(block);
            });
            hupperBlocks.save();
            hupperBlocks.UI.rearrangeBlocks();
            hupperBlocks.save();
        });
    };
    /**
    * Parse the nodes to mark that the node have unread comment, adds prev and next links to the header
    * @param {Array} nodes
    * @param {Array} newNodes
    */
    parseNodes = function (doc, nodes, newNodes, nodeMenu) {
        var spa = Hupper.HUP.El.Span(),
            sp, node, mread, next, prev,
            i, nl;
        for (i = 0, nl = nodes.length; i < nl; i += 1) {
            node = nodes[i];
            if (node.newc) {
                node.index = newNodes.indexOf(node);
                node.next = (node.index === newNodes.length - 1) ? false : newNodes[node.index + 1].id;
                node.previous = (node.index === 0 || !newNodes[node.index - 1]) ? false : newNodes[node.index - 1].id;
                node.addNewNodeLinks();
                if (!node.hidden) {
                    // Hupper.HUP.w.nextLinks.push('node-' + node.id);
                }
            }
        }
        nodes.forEach(function (node) {
            node.addNodes(nodes, nodeMenu);
        });
    };
    /**
    * Marks as read all nodes, which have unread items
    * @param {Event} e event object
    */
    markAllNodeAsRead = function (e) {
        var n = Hupper.HUP.markReadNodes,
            d, i, nl, click;
        d = document || Hupper.HUP.w;
        for (i = 0, nl = n.length; i < nl; i += 1) {
            click = d.createEvent("MouseEvents");
            click.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            n[i].dispatchEvent(click);
        }
    };
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
    setBlocks = function (doc) {
        var scope = {}, prefs;
        Components.utils.import('resource://huppermodules/prefs.jsm', scope);
        prefs = new scope.HP();
        prefs.get.parseblocks(function (response) {
            if (response.pref.value) {
                var blocks = getBlocks(doc);
                parseBlocks(doc, blocks, Hupper.HUP.BlockMenus, Hupper.HUP.El);
            }
        });
    };

    /**
    * Initialization function, runs when the page is loaded
    * @param {Event} e window load event object
    */
    boot = function (e) {
        try {
            var ww = e.originalTarget,
                scope = {},
                elementer, hupMenu,
                markAsTroll, isTestEnv, bench, c, newComments,
                prefs;
            if (ww && ww.location && typeof ww.location.hostname === 'string' &&
                (ww.location.hostname === 'hup.hu' || ww.location.hostname === 'www.hup.hu' ||
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
                prefs = new scope.HP();
                Components.utils.import('resource://huppermodules/hup-events.jsm', scope);
                Hupper.HUP.Ev = new scope.HUPEvents(ww);
                // Logger
                postInstall();
                Components.utils.import('resource://huppermodules/hupperStyleHandler.jsm', scope);
                scope.hupperStyleHandler();
                // Elementer
                // elementer = new Hupper.Elementer(ww);
                Components.utils.import('resource://huppermodules/Elementer.jsm', scope);
                elementer = new scope.Elementer(ww);
                Hupper.HUP.El = elementer;
                // Hupper.addHupStyles();
                Components.utils.import('resource://huppermodules/menu.jsm', scope);
                hupMenu = new scope.Menu(ww);
                Components.utils.import('resource://huppermodules/hupblock.jsm', scope);
                Hupper.HUP.BlockMenus = new scope.BlockMenus(ww, hupMenu);
                // Stores the mark as read nodes
                Hupper.HUP.markReadNodes = [];
                // Hupper.HUP.w.nextLinks = [];
                // if comments are available
                if (elementer.GetId('comments')) {
                    Components.utils.import('resource://huppermodules/hupcomment.jsm', scope);
                    c = new scope.GetComments(ww);
                    newComments = c.newComments;
                    prefs.get.showqnavbox(function (response) {
                        if (c.newComments.length && response.pref.value) {
                            appendNewNotifier(null, null, hupMenu);
                        }
                    });
                } else {
                    prefs.get.insertnewtexttonode(function (response) {
                        if (response.pref.value) {
                            var nodes = getNodes(ww);
                          Components.utils.import('resource://huppermodules/hupnode.jsm', scope);
                            parseNodes(ww, nodes[0], nodes[1], new scope.NodeMenus(ww, hupMenu));
                            prefs.get.showqnavbox(function (response) {
                                if (nodes[1].length > 0 && response.pref.value) {
                                    appendNewNotifier('#node-' + nodes[1][0].id, true, hupMenu);
                                }
                            });
                        }
                    });
                }
                setBlocks(ww);
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
                prefs.get.setunlimitedlinks(function (response) {
                    if (response.pref.value) {
                        var linkParams = [
                            '/cikkek',
                            '/node',
                            '/szavazasok',
                            '/promo'
                        ], callStr = [];
                        linkParams.forEach(function (link) {
                            callStr.push(
                                'a[href^="' + link + '"]',
                                'a[href^="' + link + '"]',
                                'a[href^="' + link + '"]',
                                'a[href^=" ' + link + '"]',
                                'a[href^=" ' + link + '"]',
                                'a[href^=" ' + link + '"]',
                                'a[href^="http://hup.hu' + link + '"]',
                                'a[href^="http://hup.hu' + link + '"]',
                                'a[href^="http://hup.hu' + link + '"]',
                                'a[href^=" http://hup.hu' + link + '"]',
                                'a[href^=" http://hup.hu' + link + '"]',
                                'a[href^=" http://hup.hu' + link + '"]',
                                'a[href^="http://www.hup.hu' + link + '"]',
                                'a[href^="http://www.hup.hu' + link + '"]',
                                'a[href^="http://www.hup.hu' + link + '"]',
                                'a[href^=" http://www.hup.hu' + link + '"]',
                                'a[href^=" http://www.hup.hu' + link + '"]',
                                'a[href^=" http://www.hup.hu' + link + '"]'
                            );
                        });
                        Array.prototype.slice
                            .call(ww.querySelectorAll(callStr.join(',')))
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
            appcontent.addEventListener("DOMContentLoaded", boot, true);
        }
        Components.utils.import('resource://huppermodules/prefs.jsm', scope);
        showInStatusbar = new scope.HP().get.showinstatusbar();
        statusbar = document.getElementById('HUP-statusbar');
        statusbar.hidden = !showInStatusbar;
        if (showInStatusbar) {
            Components.utils.import('resource://huppermodules/statusclickhandler.jsm', scope);
            handler = new scope.StatusClickHandler(statusbar);
        }
        document.getElementById('contentAreaContextMenu').addEventListener('popupshowing', function () {
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
        window.removeEventListener('unload', initialize, false);
    };
    window.addEventListener('load', initialize, false);
    // window.removeEventListener('unload', initialize, false);
}());
