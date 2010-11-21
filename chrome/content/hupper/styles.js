Hupper.styles = function() {

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
  };

  HUP.L.log('init styles');
  if(!Hupper.styleLoader) {
    Components.utils.import('resource://huppermodules/styleLoader.jsm');
    var styleLoader = new StyleLoader();
    Hupper.styleLoader = styleLoader;
  }
  // styleLoader.load('@-moz-document url-prefix(http://hup.hu) { #all {font-size:20px !important;} }');
  if(HUP.hp.get.styleIndent()) {
    Hupper.styleLoader.load(indentStyle);
  } else {
    Hupper.styleLoader.unLoad(indentStyle);
  }
  if(HUP.hp.get.styleAccessibility()) {
    Hupper.styleLoader.load(accesibilityStyle);
  } else {
    Hupper.styleLoader.unLoad(accesibilityStyle);
  }
  var loadedStyles = Hupper.styleLoader.getLoadedStyles();
  loadedStyles.forEach(function(style) {
    HUP.L.log(style);
    if(style.indexOf(marker) > -1) {
      Hupper.styleLoader.unLoad(style);
    }
  });
  var width = HUP.hp.get.styleWiderSidebar();
  if(width > 0) {
    Hupper.styleLoader.load(widthStyle(width));
  }

  HUP.L.log('init styles finished');
};
