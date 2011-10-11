var scope = {};
Components.utils.import('resource://huppermodules/prefs.jsm', scope);
var TrollHandler = function () {
    this.prefs = new scope.HP();
};
TrollHandler.prototype = {
    normalize: function (items) {
        return items.filter(function (item) {
            return item !== '';
        });
    },
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
                    me.prefs.set.trolls(me.normalize(trolls).join(','), cb);
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
                    me.prefs.set.trolls(me.normalize(
                        trolls.filter(function (troll) {
                            return troll !== user;
                        })
                    ).join(','), cb);
                });
            } else {
                cb();
            }
        });
    },
    isHighlighted: function (user, cb) {
        var me = this;
        this.prefs.get.highlightusers(function (response) {
            var users = response.pref.value.split(',');
            cb(users.some(function (hluser) {
                var hluserArr = hluser.split(':');
                return hluserArr[0] === user;
            }));
        });
    },
    highlightUser: function (user, color, cb) {
        var me = this;
        me.isHighlighted(user, function (isHighlighted) {
            if (!isHighlighted) {
                me.prefs.get.highlightusers(function (response) {
                    var users = response.pref.value.split(',');
                    users.push(user + ':' + color);
                    me.prefs.set.highlightusers(me.normalize(users).join(','), cb);
                });
            } else {
                cb();
            }
        });
    },
    unhighlightUser: function (user, cb) {
        var me = this;
        me.isHighlighted(user, function (isHighlighted) {
            if (isHighlighted) {
                me.prefs.get.highlightusers(function (response) {
                    var users = response.pref.value.split(',');
                    me.prefs.set.highlightusers(
                        me.normalize(users.filter(function (hluser) {
                            return hluser.split(':')[0] !== user;
                        })
                    ).join(','), cb);
                });
            } else {
                cb();
            }
        });
    }
};

var trollHandler = new TrollHandler();
let EXPORTED_SYMBOLS = ['trollHandler'];
