var generateId = (function () {
    var i = 0;
    return function () {
        i += 1;
        return 'Hupper-' + i;
    };
}());

/**
 * @class Elementer
 * @description Class to create and manipulate DOM elements
 * @constructor
 */
var Elementer = function (doc) {
    this.doc = doc;
    this.li = this.doc.createElement('li');
    this.ul = this.doc.createElement('ul');
    this.div = this.doc.createElement('div');
    this.span = this.doc.createElement('span');
    this.a = this.doc.createElement('a');
    this.img = this.doc.createElement('img');
    this.button = this.doc.createElement('button');
    this.GetBody();
    this.subscriptions = [];
};
Elementer.prototype = {
    /**
    * Creates an 'li' element
    * @return Li element
    * @type Element
    */
    Li: function () {
        return this.li.cloneNode(true);
    },
    /**
    * Creates an 'ul' element
    * @return Ul element
    * @type Element
    */
    Ul: function () {
        return this.ul.cloneNode(true);
    },
    /**
    * Creates an 'div' element
    * @return Div element
    * @type Element
    */
    Div: function () {
        return this.div.cloneNode(true);
    },
    /**
    * Creates an 'span' element
    * @return Span element
    * @type Element
    */
    Span: function () {
        return this.span.cloneNode(true);
    },
    /**
    * Creates an 'a' element
    * @return A element
    * @type Element
    */
    A: function () {
        return this.a.cloneNode(true);
    },
    /**
    * Creates an 'img' element
    * @param {String} src source of the image
    * @param {String} alt image alternate text
    * @return Img element
    * @type Element
    */
    Img: function (src, alt) {
        var img = this.img.cloneNode(true);
        img.setAttribute('src', src);
        img.setAttribute('alt', alt);
        return img;
    },
    /**
    * Creates a 'button' element
    * @return button element
    * @type Element
    */
    Btn: function (title, className) {
        var button = this.button.cloneNode(true);
        button.setAttribute('title', title);
        this.AddClass(button, className);
        return button;
    },
    /**
    * Creates a specified element
    * @param {String} el type of element
    * @return HTML element
    * @type Element
    */
    El: function (el) {
        var element;
        switch (el) {
        case 'h1':
            element = this.doc.createElement('h1');
            break;
        case 'h2':
            element = this.doc.createElement('h2');
            break;
        case 'h3':
            element = this.doc.createElement('h3');
            break;
        case 'h4':
            element = this.doc.createElement('h4');
            break;
        case 'h5':
            element = this.doc.createElement('h5');
            break;
        case 'h6':
            element = this.doc.createElement('h6');
            break;
        }
        return element;
    },
    /**
    * Creates a text element
    * @return Text element
    * @type Element
    */
    Txt: function (text) {
        return this.doc.createTextNode(text);
    },
    /**
    * Adds a child element
    * @param {Element} elem addable element
    * @param {Element} parent Element, where the new element will appended
    * @return Returns the element
    * @type {Element,Null}
    */
    Add: function (elem, parent) {
        if (parent && elem) {
            parent.appendChild(elem);
            return elem;
        }
        return null;
    },
    /**
      * Inserts an element before another element
      * @param {Element} elem insertable element
      * @param {Element} before element before the new elem will inserted
      * @return Returns the elem
      * @type Element
      */
    Insert: function (elem, before) {
        if (!before || !elem) {
            return;
        }
        before.parentNode.insertBefore(elem, before);
        return elem;
    },
    /**
      * Removes the specified element
      * @param {Element} elem removable childnode
      * @param {Element} parent
      */
    Remove: function (elem, parent) {
        if (!elem || !elem.parentNode) {
            return;
        }
        var el = elem.parentNode.removeChild(elem);
        el = null;
    },
    /**
    * Removes all childnode of the element
    * @param {Element} element
    */
    RemoveAll: function (element) {
        while (element && element.firstChild) {
            this.Remove(element.firstChild);
        }
    },
    Fragment: function () {
        return this.doc.createDocumentFragment();
    },
    /**
      * @param {Element} inner the new content element
      * @param {Element} obj updatable element
      */
    Update: function (inner, obj) {
        this.RemoveAll(obj);
        this.Add(inner, obj);
    },
    /**
      * Collects the elements by their tag name
      * @param {String} tag the elements tag name
      * @param {Element} [parent] parent element
      * @return An array which contains the elements with the given tagname
      * @type {Array}
      */
    GetTag: function (tag, parent) {
        if (parent && typeof parent === 'object') {
            return parent.getElementsByTagName(tag);
        }
        return this.doc.getElementsByTagName(tag);
    },
    /**
      * Returns the first matching tag
      * @see #GetTag
      * @param {String} tag the elements tag name
      * @param {Objecŧ} [parent] parent element
      * @return First element node or null
      * @type Element
      */
    GetFirstTag: function (tag, parent) {
        var tags = this.GetTag(tag, parent);
        return (tags.length) ? tags[0] : null;
    },
    /**
      * Returns the document body
      * @type Element
      */
    GetBody: function () {
        if (this.body) {
            return this.body;
        }
        this.body = this.doc.body;
        return this.body;
    },
    /**
      * Returns an element by it's id
      * @param {String} id Id of the element
      * @param {Element} [parent] parent element
      * @type Element
      */
    GetId: function (id, parent) {
        // if (!this.elements) {
        //   this.elements = new Object();
        // }
        var output;
        if (typeof parent === 'object' && parent.nodeType === 1) {
            output = parent.getElementById(id);
        } else if (typeof parent === 'undefined') {
            output = this.doc.getElementById(id);
        }
        return output;
    },
    /**
    * Adds the specified class to the element
    * @param {Element} el DOM element
    * @param {String} c Class name
    */
    AddClass: function (el, c) {
        if (!el || !c || this.HasClass(el, c)) {
            return false;
        }
        var scope = {}, curClass;
        Components.utils.import('resource://huppermodules/hupstringer.jsm', scope);
        curClass = el.getAttribute('class');
        if (curClass === null || scope.HupStringer.empty(curClass)) {
            el.setAttribute('class', c);
        } else {
            el.setAttribute('class', curClass + ' ' + c);
        }
    },
    /**
    * Removes the specified class from the element
    * @param {Element} el DOM element
    * @param {String} c Class name
    */
    RemoveClass: function (el, c) {
        if (!el || !c) {
            return false;
        }
        var cl =  new RegExp('\\b' + c + '\\b');
        el.setAttribute('class', el.getAttribute('class').replace(cl, ''));
    },
    /**
    * Checks that the element has the specified class or not
    * @param {Element} el Element
    * @param {String} c Class name
    * @type {Boolean}
    */
    HasClass: function (el, c) {
        if (!el || !c || !el.getAttribute) {
            return false;
        }
        var cl = new RegExp('\\b' + c + '\\b');
        return cl.test(el.getAttribute('class'));
    },
    /**
    * Adds or removes the specified class from the element
    * @param {Element} el DOM element
    * @param {String} c Class name
    */
    ToggleClass: function (el, c) {
        if (this.HasClass(el, c)) {
            this.RemoveClass(el, c);
        } else {
            this.AddClass(el, c);
        }
    },
    /**
    * Collects the elements, which has the specified className (cn) and
    * childNodes of the specified node (par)
    * @param {Element} par parent element node
    * @param {String} cn The className
    * @param {String} el element type
    * @param {Boolean} [force] if the par attribute is false|undefined change
    * the parent element to the body if the value of the variable is true
    * @return the elements which are childnodes of the parent and has the specified classname
    * @type {Array}
    */
    GetByClass: function (par, cn, el, force) {
        el = el ? el.toUpperCase() : '*';
        if (!par) {
            if (force === true) {
                par = this.GetBody();
            } else {
                return [];
            }
        }
        var out = [], ts, i, tsl;
        // try to use the native getElementsByClassName method
        if (this.doc.getElementsByClassName) {
            ts = Array.prototype.slice.call(par.getElementsByClassName(cn));
            return el === '*' ? ts : ts.filter(function (elem) {
                return elem.nodeName === el;
            });
        } else {
            ts = this.GetTag(el, par);
            for (i = 0, tsl = ts.length; i < tsl; i += 1) {
                if (this.HasClass(ts[i], cn)) {
                    out.push(ts[i]);
                }
            }
        }
        return out;
    },
    /**
    * @param {Element} par parent element node
    * @param {String} attr attribitue name
    * @param {String} [val] value of the attribute
    * @param {String} el element type
    * @param {Boolean} [force] if the par attribute is false|undefined change the parent element to the body if the value of the variable is true
    * @return the elements which are childnodes of the parent and has the specified attribute
    * @type Array
    */
    GetByAttrib: function (par, el, attr, val, force) {
        el = el ? el.toUpperCase() : el = '*';
        if (!par) {
            if (force === true) {
                par = this.GetBody();
            } else {
                return [];
            }
        }
        var out = [], ts, i, tsl;
        ts = this.GetTag(el, par);
        for (i = 0, tsl = ts.length; i < tsl; i += 1) {
            if (this.HasAttr(ts[i], attr, val)) {
                out.push(ts[i]);
            }
        }
        return out;
    },
    /**
    * @param {Element} el an element
    * @param {String} attr name of the attribute
    * @param {String} [val] value of the attribute
    * @returns true if the element has the attribute (if value specified the attribute value also checked)
    * @type {Boolean}
    */
    HasAttr: function (el, attr, val) {
        var a = el.getAttribute(attr);
        if (typeof val === 'string') {
            return (typeof a !== 'undefined' && a === val);
        } else {
            return (typeof a !== 'undefined');
        }
    },
    /**
    * @param {String} text link content
    * @param {String} [href] url of the link
    * @return link object
    * @type Element
    */
    CreateLink: function (text, href) {
        var l = this.A();
        if (href) {
            l.setAttribute('href', href);
        }
        this.Add(this.Txt(text), l);
        return l;
    },
    Hide: function (el) {
        this.AddClass(el, 'hup-hidden');
    },
    Show: function (el) {
        this.RemoveClass(el, 'hup-hidden');
    },
    subscribe: function (element, event, callback, capture) {
        if (!this.HasAttr(element, 'id')) {
            element.setAttribute('id', generateId());
        }
        capture = capture || false;
        var elementId = element.getAttribute('id'),
            subscription = {};

        element.addEventListener(event, callback, capture);
        this.subscriptions.push({
            element: element,
            event: event,
            callback: callback,
            capture: capture
        });
    },
    unsubscribe: function (element, event, callback, capture) {
        var callbacks, elementId, indexes, _this;
        if (typeof element !== 'undefined') {
            elementId = element.getAttribute('id');
            if (typeof event !== 'undefined') {
                indexes = [];
                _this = this;
                callbacks = this.subscriptions.forEach(function (cb, index) {
                    if (
                      (typeof element === 'undefined' || element === cb.element) &&
                      (typeof event === 'undefined' || event === cb.event) &&
                      (typeof callback === 'undefined' || callback === cb.callback) &&
                      (typeof capture === 'undefined' || capture === cb.capture)
                    ) {
                        indexes.push(index);
                    }
                });
                indexes.forEach(function (index) {
                    var cb = _this.subscriptions[elementId][event][index];
                    cb.element.removeEventListener(cb.event, cb.callback, cb.capture);
                    cb.element = null;
                    cb.event = null;
                    cb.callback = null;
                    cb.capture = null;
                    delete cb.element;
                    delete cb.event;
                    delete cb.callback;
                    delete cb.capture;
                    cb = null;
                    _this.subscriptions[elementId][event][index] = null;
                    delete _this.subscriptions[elementId][event][index];
                });
            }
        }
    },
    destroy: function () {
        this.doc = null;
        this.li = null;
        this.ul = null;
        this.div = null;
        this.span = null;
        this.a = null;
        this.img = null;
        this.button = null;
        this.body = null;
        this.unsubscribe();
    }
};

var EXPORTED_SYMBOLS = ['Elementer', 'generateId'];
