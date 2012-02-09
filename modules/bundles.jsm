var bundles = Components.classes["@mozilla.org/intl/stringbundle;1"]
                  .getService(Components.interfaces.nsIStringBundleService);
var strings = bundles.createBundle("chrome://hupper/locale/hupper.properties");

var hupperBundles = {
    getFormattedString: function (id, args) {
        return strings.formatStringFromName(id, args, args.length);
    },
    getString: function (name) {
        return strings.GetStringFromName(name);
    }
};

var EXPORTED_SYMBOLS = ['hupperBundles'];
