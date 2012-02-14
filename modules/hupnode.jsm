/*global Hupper: true */
var hideTaxonomyNodes = function (nodes) {
    nodes.forEach(function (node) {
        node.checkTaxonomy();
    });
};
/**
 * @class Node
 * @description class to parse a node and make changes on it
 * @param {Element} node an article node
 */
var Node = function (doc, node) {
    var scope = {},
        header, submitData, cont, footer, sender, taxonomy;
    Components.utils.import('resource://huppermodules/bundles.jsm', scope);
    this.bundles = scope.hupperBundles;
    this.doc = doc;
    Components.utils.import('resource://huppermodules/Elementer.jsm', scope);
    this.elementer = new scope.Elementer(this.doc);
    Components.utils.import('resource://huppermodules/prefs.jsm', scope);
    this.prefs = new scope.HP();
    header = this.elementer.GetFirstTag('h2', node);
    submitData = node.childNodes[3];
    cont = node.childNodes[5];
    footer = this.elementer.HasClass(node.childNodes[7], 'links') ? node.childNodes[7] : false;
    sender = this.elementer.GetByAttrib(submitData, 'a', 'title', 'Felhasználói profil megtekintése.');
    taxonomy = this.elementer.GetByAttrib(submitData, 'a', 'rel', 'tag');
    this.element = node;
    this.id = parseInt(node.id.replace('node-', ''), 10);
    this.header = header;
    Components.utils.import('resource://huppermodules/hupstringer.jsm', scope);
    this.path = scope.HupStringer.trim(this.elementer.GetFirstTag('a', this.header).getAttribute('href'));
    this.submitData = submitData;
    this.cont = cont;
    this.footer = footer;
    this.newc = this.elementer.GetByClass(footer, 'comment_new_comments', 'li').length > 0 ? true : false;
    if (taxonomy.length > 0) {
        this.taxonomy = taxonomy[0].innerHTML;
        this.taxonomyNode = taxonomy[0];
    } else {
        this.taxonomy = null;
        this.taxonomyNode = null;
    }
    this.sender = sender.length ? {
        name: sender[0].innerHTML,
        id: parseInt(sender[0].href.replace('http://hup.hu/user/', ''), 10),
        url: sender[0].href
    } : false;
    this.checkTaxonomy();
    Components.utils.import('resource://huppermodules/nodeheaderbuilder.jsm', scope);
    this.builder = new scope.NodeHeaderBuilder(this.doc);
    this.addNnewSpan();
    if (this.taxonomy) {
        this.addTaxonomyCloser();
    }
};
Node.prototype = {
    hidden: false,
    next: false,
    previous: false,
    hide: function () {
        this.elementer.AddClass(this.element, 'hup-hidden');
        this.hidden = true;
        if (this.nodeMenu) {
            this.nodeMenu.addNodeToMenu(this);
        }
    },
    show: function () {
        this.elementer.RemoveClass(this.element, 'hup-hidden');
        this.hidden = false;
        if (this.nodeMenu) {
            this.nodeMenu.removeNodeFromMenu(this);
        }
    },
    checkTaxonomy: function () {
        var _this = this,
            scope = {};
        Components.utils.import('resource://huppermodules/hupstringer.jsm', scope);
        this.prefs.get.hidetaxonomy(function (response) {
            var hideTaxonomies = scope.HupStringer.trim(response.pref.value);
            if (hideTaxonomies.length && hideTaxonomies.indexOf(_this.taxonomy) !== -1) {
                _this.hide();
            } else {
                _this.show();
            }
        });
    },
    addNnewSpan: function () {
        this.sp = this.elementer.Span();
        this.elementer.AddClass(this.sp, 'nnew');
        this.elementer.Insert(this.sp, this.header.firstChild);
    },
    /**
    * @param {Integer} i node index
    * @param {Integer} nl number of the nodes
    */
    addNewNodeLinks: function () {
        this.addNameLink();
        this.addMarkAsRead();
        this.addNewText();
        this.addPrev();
        this.addNext();
    },
    addMarkAsRead: function () {
        var mread = this.builder.buildMarker(this.path, this.id),
            _this = this;
        // Hupper.HUP.markReadNodes.push(mread);
        this.elementer.Add(mread, this.sp);
        this.elementer.subscribe(mread, 'click', function () {
            _this.markAsRead();
        });
        this.readMarker = mread;
    },
    addNewText: function () {
        this.elementer.Add(this.builder.buildNewText(), this.sp);
    },
    addNameLink: function () {
        // this.elementer.Insert(this.builder.buildNameLink('node-' + this.id), this.header);
        this.elementer.Insert(this.builder.buildNameLink(this.id, 'node'), this.header);
    },
    addNext: function () {
        if (this.next === false) {
            this.elementer.Add(this.builder.buildLastLink(), this.sp);
        } else {
            this.elementer.Add(this.builder.buildNextLink('node-' + this.next), this.sp);
        }
    },
    addPrev: function () {
        if (this.previous === false) {
            this.elementer.Add(this.builder.buildFirstLink(), this.sp);
        } else {
            this.elementer.Add(this.builder.buildPrevLink('node-' + this.previous), this.sp);
        }
    },
    addTaxonomyCloser: function () {
        this.taxonomyButton = this.elementer.Btn();
        this.elementer.AddClass(this.taxonomyButton, 'hupper-button taxonomy-button delete-button');
        var txt = this.bundles.getFormattedString('hideTaxonomy', [this.taxonomy]),
            _this = this;
        this.taxonomyButton.setAttribute('title', txt);
        this.elementer.subscribe(this.taxonomyButton, 'click', function () {
            _this.addToHide();
            hideTaxonomyNodes(_this.nodes);
        });
        this.elementer.Add(this.taxonomyButton, this.taxonomyNode.parentNode);
    },
    addToHide: function () {
        var _this = this;
        this.prefs.get.hidetaxonomy(function (response) {
            var taxonomies = response.pref.value.split(';');
            if (taxonomies.indexOf(_this.taxonomy) === -1) {
                taxonomies.push(_this.taxonomy);
            }
            _this.prefs.set.hidetaxonomy(taxonomies.join(';'));
        });
    },
    addNodes: function (nodes, nodeMenu) {
        this.nodes = nodes;
        this.nodeMenu = nodeMenu;
        if (this.hidden) {
            nodeMenu.addNodeToMenu(this);
        }
    },
    markAsRead: function () {
        var scope = {},
            marker = this.readMarker,
            ajax, bundles;
        Components.utils.import('resource://huppermodules/bundles.jsm', scope);
        bundles = scope.hupperBundles;
        Components.utils.import('resource://huppermodules/ajax.jsm', scope);
        ajax = new scope.Ajax({
            method: 'get',
            url: 'http://hup.hu' + marker.getAttribute('path').replace(/^\s*(.+)\s*$/, '$1'),
            successHandler: function () {
                marker.innerHTML = bundles.getString('markingSuccess');
                if (marker.nextSibling.getAttribute('class') === 'hnew') {
                    this.elementer.Remove(marker.nextSibling, marker.parentNode);
                }
                setTimeout(function () {
                    this.elementer.Remove(marker);
                }, 750);
            },
            loadHandler: function () {
                var img = this.elementer.Img('chrome://hupper/skin/ajax-loader.gif', 'marking...');
                this.elementer.RemoveAll(marker);
                this.elementer.Add(img, marker);
            },
            errorHandler: function () {
                var t = this.elementer.Txt(bundles.getString('markingError'));
                this.elementer.RemoveAll(marker);
                this.elementer.Add(t, marker);
            }
        });
    },
    destroy: function () {
        this.taxonomyButton = null;
        this.elementer.destroy();
    }
};
/**
 * @class NodeMenus
 */
