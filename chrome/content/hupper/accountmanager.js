/**
 * Google account manager namespace,
 * check that the user is logged in,
 * logging in the user
 * @requires _HUPPasswordManager to get the users password
 * @requires #getFeedList function, to gets the feeds
 */
 if (typeof Hupper === 'undefined') {
    var Hupper = {};
 }
Hupper.AccountManager = {
  // mozilla nsi cookie manager component
  CookieManager: Components.classes["@mozilla.org/cookiemanager;1"].getService(Components.interfaces.nsICookieManager),
  /**
   * Check, that the account is configured
   * @type {Boolean}
   */
  passwordManager: function() {
    return new _HUPPasswordManager();
  },
  hp: function () {
      if(typeof this._hp === 'undefined') {
          var scope = {};
          Components.utils.import('resource://huppermodules/prefs.jsm', scope);
          this._hp = new scope.HP();
      }
      return this._hp;
  },
  accountExists: function() {
    if(this.hp().get.username() && this.passwordManager().getPassword()) {
      return true;
    }
    return false;
  },
  /**
   * do the login into the google service
   * @param {Function} onLoad run after successful login
   */
  logIn: function(onLogin) {
    if(this.accountExists()) {
      var url = 'http://hup.hu/node?destination=node';
      var param = 'name='+encodeURIComponent(this.hp().get.username())+'&pass='+encodeURIComponent(this.passwordManager().getPassword())+'&op=' + encodeURIComponent('Belépés') + '&form_id=user_login_block';
      var _this = this;
      var ajax = new Hupper.Ajax({
        url: url,
        method: 'post',
        successHandler: function(e) {
          _this.ajaxSuccess(e);
          if(typeof onLogin == 'function') {
            onLogin();
          }
        },
        pars: param
      });
    } else {
      this.loginFailed();
      return -1;
    }
    return true;
  },
  /**
   * @param {Event} e event object
   * @returns true if the login was succes and false if wasn't
   * @type Boolean
   */
  ajaxSuccess: function(e) {
    return true;
  },
  /**
   * do things when the login failed
   * @returns false
   * @type Boolean
   */
  loginFailed: function() {
    return false;
  }
};
