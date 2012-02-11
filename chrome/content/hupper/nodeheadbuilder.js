/*global Hupper:true, Components: true */
/**
 * Namespace to build links, lists etc.
 * @class NodeHeaderBuilder
 * @namespace Hupper
 * @description Namespace to build links, lists etc.
 * @constructor
 */
Hupper.NodeHeaderBuilder = function (doc) {
    var scope = {},
        bundles;
    this.doc = doc;
    Components.utils.import('resource://huppermodules/prefs.jsm', scope);
    this.prefs = new scope.HP();
    Components.utils.import('resource://huppermodules/Elementer.jsm', scope);
    this.elementer = new scope.Elementer(doc);
    Components.utils.import('resource://huppermodules/bundles.jsm', scope);
    bundles = scope.hupperBundles;
    /**
    * @final
    */
    this.firstLinkText = bundles.getString('FirstLinkText');
    /**
    * @final
    */
    this.lastLinkText = bundles.getString('LastLinkText');
    /**
    * @final
    */
    this.prevLinkText = bundles.getString('PrevLinkText');
    /**
    * @final
    */
    this.nextLinkText = bundles.getString('NextLinkText');
    /**
    * @final
    */
    this.topLinkText = bundles.getString('TopLinkText');
    /**
    * @final
    */
    this.backLinkText = bundles.getString('BackLinkText');
    /**
    * @final
    */
    this.parentLinkText = bundles.getString('ParentLinkText');

    // Title text nodes
    this.fit = this.elementer.Txt(this.firstLinkText);
    this.lat = this.elementer.Txt(this.lastLinkText);

    // Mark as read node
    this.markR = this.elementer.CreateLink(bundles.getString('markingText'));
    this.elementer.AddClass(this.markR, 'mark');
};
Hupper.NodeHeaderBuilder.prototype = {
    /**
      * Builds a link which points to the specified path with the next link str
      * @param {String} path Path for the next node
      * @return A DOM link (a) object within the ~Next~ text
      * @type Element
      */
    buildNextLink: function (path) {
        return this.elementer.CreateLink(this.nextLinkText, '#' + path);
    },
    /**
      * Builds a link which points to the specified path with the prev link text
      * @param {String} path Path for the next node
      * @return A DOM link (a) object within the ~Prev~ text
      * @type Element
      */
    buildPrevLink: function (path) {
        return this.elementer.CreateLink(this.prevLinkText, '#' + path);
    },
    /**
      * Builds a text node with the first text
      * @return Span element within first link text
      * @type Element
      */
    buildFirstLink: function () {
        var nsp = this.elementer.Span();
        this.elementer.Add(this.fit, nsp);
        return nsp;
    },
    /**
      * Builds a text node with the last text
      * @return Span element with within last link text
      * @type Element
      */
    buildLastLink: function () {
        var nsp = this.elementer.Span();
        this.elementer.Add(this.lat, nsp);
        return nsp;
    },
    /**
      * Builds a mark as read linknode
      * @return Link (a) element
      * @param {String} path the path to the node
      * @param {Int} i marker id
      * @type Element
      */
    buildMarker: function (path, i) {
        var mr = this.markR.cloneNode(true);
        mr.setAttribute('path', path);
        mr.setAttribute('id', 'marker-' + i);
        // mr.addEventListener('click', Hupper.markNodeAsRead, true);
        return mr;
    },
    /**
      * Builds a text node with [new] text
      * @return Span element, within a next link
      * @type Element
      */
    buildNewText: function () {
        var nsp = this.elementer.Span(),
            _this = this;
        this.elementer.AddClass(nsp, 'hnew');
        this.prefs.get.newcommenttext(function (response) {
            _this.elementer.Add(_this.elementer.Txt(response.pref.value), nsp);
        });
        return nsp;
    },
    /**
      * Builds an invisible link with a name attribute
      * @param {Int} i id of the node
      * @return Link (a) element only with name attribute
      * @type Element
      */
    buildNameLink: function (i, type) {
        var liaC = this.elementer.A();
        if (!type) {
            type = 'n';
        }
        liaC.setAttribute('name', type + '-' + i);
        return liaC;
    },
    /**
      * Builds a link node which points to the top of the page
      * @return Li element, within a link which points to the top of the page
      * @type Element
      */
    buildComExtraTop: function () {
        var tmpList = this.elementer.Li();
        this.elementer.Add(this.elementer.CreateLink(this.topLinkText, '#'), tmpList);
        return tmpList;
    },
    /**
      * Builds a link node which points to the previous page
      * @return Li element with a link, which point to the previous history page
      * @type Element
      */
    buildComExtraBack: function () {
        var tmpList = this.elementer.Li();
        this.elementer.Add(this.elementer.CreateLink(this.backLinkText, 'javascript:history.back();'), tmpList);
        return tmpList;
    },
    /**
      * Builds a link node which points to the comment's parent comment
      * @param {String} parent The parent comment id
      * @return Li element with a link, which points to the parent comment
      * @type Element
      */
    buildComExtraParent: function (parent) {
        var tmpList = this.elementer.Li(),
        link = this.elementer.CreateLink(this.parentLinkText, '#' + parent.id);
        // if fading enabled, add an event listener, which will fades the parent node
        this.prefs.get.fadeparentcomment(function (response) {
            if (response.pref.value) {
                link.addEventListener('click', function (e) {
                    var scope = {}, transform;
                    Components.utils.import('resource://huppermodules/transform.jsm', scope);
                    transform = new scope.Transform(e.target.n.comment, 'FadeIn');
                }, false);
                link.n = parent;
            }
        });
        this.elementer.Add(link, tmpList);
        return tmpList;
    },
    /**
      * Builds a link with a permalink text
      * @param {String} cid
      * @return Li element, with a link, which points to exactly to the comment
      * @type Element
      */
    buildComExtraPerma: function (cid) {
        var tmpList = this.elementer.Li();
        this.elementer.Add(this.elementer.CreateLink('permalink', '#' + cid), tmpList);
        return tmpList;
    }
};
