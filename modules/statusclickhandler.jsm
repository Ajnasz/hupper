/**
 * @param {Element} ob
 */
StatusClickHandler = function(ob) {
  this.ob = ob;
  if(!this.ob) { return; }
  this.pageRex = new RegExp('^https?://(?:www\.)?hup.hu');
  this.observe();
};
StatusClickHandler.prototype = {
  st: null,
  ob: null,
  /**
   * add the event handler to the statusbar icon
   */
  observe: function() {
    var _this = this;
    this.ob.addEventListener('click', function(event){_this.click(event)}, false);
    if(this.st == 2) {
      this.ob.addEventListener('dblclick', function(event){_this.click(event)}, false);
    }
    this.ob.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      e.stopPropagation();
    }, false);
  },
  /**
   * event handler runs when user click on the statusbar icon
   * event.button:
   *   0 = left click
   *   1 = middle click
   *   2 = right click
   * @param {Object} event
   */
  click: function(e) {
    var currentTab = this.openHUP();
    if(currentTab.contentDocument.Jumps) {
      switch(e.button) {
        case 0:
          currentTab.contentDocument.Jumps.next();
        break;

      case 2:
          currentTab.contentDocument.Jumps.prev();
        break;

      case 1:
        // HupAccountManager.logIn();
        // var currentTab = _this.openHUP();
        break;
      }
    }
  },
  getOpenedHUP: function() {
    var brl = gBrowser.browsers.length;
    var outObj = {hupTab: false, blankPage: false};
    var r = this.pageRex;
    for(var i = 0 ; i < brl; i++) {
      if(r.test(gBrowser.getBrowserAtIndex(i).currentURI.spec)) {
        outObj.hupTab = i;
        return outObj;
      } else if(gBrowser.getBrowserAtIndex(i).currentURI.spec == 'about:blank' && outObj.blankPage === false) {
        outObj.blankPage = i;
      }
    }
    return outObj;
  },
  openHUP: function() {
    var currentTab = gBrowser.getBrowserAtIndex(gBrowser.mTabContainer.selectedIndex);
    if(!/^https?:\/\/(?:www\.)?hup\.hu/.test(currentTab.currentURI.spec)) {
      var openedHUP = this.getOpenedHUP();
      if(openedHUP.hupTab === false) {
        if(openedHUP.blankPage === false) {
            currentTab = gBrowser.selectedTab = gBrowser.addTab('http://hup.hu');
        } else {
          gBrowser.mTabContainer.selectedIndex = openedHUP.blankPage;
          gBrowser.loadURI('http://hup.hu');
          gBrowser.getBrowserAtIndex(gBrowser.mTabContainer.selectedIndex).contentWindow.focus();
        }
        gBrowser
      } else {
        gBrowser.mTabContainer.selectedIndex = openedHUP.hupTab;
      }
      currentTab = gBrowser.getBrowserAtIndex(gBrowser.mTabContainer.selectedIndex);
    }
    return currentTab;
  }
};

let EXPORTED_SYMBOLS = ['StatusClickHandler'];
