 if (typeof Hupper === 'undefined') {
    var Hupper = {};
 }
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
    var filterhuppers = Hupper.HUP.hp.get.filterhuppers();
    if(filterhuppers) {
      var huppers = Hupper.HUP.hp.get.huppers().split(',');
      var color = Hupper.HUP.hp.get.huppercolor();
      var colors = Hupper.HUP.hp.get.highlightusers();
      huppers.forEach(function(hup_user) {
        colors += ',' + hup_user + ':' + color;
      })
      Hupper.HUP.hp.set.highlightusers(colors);
      Hupper.HUP.hp.set.huppercolor('');
      Hupper.HUP.hp.set.huppers('');
    }
  };
  var convertBlockSettings = function() {
    var blocks = Hupper.Json.decode(Hupper.HUP.hp.get.blocks());
    var output = {left: [], right: []}

    if(!blocks['block-blog-0']) {
      for(var block in blocks) {
        block.left ? output.left.push(block) : block.right.push(block);
      }
      output.left.sort(function(a,b) {
        return a.index > b.index;
      });
      output.right.sort(function(a,b) {
        return a.index > b.index;
      });
    } else if(blocks['left'] || blocks['right']) {
      output = blocks;
    }
    Hupper.HUP.hp.set.blocks(Hupper.Json.encode(output));
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
    oldVerValue = parseVersion(Hupper.HUP.hp.M.getCharPref('extensions.hupper.version'));
  } catch(e){Hupper.HUP.L.log('postinstallerror: ', e.message);}

  var version = parseVersion(HUPPER_VERSION); // current version eg.: 0.0053
  if(!oldVerValue || oldVerValue < HUPPER_VERSION) {

    // after the v0.0.5.3 the huppers were removed
    if(oldVerValue < 0.0053) {
      try {
        convertColors();
      } catch(e) { Hupper.HUP.L.log('postinstallerror2', e.message, e.fileName, e.lineNumber)}
    } else if(oldVerValue < 0.0054) {
      convertBlockSettings();
    }
    Hupper.HUP.L.log('postinstall', version, oldVerValue);
    Hupper.HUP.hp.M.setCharPref('extensions.hupper.version', HUPPER_VERSION);
  }
};
