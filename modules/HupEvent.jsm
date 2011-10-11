/**
  * @class EventProvider
  */
var HupEvent = function () {};
HupEvent.prototype = {
    subscribe: function (eventName, fn, obj, overrideContext) {
        if (!this._subscribers) {
            this._subscribers = {};
        }
        if (!this._subscribers[eventName]) {
            this._subscribers[eventName] = [];
        }
        this._subscribers[eventName].push({fn: fn, obj: obj, overrideContext: overrideContext});
    },
    on: function () {
        this.subscribe.apply(this, arguments);
    },
    fireEvent: function (eventName, args) {
        if (!this._subscribers || !this._subscribers[eventName]) {
            return;
        }
        var subscribers = this._subscribers[eventName];
        for (let i = 0, sl = subscribers.length; i < sl; i++) {
            subscription = subscribers[i];
            try {
              subscription.fn.call(subscription.context || this, args);
            } catch(err) {
              Components.utils.reportError(err);
            }
        }
      }
};
let EXPORTED_SYMBOLS = ['HupEvent'];
