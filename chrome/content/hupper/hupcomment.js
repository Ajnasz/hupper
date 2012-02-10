/*global Hupper: true, HUP: true */
(function () {
    var plusOneRex = new RegExp('(?:^|\\s)\\+1(?:$|\\s|\\.|,)'),
        minusOneRex = new RegExp('(?:^|\\s)-1(?:$|\\s|\\.|,)'),
        commentClasses = null;
    /**
    * @constructor
    * @class Comment
    * @namespace Hupper
    * @description class to parse a comment node
    * @param {Element} commentNode HTML Element
    * @param {Array} indentComments comments, which are indented
    * @param {Array} comments all comment of the page
    * @param {Hupper.GetComments} hupComments the general GetHupComments instance
    */
    Hupper.Comment = function (doc, commentNode, indentComments, comments, hupComments) {
        this.doc = doc;
        this.comment = commentNode;
        this.hupComments = hupComments;
        this.id = this.comment.previousSibling.previousSibling.id;
        this.header = Hupper.HUP.El.GetByClass(this.comment, 'submitted', 'div')[0];
        this.footer = Hupper.HUP.El.GetByClass(this.comment, 'link', 'div')[0];
        this.cont = Hupper.HUP.El.GetByClass(this.comment, 'content', 'div')[0];
        this.isDeletedUser();
        this.getDate();
        if (Hupper.HUP.w.location.search.replace(/\?page=/, '') > 0) {
            this.todayComment();
        }
        this.replies = [];
        this.newComment();
        this.footerLinks = Hupper.HUP.El.GetFirstTag('ul', this.footer);
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
        var me = this, scope = {};
        this.isBoringComment(function (isBoring) {
            if (isBoring) {
                Hupper.HUP.El.AddClass(me.comment, 'hup-boring');
            }
        });
        if (this.children !== -1) {
            Hupper.HUP.El.AddClass(this.comment, 'has-children');
        }
        Components.utils.import('resource://huppermodules/bundles.jsm', scope);
        this.bundles = scope.hupperBundles;
    };
    Hupper.Comment.prototype = {
        /**
        * @returns the childcomment container of a comment or -1
        * @type {Element,Number}
        */
        getChildComment: function () {
            var children = this.comment.nextSibling.nextSibling;
            if (Hupper.HUP.El.HasClass(children, 'indented')) {
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
            while (Hupper.HUP.El.HasClass(elem.parentNode, 'indented')) {
                elem = elem.parentNode;
                indent++;
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
                s = Hupper.HUP.El.Span();
                a = Hupper.HUP.El.A();
                Hupper.HUP.El.AddClass(s, 'new');
                Hupper.HUP.El.Add(Hupper.HUP.El.Txt('új'), s);
                Hupper.HUP.El.Insert(s, _comment.comment.firstChild);
                a.setAttribute('id', 'new');
                Hupper.HUP.El.Insert(a, _comment.comment.firstChild);
            }
        },
        newComment: function () {
            var newNodes = Hupper.HUP.El.GetByClass(this.comment, 'new', 'span');
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
            Hupper.HUP.El.AddClass(this.comment, commentClasses.trollCommentClass);
            Hupper.HUP.El.AddClass(this.header, commentClasses.trollCommentHeaderClass);
            if (this.children !== -1) {
                Hupper.HUP.El.AddClass(this.children, commentClasses.trollCommentAnswersClass);
            }
        },
        setTroll: function () {
            this.troll = true;
            var me = this;
            Hupper.HUP.hp.get.trollCommentClass(function (response) {
                Hupper.HUP.El.AddClass(me.comment, response.pref.value);
            });
            Hupper.HUP.hp.get.trollCommentHeaderClass(function (response) {
                Hupper.HUP.El.AddClass(me.header, response.pref.value);
            });
            if (this.children !== -1) {
                Hupper.HUP.hp.get.trollCommentAnswersClass(function (response) {
                    Hupper.HUP.El.AddClass(me.children, response.pref.value);
                });
            }
        },
        unsetTroll: function () {
            this.troll = false;
            var me = this;
            Hupper.HUP.hp.get.trollCommentClass(function (response) {
                Hupper.HUP.El.RemoveClass(me.comment, response.pref.value);
            });
            Hupper.HUP.hp.get.trollCommentHeaderClass(function (response) {
                Hupper.HUP.El.RemoveClass(me.header, response.pref.value);
            });
            if (this.children !== -1) {
                Hupper.HUP.hp.get.trollCommentAnswersClass(function (response) {
                    Hupper.HUP.El.RemoveClass(me.children, response.pref.value);
                });
            }
        },
        /**
        * highligts the header of the node if the user is a troll
        */
        highlightTroll: function () {
            this.setTroll();
            /*
            var _this = this;;
            if (!commentClasses) {
              Hupper.HUP.hp.get.trollCommentClass(function (response) {
                commentClasses = {};
                commentClasses.trollCommentClass = response.pref.value;
                Hupper.HUP.hp.get.trollCommentHeaderClass(function (response) {
                  commentClasses.trollCommentHeaderClass = response.pref.value;
                  Hupper.HUP.hp.get.trollCommentAnswersClass(function (response) {
                    commentClasses.trollCommentAnswersClass = response.pref.value;
                    _this._highlightComment();
                  });
                });
              });
            } else {
              this._highlightComment();
            }
            */
        },
        /**
        * @param {Hupper.NodeHeaderBuilder} builder
        */
        addExtraLinks: function (builder) {
            Hupper.HUP.El.Add(builder.buildComExtraTop(), this.footerLinks);
            Hupper.HUP.El.Add(builder.buildComExtraBack(), this.footerLinks);
        },
        /**
        * replace the 'uj' text in the header of newly posted comments
        * @param {Hupper.NodeHeaderBuilder} builder
        * @param {Element} tmpSpan1
        */
        replaceNewCommentText: function (builder, tmpSpan1) {
            Hupper.HUP.El.Remove(this.newComm, this.comment);
            Hupper.HUP.El.Add(builder.buildNewText(), tmpSpan1);
        },
        /**
        * @param {Hupper.NodeHeaderBuilder} builder
        */
        addComExtraParent: function (builder) {
            Hupper.HUP.El.Add(builder.buildComExtraParent(this.parent), this.footerLinks);
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
            var firstParagraph = Hupper.HUP.El.GetFirstTag('p', this.cont);
            return plusOneRex.test(firstParagraph.textContent);
        },
        isBoringComment: function (cb) {
            var paragraphs = Hupper.HUP.El.GetTag('p', this.cont),
                trimComment;
            if (paragraphs.length === 1) {
                trimComment = paragraphs[0].innerHTML.replace(/^\s*|\s*$/g, '');
                Hupper.HUP.hp.get.boringcommentcontents(function (response) {
                    var rex = new RegExp(response.pref.value),
                        output = rex.test(trimComment);
                    cb(output);
                });
            } else {
                cb(false);
            }
        },
        isMinusOne: function () {
            var firstParagraph = Hupper.HUP.El.GetFirstTag('p', this.cont);
            return minusOneRex.test(firstParagraph.textContent);
        },
        renderReplies: function () {
            var replies = Hupper.HUP.El.GetByClass(this.footer, 'hup-replies', 'div'),
                fragment = Hupper.HUP.El.Fragment();
            if (!replies.length) {
                replies = Hupper.HUP.El.Div();
                Hupper.HUP.El.AddClass(replies, 'hup-replies');
                Hupper.HUP.El.Insert(replies, this.footer.firstChild);
            } else {
                replies = replies[0];
                Hupper.HUP.El.RemoveAll(replies);
            }
            Hupper.HUP.El.Add(Hupper.HUP.El.Txt('replies: '), fragment);
            this.replies.forEach(function (reply, index) {
                if (index > 0) {
                    Hupper.HUP.El.Add(Hupper.HUP.El.Txt(', '), fragment);
                }
                reply.isBoringComment(function (isBoring) {
                    var link = Hupper.HUP.El.CreateLink(reply.user, '#' + reply.id);
                    if (isBoring) {
                        Hupper.HUP.El.AddClass(link, 'hup-boring');
                    }
                    Hupper.HUP.El.Add(link, fragment);
                });
            });
            Hupper.HUP.El.Add(fragment, replies);
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
                * @param {Hupper.Comment} comment a HUPComment object
                */
                var _this = this,
                createPoint = function (comment) {
                    var point = Hupper.HUP.El.Li();
                    Hupper.HUP.El.AddClass(point, 'point');
                    Hupper.HUP.El.Add(Hupper.HUP.El.CreateLink(comment.user, '#' + comment.id), point);
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
                    if (Hupper.HUP.El.HasClass(this.parentNode, 'show')) {
                        transform = new scope.Transform(
                            Hupper.HUP.El.GetByClass(this.parentNode, 'point-details')[0],
                            'SlideUp',
                            {
                                onEnd: function () {
                                    Hupper.HUP.El.RemoveClass(_this.parentNode, 'show');
                                }
                            }
                        );
                    } else {
                        Hupper.HUP.El.AddClass(this.parentNode, 'show');
                        transform = new scope.Transform(
                            Hupper.HUP.El.GetByClass(this.parentNode, 'point-details')[0],
                            'SlideDown'
                        );
                    }
                };
                pointContainer = Hupper.HUP.El.Div();
                sumContainer = Hupper.HUP.El.El('h6');
                pointDetails  = Hupper.HUP.El.Div();

                sumContainer.setAttribute('title', 'osszesen');
                sumContainer.addEventListener('click', togglePoints, true);
                Hupper.HUP.El.AddClass(sumContainer, 'sum-points');
                points = Hupper.HUP.El.Txt(this.bundles
                  .getFormattedString('pointSum',
                    [this.plusPoints.length - this.minusPoints.length]));
                Hupper.HUP.El.RemoveAll(sumContainer);
                Hupper.HUP.El.Add(points, sumContainer);

                Hupper.HUP.El.AddClass(pointDetails, 'point-details');

                Hupper.HUP.El.AddClass(pointContainer, 'points');
                Hupper.HUP.El.Add(sumContainer, pointContainer);
                Hupper.HUP.El.Add(pointDetails, pointContainer);
                fragment = Hupper.HUP.El.Fragment();
                Hupper.HUP.El.Add(pointContainer, fragment);

                if (this.plusPoints.length) {
                    plusContainer = Hupper.HUP.El.Ul();
                    type = Hupper.HUP.El.Li();
                    Hupper.HUP.El.AddClass(type, 'type');
                    Hupper.HUP.El.Add(Hupper.HUP.El.Txt('plus'), type);
                    Hupper.HUP.El.Add(type, plusContainer);
                    plusContainer.setAttribute('title', 'plus');

                    this.plusPoints.forEach(function (comment) {
                        Hupper.HUP.El.Add(createPoint(comment), plusContainer);
                    });
                    Hupper.HUP.El.Add(plusContainer, pointDetails);
                }
                if (this.minusPoints.length) {
                    minusContainer = Hupper.HUP.El.Ul();
                    minusContainer.setAttribute('title', 'minus');
                    type = Hupper.HUP.El.Li();
                    Hupper.HUP.El.AddClass(type, 'type');
                    Hupper.HUP.El.Add(Hupper.HUP.El.Txt('minus'), type);
                    Hupper.HUP.El.Add(type, minusContainer);
                    this.minusPoints.forEach(function (comment) {
                        Hupper.HUP.El.Add(createPoint(comment), minusContainer);
                    });
                    Hupper.HUP.El.Add(minusContainer, pointDetails);
                }

                Hupper.HUP.El.Insert(fragment, this.cont.firstChild);
            } catch (e) {
                Components.utils.reportError(e);
            }
        }
    };
    /**
    * @constructor
    * @class GetComments
    * @namespace Hupper
    * @description A class to handle all of the comments on the page
    */
    Hupper.GetComments = function (doc) {
        this.doc = doc;
        this.getComments();
        this.parseComments();
    };
    Hupper.GetComments.prototype = {
        /**
        * @param {Element} element A comment div
        * @returns a Hupper.Comment object or null
        * @type {Hupper.Comment,NULL}
        */
        get: function (element) {
            var comments = this.comments.filter(function (c) {
                return c.comment === element;
            });
            return (comments.length) ? comments[0] : null;
        },
        getComments: function () {
            var coms = Hupper.HUP.El.GetId('comments'), ds, _this;
            if (!coms) {
                return false;
            }
            Hupper.HUP.hp.get.hideboringcomments(function (response) {
                if (!response.pref.value) {
                    Hupper.HUP.El.AddClass(coms, 'keep-boring-comments');
                }
            });
            ds = Hupper.HUP.El.GetByClass(coms, 'comment', 'div');
            this.comments = [];
            this.indentComments = [];
            this.newComments = [];
            _this = this;
            ds.forEach(function (c) {
                var comment = new Hupper.Comment(_this.doc, c, _this.indentComments, _this.comments, _this);
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
            bh, builder, ps, spanNode, tmpSpan1, i, ncl;
            highlightUsers.forEach(function (hluser) {
                bh = hluser.split(':');
                hh[bh[0]] = bh[1];
            });
            builder = new Hupper.NodeHeaderBuilder(this.doc);
            try {
                this.comments.forEach(function (C) {
                    if (filtertrolls && Hupper.inArray(C.user, trolls)) {
                        C.setTroll();
                    }
                    if (extraCommentLinks) {
                        C.addExtraLinks(builder);
                    }
                    if (C.parent !== -1) {
                        C.addComExtraParent(builder);
                    }
                    if (insertPermalink) {
                        Hupper.HUP.El.Add(builder.buildComExtraPerma(C.id), C.footerLinks);
                    }
                    C.highlightComment(hh);
                    C.showPoints();
                });
            } catch (e) {
                var scope = {};
                Components.utils.import('resource://huppermodules/log.jsm', scope);
                scope.hupperLog('hupcomment', e.message, e.lineNumber, e.fileName);
            }
            if (replacenewcommenttext || prevnextlinks) {
                spanNode = Hupper.HUP.El.Span();
                for (i = 0, ncl = this.newComments.length; i < ncl; i += 1) {
                    tmpSpan1 = spanNode.cloneNode(true);
                    Hupper.HUP.El.AddClass(tmpSpan1, 'hnav');
                    if (prevnextlinks) {
                        if (i > 0) {
                            Hupper.HUP.El.Add(builder.buildPrevLink(this.newComments[i - 1].id), tmpSpan1);
                        } else {
                            Hupper.HUP.El.Add(builder.buildFirstLink(), tmpSpan1);
                        }
                        if (i < ncl - 1) {
                            Hupper.HUP.El.Add(builder.buildNextLink(this.newComments[i + 1].id), tmpSpan1);
                        } else {
                            Hupper.HUP.El.Add(builder.buildLastLink(), tmpSpan1);
                        }
                        Hupper.HUP.w.nextLinks.push(this.newComments[i].id);
                    }
                    if (replacenewcommenttext) {
                        this.newComments[i].replaceNewCommentText(builder, tmpSpan1);
                    }
                    Hupper.HUP.El.Insert(tmpSpan1, this.newComments[i].header.firstChild);
                }
            }
        },
        parseComments: function () {
          // if (!prefs) {
            var prefs = {},
                _this = this;
            Hupper.HUP.hp.get.replacenewcommenttext(function (response) {
                prefs.replacenewcommenttext = response.pref.value;
                Hupper.HUP.hp.get.prevnextlinks(function (response) {
                    prefs.prevnextlinks = response.pref.value;
                    Hupper.HUP.hp.get.trolls(function (response) {
                        prefs.trolls = response.pref.value;
                        Hupper.HUP.hp.get.filtertrolls(function (response) {
                            prefs.filtertrolls = response.pref.value;
                            Hupper.HUP.hp.get.huppers(function (response) {
                                prefs.huppers = response.pref.value;
                                Hupper.HUP.hp.get.extracommentlinks(function (response) {
                                    prefs.extraCommentLinks = response.pref.value;
                                    Hupper.HUP.hp.get.insertpermalink(function (response) {
                                        prefs.insertPermalink = response.pref.value;
                                        Hupper.HUP.hp.get.highlightusers(function (response) {
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
        }
    };
}());
