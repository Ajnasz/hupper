HUPJson = {
  decode: function(text) {
    try {
      JSON = Components.classes["@mozilla.org/dom/json;1"].createInstance(Components.interfaces.nsIJSON);
      return nativeJSON.decode(text);
    } catch(e) {
      return eval(text);
    }
  },
  encode: function(obj) {
    return obj.toSource();
  }
}
