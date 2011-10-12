var HP = function () {
    this.M = (function () {
        var prefs = Components.classes["@mozilla.org/preferences-service;1"]
              .getService(Components.interfaces.nsIPrefBranch),
            isFunction = function (f) {
            return typeof f === 'function';
        };
        return {
            getBoolPref: function (n, cb) {
                var value = prefs.getBoolPref(n);
                if (isFunction(cb)) {
                    cb({success: true, pref: {name: n, value: value}});
                }
                return value;
            },
            getCharPref: function (n, cb) {
                var value = prefs.getCharPref(n);
                if (isFunction(cb)) {
                    cb({success: true, pref: {name: n, value: value}});
                }
                return value;
            },
            getIntPref: function (n, cb) {
                var value = prefs.getIntPref(n);
                if (isFunction(cb)) {
                    cb({success: true, pref: {name: n, value: value}});
                }
                return value;
            },
            setBoolPref: function (n, v, cb) {
                prefs.setBoolPref(n, v);
                var value = prefs.getBoolPref(n);
                if (isFunction(cb)) {
                    cb({success: true, pref: {name: n, value: value}});
                }
                return value;
            },
            setCharPref: function (n, v, cb) {
                prefs.setCharPref(n, v);
                var value = prefs.getCharPref(n);
                if (isFunction(cb)) {
                    cb({success: true, pref: {name: n, value: value}});
                }
                return value;
            },
            setIntPref: function (n, v, cb) {
                prefs.setIntPref(n, v);
                var value = prefs.getIntPref(n);
                if (isFunction(cb)) {
                    cb({success: true, pref: {name: n, value: value}});
                }
                return value;
            }
        };
    }());
    this.get.M = this.set.M = this.M;
};
HP.prototype = {
    M: null, // Manager
    get: {
        trolls: function (cb) {
            return this.M.getCharPref('extensions.hupper.trolls', cb);
        },
        /**
        * @return {Boolean}
        */
        filtertrolls: function (cb) {
            return this.M.getBoolPref('extensions.hupper.filtertrolls', cb);
        },
        trollcolor: function (cb) {
            return this.M.getCharPref('extensions.hupper.trollcolor', cb);
        },
        /**
        * @return hide, hilight
        */
        trollfiltermethod: function (cb) {
            // hide, hilight
            return this.M.getCharPref('extensions.hupper.trollfiltermethod', cb);
        },
        /**
        * @return {String}
        */
        huppers: function (cb) {
            return this.M.getCharPref('extensions.hupper.huppers', cb);
        },
        /**
        * @namespace HP.get
        * @return {Boolean}
        */
        filterhuppers: function (cb) {
            return this.M.getBoolPref('extensions.hupper.filterhuppers', cb);
        },
        huppercolor: function (cb) {
            return this.M.getCharPref('extensions.hupper.huppercolor', cb);
        },
        replacenewcommenttext: function (cb) {
            return this.M.getBoolPref('extensions.hupper.replacenewcommenttext', cb);
        },
        newcommenttext: function (cb) {
            return this.M.getCharPref('extensions.hupper.newcommenttext', cb);
        },
        extracommentlinks: function (cb) {
            return this.M.getBoolPref('extensions.hupper.extracommentlinks', cb);
        },
        hilightforumlinesonhover: function (cb) {
            return this.M.getBoolPref('extensions.hupper.hilightforumlinesonhover', cb);
        },
        insertpermalink: function (cb) {
            return this.M.getBoolPref('extensions.hupper.insertpermalink', cb);
        },
        insertnewtexttonode: function (cb) {
            return this.M.getBoolPref('extensions.hupper.insertnewtexttonode', cb);
        },
        fadeparentcomment: function (cb) {
            return this.M.getBoolPref('extensions.hupper.fadeparentcomment', cb);
        },
        showqnavbox: function (cb) {
            return this.M.getBoolPref('extensions.hupper.showqnavbox', cb);
        },
        hidetrollanswers: function (cb) {
            return this.M.getBoolPref('extensions.hupper.hidetrollanswers', cb);
        },
        hideads: function (cb) {
            return this.M.getBoolPref('extensions.hupper.hideads', cb);
        },
        highlightusers: function (cb) {
            return this.M.getCharPref('extensions.hupper.highlightusers', cb);
        },
        username: function (cb) {
            return this.M.getCharPref('extensions.hupper.username', cb);
        },
        hidetaxonomy: function (cb) {
            return this.M.getCharPref('extensions.hupper.hidetaxonomy', cb);
        },
        showinstatusbar: function (cb) {
            return this.M.getBoolPref('extensions.hupper.showinstatusbar', cb);
        },
        blocks: function (cb) {
            return this.M.getCharPref('extensions.hupper.blocks', cb);
        },
        /**
        * @type Boolean
        */
        prevnextlinks: function (cb) {
            return this.M.getBoolPref('extensions.hupper.prevnextlinks', cb);
        },
        parseblocks: function (cb) {
            return this.M.getBoolPref('extensions.hupper.parseblocks', cb);
        },
        styleIndent: function (cb) {
            return this.M.getBoolPref('extensions.hupper.style_indent', cb);
        },
        styleAccessibility: function (cb) {
            return this.M.getBoolPref('extensions.hupper.style_accessibility', cb);
        },
        styleWiderSidebar: function (cb) {
            return this.M.getIntPref('extensions.hupper.style_wider_sidebar', cb);
        },
        styleMinFontsize: function (cb) {
            return this.M.getIntPref('extensions.hupper.style_min_fontsize', cb);
        },
        hideboringcomments: function (cb) {
            return this.M.getBoolPref('extensions.hupper.hideboringcomments', cb);
        },
        trollCommentHeaderClass: function (cb) {
            cb({success: true, pref: {value: 'trollHeader', name: 'trollHeader'}});
        },
        trollCommentClass: function (cb) {
            cb({success: true, pref: {value: 'trollComment', name: 'trollcommentclass'}});
        },
        trollCommentAnswersClass: function (cb) {
            cb({success: true, pref: {value: 'trollCommentAnswer', name: 'trollcommentanswer'}});
        }
    },
    set: {
        M: this.M,
        trolls: function (value, cb) {
            this.M.setCharPref('extensions.hupper.trolls', value, cb);
        },
        /**
        * @namespace HP.set
        * @return {Boolean}
        */
        filtertrolls: function (value, cb) {
            this.M.setBoolPref('extensions.hupper.filtertrolls', value, cb);
        },
        trollfiltermethod: function (value, cb) {
            // hide, hilig, cbht
            this.M.setCharPref('extensions.hupper.trollfiltermethod', value);
        },
        trollcolor: function (value, cb) {
            this.M.setCharPref('extensions.hupper.trollcolor', value, cb);
        },
        huppers: function (value, cb) {
            this.M.setCharPref('extensions.hupper.huppers', value, cb);
        },
        filterhuppers: function (value, cb) {
            this.M.setBoolPref('extensions.hupper.filterhuppers', value, cb);
        },
        huppercolor: function (value, cb) {
            this.M.setCharPref('extensions.hupper.huppercolor', value, cb);
        },
        replacenewcommenttext: function (value, cb) {
            this.M.setBoolPref('extensions.hupper.replacenewcommenttext', value, cb);
        },
        newcommenttext: function (value, cb) {
            this.M.setCharPref('extensions.hupper.newcommenttext', value, cb);
        },
        extracommentlinks: function (value, cb) {
            this.M.setBoolPref('extensions.hupper.extracommentlinks', value, cb);
        },
        hilightforumlinesonhover: function (value, cb) {
            this.M.setBoolPref('extensions.hupper.hilightforumlinesonhover', value, cb);
        },
        insertpermalink: function (value, cb) {
            this.M.setBoolPref('extensions.hupper.insertpermalink', value, cb);
        },
        insertnewtexttonode: function (value, cb) {
            this.M.setBoolPref('extensions.hupper.insertnewtexttonode', value, cb);
        },
        fadeparentcomment: function (value, cb) {
            this.M.setBoolPref('extensions.hupper.fadeparentcomment', value, cb);
        },
        showqnavbox: function (value, cb) {
            this.M.setBoolPref('extensions.hupper.showqnavbox', value, cb);
        },
        hidetrollanswers: function (value, cb) {
            this.M.setBoolPref('extensions.hupper.hidetrollanswers', value, cb);
        },
        hideads: function (value, cb) {
            this.M.setBoolPref('extensions.hupper.hideads', value, cb);
        },
        highlightusers: function (value, cb) {
            this.M.setCharPref('extensions.hupper.highlightusers', value, cb);
        },
        username: function (value, cb) {
            return this.M.setCharPref('extensions.hupper.username', value, cb);
        },
        hidetaxonomy: function (value, cb) {
            return this.M.setCharPref('extensions.hupper.hidetaxonomy', value, cb);
        },
        showinstatusbar: function (value, cb) {
            return this.M.setBoolPref('extensions.hupper.showinstatusbar', value, cb);
        },
        blocks: function (value, cb) {
            return this.M.setCharPref('extensions.hupper.blocks', value, cb);
        },
        parseblocks: function (value, cb) {
            return this.M.setBoolPref('extensions.hupper.parseblocks', value, cb);
        },
        styleIndent: function (value, cb) {
            return this.M.setBoolPref('extensions.hupper.style_indent', value, cb);
        },
        styleAccessibility: function (value, cb) {
            return this.M.setBoolPref('extensions.hupper.style_accessibility', value, cb);
        },
        styleWiderSidebar: function (value, cb) {
            return this.M.setIntPref('extensions.hupper.style_wider_sidebar', value, cb);
        },
        styleMinFontsize: function (value, cb) {
            return this.M.setIntPref('extensions.hupper.style_min_fontsize', value, cb);
        },
        hideboringcomments: function (value, cb) {
            return this.M.setBoolPref('extensions.hupper.hideboringcomments', value, cb);
        }
    }
};
let EXPORTED_SYMBOLS = ['HP'];