var NodeMenus = function (doc, hupMenu) {
    this.nodes = {};
    this.hupMenu = hupMenu;
    var scope = {};
    Components.utils.import('resource://huppermodules/bundles.jsm', scope);
    this.bundles = scope.hupperBundles;
    this.doc = doc;
    Components.utils.import('resource://huppermodules/Elementer.jsm', scope);
    this.elementer = new scope.Elementer(this.doc);
    Components.utils.import('resource://huppermodules/prefs.jsm', scope);
    this.prefs = new scope.HP();
};
NodeMenus.prototype = {
    addMenu: function () {
        if (this.menu) {
            return;
        }
        var _this = this;
        this.menuitem = this.hupMenu.addMenuItem({
            name: this.bundles.getString('restoreNodes'),
            click: function () {
                _this.elementer.ToggleClass(this.parentNode, 'hide-submenu');
                _this.elementer.ToggleClass(this.parentNode, 'collapsed');
                _this.elementer.ToggleClass(this.parentNode, 'expanded');
            }
        }, null, true);
        this.elementer.RemoveClass(this.menuitem, 'leaf');
        this.elementer.AddClass(this.menuitem, 'hide-submenu collapsed');
        this.menu = this.hupMenu.addMenu(this.menuitem);
    },
    removeMenu: function () {
        if (this.menuitem || this.menu) {
            this.hupMenu.removeMenu(this.menu);
            this.hupMenu.removeMenuItem(this.menuitem);
            this.menuitem = null;
            this.menu = null;
        }
    },
    addNodeToMenu: function (node) {
        if (!this.nodes[node.taxonomy]) {
            if (!this.menu) {
                this.addMenu();
            }
            var _this = this;
            this.nodes[node.taxonomy] = this.hupMenu.addMenuItem({
                name: node.taxonomy,
                click: function () {
                    node.show();
                }
            }, _this.menu);
        }
    },
    removeNodeFromMenu: function (node) {
        var _this = this, n, i;
        if (this.nodes[node.taxonomy]) {
            this.elementer.Remove(this.nodes[node.taxonomy]);
            delete this.nodes[node.taxonomy];
            this.prefs.get.hidetaxonomy(function (response) {
                var taxonomies = response.pref.value.split(';'),
                    i, tl;
                for (i = 0, tl = taxonomies.length; i < tl; i += 1) {
                    if (taxonomies[i] === node.taxonomy) {
                        taxonomies.splice(i, 1);
                        break;
                    }
                }
                _this.prefs.set.hidetaxonomy(taxonomies.join(';'));
                hideTaxonomyNodes(node.nodes);
            });
        }
        n = 0;
        for (i in this.nodes) {
            if (this.nodes.hasOwnProperty(i)) {
                n += 1;
            }
        }
        if (n === 0) {
            this.removeMenu();
        }
    },
    destroy: function () {
        this.elementer.destroy();
        this.elementer = null;
        this.menu = null;
    }
};

var EXPORTED_SYMBOLS = ['hideTaxonomyNodes', 'Node', 'NodeMenus'];
