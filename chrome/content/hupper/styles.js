Hupper.styles = function() {

  HUP.L.log('init styles');
  if(!Hupper.styleLoader) {
    Components.utils.import('resource://huppermodules/styleLoader.jsm');
    var styleLoader = new StyleLoader();
    Hupper.styleLoader = styleLoader;
  }
  var loadStyles = function(HUP, Hupper) {
    return function() {

      var styles = '/* headers-answers-trolls */ @-moz-document url-prefix(http://hup.hu) {';
      switch(HUP.hp.get.trollfiltermethod()) {
        case 'hide':
          styles += '.' + HUP.hp.get.trollCommentClass + ' {display:none !important;}';
          if(HUP.hp.get.hidetrollanswers()) {
            styles += '.' + HUP.hp.get.trollCommentAnswersClass + ' {display:none !important;}';
          }
          break;
        case 'hilight':
        default:
          styles += '.' + HUP.hp.get.trollCommentHeaderClass + ' {background-color:' + HUP.hp.get.trollcolor() + ' !important;}';
          break;
      };
      if(HUP.hp.get.hilightforumlinesonhover()) {
        styles += 'tr.odd:hover td, tr.even:hover td {background-color: #D8D8C4;}';
      }
      styles += '}';
      var indentStyle = 'chrome://hupper/skin/indentstyles.css',
          accesibilityStyle = 'chrome://hupper/skin/accesibilitystyles.css';
      var marker = '/* hupper width */';
      var widthStyle = function(width) {
        return '' +
          marker + '@-moz-document url-prefix(http://hup.hu) {' +
            '.sidebar {' +
              'width:' + width + 'px !important;' +
          '}' +
        '}';
      }


      // styleLoader.load('@-moz-document url-prefix(http://hup.hu) { #all {font-size:20px !important;} }');
      if(HUP.hp.get.styleIndent()) {
        Hupper.styleLoader.load(indentStyle);
      }
      if(HUP.hp.get.styleAccessibility()) {
        Hupper.styleLoader.load(accesibilityStyle);
      }
      var width = HUP.hp.get.styleWiderSidebar();
      if(width > 0) {
        Hupper.styleLoader.load(widthStyle(width));
      }

      HUP.L.log('init styles finished');
      Hupper.styleLoader.load(styles);
      Hupper.styleLoader.load('chrome://hupper/skin/hupper.css');
  }}(HUP, Hupper);
  Hupper.styleLoader.unloadAll(loadStyles);
};
