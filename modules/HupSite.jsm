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
        this.setBlocks();
        this.setUnlimitedLinks();
    },
    setUnlimitedLinks: function () {
        var doc = this.doc;
        this.prefs.get.setunlimitedlinks(function (response) {
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
                .call(doc.querySelectorAll(callStr.join(',')))
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
    },
    parseBlocks: function (blockElements) {
        var scope = {},
            blockMenus = this.blockMenus,
            prefs = this.prefs,
            doc = this.doc,
            _this = this,
            processedBlocks, leftBlocksFromConf, rightBlocksFromConf,
            hupperBlocks;

        Components.utils.import('resource://huppermodules/hupblocks.jsm', scope);
        hupperBlocks = new scope.Blocks();
        hupperBlocks.UI = scope.Blocks.UI(this.doc, hupperBlocks);
        Components.utils.import('resource://huppermodules/hupblock.jsm', scope);
        this.hupperBlocks = hupperBlocks;
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
                    })
                );
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
            _this.processedBlocks = processedBlocks;
        });
    },
    getBlocks: function () {
        var scope = {};
        return this.elementer
            .GetByClass(this.elementer.GetId('sidebar-left'), 'block', 'div')
            .concat(this.elementer.GetByClass(this.elementer.GetId('sidebar-right'), 'block', 'div'));
    },
    setBlocks: function () {
        var _this = this;
        this.prefs.get.parseblocks(function (response) {
            if (response.pref.value) {
                var blocks = _this.getBlocks(blocks);
                _this.parseBlocks(blocks);
            }
        });
    },
    markAllNodeAsRead: function (e) {
        this.newNodes.forEach(function (node) {
            this.nodes[node].markAsRead();
        }, this);
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
        var _this = this;
        this.prefs.get.showqnavbox(function (response) {
            if (_this.comments.newCommentsList.length && response.pref.value) {
                _this.appendNewNotifier('#' + _this.comments.comments[_this.comments.newCommentsList.getFirst()].id);
            }
        });
    },
    addNewNodeNotifier: function () {
        var _this = this;
        this.prefs.get.insertnewtexttonode(function (response) {
            if (response.pref.value) {
                _this.prefs.get.showqnavbox(function (response) {
                    if (_this.newNodeList.length > 0 && response.pref.value) {
                        var nodeId = _this.nodes[_this.newNodeList.getFirst()].id;
                        _this.appendNewNotifier('#node-' + nodeId, true);
                    }
                });
            }
        });
    },
    getNodes: function () {
        var scope = {},
            nodes = [],
            c, ds, i, dsl, node, elementer;

        Components.utils.import('resource://huppermodules/NewNodeList.jsm', scope);
        this.newNodeList = new scope.NewNodeList();
        elementer = this.elementer;
        c = elementer.GetId('content-both');
        ds = elementer.GetTag('div', c);

        Components.utils.import('resource://huppermodules/hupnode.jsm', scope);
        for (i = 0, dsl = ds.length; i < dsl; i += 1) {
            if (elementer.HasClass(ds[i], 'node')) {
                node = new scope.Node(this.doc, ds[i]);
                node.index = nodes.length;
                nodes.push(node);
                if (node.newc && !node.hidden) {
                    this.newNodeList.add(node.index);
                }
            }
        }
        this.nodes = nodes;
        // this.newNodes = newNodes;
    },
    parseNodes: function () {
        var nodeMenu, node, next, prev, current;
        Components.utils.import('resource://huppermodules/hupnode.jsm', scope);
        nodeMenu = new scope.NodeMenus(this.doc, this.menu);
        if (this.newNodeList.hasItem()) {
            this.newNodeList.goToBegin();
            do {
                current = this.newNodeList.getCurrent();
                next = this.newNodeList.getNext();
                prev = this.newNodeList.getPrevious();
                node = this.nodes[current];
                node.next = next !== null ? this.nodes[next].id : false;
                node.previous = prev !== null ? this.nodes[prev].id : false;

                node.addNewNodeLinks();
                node.addNodes(this.nodes, nodeMenu);
                if (this.newNodeList.next() === false) {
                    break;
                }
            } while (true);
        }
        this.nodes.forEach(function (node, i) {
            node.addNodes(this.nodes, nodeMenu);
        }, this);
    },

    noWiden: function() {
        var elements = this.elementer.GetByClass(this.elementer.GetId('comments'), 'widen-comment');
        elements.forEach(function (el) {
            this.elementer.RemoveClass(el, 'widen-comment');
        }.bind(this));
    },

    parseComments: function () {
        Components.utils.import('resource://huppermodules/hupcomment.jsm', scope);
        this.comments = new scope.GetComments(this.doc);
        var comments = this.elementer.GetId('comments');
        this.prefs.get.widenComments(function (response) {
            if (response.pref.value) {
                this.elementer.subscribe(comments, 'click', function (e) {
                    if (this.elementer.HasClass(e.target, 'expand-comment')) {
                        e.preventDefault();
                        this.noWiden();

                        var indented = e.target,
                            count = 0;
                        while (indented) {
                            indented = indented.parentNode;
                            if (indented && this.elementer.HasClass(indented, 'indented')) {
                                if (++count > 1) {
                                    this.elementer.AddClass(indented, 'widen-comment');
                                }
                            }
                        }
                    }
                }.bind(this), false);
                this.elementer.subscribe(this.elementer.GetBody(), 'click', function (e) {
                    if (e.target.nodeName.toUpperCase() === 'A') {
                        return;
                    }

                    var c = e.target,
                        isComment = false;

                    while (c) {
                        if (c && this.elementer.HasClass(c, 'comment')) {
                            isComment = true;
                            break;
                        }

                        // outside comment
                        if (c && this.elementer.HasClass(c, 'indented')) {
                            isComment = false;
                            break;
                        }
                        c = c.parentNode;
                    }

                    if (!isComment) {
                        this.noWiden();
                    }
                }.bind(this));
            }
        }.bind(this));
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
    },
    getNodeIndexFromId: function (id) {
        var i, nl;
        for (i = 0, nl = this.nodes.length; i < nl; i += 1) {
            if (this.nodes[i].id === id) {
                return this.nodes[i].index;
            }
        }
    },
    getCommentIndexFromId: function (id) {
        var comments = this.comments.comments,
            commentId, i, nl;
        for (i = 0, nl = comments.length; i < nl; i += 1) {
            commentId = +comments[i].id.substr(8);
            if (commentId === id) {
                return comments[i].index;
            }
        }
    },
    getPrevNew: function () {
        if (this.hasComments()) {
            return this.getPrevNewComment();
        } else {
            return this.getPrevNewNode();
        }
    },
    getNextNew: function () {
        if (this.hasComments()) {
            return this.getNextNewComment();
        } else {
            return this.getNextNewNode();
        }
    },
    getPrevNewComment: function () {
        var commentsList = this.comments.newCommentsList,
            currentIndex,
            match;
        match = this.doc.location.hash.match(/#comment-(\d+)/);
        if (match) {
            currentIndex = this.getCommentIndexFromId(+match[1]);
            if (typeof currentIndex === 'number') {
                commentsList
                .setCurrent(commentsList.getIndexOf(currentIndex));
            }
        }
        if (commentsList.previous() === false) {
            commentsList.goToEnd();
        }
        return this.comments.comments[commentsList.getCurrent()];
    },
    getNextNewComment: function () {
        var commentsList = this.comments.newCommentsList,
            currentIndex,
            match;
        match = this.doc.location.hash.match(/#comment-(\d+)/);
        if (match) {
            currentIndex = this.getCommentIndexFromId(+match[1]);
            if (typeof currentIndex === 'number') {
                commentsList.setCurrent(commentsList.getIndexOf(currentIndex));
            }
        }
        if (commentsList.next() === false) {
            commentsList.goToBegin();
        }
        return this.comments.comments[commentsList.getCurrent()];
    },
    getPrevNewNode: function () {
        var currentIndex,
            match;
        match = this.doc.location.hash.match(/#node-(\d+)/);
        if (match) {
            currentIndex = this.getNodeIndexFromId(+match[1]);
            if (typeof currentIndex === 'number') {
                this.newNodeList.setCurrent(this.newNodeList.getIndexOf(currentIndex));
            }
        }
        if (this.newNodeList.previous() === false) {
            this.newNodeList.goToEnd();
        }
        return this.nodes[this.newNodeList.getCurrent()];
    },
    getNextNewNode: function () {
        var currentIndex,
            match;
        match = this.doc.location.hash.match(/#node-(\d+)/);
        if (match) {
            currentIndex = this.getNodeIndexFromId(+match[1]);
            if (typeof currentIndex === 'number') {
                this.newNodeList.setCurrent(this.newNodeList.getIndexOf(currentIndex));
            }
        }
        if (this.newNodeList.next() === false) {
            this.newNodeList.goToBegin();
        }
        return this.nodes[this.newNodeList.getCurrent()];
    },
    destroy: function () {
        if (this.comments) {
            this.comments.destroy();
        }
        if (this.blockMenus) {
            this.blockMenus.destroy();
            this.blockMenus = null;
        }
        if (this.menu) {
            this.menu.destroy();
            this.menu = null;
        }
        if (this.nodes) {
            this.nodes.forEach(function (node) {
                node.destroy();
                node = null;
            });
            this.nodes = null;
        }
        if (this.newNodeList) {
            this.newNodeList.destroy();
            this.newNodeList = null;
        }

        if (this.processedBlocks) {
            this.processedBlocks.forEach(function (block) {
                block.destroy();
                block = null;
            });
        }
        if (this.hupperBlocks) {
            this.hupperBlocks.destroy();
            this.hupperBlocks.UI.destroy();
            this.hupperBlocks.UI = null;
            this.hupperBlocks = null;
        }
        this.processedBlocks = null;
        this.doc = null;
        this.prefs = null;
        this.elementer.destroy();
        this.elementer = null;
        if (typeof this.onDestroy === 'undefined') {
            this.onDestroy();
        }
    }
};
var EXPORTED_SYMBOLS = ['HupSite'];
