Hupper.styles = function() {

  HUP.L.log('init styles');
  Components.utils.import('resource://huppermodules/styleLoader.jsm');
  if(!(Hupper.styleLoader instanceof StyleLoader)) {
    var styleLoader = new StyleLoader();
    Hupper.styleLoader = styleLoader;
  }
      var stylesToLoad = [];

      var styles = '/* headers-answers-trolls */ @-moz-document url-prefix(http://hupperl),url-prefix(http://hup.hu) {';
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
      var widthStyle = function(width) {
        return '' +
          '/* hupper width */@-moz-document url-prefix(http://hupperl),url-prefix(http://hup.hu) {' +
            '.sidebar {' +
              'width:' + width + 'px !important;' +
          '}' +
        '}';
      };
      var minFontsizeStyle = function(fontsize) {
        return '' +
          '/* min font size */@-moz-document url-prefix(http://hupperl),url-prefix(http://hup.hu) {' +

            'body,#all,#top-nav,#top-nav a,.sidebar .block .content,#footer,.node .links {' +
              'font-size:' + fontsize + 'px !important;' +
          '}' +
        '}';
      };


      // styleLoader.load('@-moz-document url-prefix(http://hupperl),url-prefix(http://hup.hu) { #all {font-size:20px !important;} }');
      stylesToLoad.push(styles);
      if(HUP.hp.get.styleIndent()) {
        stylesToLoad.push(indentStyle);
      }
      if(HUP.hp.get.styleAccessibility()) {
        stylesToLoad.push(accesibilityStyle);
      }
      var width = HUP.hp.get.styleWiderSidebar();
      if(width > 0) {
        stylesToLoad.push(widthStyle(width));
      }
      var minFontsize = HUP.hp.get.styleMinFontsize();
      if (minFontsize > 0) {
        stylesToLoad.push(minFontsizeStyle(minFontsize));
      }
      stylesToLoad.push('chrome://hupper/skin/hupper.css');

      HUP.L.log('init styles finished');

  var styleLoader = Hupper.styleLoader;
  styleLoader.unloadAll(function() {
    stylesToLoad.forEach(function(s) {
      styleLoader.load(s);
    });
  }, stylesToLoad);
};
