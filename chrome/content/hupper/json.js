if (typeof Hupper === 'undefined') {
  var Hupper = {};
}
var Hupper.Json = {
    decode: function (text) {
        return JSON.parse(text);
    },
    encode: function (obj) {
        return JSON.stringify(obj);
    }
};
