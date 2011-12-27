if (typeof Hupper === 'undefined') {
  var Hupper = {};
}
Hupper.Json = {
    decode: function (text) {
        try {
            return JSON.parse(text);
        } catch (e) {
              // fallback, because the text may not a valid json
             var mySandbox = new Components.utils.Sandbox("http://hup.hu/");
             return Components.utils.evalInSandbox(text, mySandbox);
        }
    },
    encode: function (obj) {
        return JSON.stringify(obj);
    }
};
