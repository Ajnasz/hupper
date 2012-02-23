/**
 * @param {Element} ob
 */
function StatusClickHandler(ob, sites) {
    this.ob = ob;
    if (!this.ob) {
        return;
    }
    this.pageRex = new RegExp('^https?://(?:www\\.)?hup\\.(?:hu|lh)');
    this.observe();
    this.sites = sites;
}
StatusClickHandler.prototype = {
    st: null,
    ob: null,
    getGBrowser: function () {
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                          .getService(Components.interfaces.nsIWindowMediator),
            mainWindow = wm.getMostRecentWindow("navigator:browser");
        return mainWindow.gBrowser;
    },
    /**
    * add the event handler to the statusbar icon
    */
    observe: function () {
        var _this = this;
        this.ob.addEventListener('click', function (event) {
            _this.click(event);
        }, false);
        if (this.st === 2) {
            this.ob.addEventListener('dblclick', function (event) {
                _this.click(event);
            }, false);
        }
        this.ob.addEventListener('contextmenu', function (e) {
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
    click: function (e) {
        var currentTab = this.openHUP(),
            link, currentSite, newNode;
        this.sites.forEach(function (site) {
            if (site && site.doc === currentTab.contentDocument) {
                currentSite = site;
            }
        });
        if (currentTab.contentDocument) {
            switch (e.button) {
            case 0:
                newNode = currentSite.getNextNew();
                break;

            case 2:
                newNode = currentSite.getPrevNew();
                break;

            case 1:
                // HupAccountManager.logIn();
                // var currentTab = _this.openHUP();
                break;
            }
            if (newNode) {
                if (currentSite.hasComments()) {
                    link = '#' + newNode.id;
                } else {
                    link = '#node-' + newNode.id;
                }
                currentTab.contentDocument.location.hash = link;
            }
        }
    },
    getOpenedHUP: function () {
        var gBrowser = this.getGBrowser(),
            brl = gBrowser.browsers.length,
            outObj = {hupTab: false, blankPage: false},
            r = this.pageRex, i;
        for (i = 0 ; i < brl; i += 1) {
            if (r.test(gBrowser.getBrowserAtIndex(i).currentURI.spec)) {
                outObj.hupTab = i;
                return outObj;
            } else if (gBrowser.getBrowserAtIndex(i).currentURI.spec === 'about:blank' && outObj.blankPage === false) {
                outObj.blankPage = i;
            }
        }
        return outObj;
    },
    openHUP: function () {
        var gBrowser = this.getGBrowser(),
            currentTab = gBrowser.getBrowserAtIndex(gBrowser.mTabContainer.selectedIndex),
            openedHUP;
        if (!/^https?:\/\/(?:www\.)?hup\.hu/.test(currentTab.currentURI.spec)) {
            openedHUP = this.getOpenedHUP();
            if (openedHUP.hupTab === false) {
                if (openedHUP.blankPage === false) {
                    currentTab = gBrowser.selectedTab = gBrowser.addTab('http://hup.hu');
                } else {
                    gBrowser.mTabContainer.selectedIndex = openedHUP.blankPage;
                    gBrowser.loadURI('http://hup.hu');
                    gBrowser.getBrowserAtIndex(gBrowser.mTabContainer.selectedIndex).contentWindow.focus();
                }
            } else {
                gBrowser.mTabContainer.selectedIndex = openedHUP.hupTab;
            }
            currentTab = gBrowser.getBrowserAtIndex(gBrowser.mTabContainer.selectedIndex);
        }
        return currentTab;
    }
};

var EXPORTED_SYMBOLS = ['StatusClickHandler'];
