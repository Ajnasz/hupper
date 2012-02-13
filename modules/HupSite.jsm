/*global Components: true */
var scope = {};
var HupSite = function (doc) {
    this.doc = doc;
    Components.utils.import('resource://huppermodules/prefs.jsm', scope);
    this.prefs = new scope.HP();
    Components.utils.import('resource://huppermodules/Elementer.jsm', scope);
    this.elementer = new scope.Elementer(this.doc);
};
HupSite.prototype = {
    init: function () {
        this.setStyles();
        this.createBlockMenus();
        if (this.hasComments()) {
            this.parseComments();
            this.addNewCommentsNotifier();
        } else {
            this.getNodes();
            this.parseNodes();
            this.addNewNodeNotifier();
        }
    },
    markAllNodeAsRead: function (e) {
    },
    appendNewNotifier: function (link, mark) {
        var scope = {}, bundles;
        Components.utils.import('resource://huppermodules/bundles.jsm', scope);
        bundles = scope.hupperBundles;
        this.menu.addMenuItem({
            name: bundles.getString('firstNew'),
            href: link || '#new'
        });
        if (mark) {
            this.menu.addMenuItem({
                name: bundles.getString('markAllRead'),
                click: this.markAllNodeAsRead
            });
        }
    },
    addNewCommentsNotifier: function () {
        var newComments = this.comments.newComments,
            _this = this;
        this.prefs.get.showqnavbox(function (response) {
            if (newComments.length && response.pref.value) {
                _this.appendNewNotifier();
            }
        });
    },
    addNewNodeNotifier: function () {
        var _this = this;
        this.prefs.get.insertnewtexttonode(function (response) {
            if (response.pref.value) {
                _this.prefs.get.showqnavbox(function (response) {
                    if (_this.nodes[1].length > 0 && response.pref.value) {
                        _this.appendNewNotifier('#node-' + _this.nodes[1][0].id, true);
                    }
                });
            }
        });
    },
    getNodes: function () {
        var scope = {},
            c, ds, nodes, newNodes, i, dsl, node,
            elementer;
        elementer = this.elementer;
        c = elementer.GetId('content-both');
        ds = elementer.GetTag('div', c);
        nodes = [];
        newNodes = [];
        Components.utils.import('resource://huppermodules/hupnode.jsm', scope);
        for (i = 0, dsl = ds.length; i < dsl; i += 1) {
            if (elementer.HasClass(ds[i], 'node')) {
                node = new scope.Node(this.doc, ds[i]);
                if (node.newc && !node.hidden) {
                    nodes.push(node);
                    newNodes.push(node);
                } else {
                    nodes.push(node);
                }
            }
        }
        this.nodes = nodes;
        this.newNodes = newNodes;
        return [nodes, newNodes];
    },
    parseNodes: function () {
        var nodes, newNodes, nodeMenu, elementer, spa, sp, node, mread, next, prev, i, nl;
        nodes = this.nodes;
        newNodes = this.newNodes;
        Components.utils.import('resource://huppermodules/hupnode.jsm', scope);
        nodeMenu = new scope.NodeMenus(this.doc, this.menu);
        elementer = this.elementer;
        spa = elementer.Span();
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

    },
    parseComments: function () {
        Components.utils.import('resource://huppermodules/hupcomment.jsm', scope);
        var comments = new scope.GetComments(this.doc);
        this.comments = comments;
    },
    hasComments: function () {
        return !!this.elementer.GetId('comments');
    },
    setStyles: function () {
        Components.utils.import('resource://huppermodules/hupperStyleHandler.jsm', scope);
        scope.hupperStyleHandler();
    },
    createMenu: function () {
        Components.utils.import('resource://huppermodules/menu.jsm', scope);
        this.menu = new scope.Menu(this.doc);
    },
    createBlockMenus: function () {
        if (!this.menu) {
            this.createMenu();
        }
        if (!this.blockMenus) {
            Components.utils.import('resource://huppermodules/hupblock.jsm', scope);
            this.blockMenus = new scope.BlockMenus(this.doc, this.menu);
        }
    }
};
var EXPORTED_SYMBOLS = ['HupSite'];
