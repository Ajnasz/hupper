/**
 * @constructor
 * @class Transform
 * @description Creates effects
 * @module Hupper
 * @param {Element,String} ob transformable object
 * @param {String} type type of the effect
 * @param {Object} [opts] options
 * @return Transform
 */
var Transform = function(ob, type, opts) {
  if(typeof ob == 'object') {
    this.ob = ob;
  } else if(typeof ob == 'string') {
    this.ob = document.getElementById(ob);
  } else {
    return false;
  }
  if(!opts) {
    var opts = {};
  }
  this.type = type;
  this.speed = opts.speed || false;
  this.dur = opts.dur || 10;
  this.ob.style.display = '';
  this.start(this.type);
  return this;
};
/**
 * make the transformation
 * @param {Object} THIS reference to the Transform.prototype object
 */
Transform.prototype = {
  /**
   * Starts the transformation
   * @method start
   * @param {String} type The type of the transformation. Available types are: FadeIn, FadeOut, SlideUp, SlideDown
   */
  start: function(type) {
    switch(type) {
      case 'FadeIn':
        this.i = 0;
        this.speed = this.speed || 0.1;
        this.FadeIn(this);
        break;
      case 'FadeOut':
        this.i = 10;
        this.speed = this.speed || 0.1;
        this.FadeOut(this);
        break;
      case 'SlideUp':
        this.i = 0;
        this.speed = this.speed || 0.3;
        this.ob.style.overflow = 'hidden';
        this.ob.style.height = '';
        this.ob.style.display = '';

        this.obHeight = this.ob.offsetHeight;
        this.SlideUp(this);
        break;
      case 'SlideDown':
        this.i = 10;
        this.speed = this.speed || 0.3;
        this.ob.style.overflow = 'hidden';
        this.ob.style.height = '';
        this.ob.style.display = '';
        this.obHeight = this.ob.offsetHeight;
        this.ob.style.height = 0;
        this.SlideDown(this);
        break;
    }
  },
  /**
   * Fade in the object
   * @method FadeIn
   * @param {Transform} THIS
   */
  FadeIn: function(THIS) {
    THIS.ob.style.height = '';
    THIS.ob.style.opacity = 0.1*THIS.i;
    if(THIS.i < THIS.dur) {
      setTimeout(THIS.FadeIn, THIS.dur/THIS.speed, THIS);
      THIS.i++;
    }
  },
  /**
   * Fade out the object
   * @method FadeOut
   * @param {Transform} THIS
   */
  FadeOut: function(THIS) {
    THIS.ob.style.opacity = 0.1*THIS.i;
    if(THIS.i > 0) {
      setTimeout(THIS.FadeOut, THIS.dur/THIS.speed, THIS);
      THIS.i--;
    }
    if(THIS.i == 0) {
      THIS.ob.style.display = 'none';
    }
  },
  /**
   * Slide up the object
   * @method SlideUp
   * @param {Transform} THIS
   */
  SlideUp: function(THIS) {
    var s = THIS.obHeight / THIS.dur;
    THIS.ob.style.height = (THIS.obHeight-(s * THIS.i)) + 'px';
    if(THIS.i < THIS.dur) {
      setTimeout(THIS.SlideUp, THIS.dur/THIS.speed, THIS);
      THIS.i++;
    } else {
      THIS.ob.style.display = 'none';
    }
  },
  /**
   * Slide down the object
   * @method SlideDown
   * @param {Transform} THIS
   */
  SlideDown: function(THIS) {
    var s = THIS.obHeight / THIS.dur;
    THIS.ob.style.display = '';
    THIS.ob.style.height = (THIS.obHeight-(s * THIS.i)) + 'px';
    if(THIS.i > 0) {
      setTimeout(THIS.SlideDown, THIS.dur/THIS.speed, THIS);
      THIS.i--;
    } else {
      THIS.ob.style.height = '';
    }
  }
};
