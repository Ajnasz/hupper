var HUPMenu = function() {
  this.add();
};
HUPMenu.prototype = {
  block: null,
  id: 'block-hupper-0',
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
  addMenuItem: function(menuItem, parent) {
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
    HUP.El.Add(li, parent);
    return li;
  },
  removeMenuItem: function(menuItem) {
    HUP.El.Remove(menuItem);
  }
};
