/**
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
 * @class Ajax
 * @description sends request to the {@link http://hup.hu hup.hu} site
 * @constructor
 * @param {Object} pars object to overwrite the default parameters
 */
var Ajax = function (pars, el) {
    if (typeof pars.url === 'undefined') {
        return false;
    }

    var stChg = function (ob, p) {
        return function () {
            ob.handler(p);
        };
    };
    this.el = el;
    this.url = pars.url;
    this.pars = typeof pars.pars !== 'undefined' ? pars.pars : this.pars;
    this.handler = typeof pars.handler !== 'undefined' ? pars.handler : this.handler;
    this.method = typeof pars.method !== 'undefined' ? pars.method : 'get';
    this.successHandler = typeof pars.successHandler !== 'undefined' ? pars.successHandler : this.successHandler;
    this.errorHandler = typeof pars.errorHandler !== 'undefined' ? pars.errorHandler : this.errorHandler;
    this.loadHandler = typeof pars.loadHandler !== 'undefined' ? pars.loadHandler : this.loadHandler;

    // this.req = new XMLHttpRequest();
    this.req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
               .createInstance(Components.interfaces.nsIXMLHttpRequest);
    this.req.open(this.method, this.url, true);
    this.req.setRequestHeader('User-Agent', this.agent);
    this.req.setRequestHeader('Accept-Charset', 'utf-8');
    this.req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

    if (this.method.toLowerCase() === 'post') {
        this.req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }

    this.req.onreadystatechange = stChg(this, false);
    this.req.send(this.pars);
};
Ajax.prototype = {
    url: null,
    pars: null,
    req: null,
    el: null,
    method: 'get',
    agent: 'Hupper Firefox extension ###VERSION###',
    /**
    * Runs on statechange
    * @param {Object} pars
    * @return The error or load or successhandler state
    */
    handler: function (pars) {
        try {
            if (this.req.readyState === 4) {
                if (this.req.status !== 'undefined') {
                    if (this.req.status === 200) {
                        return this.successHandler();
                    } else {
                        return this.errorHandler('status code - ' + this.req.status);
                    }
                } else {
                    return this.errorHandler('no status code');
                }
            } else {
                return this.loadHandler();
            }
        } catch (e) {
            return this.errorHandler('no readyState', e);
        }
    },
    /**
    * runs if the request was success
    */
    successHandler: function () {
        return this.req.responseText;
    },
    /**
    * runs if the request was not success
    * @param {String} msg Error message string
    * @param {Int} er Error code
    */
    errorHandler: function (msg, er) {
        var scope = {};
        Components.utils.import('resource://huppermodules/log.jsm', scope);
        scope.hupperLog('Ajax error: ' + msg + ' || ' + er);
        scope.hupperLog(this.url);
        return false;
    },
    /**
    * runs the request doesn't finished
    */
    loadHandler: function () {
        return true;
    }
};

var EXPORTED_SYMBOLS = ['Ajax'];
