var TreeView = function () {
    var scope = {}, treeViewEvents, createView;
    Components.utils.import('resource://huppermodules/HupEvent.jsm', scope);
    treeViewEvents = new scope.HupEvent();
    var log = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
    return {
        treeView: function (data, element) {
            var treeView = {
                rowCount: data.length,
                getCellText: function (row, column) {
                    return data[row][column.id].text;
                },
                setCellText: function (row, column, text) {
                    data[row][column.id].text = text;
                    treeViewEvents.fireEvent('setCellText', {row: row, col: column, text: text});
                },
                setTree: function (treebox) {
                    this.treebox = treebox;
                },
                isContainer: function (row) {
                    return false;
                },
                isSeparator: function (row) {
                    return false;
                },
                isSorted: function () {
                    return false;
                },
                getLevel: function (row) {
                    return 0;
                },
                getImageSrc: function (row, col) {
                    return null;
                },
                isEditable: function (row, column) {
                    return !!data[row][column.id].editable;
                },
                isSelectable: function (row, column) {
                    var selectable = data[row][column.id].seltype;
                    return typeof selectable === 'boolean' ? selectable : true;
                },
                getParentIndex: function () {},
                cycleHeader: function (col, elem) {},
                getRowProperties: function (row, props) { return ''; },
                getCellProperties: function (row, col, props) {return ''; },
                performAction: function (action) {
                    log.logStringMessage('perform action: ' + action);
                },
                performActionOnrow: function (action, index) {
                    log.logStringMessage('perform action on row: ' + action, index);
                },
                performActionOnCell: function (action, index, column) {
                    log.logStringMessage('perform action on cell: ' + action, index, column);
                },
                getColumnProperties: function (colid, col, props) { return '' },
                get isEditing() {
                    log.logStringMessage('editing row: ', this.editingRow);
                    return this.editingRow > -1;
                }
            };
            element.view = treeView;
        },
        events: treeViewEvents
    };
};
let EXPORTED_SYMBOLS = ['TreeView'];
