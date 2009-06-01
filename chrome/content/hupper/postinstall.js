/**
 * If some data format has been changed, the postinstall
 * will convert the datas to the newer format
 * @method postInstall
 * @namespace Hupper
 */
Hupper.postInstall = function() {

  const HUPPER_VERSION = '###VERSION###';

  /**
   * !Previous < 0.0.5.3
   * adds the old huppers to the highlighted users with
   * the color of the huppers
   */
  var convertColors = function() {
    var filterhuppers = HUP.hp.get.filterhuppers();
    if(filterhuppers) {
      var huppers = HUP.hp.get.huppers().split(',');
      var color = HUP.hp.get.huppercolor();
      var colors = HUP.hp.get.highlightusers();
      huppers.forEach(function(hup_user) {
        colors += ',' + hup_user + ':' + color;
      })
      HUP.hp.set.highlightusers(colors);
      HUP.hp.set.huppercolor('');
      HUP.hp.set.huppers('');
    }
  };

  /**
   * creates a float number from the ver param, which will
   * be comparable to decide which version is the newer
   * @param {String} ver the version number as a string
   * @returns a float number. 0 < NUMBER < 1
   * @type Float
   */
  var parseVersion = function(ver) {
    return parseFloat('0.' + ver.replace(/\.|[^\d]/g, ''));
  };



  var oldVerValue = 0; // previous version
  try {
    oldVerValue = parseVersion(HUP.hp.M.getCharPref('extensions.hupper.version'));
  } catch(e){HUP.L.log(e.message);}

  var version = parseVersion(HUPPER_VERSION); // current version eg.: 0.0053
  if(!oldVerValue || oldVerValue < HUPPER_VERSION) {

    // after the v0.0.5.3 the huppers were removed
    if(oldVerValue < 0.0053) {
      try {
        convertColors();
      } catch(e) { HUP.L.log(e.message, e.fileName, e.lineNumber)}
    }
    HUP.L.log('postinstall', version, oldVerValue);
    HUP.hp.M.setCharPref('extensions.hupper.version', HUPPER_VERSION);
  }
};
