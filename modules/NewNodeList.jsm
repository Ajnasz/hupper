function NewNodeList() {
    this.nodes = [];
    this.current = -1;
    this.length = 0;
}
NewNodeList.prototype = {
    add: function (nodeIndex) {
        this.nodes.push(nodeIndex);
        if (this.current === -1) {
            this.current = 0;
        }
        this.length += 1;
    },
    hasItem: function () {
        return this.current !== -1;
    },
    checkHasItem: function () {
        if (!this.hasItem()) {
            throw new TypeError('No current is defined');
        }
    },
    isOnLastItem: function () {
        return this.current === this.nodes.length - 1;
    },
    isOnFirstItem: function () {
        return this.current === 0;
    },
    getIndexOf: function (nodeIndex) {
        this.checkHasItem();
        return this.nodes.indexOf(nodeIndex);
    },
    setCurrent: function (id) {
        this.checkHasItem();
        this.current = id;
    },
    getCurrent: function () {
        this.checkHasItem();
        return this.nodes[this.current];
    },
    getFirst: function () {
        this.checkHasItem();
        return this.nodes[0];
    },
    getLast: function () {
        this.checkHasItem();
        return this.nodes[this.nodes.length - 1];
    },
    getNext: function () {
        this.checkHasItem();
        // currently on the last, return the first
        if (!this.isOnLastItem()) {
            return this.nodes[this.current + 1];
        }
        return null;
    },
    getPrevious: function () {
        this.checkHasItem();
        if (!this.isOnFirstItem()) {
            return this.nodes[this.current - 1];
        }
        return null;
    },
    goToEnd: function () {
        this.current = this.nodes.length - 1;
    },
    goToBegin: function () {
        this.current = 0;
    },
    next: function () {
        this.checkHasItem();
        if (this.isOnLastItem()) {
            return false;
        }
        this.current += 1;
    },
    previous: function () {
        this.checkHasItem();
        if (this.isOnFirstItem()) {
            return false;
        }
        this.current -= 1;
    },
    destroy: function () {
        this.nodes = null;
        delete this.nodes;
        this.current = null;
    }
};

var EXPORTED_SYMBOLS = ['NewNodeList'];
