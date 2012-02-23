/*global Hupper: true, StyleLoader: true*/
var hupperStyleHandler = function () {
    var scope = {},
        stylesToLoad = [],
        addStyle, indentStyle,
        accesibilityStyle, widthStyle, minFontsizeStyle,
        prefs;
    Components.utils.import('resource://huppermodules/prefs.jsm', scope);
    prefs = new scope.HP();
    prefs.get.trollfiltermethod(function (response) {
        var styles = '',
            trollfiltermethod = response.pref.value;

        prefs.get.trollCommentClass(function (response) {
            var trollCommentClass = response.pref.value;
            prefs.get.hidetrollanswers(function (response) {
                var hidetrollanswers = response.pref.value;

                prefs.get.trollCommentAnswersClass(function (response) {
                    var trollCommentAnswersClass = response.pref.value;

                    prefs.get.trollCommentHeaderClass(function (response) {
                        var trollCommentHeaderClass = response.pref.value;

                        prefs.get.trollcolor(function (response) {
                            var trollcolor = response.pref.value;

                            prefs.get.hilightforumlinesonhover(function (response) {
                                var hilightforumlinesonhover = response.pref.value;
                                switch (trollfiltermethod) {
                                case 'hide':
                                    styles += '.' + trollCommentClass +
                                      ' {display:none !important;}';
                                    if (hidetrollanswers) {
                                        styles += '.' + trollCommentAnswersClass +
                                          ' {display:none !important;}';
                                    }
                                    break;
                                // case 'hilight':
                                default:
                                    // styles += '.' + trollCommentHeaderClass +
                                    //   ' {background-color:' + trollcolor + ' !important;}';
                                    styles += '.' + trollCommentClass + ' .submitted {' +
                                        'background-color:' + trollcolor + ' !important;' +
                                    '}';
                                    break;
                                }
                                if (hilightforumlinesonhover) {
                                    styles += 'tr.odd:hover td,' +
                                      'tr.even:hover td {background-color: #D8D8C4;}';
                                }
                                styles = '/* hupper user styles */@-moz-document ' +
                                'url-prefix(http://hup.lh),' +
                                'url-prefix(http://hup.hu) {' +
                                  styles + '}';
                                Components.utils.import('resource://huppermodules/log.jsm', scope);
                                scope.hupperLog('add styles: ', styles);
                                stylesToLoad.push(styles);
                            });
                        });
                    });
                });
            });
        });
    });
    indentStyle = 'chrome://hupper/skin/indentstyles.css';
    accesibilityStyle = 'chrome://hupper/skin/accesibilitystyles.css';
    widthStyle = function (width) {
        return '' +
          '/* hupper width */@-moz-document url-prefix(http://hup.lh),' +
          'url-prefix(http://hup.lh)' +
          'url-prefix(http://hup.hu) {' +
            '.sidebar {' +
              'width:' + width + 'px !important;' +
          '}' +
        '}';
    };
    minFontsizeStyle = function (fontsize) {
        return '' +
          '/* min font size */@-moz-document url-prefix(http://hup.lh),' +
          'url-prefix(http://www.hup.hu),' +
          'url-prefix(http://hup.hu) {' +
            'body,#all,#top-nav,#top-nav a,.sidebar .block .content,#footer,.node .links {' +
              'font-size:' + fontsize + 'px !important;' +
          '}' +
        '}';
    };

    prefs.get.styleIndent(function (response) {
        if (response.pref.value) {
            stylesToLoad.push(indentStyle);
        }
    });
    prefs.get.styleAccessibility(function (response) {
        if (response.pref.value) {
            stylesToLoad.push(accesibilityStyle);
        }
    });
    prefs.get.styleWiderSidebar(function (response) {
        var width = response.pref.value;
        if (width > 0) {
            stylesToLoad.push(widthStyle(width));
        }
    });
    prefs.get.styleMinFontsize(function (response) {
        var minFontsize = response.pref.value;
        if (minFontsize > 0) {
            stylesToLoad.push(minFontsizeStyle(minFontsize));
        }
    });
    stylesToLoad.push("chrome://hupper/skin/hupper.css");

    Components.utils.import('resource://huppermodules/styleLoader.jsm', scope);
    scope.styleLoader.unloadAll(function () {
        stylesToLoad.forEach(function (s) {
            scope.styleLoader.load(s);
        });
    }, stylesToLoad);
};

var EXPORTED_SYMBOLS = ['hupperStyleHandler'];
