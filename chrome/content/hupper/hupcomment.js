/**
 * @constructor
 * @class HUPComment
 * @description class to parse a comment node
 * @param {Element} commentNode HTML Element
 * @param {Array} indentComments comments, which are indented
 * @param {Array} comments all comment of the page
 * @param {GetHupComments} hupComments the general GetHupComments instance
 */
var HUPComment = function(commentNode, indentComments, comments, hupComments) {
  this.comment = commentNode;
  this.hupComments = hupComments;
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
  HUP.L.log('parent:', this.parent, this.parent.id);
  if(this.parent != -1) {
    this.getPlusOrMinus();
    if(this.plusOne || this.minusOne) {
      if(this.plusOne) {
        this.parent.updatePoints(1)
      } else {
        this.parent.updatePoints(-1);
      }
    }
  }
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
  },
  plusOne: false,
  minusOne: false,
  plusPoints: 0,
  minusPoints: 0,
  getPlusOrMinus: function() {
    if(this.isPlusOne()) {
      this.plusOne = true;
    } else if(this.isMinusOne()) {
      this.minusOne = true;
    }
  },
  isPlusOne: function() {
    var firstParagraph = HUP.El.GetFirstTag('p', this.cont);
    var rex = new RegExp('\\+1\\b');
    return rex.test(firstParagraph.innerHTML);
  },
  isMinusOne: function() {
    var firstParagraph = HUP.El.GetFirstTag('p', this.cont);
    var rex = new RegExp('-1\\b');
    return rex.test(firstParagraph.innerHTML);
  },
  updatePoints: function(direction) {
    HUP.L.log('updatepoints', this.id, direction);
    if(direction > 0) {
      this.plusPoints++;
    } else if(direction < 0) {
      this.minusPoints--;
    }
    var _this = this;
    var createPoints = function() {
      if(!_this.pointContainer) {
        _this.pointContainer = HUP.El.Div();
        _this.plusContainer = HUP.El.Span();
        _this.minusContainer = HUP.El.Span();
        _this.sumContainer = HUP.El.Span();
        HUP.El.AddClass(_this.pointContainer, 'points');
        HUP.El.AddClass(_this.plusContainer, 'point plus-points');
        HUP.El.AddClass(_this.minusContainer, 'point minus-points');
        HUP.El.AddClass(_this.sumContainer, 'point sum-points');
        HUP.El.Add(_this.plusContainer, _this.pointContainer);
        HUP.El.Add(_this.minusContainer, _this.pointContainer);
        HUP.El.Add(_this.sumContainer, _this.pointContainer);
        _this.minusContainer.setAttribute('title','minus');
        _this.plusContainer.setAttribute('title','plus');
        _this.sumContainer.setAttribute('title','osszesen');
        HUP.El.Insert(_this.pointContainer, _this.cont);
      }
      _this.plusContainer.innerHTML = _this.plusPoints;
      _this.minusContainer.innerHTML = _this.minusPoints;
      _this.sumContainer.innerHTML = _this.plusPoints - _this.minusPoints;
    }
    HUP.L.log('minus: ', this.minusPoints, 'plus', this.plusPoints);
    createPoints();
  }
};

/**
 * @constructor
 * @class GetHupComments
 * @description A class to handle all of the comments on the page
 */
var GetHupComments = function() {
  var _this = this;
  var getComments = function() {
    var coms = HUP.El.GetId('comments');
    if(!coms) {
      return false;
    }
    var ds = HUP.El.GetTag('div', coms);
    _this.comments = new Array();
    _this.indentComments = new Array();
    _this.newComments = new Array();
    for(var i = 0, dsl = ds.length, comment; i < dsl; i++) {
      if(HUP.El.HasClass(ds[i], 'comment')) {
        comment = new HUPComment(ds[i], _this.indentComments, _this.comments, _this);
        if(typeof _this.indentComments[comment.indent] == 'undefined') {
          _this.indentComments[comment.indent] = new Array();
        }
        _this.indentComments[comment.indent].push(_this.comments.length);
        _this.comments.push(comment);
        if(comment.newComm) {
          _this.newComments.push(comment);
        }
      }
    }
  };
  var parseComments = function() {
    var replacenewcommenttext = HupperPrefs.replacenewcommenttext();
    var prevnextlinks = HupperPrefs.prevnextlinks();
    var trolls = HupperPrefs.trolls();
    var filtertrolls = HupperPrefs.filtertrolls();
    var huppers = HupperPrefs.huppers();
    var filterhuppers = HupperPrefs.filterhuppers();
    var extraCommentLinks = HupperPrefs.extraCommentLinks();
    var insertPermalink = HupperPrefs.insertPermalink();
    var highlightUsers = HupperPrefs.highlightusers().split(',');
    var hh = {}, bh;
    highlightUsers.forEach(function(hluser){
      bh = hluser.split(':');
      hh[bh[0]] = bh[1];
    });
    var builder = new NodeHeaderBuilder(), ps;
    try {
      _this.comments.forEach(function(C) {
        if(filtertrolls && inArray(C.user, trolls)) {
          C.highlightTroll();
        }
        if(filterhuppers && inArray(C.user, huppers)) {
          C.highlightHupper();
        }
        if(extraCommentLinks) {
          C.addExtraLinks(builder);
        }
        if(C.parent != -1) {
          C.addComExtraParent(builder);
        }
        if(insertPermalink) {
          HUP.El.Add(builder.buildComExtraPerma(C.id), C.footerLinks);
        }
        C.highlightComment(hh);
      });
    } catch(e) {HUP.L.log(e.message, e.lineNumber, e.fileName)}
    if(replacenewcommenttext || prevnextlinks) {
      var spanNode = HUP.El.Span(), tmpSpan1;
      for(var i = 0, ncl = _this.newComments.length; i < ncl; i++) {
        tmpSpan1 = spanNode.cloneNode(true);
        HUP.El.AddClass(tmpSpan1, 'hnav');
        if(prevnextlinks) {
          (i > 0) ? HUP.El.Add(builder.buildPrevLink(_this.newComments[i - 1].id), tmpSpan1) : HUP.El.Add(builder.buildFirstLink(), tmpSpan1);
          (i < ncl - 1) ? HUP.El.Add(builder.buildNextLink(_this.newComments[i + 1].id), tmpSpan1) : HUP.El.Add(builder.buildLastLink(), tmpSpan1);
          HUP.w.nextLinks.push(_this.newComments[i].id);
        }
        if(replacenewcommenttext) {
          _this.newComments[i].replaceNewCommentText(builder, tmpSpan1)
        }
        HUP.El.Insert(tmpSpan1, _this.newComments[i].header.firstChild);
      }
    }
  };
  getComments();
  parseComments();
};
GetHupComments.prototype = {
  /**
   * @param {Element} element A comment div
   * @returns a HupComment object or null
   * @type {HUPComment,NULL}
   */
  get: function(element) {
    var comments = this.comments.filter(function(c){HUP.L.log(c.comment, element);return c.comment == element});
    return (comments.length) ? comments[0] : null;
  }
};
