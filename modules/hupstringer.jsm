HupStringer = {
  trim: function(str) {
    return str.replace(/^\s+|\s+$/g, '');
  },
  empty: function(str) {
    return (this.trim(str) == '');
  }
};

let EXPORTED_SYMBOLS = ['HupStringer'];
