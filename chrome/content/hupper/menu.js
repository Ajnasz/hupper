/**
 * @constructor
 * @class Menu
 * @namespace Hupper
 * @module Hupper
 * @description handles the hupper block
 */
Hupper.Menu = function() {
  this.add();
};
Hupper.Menu.prototype = {
  block: null,
  id: 'block-hupper-0',
  hidden: false,
  menuItems: 0,
  hide: function() {
    if(this.block) {
      Hupper.HUP.El.AddClass(this.block, 'hup-hidden');
      this.hidden = true;
    }
  },
  show: function() {
    if(this.block) {
      Hupper.HUP.El.RemoveClass(this.block, 'hup-hidden');
      this.hidden = false;
    }
  },
  create: function() {
    this.titleNode = Hupper.HUP.El.El('h2');

    this.block = Hupper.HUP.El.Div();
    this.contentNode = Hupper.HUP.El.Div();
    Hupper.HUP.El.AddClass(this.contentNode, 'content');

    Hupper.HUP.El.Add(this.titleNode, this.block);
    Hupper.HUP.El.Add(this.contentNode, this.block);
    this.block.setAttribute('id', this.id);
    Hupper.HUP.El.AddClass(this.block, 'block block-hupper');
    Hupper.HUP.El.Add(Hupper.HUP.El.CreateLink('Hupper', 'http://hupper.mozdev.org/'), this.titleNode);
  },
  add: function() {
    if(Hupper.HUP.El.GetId(this.id) || this.block) return;
    this.create();
    Hupper.HUP.El.Hide(this.block);
    var googleBlock = Hupper.HUP.El.GetId('block-user-1');
    Hupper.HUP.El.Insert(this.block, googleBlock);
    this.hide();
  },
  addMainMenu: function() {
    if(this.menu) return;
    Hupper.HUP.El.Show(this.block);
    this.menu = this.addMenu(this.contentNode);
    Hupper.HUP.El.AddClass(this.menu, 'menu');
    Hupper.HUP.El.Add(this.menu, this.contentNode);
  },
  /**
   * @param {Element} parent The parent menu item (LI element)
   */
  addMenu: function(parent) {
    if(!parent) return false;
    var ul = Hupper.HUP.El.Ul();
    Hupper.HUP.El.Add(ul, parent);
    return ul;
  },
  removeMenu: function(menu) {
    Hupper.HUP.El.Remove(menu);
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
    var li = Hupper.HUP.El.Li();
    var a = Hupper.HUP.El.CreateLink(menuItem.name, menuItem.href || 'javascript:void(0)');

    if(typeof menuItem.click == 'function') {
      Hupper.HUP.Ev.addEvent(a, 'click', menuItem.click);
    }

    if(!parent) parent = this.menu;
    Hupper.HUP.El.AddClass(li, 'leaf');
    Hupper.HUP.El.Add(a, li);
    (first && parent.firstChild) ? Hupper.HUP.El.Insert(li, parent.firstChild) : Hupper.HUP.El.Add(li, parent);
    if(this.hidden) this.show();
    this.menuItems++;
    return li;
  },
  removeMenuItem: function(menuItem) {
    Hupper.HUP.El.Remove(menuItem);
    this.menuItems--;
    if(this.menuItems == 0) this.hide();
  }
};
