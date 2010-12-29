Hupper.styles = function() {
  HUP.L.log('init styles');
  var stylesToLoad = [];
  var addStyle = function(s) {
    stylesToLoad.push(s);
  };
  HUP.hp.get.trollfiltermethod(function(response) {
    var styles = '';
    var trollfiltermethod = response.pref.value;

    HUP.hp.get.trollCommentClass(function(response) {
      var trollCommentClass = response.pref.value;

      HUP.hp.get.hidetrollanswers(function(response) {
        var hidetrollanswers = response.pref.value;

        HUP.hp.get.trollCommentAnswersClass(function(response) {
          var trollCommentAnswersClass = response.pref.value;

          HUP.hp.get.trollCommentHeaderClass(function(response) {
            var trollCommentHeaderClass = response.pref.value;

            HUP.hp.get.trollcolor(function(response) {
              var trollcolor = response.pref.value;

              HUP.hp.get.hilightforumlinesonhover(function(response) {
                var hilightforumlinesonhover = response.pref.value;
                console.log('highligh forum: ', hilightforumlinesonhover);
                switch(trollfiltermethod) {
                  case 'hide':
                    styles += '.' + trollCommentClass + ' {display:none !important;}';
                    if(hidetrollanswers) {
                      styles += '.' + trollCommentAnswersClass + ' {display:none !important;}';
                    }
                    break;
                  case 'hilight':
                  default:
                    styles += '.' + trollCommentHeaderClass + ' {background-color:' + trollcolor + ' !important;}';
                    break;
                };
                if(hilightforumlinesonhover) {
                  styles += 'tr.odd:hover td, tr.even:hover td {background-color: #D8D8C4;}';
                }
                addStyle(styles);
              });
            });
          });
        });
      });
    });
  });
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


  HUP.hp.get.styleIndent(function(response) {
    if (response.pref.value) {
      addStyle(indentStyle);
    }
  });
  HUP.hp.get.styleAccessibility(function(response) {
    if (response.pref.value) {
      addStyle(accesibilityStyle);
    }
  });
  HUP.hp.get.styleWiderSidebar(function(response) {
    var width = response.pref.value;
    if(width > 0) {
      addStyle(widthStyle(width));
    }
  });
  HUP.hp.get.styleMinFontsize(function(response) {
    var minFontsize = response.pref.value;
    if (minFontsize > 0) {
      addStyle(minFontsizeStyle(minFontsize));
    }
  });
  addStyle("chrome://hupper/skin/hupper.css");

  Components.utils.import('resource://huppermodules/styleLoader.jsm');
  if(!(Hupper.styleLoader instanceof StyleLoader)) {
    var styleLoader = new StyleLoader();
    Hupper.styleLoader = styleLoader;
  }
  var styleLoader = Hupper.styleLoader;
  styleLoader.unloadAll(function() {
    stylesToLoad.forEach(function(s) {
      styleLoader.load(s);
    });
  }, stylesToLoad);
};
