/**
 * @constructor
 * @class HUPComment
 * @description class to parse a comment node
 * @param {Element} commentNode HTML Element
 * @param {Array} indentComments comments, which are indented
 * @param {Array} comments all comment of the page
 */
var HUPComment = function(commentNode, indentComments, comments) {
  this.comment = commentNode;
  this.id = this.comment.previousSibling.previousSibling.id;
  this.header = HUP.El.GetByClass(this.comment, 'submitted', 'div')[0];
  this.footer = HUP.El.GetByClass(this.comment, 'link', 'div')[0];
  this.cont = HUP.El.GetByClass(this.comment, 'content', 'div')[0];
  this.isDeletedUser();
  this.getDate();
  if(HUP.w.location.search.replace(/\?page=/, '') > 0) {
    this.todayComment();
  }
  this.newComment();
  this.footerLinks = HUP.El.GetFirstTag('ul', this.footer);
  this.getIndent(); // get indent state
  this.getChildComment(); // get child comments
  this.user = !this.deletedUser ? this.header.childNodes[1].innerHTML : this.header.textContent.replace(/[^\(]+\( ([^ ]+).*/, '$1');
  this.getParent(indentComments, comments);
};
HUPComment.prototype = {
  /**
   * @returns the childcomment container of a comment or -1
   * @type {Element,Number}
   */
  getChildComment: function() {
    var childs = this.comment.nextSibling.nextSibling;
    if(HUP.El.HasClass(childs, 'indented')) {
      this.childs = childs;
    } else {
      this.childs = -1;
    }
  },
  /**
   * Get the indent level of the element
   */
  getIndent: function() {
    var indent = 0, elem = this.comment;
    while(HUP.El.HasClass(elem.parentNode, 'indented')) {
      elem = elem.parentNode;
      indent++;
    }
    this.indent = indent;
  },
  /**
   * checks the comment, and if it has been posted "today", than adds the "új" text to it's header
   */
  todayComment: function() {
    var _comment = this;
    var today =  new Date();
    if(this.date.getFullYear() == today.getFullYear() && this.date.getMonth() == today.getMonth() && this.date.getDate() == today.getDate()) {
      var s = HUP.El.Span(), a = HUP.El.A();
      HUP.El.AddClass(s, 'new');
      HUP.El.Add(HUP.El.Txt('új'), s);
      HUP.El.Insert(s, _comment.comment.firstChild);
      a.setAttribute('id', 'new');
      HUP.El.Insert(a, _comment.comment.firstChild);
    }
  },
  newComment: function() {
    var newNodes = HUP.El.GetByClass(this.comment, 'new', 'span');
    this.newComm = newNodes.length ? newNodes[0] : false;
  },
  /**
   * Check, that the comment is an answer for another comment or not
   * If yes, it sets the this.parent to the index of the parent comment
   * @param {Array} indentedComments
   * @param {Array} all comments
   */
  getParent: function(indentComments, comments) {
    var parent = (this.indent > 0 && indentComments[(this.indent-1)]) ? indentComments[(this.indent - 1)][(indentComments[(this.indent - 1)].length - 1)] : false;
    this.parent = (typeof parent != 'undefined' && parent !== false) ? comments[parent] : -1;
  },
  /**
   * converts the post date of a comment to a javascript Date object
   * @returns the converted Date object
   * @type Date
   */
  getDate: function() {
    var a = this.deletedUser ? this.header.textContent : this.header.childNodes[2].textContent;
    var outObj = {};
    var dayNames = {'hétfő': 1, 'kedd': 2, 'szerda': 3, 'csütörtök': 4, 'péntek': 5, 'szombat': 6, 'vasárnap': 7};
    var monthNames = {'január': 0, 'február': 1, 'március': 2, 'április': 3, 'május': 4, 'június': 5, 'július': 6, 'augusztus': 7, 'szeptember': 8, 'október': 9, 'november': 10, 'december': 11};
    var dateRex = new RegExp(/[\s\|]+([0-9]+)\.\s([a-zúőűáéóüöí]+)\s+([0-9]+)\.,\s+([a-zűáéúőóüöí]+)\s+-\s+(\d+):(\d+).*/);
    a.replace(dateRex, function(all, year, month, day, dayname, hour, min) {
      var date = new Date();
      date.setYear(year);
      date.setMonth(monthNames[month]);
      date.setDate(day);
      date.setHours(hour);
      date.setMinutes(min);
      outObj = date;
    });
    this.date = outObj;
  },
  /**
   * @returns check that the user is still a member of the site or not
   * @type {Boolean}
   */
  isDeletedUser: function() {
    this.deletedUser = this.header.getElementsByTagName('a').length == 0;
  },
  /**
   * adds the defined color to the comments header
   * @param {String} color
   */
  highLightComment: function(color) {
    if(/[0-9a-f#]+/i.test(color)) { // hexa
      if(!/^#/.test(color)) {
        color = '#' + color;
      }
    }
    this.header.style.backgroundColor = color;
  },
  /**
   * highligts the header of the node if the user is a troll
   */
  highlightTroll: function()  {
    HUP.El.AddClass(this.comment, HupperVars.trollCommentClass);
    HUP.El.AddClass(this.header, HupperVars.trollCommentHeaderClass);
    if(this.childs != -1) {
      HUP.El.AddClass(this.childs, HupperVars.trollCommentAnswersClass);
    }
  },
  /**
   * @param {NodeHeaderBuilder} builder
   */
  addExtraLinks: function(builder) {
    HUP.El.Add(builder.buildComExtraTop(), this.footerLinks);
    HUP.El.Add(builder.buildComExtraBack(), this.footerLinks);
  },
  /**
  * replace the 'uj' text in the header of newly posted comments
   * @param {NodeHeaderBuilder} builder
   * @param {Element} tmpSpan1
  */
  replaceNewCommentText: function(builder, tmpSpan1) {
    HUP.El.Remove(this.newComm, this.comment);
    HUP.El.Add(builder.buildNewText(), tmpSpan1);
  },
  /**
   * @param {NodeHeaderBuilder} builder
   */
  addComExtraParent: function(builder) {
    HUP.El.Add(builder.buildComExtraParent(this.parent), this.footerLinks);
  },
  /**
   * @param {Object} users
   */
  highlightComment: function(users) {
    if(users[this.user]) {
      this.highLightComment(users[this.user]);
    }
  }
};
