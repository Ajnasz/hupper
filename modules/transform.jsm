var scope = {};
Components.utils.import('resource://huppermodules/timer.jsm', scope);

/**
 * @constructor
 * @class Transform
 * @description Creates effects
 * @param {Element,String} ob transformable object
 * @param {String} type type of the effect
 * @param {Object} [opts] options
 */
function Transform(ob, type, opts) {
    if (typeof ob === 'object') {
        this.ob = ob;
    } else if (typeof ob === 'string') {
        this.ob = document.getElementById(ob);
    } else {
        return false;
    }
    if (!opts) {
        opts = {};
    }
    this.type = type;
    this.speed = opts.speed || false;
    this.frames = opts.frames || 10;
    this.onEnd = opts.onEnd || function () {};
    this.ob.style.display = '';
    this.start(this.type);
}
Transform.prototype = {
    /**
    * Starts the transformation
    * @method start
    * @param {String} type The type of the transformation. Available types are: FadeIn, FadeOut, SlideUp, SlideDown
    */
    start: function (type) {
        switch (type) {
        case 'FadeIn':
            this.i = 0;
            this.speed = this.speed || 0.1;
            this.FadeIn();
            break;
        case 'FadeOut':
            this.i = 10;
            this.speed = this.speed || 0.1;
            this.FadeOut();
            break;
        case 'SlideUp':
            this.i = 0;
            this.speed = this.speed || 0.3;
            this.ob.style.overflow = 'hidden';
            this.ob.style.height = '';
            this.ob.style.display = '';
            this.obHeight = this.ob.offsetHeight;
            this.SlideUp();
            break;
        case 'SlideDown':
            this.i = 10;
            this.speed = this.speed || 0.3;
            this.ob.style.overflow = 'hidden';
            this.ob.style.height = '';
            this.ob.style.display = '';
            this.obHeight = this.ob.offsetHeight;
            this.ob.style.height = 0;
            this.SlideDown();
            break;
        }
    },
    /**
    * Fade in the object
    * @method FadeIn
    */
    FadeIn: function () {
        this.ob.style.height = '';
        this.ob.style.opacity = 0.1 * this.i;
        if (this.i < this.frames) {
            var _this = this;
            scope.later(function () {
                _this.FadeIn();
            }, this.frames / this.speed);
            this.i += 1;
        } else {
            if (typeof this.onEnd === 'function') {
                this.onEnd();
            }
        }
    },
    /**
    * Fade out the object
    * @method FadeOut
    */
    FadeOut: function () {
        this.ob.style.opacity = 0.1 * this.i;
        if (this.i > 0) {
            var _this = this;
            scope.later(function () {
                _this.FadeOut();
            }, this.frames / this.speed);
            this.i -= 1;
        }
        if (this.i === 0) {
            this.ob.style.display = 'none';
            if (typeof this.onEnd === 'function') {
                this.onEnd();
            }
        }
    },
    /**
    * Slide up the object
    * @method SlideUp
    */
    SlideUp: function () {
        var s = this.obHeight / this.frames,
          _this;
        this.ob.style.height = (this.obHeight - (s * this.i)) + 'px';
        if (this.i < this.frames) {
            _this = this;
            scope.later(function () {
                _this.SlideUp();
            }, this.frames / this.speed);
            this.i += 1;
        } else {
            this.ob.style.display = 'none';
            if (typeof this.onEnd === 'function') {
                this.onEnd();
            }
        }
    },
    /**
    * Slide down the object
    * @method SlideDown
    */
    SlideDown: function () {
        var s = this.obHeight / this.frames,
            _this;
        this.ob.style.display = '';
        this.ob.style.height = (this.obHeight - (s * this.i)) + 'px';
        if (this.i > 0) {
            _this = this;
            scope.later(function () {
                _this.SlideDown();
            }, this.frames / this.speed);
            this.i -= 1;
        } else {
            this.ob.style.height = '';
            if (typeof this.onEnd === 'function') {
                this.onEnd();
            }
        }
    }
};

var EXPORTED_SYMBOLS = ['Transform'];
