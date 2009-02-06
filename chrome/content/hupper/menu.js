/**
 * @constructor
 * @class HUPMenu
 * @module Hupper
 * @description handles the hupper block
 */
var HUPMenu = function() {
  this.add();
};
HUPMenu.prototype = {
  block: null,
  id: 'block-hupper-0',
  hidden: false,
  menuItems: 0,
  hide: function() {
    if(this.block) {
      HUP.El.AddClass(this.block, 'hidden');
      this.hidden = true;
    }
  },
  show: function() {
    if(this.block) {
      HUP.El.RemoveClass(this.block, 'hidden');
      this.hidden = false;
    }
  },
  create: function() {
    this.titleNode = HUP.El.El('h2');

    this.block = HUP.El.Div();
    this.contentNode = HUP.El.Div();
    HUP.El.AddClass(this.contentNode, 'content');

    HUP.El.Add(this.titleNode, this.block);
    HUP.El.Add(this.contentNode, this.block);
    this.block.setAttribute('id', this.id);
    HUP.El.AddClass(this.block, 'block block-hupper');
    HUP.El.Add(HUP.El.CreateLink('Hupper', 'http://hupper.mozdev.org/'), this.titleNode);
  },
  add: function() {
    if(HUP.El.GetId(this.id) || this.block) return;
    this.create();
    HUP.El.Hide(this.block);
    var googleBlock = HUP.El.GetId('block-user-1');
    HUP.El.Insert(this.block, googleBlock);
    this.hide();
  },
  addMainMenu: function() {
    if(this.menu) return;
    HUP.El.Show(this.block);
    this.menu = this.addMenu(this.contentNode);
    HUP.El.AddClass(this.menu, 'menu');
    HUP.El.Add(this.menu, this.contentNode);
  },
  /**
   * @param {Element} parent The parent menu item (LI element)
   */
  addMenu: function(parent) {
    if(!parent) return false;
    var ul = HUP.El.Ul();
    HUP.El.Add(ul, parent);
    return ul;
  },
  removeMenu: function(menu) {
    HUP.El.Remove(menu);
  },
  /**
   * @param {Object} menuItem
   *  name: 'name of the menu item'
   *  click: function
   *  href: 'http://...
   * @param {Element} [parent] parent element where the menu item should be appended
   * @param {Boolean} [first] insert it as a first menu item
   */
  addMenuItem: function(menuItem, parent, first) {
  // {name: 'block name', href: 'false, http://...', click: function() {}}
    if(!parent && !this.menu) this.addMainMenu();
    var li = HUP.El.Li();
    var a = HUP.El.CreateLink(menuItem.name, menuItem.href || 'javascript:void(0)');

    if(typeof menuItem.click == 'function') {
      HUP.Ev.addEvent(a, 'click', menuItem.click);
    }

    if(!parent) parent = this.menu;
    HUP.El.AddClass(li, 'leaf');
    HUP.El.Add(a, li);
    (first && parent.firstChild) ? HUP.El.Insert(li, parent.firstChild) : HUP.El.Add(li, parent);
    if(this.hidden) this.show();
    this.menuItems++;
    return li;
  },
  removeMenuItem: function(menuItem) {
    HUP.El.Remove(menuItem);
    this.menuItems--;
    if(this.menuItems == 0) this.hide();
  }
};
