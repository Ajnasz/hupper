/**
 * @class Timer
 * @namespace Hupper
 * @description is small bencmark utility
 * @constructor
 */
var Timer = function() {
  this.start();
};
Timer.prototype = {
  /**
   * Start the timer
   */
  start: function() {
    this.startTime = new Date();
  },
  /**
   * Stop the timer
   */
  stop: function() {
    this.endTime = new Date();
  },
  /**
   * Finish the run and return the result
   * @return The difference between the start and the and in ms
   * @type Int
   */
  finish: function() {
    return this.endTime.getTime() - this.startTime.getTime();
  }
};

let EXPORTED_SYMBOLS = ['Timer'];
