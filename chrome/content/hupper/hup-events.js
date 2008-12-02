var HUPEvents = function() {
  this.doc = HUP.w;
};
HUPEvents.prototype = {
  /**
   * @param {Element} ob
   * @param {String} ev event type
   * @param {Function} fn function to run when event fired
   * @param {Boolean} cap use capture
   * @param {Boolean} force add event to the doc if element not found
   */
  addEvent: function(ob, ev, fn, cap, force) {
    if(!ob && !force) return;
    if(!ob) ob = this.doc;
    ob.addEventListener(ev, fn, cap);
  },
  /**
   * @param {Element} ob
   * @param {String} ev event type
   * @param {Function} fn function to run when event fired
   * @param {Boolean} cap use capture
   * @param {Boolean} force add event to the doc if element not found
   */
  removeEvent: function(ob, ev, fn, cap, force) {
    if(!ob && !force) return;
    if(!ob) ob = this.doc;
    ob.removeEventListener(ev, fn, cap);
  }
}
