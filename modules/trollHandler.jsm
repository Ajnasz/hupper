var scope = {};
Components.utils.import('resource://huppermodules/prefs.jsm', scope);
var TrollHandler = function () {
    this.prefs = new scope.HP();
};
TrollHandler.prototype = {
    isTroll: function (user, cb) {
        this.prefs.get.trolls(function (response) {
            var trolls = response.pref.value.split(',');
            cb(trolls.some(function (troll) {
                return troll === user;
            }));
        });
    },
    addTroll: function (user, cb) {
        var me = this;
        me.isTroll(user, function (isTroll) {
            if (!isTroll) {
                me.prefs.get.trolls(function (response) {
                    var trolls = response.pref.value.split(',');
                    trolls.push(user);
                    me.prefs.set.trolls(trolls.join(','), cb);
                });
            } else {
                cb();
            }
        });
    },
    removeTroll: function (user, cb) {
        var me = this;
        me.isTroll(user, function (isTroll) {
            if (isTroll) {
                me.prefs.get.trolls(function (response) {
                    var trolls = response.pref.value.split(',');
                    me.prefs.set.trolls(trolls.filter(function (troll) {
                        return troll !== user;
                    }).join(','), cb);
                });
            } else {
                cb();
            }
        });
    }
};

var trollHandler = new TrollHandler();
let EXPORTED_SYMBOLS = ['trollHandler'];
