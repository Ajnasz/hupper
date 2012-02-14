/**
 * @constructor
 * @class Menu
 * @description handles the hupper block
 */
var Menu = function (doc) {
    var scope = {};
    Components.utils.import('resource://huppermodules/Elementer.jsm', scope);
    this.elementer = new scope.Elementer(doc);
    this.add();
};
Menu.prototype = {
    block: null,
    id: 'block-hupper-0',
    hidden: false,
    menuItems: 0,
    hide: function () {
        if (this.block) {
            this.elementer.AddClass(this.block, 'hup-hidden');
            this.hidden = true;
        }
    },
    show: function () {
        if (this.block) {
            this.elementer.RemoveClass(this.block, 'hup-hidden');
            this.hidden = false;
        }
    },
    create: function () {
        this.titleNode = this.elementer.El('h2');

        this.block = this.elementer.Div();
        this.contentNode = this.elementer.Div();
        this.elementer.AddClass(this.contentNode, 'content');

        this.elementer.Add(this.titleNode, this.block);
        this.elementer.Add(this.contentNode, this.block);
        this.block.setAttribute('id', this.id);
        this.elementer.AddClass(this.block, 'block block-hupper');
        this.elementer.Add(this.elementer.CreateLink('Hupper', 'http://hupper.mozdev.org/'), this.titleNode);
    },
    add: function () {
        if (this.elementer.GetId(this.id) || this.block) {
            return;
        }
        this.create();
        this.elementer.Hide(this.block);
        var googleBlock = this.elementer.GetId('block-user-1');
        this.elementer.Insert(this.block, googleBlock);
        this.hide();
    },
    addMainMenu: function () {
        if (this.menu) {
            return;
        }
        this.elementer.Show(this.block);
        this.menu = this.addMenu(this.contentNode);
        this.elementer.AddClass(this.menu, 'menu');
        this.elementer.Add(this.menu, this.contentNode);
    },
    /**
    * @param {Element} parent The parent menu item (LI element)
    */
    addMenu: function (parent) {
        if (!parent) {
            return false;
        }
        var ul = this.elementer.Ul();
        this.elementer.Add(ul, parent);
        return ul;
    },
    removeMenu: function (menu) {
        this.elementer.Remove(menu);
    },
    /**
    * @param {Object} menuItem
    *  name: 'name of the menu item'
    *  click: function
    *  href: 'http://...
    * @param {Element} [parent] parent element where the menu item should be appended
    * @param {Boolean} [first] insert it as a first menu item
    */
    addMenuItem: function (menuItem, parent, first) {
        // {name: 'block name', href: 'false, http://...', click: function () {}}
        if (!parent && !this.menu) {
            this.addMainMenu();
        }
        var li = this.elementer.Li(),
            a = this.elementer.CreateLink(menuItem.name, menuItem.href || 'javascript:void(0)');

        if (typeof menuItem.click === 'function') {
            this.elementer.subscribe(a, 'click', menuItem.click);
        }

        if (!parent) {
            parent = this.menu;
        }
        this.elementer.AddClass(li, 'leaf');
        this.elementer.Add(a, li);
        if (first && parent.firstChild) {
            this.elementer.Insert(li, parent.firstChild);
        } else {
            this.elementer.Add(li, parent);
        }
        if (this.hidden) {
            this.show();
        }
        this.menuItems += 1;
        return li;
    },
    removeMenuItem: function (menuItem) {
        this.elementer.Remove(menuItem);
        this.menuItems -= 1;
        if (this.menuItems === 0) {
            this.hide();
        }
    },
    destroy: function () {
        this.elementer.destroy();
        this.elementer = null;
        this.menuItems = null;
        this.blocks = null;
        this.titleNode = null;
        this.block = null;
        this.hidden = null;
    }
};

var EXPORTED_SYMBOLS = ['Menu'];
