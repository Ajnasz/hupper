/**
 * @constructor
 * @class HUPComment
 * @param {Element} a comment node
 */
var HUPComment = function(commentNode, indentComments, comments) {
  this.comment = commentNode;
  this.header = HUP.El.GetByClass(this.comment, 'submitted', 'div')[0];
  this.footer = HUP.El.GetByClass(this.comment, 'link', 'div')[0];
  this.cont = HUP.El.GetByClass(this.comment, 'content', 'div')[0];
  this.newComment();
  this.footerLinks = HUP.El.GetFirstTag('ul', this.footer);
  this.id = this.comment.previousSibling.previousSibling.id;
  this.getIndent(); // get indent state
  this.getChildComment(); // get child comments
  this.user = (typeof this.header.childNodes[1] != 'undefined') ? this.header.childNodes[1].innerHTML : this.header.innerHTML.replace(/[^\(]+\( ([^ ]+).*/, '$1');
  this.getParent(indentComments, comments);
};
HUPComment.prototype = {
  getChildComment: function() {
    var childs = this.comment.nextSibling.nextSibling;
    if(HUP.El.HasClass(this.childs, 'indented')) {
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
    var parent = (this.indent > 0) ? indentComments[(this.indent - 1)][(indentComments[(this.indent - 1)].length - 1)] : false;
    this.parent = (typeof parent != 'undefined' && parent !== false) ? comments[parent] : -1;
  },
  highLightComment: function(color) {
    if(/[0-9a-f#]+/i.test(color)) { // hexa
      if(!/^#/.test(color)) {
        color = '#' + color;
      }
    }
    this.header.style.backgroundColor = color;
  },
  highlightTroll: function()  {
    HUP.El.AddClass(this.comment, HupperVars.trollCommentClass);
    HUP.El.AddClass(this.header, HupperVars.trollCommentHeaderClass);
    if(this.childs != -1) {
      HUP.El.AddClass(this.childs, HupperVars.trollCommentAnswersClass);
    }
  },
  highlightHupper: function() {
    HUP.El.AddClass(this.comment, HupperVars.hupperCommentClass);
    HUP.El.AddClass(this.header, HupperVars.hupperCommentHeaderClass);
  },
  addExtraLinks: function(builder) {
    HUP.El.Add(builder.buildComExtraTop(), this.footerLinks);
    HUP.El.Add(builder.buildComExtraBack(), this.footerLinks);
  },
  replaceNewCommentText: function(builder, tmpSpan1) {
    HUP.El.Remove(this.newComm, this.comment);
    HUP.El.Add(builder.buildNewText(), tmpSpan1);
  },
  addComExtraParent: function(builder) {
    HUP.El.Add(builder.buildComExtraParent(this.parent), this.footerLinks);
  },
  highlightComment: function(users) {
    if(users[this.user]) {
      this.highLightComment(users[this.user]);
    }
  }
};
