/*global Hupper: true, HUP: true, StyleLoader: true*/
Hupper.styles = function () {
    var stylesToLoad = [],
    addStyle, indentStyle,
    accesibilityStyle, widthStyle, minFontsizeStyle,
    styleLoader;
    addStyle = function (s) {
        stylesToLoad.push(s);
    };
    Hupper.HUP.hp.get.trollfiltermethod(function (response) {
        var styles = '',
            trollfiltermethod = response.pref.value;

        Hupper.HUP.hp.get.trollCommentClass(function (response) {
            var trollCommentClass = response.pref.value;
            Hupper.HUP.hp.get.hidetrollanswers(function (response) {
                var hidetrollanswers = response.pref.value;

                Hupper.HUP.hp.get.trollCommentAnswersClass(function (response) {
                    var trollCommentAnswersClass = response.pref.value;

                    Hupper.HUP.hp.get.trollCommentHeaderClass(function (response) {
                        var trollCommentHeaderClass = response.pref.value;

                        Hupper.HUP.hp.get.trollcolor(function (response) {
                            var trollcolor = response.pref.value;

                            Hupper.HUP.hp.get.hilightforumlinesonhover(function (response) {
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
                                styles = '/* hupper user styles */@-moz-document' +
                                ' url-prefix(http://hupperl),url-prefix(http://hup.hu) {' +
                                  styles + '}';
                                Hupper.HUP.L.log('add styles: ', styles);
                                addStyle(styles);
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
          '/* hupper width */@-moz-document url-prefix(http://hupperl),' +
          'url-prefix(http://hup.hu) {' +
            '.sidebar {' +
              'width:' + width + 'px !important;' +
          '}' +
        '}';
    };
    minFontsizeStyle = function (fontsize) {
        return '' +
          '/* min font size */@-moz-document url-prefix(http://hupperl),' +
          'url-prefix(http://hup.hu) {' +
            'body,#all,#top-nav,#top-nav a,.sidebar .block .content,#footer,.node .links {' +
              'font-size:' + fontsize + 'px !important;' +
          '}' +
        '}';
    };

    Hupper.HUP.hp.get.styleIndent(function (response) {
        if (response.pref.value) {
            addStyle(indentStyle);
        }
    });
    Hupper.HUP.hp.get.styleAccessibility(function (response) {
        if (response.pref.value) {
            addStyle(accesibilityStyle);
        }
    });
    Hupper.HUP.hp.get.styleWiderSidebar(function (response) {
        var width = response.pref.value;
        if (width > 0) {
            addStyle(widthStyle(width));
        }
    });
    Hupper.HUP.hp.get.styleMinFontsize(function (response) {
        var minFontsize = response.pref.value;
        if (minFontsize > 0) {
            addStyle(minFontsizeStyle(minFontsize));
        }
    });
    addStyle("chrome://hupper/skin/hupper.css");

    Components.utils.import('resource://huppermodules/styleLoader.jsm');
    if (!(Hupper.styleLoader instanceof StyleLoader)) {
        styleLoader = new StyleLoader();
        Hupper.styleLoader = styleLoader;
    }
    styleLoader = Hupper.styleLoader;
    styleLoader.unloadAll(function () {
        stylesToLoad.forEach(function (s) {
            styleLoader.load(s);
        });
    }, stylesToLoad);
};
