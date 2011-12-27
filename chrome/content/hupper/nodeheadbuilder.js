/**
 * Namespace to build links, lists etc.
 * @class NodeHeaderBuilder
 * @namespace Hupper
 * @description Namespace to build links, lists etc.
 * @constructor
 */
Hupper.NodeHeaderBuilder = function() {
  /**
   * @final
   */
  this.firstLinkText = Hupper.HUP.Bundles.getString('FirstLinkText');
  /**
   * @final
   */
  this.lastLinkText = Hupper.HUP.Bundles.getString('LastLinkText');
  /**
   * @final
   */
  this.prevLinkText = Hupper.HUP.Bundles.getString('PrevLinkText');
  /**
   * @final
   */
  this.nextLinkText = Hupper.HUP.Bundles.getString('NextLinkText');
  /**
   * @final
   */
  this.topLinkText = Hupper.HUP.Bundles.getString('TopLinkText');
  /**
   * @final
   */
  this.backLinkText = Hupper.HUP.Bundles.getString('BackLinkText');
  /**
   * @final
   */
  this.parentLinkText = Hupper.HUP.Bundles.getString('ParentLinkText');

  // Title text nodes
  this.fit = Hupper.HUP.El.Txt(this.firstLinkText);
  this.lat = Hupper.HUP.El.Txt(this.lastLinkText);
  // this.newCt = Hupper.HUP.El.Txt(Hupper.HUP.hp.get.newcommenttext());

  // Mark as read node
  this.markR = Hupper.HUP.El.CreateLink(Hupper.HUP.Bundles.getString('markingText'));
  Hupper.HUP.El.AddClass(this.markR, 'mark');
};
Hupper.NodeHeaderBuilder.prototype = {
  /**
    * Builds a link which points to the specified path with the next link str
    * @param {String} path Path for the next node
    * @return A DOM link (a) object within the ~Next~ text
    * @type Element
    */
  buildNextLink: function(path) {
    return Hupper.HUP.El.CreateLink(this.nextLinkText, '#' + path);
  },
  /**
    * Builds a link which points to the specified path with the prev link text
    * @param {String} path Path for the next node
    * @return A DOM link (a) object within the ~Prev~ text
    * @type Element
    */
  buildPrevLink: function(path) {
    return Hupper.HUP.El.CreateLink(this.prevLinkText, '#' + path);
  },
  /**
    * Builds a text node with the first text
    * @return Span element within first link text
    * @type Element
    */
  buildFirstLink: function() {
    var nsp = Hupper.HUP.El.Span();
    Hupper.HUP.El.Add(this.fit, nsp);
    return nsp;
  },
  /**
    * Builds a text node with the last text
    * @return Span element with within last link text
    * @type Element
    */
  buildLastLink: function() {
    var nsp = Hupper.HUP.El.Span();
    Hupper.HUP.El.Add(this.lat, nsp);
    return nsp;
  },
  /**
    * Builds a mark as read linknode
    * @return Link (a) element
    * @param {String} path the path to the node
    * @param {Int} i marker id
    * @type Element
    */
  buildMarker: function(path, i) {
    var mr = this.markR.cloneNode(true);
    mr.setAttribute('path', path);
    mr.setAttribute('id', 'marker-' + i);
    mr.addEventListener('click', Hupper.markNodeAsRead, true);
    return mr;
  },
  /**
    * Builds a text node with [new] text
    * @return Span element, within a next link
    * @type Element
    */
  buildNewText: function() {
    var nsp = Hupper.HUP.El.Span();
    Hupper.HUP.El.AddClass(nsp, 'hnew');
    var _this = this;
    Hupper.HUP.hp.get.newcommenttext(function(response) {
      Hupper.HUP.El.Add(Hupper.HUP.El.Txt(response.pref.value), nsp);
    })
    return nsp;
  },
  /**
    * Builds an invisible link with a name attribute
    * @param {Int} i id of the node
    * @return Link (a) element only with name attribute
    * @type Element
    */
  buildNameLink: function(i, type) {
    var liaC = Hupper.HUP.El.A();
    if(!type) type = 'n';
    liaC.setAttribute('name', type + '-' + i);
    return liaC;
  },
  /**
    * Builds a link node which points to the top of the page
    * @return Li element, within a link which points to the top of the page
    * @type Element
    */
  buildComExtraTop: function() {
    var tmpList = Hupper.HUP.El.Li();
    Hupper.HUP.El.Add(Hupper.HUP.El.CreateLink(this.topLinkText, '#'), tmpList);
    return tmpList;
  },
  /**
    * Builds a link node which points to the previous page
    * @return Li element with a link, which point to the previous history page
    * @type Element
    */
  buildComExtraBack: function() {
    var tmpList = Hupper.HUP.El.Li();
    Hupper.HUP.El.Add(Hupper.HUP.El.CreateLink(this.backLinkText, 'javascript:history.back();'), tmpList);
    return tmpList;
  },
  /**
    * Builds a link node which points to the comment's parent comment
    * @param {String} parent The parent comment id
    * @return Li element with a link, which points to the parent comment
    * @type Element
    */
  buildComExtraParent: function(parent) {
    var tmpList = Hupper.HUP.El.Li(),
    link = Hupper.HUP.El.CreateLink(this.parentLinkText, '#' + parent.id);
    // if fading enabled, add an event listener, which will fades the parent node
    Hupper.HUP.hp.get.fadeparentcomment(function(response) {
      if(response.pref.value) {
        link.addEventListener('click', function(e) {
          new Hupper.Transform(e.target.n.comment, 'FadeIn');
        }, false);
        link.n = parent;
      }
    });
    Hupper.HUP.El.Add(link, tmpList);
    return tmpList;
  },
  /**
    * Builds a link with a permalink text
    * @param {String} cid
    * @return Li element, with a link, which points to exactly to the comment
    * @type Element
    */
  buildComExtraPerma: function(cid) {
    var tmpList = Hupper.HUP.El.Li();
    Hupper.HUP.El.Add(Hupper.HUP.El.CreateLink('permalink', '#' + cid), tmpList);
    return tmpList;
  }
};
