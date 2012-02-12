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
  var scope = {}, prefs;
  Components.utils.import('resource://huppermodules/prefs.jsm', scope);
  prefs = new scope.HP();

  /**
   * !Previous < 0.0.5.3
   * adds the old huppers to the highlighted users with
   * the color of the huppers
   */
  var convertColors = function() {
    var filterhuppers = prefs.get.filterhuppers();
    if(filterhuppers) {
      var huppers = prefs.get.huppers().split(',');
      var color = prefs.get.huppercolor();
      var colors = prefs.get.highlightusers();
      huppers.forEach(function(hup_user) {
        colors += ',' + hup_user + ':' + color;
      })
      prefs.set.highlightusers(colors);
      prefs.set.huppercolor('');
      prefs.set.huppers('');
    }
  };
  var convertBlockSettings = function() {
    var blocks = JSON.parse(prefs.get.blocks());
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
    prefs.set.blocks(JSON.stringify(output));
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
  var scope = {};
  Components.utils.import('resource://huppermodules/log.jsm', scope);
  try {
    oldVerValue = parseVersion(prefs.M.getCharPref('extensions.hupper.version'));
  } catch(e) {
    scope.hupperLog('postinstallerror: ', e.message);
  }

  var version = parseVersion(HUPPER_VERSION); // current version eg.: 0.0053
  if(!oldVerValue || oldVerValue < HUPPER_VERSION) {

    // after the v0.0.5.3 the huppers were removed
    if(oldVerValue < 0.0053) {
      try {
        convertColors();
      } catch(e) {
        scope.hupperLog('postinstallerror2', e.message, e.fileName, e.lineNumber);
      }
    } else if(oldVerValue < 0.0054) {
      convertBlockSettings();
    }
    scope.hupperLog('postinstall', version, oldVerValue);
    prefs.M.setCharPref('extensions.hupper.version', HUPPER_VERSION);
  }
};
