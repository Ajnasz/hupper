/*jshint moz:true*/
console.log('comments.js');
(function ($, def) {
    'use strict';
    def('comment', function () {
        var COMMENT_HEADER_CLASS = 'submitted';
        var NEW_COMMENT_CLASS = 'comment-new';
        var COMMENT_CLASS = 'comment-new';
        var COMMENT_NEW_MARKER_CLASS = 'new';
        var ANONYM_COMMENT_AUTHOR_REGEXP = /[^\(]+\( ([^ ]+).*/;
        var COMMENT_DATE_REGEXP = /[\s\|]+([0-9]+)\.\s([a-zúőűáéóüöí]+)\s+([0-9]+)\.,\s+([a-zűáéúőóüöí]+)\s+-\s+(\d+):(\d+).*/;
        var COMMENT_MONTH_NAMES = {
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
        };
        /**
            * @type commentDataStruct
            *   isNew Boolean
            *   author String
            *   created Timestamp
            */
        var commentDataStruct = {
            isNew: false,
            author: '',
            created: 0,
            id: ''
        };
        /**
            * @type commentStruct
            *   node: jQueryObject
            *   header: jQueryObject
            */
        var commentStruct = {
            node: null,
            header: null
        };
        /**
            * @param commentStruct comment
            * @return string
            */
        function getCommentAuthor(comment) {
            var output = '';
            output = comment.header.find('a').text().trim();
            if (output === '') {
                output = comment.header.text().replace(ANONYM_COMMENT_AUTHOR_REGEXP, '$1');
            }
            return output;
        }
        /**
            * @param commentStruct comment
            * @return Timestamp
            */
        function getCommentCreateDate(comment) {
            var date, dateMatch;
            dateMatch = comment.header.text().match(COMMENT_DATE_REGEXP);
            date = new Date();
            date.setYear(dateMatch[1]);
            date.setMonth(COMMENT_MONTH_NAMES[dateMatch[2]]);
            date.setDate(dateMatch[3]);
            date.setHours(dateMatch[5]);
            date.setMinutes(dateMatch[6]);
            return date.getTime();
        }
        /**
            * @param commentStruct comment
            * @return String
            */
        function getCommentId(comment) {
            return comment.node.prev('a').attr('id');
        }
        /**
            * @param HTMLCommentNode node
            * @return Object
            *   node: jQueryObject
            *   header: jQueryObject
            */
        function getCommentObj(node) {
            var commentObj = Object.create(commentStruct);
            var $node = $(node);
            commentObj.node = $node;
            commentObj.header = $node.find('.' + COMMENT_HEADER_CLASS);
            return commentObj;
        }
        /**
            * @param HTMLCommentElementNode node
            * @return commentDataStruct
            */
        function parseComment(node) {
            var output = Object.create(commentDataStruct);
            var commentObj = getCommentObj(node);
            output.isNew = commentObj.node.hasClass(NEW_COMMENT_CLASS);
            output.author = getCommentAuthor(commentObj);
            output.created = getCommentCreateDate(commentObj);
            output.id = getCommentId(commentObj);
            return output;
        }
        /**
         * @param commentStruct comment
         */
        function getNewMarkerElement(comment) {
            return comment.node.find('> .' + COMMENT_NEW_MARKER_CLASS);
        }
        /**
         * @param commentStruct comment
         * @param string text
         */
        function setNew(comment, text) {
            getNewMarkerElement(comment).text(text);
        }
        /**
         * @param commentDataStruct comment
         * @return commentStruct
         */
        function commentDataStructToObj(comment) {
            var item = $('#' + comment.id).next('.' + COMMENT_CLASS);
            return getCommentObj(item[0]);
        }
        return {
            parseComment: parseComment,
            setNew: setNew,
            commentDataStructToObj: commentDataStructToObj
        };
    });
}(window.jQuery, window.def));
