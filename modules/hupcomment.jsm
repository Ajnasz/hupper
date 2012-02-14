var plusOneRex = new RegExp('(?:^|\\s)\\+1(?:$|\\s|\\.|,)'),
    minusOneRex = new RegExp('(?:^|\\s)-1(?:$|\\s|\\.|,)');
/**
* @constructor
* @class Comment
* @description class to parse a comment node
* @param {Element} commentNode HTML Element
* @param {Array} indentComments comments, which are indented
* @param {Array} comments all comment of the page
* @param {GetComments} hupComments the general GetHupComments instance
*/
var Comment = function (doc, commentNode, indentComments, comments, hupComments) {
    var me = this, scope = {};
    this.doc = doc;
    Components.utils.import('resource://huppermodules/Elementer.jsm', scope);
    this.elementer = new scope.Elementer(doc);
    Components.utils.import('resource://huppermodules/prefs.jsm', scope);
    this.prefs = new scope.HP();
    this.comment = commentNode;
    this.hupComments = hupComments;
    this.id = this.comment.previousSibling.previousSibling.id;
    this.header = me.elementer.GetByClass(this.comment, 'submitted', 'div')[0];
    this.footer = me.elementer.GetByClass(this.comment, 'link', 'div')[0];
    this.cont = me.elementer.GetByClass(this.comment, 'content', 'div')[0];
    this.isDeletedUser();
    this.getDate();
    if (this.doc.location.search.replace(/\?page=/, '') > 0) {
        this.todayComment();
    }
    this.replies = [];
    this.newComment();
    this.footerLinks = me.elementer.GetFirstTag('ul', this.footer);
    this.getIndent(); // get indent state
    this.getChildComment(); // get child comments
    this.userElement = this.header.childNodes[1];
    this.user = !this.deletedUser ?
        this.userElement.innerHTML :
        this.header.textContent.replace(/[^\(]+\( ([^ ]+).*/, '$1');
    this.getParent(indentComments, comments);
    this.plusPoints = [];
    this.minusPoints = [];
    if (this.parent !== -1) {
        this.getPlusOrMinus();
        this.parent.addReply(this);
        // this.parent.cont.innerHTML += '<a href="#'+this.id+'">' + this.user + '</a>, ';
        if (this.plusOne) {
            this.parent.addPoint(1, this);
        } else if (this.minusOne) {
            this.parent.addPoint(-1, this);
        }
    }
    this.isBoringComment(function (isBoring) {
        if (isBoring) {
            me.elementer.AddClass(me.comment, 'hup-boring');
        }
    });
    if (this.children !== -1) {
        me.elementer.AddClass(this.comment, 'has-children');
    }
    Components.utils.import('resource://huppermodules/bundles.jsm', scope);
    this.bundles = scope.hupperBundles;
};
Comment.prototype = {
    /**
    * @returns the childcomment container of a comment or -1
    * @type {Element,Number}
    */
    getChildComment: function () {
        var children = this.comment.nextSibling.nextSibling;
        if (this.elementer.HasClass(children, 'indented')) {
            this.children = children;
        } else {
            this.children = -1;
        }
    },
    /**
    * Get the indent level of the element
    */
    getIndent: function () {
        var indent = 0, elem = this.comment;
        while (this.elementer.HasClass(elem.parentNode, 'indented')) {
            elem = elem.parentNode;
            indent += 1;
        }
        this.indent = indent;
    },
    /**
    * checks the comment, and if it has been posted "today", than adds the
    * "új" text to it's header
    */
    todayComment: function () {
        var _comment = this,
            today = new Date(),
            s, a;
        if (this.date.getFullYear() === today.getFullYear() &&
            this.date.getMonth() === today.getMonth() &&
            this.date.getDate() === today.getDate()) {
            s = this.elementer.Span();
            a = this.elementer.A();
            this.elementer.Add(this.elementer.Txt('új'), s);
            this.elementer.Insert(s, _comment.comment.firstChild);
            a.setAttribute('id', 'new');
            this.elementer.Insert(a, _comment.comment.firstChild);
        }
    },
    newComment: function () {
        var newNodes = this.elementer.GetByClass(this.comment, 'new', 'span');
        this.newComm = newNodes.length ? newNodes[0] : false;
    },
    /**
    * Check, that the comment is an answer for another comment or not
    * If yes, it sets the this.parent to the index of the parent comment
    * @param {Array} indentedComments
    * @param {Array} all comments
    */
    getParent: function (indentComments, comments) {
        var parent = (this.indent > 0 && indentComments[(this.indent - 1)]) ?
            indentComments[(this.indent - 1)][(indentComments[(this.indent - 1)].length - 1)] :
            false;
        this.parent = (typeof parent !== 'undefined' && parent !== false) ?
            comments[parent] : -1;
    },
    /**
    * converts the post date of a comment to a javascript Date object
    * @returns the converted Date object
    * @type Date
    */
    getDate: function () {
        var a = this.deletedUser ?
            this.header.textContent : this.header.childNodes[2].textContent,
            outObj = {},
            dayNames = {
                'hétfő': 1,
                'kedd': 2,
                'szerda': 3,
                'csütörtök': 4,
                'péntek': 5,
                'szombat': 6,
                'vasárnap': 7
            },
            monthNames = {
                'január': 0,
                'február': 1,
                'március': 2,
                'április': 3,
                'május': 4,
                'június': 5,
                'július': 6,
                'augusztus': 7,
                'szeptember': 8,
                'október': 9,
                'november': 10,
                'december': 11
            },
            dateRex = new RegExp(/[\s\|]+([0-9]+)\.\s([a-zúőűáéóüöí]+)\s+([0-9]+)\.,\s+([a-zűáéúőóüöí]+)\s+-\s+(\d+):(\d+).*/);
        a.replace(dateRex, function (all, year, month, day, dayname, hour, min) {
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
    isDeletedUser: function () {
        this.deletedUser = this.header.getElementsByTagName('a').length === 0;
    },
    /**
    * adds the defined color to the comments header
    * @param {String} color
    */
    highLightComment: function (color) {
        if (/[0-9a-f#]+/i.test(color)) { // hexa
            if (!/^#/.test(color)) {
                color = '#' + color;
            }
        }
        this.header.style.backgroundColor = color;
    },
    unhighLightComment: function () {
        this.header.style.backgroundColor = '';
    },
    _highlightComment: function () {
        this.elementer.AddClass(this.comment, commentClasses.trollCommentClass);
        this.elementer.AddClass(this.header, commentClasses.trollCommentHeaderClass);
        if (this.children !== -1) {
            this.elementer.AddClass(this.children, commentClasses.trollCommentAnswersClass);
        }
    },
    setTroll: function () {
        this.troll = true;
        var me = this;
        this.prefs.get.trollCommentClass(function (response) {
            me.elementer.AddClass(me.comment, response.pref.value);
        });
        this.prefs.get.trollCommentHeaderClass(function (response) {
            me.elementer.AddClass(me.header, response.pref.value);
        });
        if (this.children !== -1) {
            this.prefs.get.trollCommentAnswersClass(function (response) {
                me.elementer.AddClass(me.children, response.pref.value);
            });
        }
    },
    unsetTroll: function () {
        this.troll = false;
        var me = this;
        this.prefs.get.trollCommentClass(function (response) {
            me.elementer.RemoveClass(me.comment, response.pref.value);
        });
        this.prefs.get.trollCommentHeaderClass(function (response) {
            me.elementer.RemoveClass(me.header, response.pref.value);
        });
        if (this.children !== -1) {
            this.prefs.get.trollCommentAnswersClass(function (response) {
                me.elementer.RemoveClass(me.children, response.pref.value);
            });
        }
    },
    /**
    * highligts the header of the node if the user is a troll
    */
    highlightTroll: function () {
        this.setTroll();
    },
    /**
    * @param {NodeHeaderBuilder} builder
    */
    addExtraLinks: function (builder) {
        this.elementer.Add(builder.buildComExtraTop(), this.footerLinks);
        this.elementer.Add(builder.buildComExtraBack(), this.footerLinks);
    },
    /**
    * replace the 'uj' text in the header of newly posted comments
    * @param {NodeHeaderBuilder} builder
    * @param {Element} tmpSpan1
    */
    replaceNewCommentText: function (builder, tmpSpan1) {
        this.elementer.Remove(this.newComm, this.comment);
        this.elementer.Add(builder.buildNewText(), tmpSpan1);
    },
    /**
    * @param {NodeHeaderBuilder} builder
    */
    addComExtraParent: function (builder) {
        this.elementer.Add(builder.buildComExtraParent(this.parent), this.footerLinks);
    },
    /**
    * @param {Object} users
    */
    highlightComment: function (users) {
        if (users[this.user]) {
            this.highLightComment(users[this.user]);
        }
    },
    plusOne: false,
    minusOne: false,
    getPlusOrMinus: function () {
        if (this.isPlusOne()) {
            this.plusOne = true;
        } else if (this.isMinusOne()) {
            this.minusOne = true;
        }
    },
    isPlusOne: function () {
        var firstParagraph = this.elementer.GetFirstTag('p', this.cont);
        return plusOneRex.test(firstParagraph.textContent);
    },
    isBoringComment: function (cb) {
        var paragraphs = this.elementer.GetTag('p', this.cont),
            trimComment;
        if (paragraphs.length === 1) {
            trimComment = paragraphs[0].innerHTML.replace(/^\s*|\s*$/g, '');
            this.prefs.get.boringcommentcontents(function (response) {
                var rex = new RegExp(response.pref.value),
                    output = rex.test(trimComment);
                cb(output);
            });
        } else {
            cb(false);
        }
    },
    isMinusOne: function () {
        var firstParagraph = this.elementer.GetFirstTag('p', this.cont);
        return minusOneRex.test(firstParagraph.textContent);
    },
    renderReplies: function () {
        var replies = this.elementer.GetByClass(this.footer, 'hup-replies', 'div'),
            fragment = this.elementer.Fragment(),
            _this = this;
        if (!replies.length) {
            replies = this.elementer.Div();
            this.elementer.AddClass(replies, 'hup-replies');
            this.elementer.Insert(replies, this.footer.firstChild);
        } else {
            replies = replies[0];
            this.elementer.RemoveAll(replies);
        }
        this.elementer.Add(this.elementer.Txt('replies: '), fragment);
        this.replies.forEach(function (reply, index) {
            if (index > 0) {
                _this.elementer.Add(_this.elementer.Txt(', '), fragment);
            }
            reply.isBoringComment(function (isBoring) {
                var link = _this.elementer.CreateLink(reply.user, '#' + reply.id);
                if (isBoring) {
                    _this.elementer.AddClass(link, 'hup-boring');
                }
                _this.elementer.Add(link, fragment);
            });
        });
        this.elementer.Add(fragment, replies);
    },
    addReply: function (child) {
        var scope = {},
            me = this;

        this.replies.push(child);

        Components.utils.import('resource://huppermodules/timer.jsm', scope);
        // me.renderReplies();
        if (me._repliesRender) {
            scope.never(me._repliesRender);
            me._repliesRender = null;
        }
        me._repliesRender = scope.later(function () {
            me.renderReplies();
            me._repliesRender = null;
        }, 20);
    },
    addPoint: function (direction, comment) {
        if (direction > 0) {
            this.plusPoints.push(comment);
        } else if (direction < 0) {
            this.minusPoints.push(comment);
        }
    },
    showPoints: function (direction, comment) {
        try {
            if (!this.plusPoints.length && !this.minusPoints.length) {
                return;
            }
            /**
            * @param {Comment} comment a HUPComment object
            */
            var _this = this,
            createPoint = function (comment) {
                var point = _this.elementer.Li();
                _this.elementer.AddClass(point, 'point');
                _this.elementer.Add(_this.elementer.CreateLink(comment.user, '#' + comment.id), point);
                return point;
            },
            togglePoints, type, points, fragment,
            sumContainer, minusContainer, plusContainer, pointDetails, pointContainer;
            /**
            * show/hide the point details of the comment
            */
            togglePoints = function (event) {
                var _this = this,
                    scope = {},
                    transform;
                Components.utils.import('resource://huppermodules/transform.jsm', scope);
                if (_this.elementer.HasClass(this.parentNode, 'show')) {
                    transform = new scope.Transform(
                        _this.elementer.GetByClass(this.parentNode, 'point-details')[0],
                        'SlideUp',
                        {
                            onEnd: function () {
                                _this.elementer.RemoveClass(_this.parentNode, 'show');
                            }
                        }
                    );
                } else {
                    _this.elementer.AddClass(this.parentNode, 'show');
                    transform = new scope.Transform(
                        _this.elementer.GetByClass(this.parentNode, 'point-details')[0],
                        'SlideDown'
                    );
                }
            };
            pointContainer = _this.elementer.Div();
            sumContainer = _this.elementer.El('h6');
            pointDetails  = _this.elementer.Div();

            sumContainer.setAttribute('title', 'osszesen');
            _this.elementer.subscribe(sumContainer, 'click', togglePoints, true);
            _this.elementer.AddClass(sumContainer, 'sum-points');
            points = _this.elementer.Txt(this.bundles
              .getFormattedString('pointSum',
                [this.plusPoints.length - this.minusPoints.length]));
            _this.elementer.RemoveAll(sumContainer);
            _this.elementer.Add(points, sumContainer);

            _this.elementer.AddClass(pointDetails, 'point-details');

            _this.elementer.AddClass(pointContainer, 'points');
            _this.elementer.Add(sumContainer, pointContainer);
            _this.elementer.Add(pointDetails, pointContainer);
            fragment = _this.elementer.Fragment();
            _this.elementer.Add(pointContainer, fragment);

            if (this.plusPoints.length) {
                plusContainer = _this.elementer.Ul();
                type = _this.elementer.Li();
                _this.elementer.AddClass(type, 'type');
                _this.elementer.Add(_this.elementer.Txt('plus'), type);
                _this.elementer.Add(type, plusContainer);
                plusContainer.setAttribute('title', 'plus');

                this.plusPoints.forEach(function (comment) {
                    _this.elementer.Add(createPoint(comment), plusContainer);
                });
                _this.elementer.Add(plusContainer, pointDetails);
            }
            if (this.minusPoints.length) {
                minusContainer = _this.elementer.Ul();
                minusContainer.setAttribute('title', 'minus');
                type = _this.elementer.Li();
                _this.elementer.AddClass(type, 'type');
                _this.elementer.Add(_this.elementer.Txt('minus'), type);
                _this.elementer.Add(type, minusContainer);
                this.minusPoints.forEach(function (comment) {
                    _this.elementer.Add(createPoint(comment), minusContainer);
                });
                _this.elementer.Add(minusContainer, pointDetails);
            }

            _this.elementer.Insert(fragment, this.cont.firstChild);
        } catch (e) {
            Components.utils.reportError(e);
        }
    },
    destroy: function () {
        this.doc = null;
        this.replies = null;
        this.prefs = null;
        this.comment = null;
        this.hupComments = null;
        this.id = null;
        this.header = null;
        this.footer = null;
        this.footerLinks = null;
        this.cont = null;
        this.plusPoints = null;
        this.minusPoints = null;
        this.parent = null;
        this.plusOneRex = null;
        this.userElement = null;
        this.bundles = null;
        this.elementer.destroy();
        this.elementer = null;
    }
};
/**
* @constructor
* @class GetComments
* @description A class to handle all of the comments on the page
*/
var GetComments = function (doc) {
    var scope = {};
    this.doc = doc;
    Components.utils.import('resource://huppermodules/Elementer.jsm', scope);
    this.elementer = new scope.Elementer(this.doc);
    Components.utils.import('resource://huppermodules/prefs.jsm', scope);
    this.prefs = new scope.HP();
    this.getComments();
    this.parseComments();
};
GetComments.prototype = {
    /**
    * @param {Element} element A comment div
    * @returns a Comment object or null
    * @type {Comment,NULL}
    */
    get: function (element) {
        var comments = this.comments.filter(function (c) {
            return c.comment === element;
        });
        return (comments.length) ? comments[0] : null;
    },
    getComments: function () {
        var coms = this.elementer.GetId('comments'), ds, _this;
        if (!coms) {
            return false;
        }
        _this = this;
        this.prefs.get.hideboringcomments(function (response) {
            if (!response.pref.value) {
                _this.elementer.AddClass(coms, 'keep-boring-comments');
            }
        });
        ds = _this.elementer.GetByClass(coms, 'comment', 'div');
        this.comments = [];
        this.indentComments = [];
        this.newComments = [];
        ds.forEach(function (c) {
            var comment = new Comment(_this.doc, c, _this.indentComments, _this.comments, _this);
            if (typeof _this.indentComments[comment.indent] === 'undefined') {
                _this.indentComments[comment.indent] = [];
            }
            _this.indentComments[comment.indent].push(_this.comments.length);
            _this.comments.push(comment);
            if (comment.newComm) {
                _this.newComments.push(comment);
            }
        });
    },
    _parseComments: function (prefs) {
        var replacenewcommenttext = prefs.replacenewcommenttext,
        prevnextlinks = prefs.prevnextlinks,
        trolls = prefs.trolls.split(','),
        filtertrolls = prefs.filtertrolls,
        huppers = prefs.huppers,
        extraCommentLinks = prefs.extraCommentLinks,
        insertPermalink = prefs.insertPermalink,
        highlightUsers = prefs.highlightUsers.split(','),
        hh = {},
        scope = {},
        _this = this,
        bh, builder, ps, spanNode, tmpSpan1, i, ncl;
        highlightUsers.forEach(function (hluser) {
            bh = hluser.split(':');
            hh[bh[0]] = bh[1];
        });
        Components.utils.import('resource://huppermodules/nodeheaderbuilder.jsm', scope);
        builder = new scope.NodeHeaderBuilder(this.doc);
        try {
            this.comments.forEach(function (C) {
                if (filtertrolls && trolls.indexOf(C.user) > -1) {
                    C.setTroll();
                }
                if (extraCommentLinks) {
                    C.addExtraLinks(builder);
                }
                if (C.parent !== -1) {
                    C.addComExtraParent(builder);
                }
                if (insertPermalink) {
                    _this.elementer.Add(builder.buildComExtraPerma(C.id), C.footerLinks);
                }
                C.highlightComment(hh);
                C.showPoints();
            });
        } catch (e) {
            Components.utils.import('resource://huppermodules/log.jsm', scope);
            scope.hupperLog('hupcomment', e.message, e.lineNumber, e.fileName);
        }
        if (replacenewcommenttext || prevnextlinks) {
            spanNode = _this.elementer.Span();
            for (i = 0, ncl = this.newComments.length; i < ncl; i += 1) {
                tmpSpan1 = spanNode.cloneNode(true);
                this.elementer.AddClass(tmpSpan1, 'hnav');
                if (prevnextlinks) {
                    if (i > 0) {
                        this.elementer.Add(builder.buildPrevLink(this.newComments[i - 1].id), tmpSpan1);
                    } else {
                        this.elementer.Add(builder.buildFirstLink(), tmpSpan1);
                    }
                    if (i < ncl - 1) {
                        this.elementer.Add(builder.buildNextLink(this.newComments[i + 1].id), tmpSpan1);
                    } else {
                        this.elementer.Add(builder.buildLastLink(), tmpSpan1);
                    }
                    // HUP.w.nextLinks.push(this.newComments[i].id);
                }
                if (replacenewcommenttext) {
                    this.newComments[i].replaceNewCommentText(builder, tmpSpan1);
                }
                this.elementer.Insert(tmpSpan1, this.newComments[i].header.firstChild);
            }
        }
    },
    parseComments: function () {
      // if (!prefs) {
        var prefs = {},
            _this = this;
        _this.prefs.get.replacenewcommenttext(function (response) {
            prefs.replacenewcommenttext = response.pref.value;
            _this.prefs.get.prevnextlinks(function (response) {
                prefs.prevnextlinks = response.pref.value;
                _this.prefs.get.trolls(function (response) {
                    prefs.trolls = response.pref.value;
                    _this.prefs.get.filtertrolls(function (response) {
                        prefs.filtertrolls = response.pref.value;
                        _this.prefs.get.huppers(function (response) {
                            prefs.huppers = response.pref.value;
                            _this.prefs.get.extracommentlinks(function (response) {
                                prefs.extraCommentLinks = response.pref.value;
                                _this.prefs.get.insertpermalink(function (response) {
                                    prefs.insertPermalink = response.pref.value;
                                    _this.prefs.get.highlightusers(function (response) {
                                        prefs.highlightUsers = response.pref.value;
                                        _this._parseComments(prefs);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
      /*
      } else {
        this._parseComments();
      }
      */
    },
    destroy: function () {
        this.newComments = null;
        this.comments.forEach(function (comment) {
            comment.destroy();
            comment = null;
        });
        this.comments = null;
        this.doc = null;
        this.prefs = null;
        this.elementer.destroy();
        this.elementer = null;
    }
};

var EXPORTED_SYMBOLS = ['Comment', 'GetComments'];
