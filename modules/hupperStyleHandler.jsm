/*global Hupper: true, StyleLoader: true*/
var scope = {};
function multiPrefGetter(handlers, onFinish) {
    Components.utils.import('resource://huppermodules/prefs.jsm', scope);
    var answers = {},
        len = 0,
        prefs = new scope.HP();
    handlers.forEach(function (handler) {
        prefs.get[handler](function (response) {
            answers[handler] = response.pref.value;
            len += 1;
            if (len === handlers.length) {
                onFinish(answers);
            }
        });
    });
}
var hupperStyleHandler = function () {
    var handlers;
    Components.utils.import('resource://huppermodules/log.jsm', scope);
    handlers = [
        'trollfiltermethod',
        'trollCommentClass',
        'hidetrollanswers',
        'trollCommentAnswersClass',
        'trollCommentHeaderClass',
        'trollcolor',
        'hilightforumlinesonhover',
        'styleIndent',
        'styleAccessibility',
        'styleWiderSidebar',
        'styleMinFontsize',
        'styleHideLeftSidebar',
        'styleHideRightSidebar'
    ];
    function widthStyle(width) {
        scope.hupperLog('call width style: ', width);
        return '' +
            '/* hupper width */@-moz-document url-prefix(http://hup.lh),' +
            'url-prefix(http://www.hup.hu),' +
            'url-prefix(http://hup.hu) {' +
                '.sidebar {' +
                'width:' + width + 'px !important;' +
            '}' +
            '}';
    }
    function minFontsizeStyle(fontsize) {
        return '' +
            '/* min font size */@-moz-document url-prefix(http://hup.lh),' +
            'url-prefix(http://www.hup.hu),' +
            'url-prefix(http://hup.hu) {' +
                'body,#all,#top-nav,#top-nav a,.sidebar .block .content,#footer,.node .links {' +
                'font-size:' + fontsize + 'px !important;' +
            '}' +
            '}';
    }
    function hideLeftSidebar() {
        return '' +
            '/* hide left sidebar */@-moz-document url-prefix(http://hup.lh),' +
            'url-prefix(http://www.hup.hu),' +
            'url-prefix(http://hup.hu) {' +
                '#sidebar-left {' +
                    'display: none !important;' +
                '}' +
            '}';
    }
    function hideRightSidebar() {
        return '' +
            '/* hide right sidebar */@-moz-document url-prefix(http://hup.lh),' +
            'url-prefix(http://www.hup.hu),' +
            'url-prefix(http://hup.hu) {' +
                '#sidebar-right {' +
                    'display: none !important;' +
                '}' +
            '}';
    }
    multiPrefGetter(handlers, function (answers) {
        var rules = [],
            stylesToLoad = [],
            styles;

        if (answers.trollfiltermethod === 'hide') {
            rules.push('.' + answers.trollCommentClass + ' {display:none !important;}');

            if (answers.hidetrollanswers) {
                rules.push('.' + answers.trollCommentAnswersClass + ' {display:none !important;}');
            }
        } else {
            rules.push('.' + answers.trollCommentClass + ' .submitted {' +
                'background-color:' + answers.trollcolor + ' !important;' +
            '}');
        }

        if (answers.hilightforumlinesonhover) {
            rules.push('tr.odd:hover td, tr.even:hover td {background-color: #D8D8C4;}');
        }

        styles = '/* hupper user styles */@-moz-document' +
          ' url-prefix(http://hup.lh),' +
          ' url-prefix(http://hup.hu) {' + rules.join('') + '}';

        scope.hupperLog('add styles: ', styles);

        stylesToLoad.push(styles);

        if (answers.styleIndent) {
            stylesToLoad.push('chrome://hupper/skin/indentstyles.css');
        }

        if (answers.styleAccessibility) {
            stylesToLoad.push('chrome://hupper/skin/accesibilitystyles.css');
        }

        if (answers.styleWiderSidebar > 0) {
            stylesToLoad.push(widthStyle(answers.styleWiderSidebar));
        }

        if (answers.styleMinFontsize > 0) {
            stylesToLoad.push(minFontsizeStyle(answers.styleMinFontsize));
        }

        if (answers.styleHideLeftSidebar) {
            stylesToLoad.push(hideLeftSidebar());
        }

        if (answers.styleHideRightSidebar) {
            stylesToLoad.push(hideRightSidebar());
        }
        stylesToLoad.push("chrome://hupper/skin/hupper.css");
        Components.utils.import('resource://huppermodules/styleLoader.jsm', scope);

        scope.styleLoader.unloadAll(function () {
            stylesToLoad.forEach(function (s) {
                scope.styleLoader.load(s);
            });
        }, stylesToLoad);
    });

};

var EXPORTED_SYMBOLS = ['hupperStyleHandler'];
