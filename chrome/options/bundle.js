(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', './func'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('./func'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.func);
		global.dom = mod.exports;
	}
})(this, function (exports, _func) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.emptyText = exports.empty = exports.findCommonParent = exports.createElem = exports.remove = exports.is = exports.closest = exports.prev = exports.next = undefined;

	var func = _interopRequireWildcard(_func);

	function _interopRequireWildcard(obj) {
		if (obj && obj.__esModule) {
			return obj;
		} else {
			var newObj = {};

			if (obj != null) {
				for (var key in obj) {
					if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
				}
			}

			newObj.default = obj;
			return newObj;
		}
	}

	/**
  * @param HTMLDOMElement element
  * @param CSSSelector what
  * @return boolean
  */
	function is(element, what) {
		if (element.matches) {
			return element.matches(what);
		} else if (element.mozMatchesSelector) {
			return element.mozMatchesSelector(what);
		}
	}

	/**
  * @param element HTMLDOMElement
  * @param selector string
  * @param string sibling Use 'prev' if previous
  */
	function findSibling(element, selector, sibling) {
		var elem = element,
		    siblingName = sibling === 'prev' ? 'previousSibling' : 'nextSibling';

		while (elem && (elem.nodeType !== Node.ELEMENT_NODE || !is(elem, selector))) {
			elem = elem[siblingName];
		}

		return elem || null;
	}

	/**
  * @param element HTMLDOMElement
  * @param selector string
  */
	function next(element, selector) {
		return findSibling(element, selector);
	}

	/**
  * @param element HTMLDOMElement
  * @param selector string
  */
	function prev(element, selector) {
		return findSibling(element, selector, 'prev');
	}

	function closest(element, selector) {
		var elem = element.parentNode;

		while (elem && !is(elem, selector)) {
			elem = elem.parentNode;
		}

		return elem || null;
	}

	function remove(element) {
		return element.parentNode.removeChild(element);
	}

	function findCommonParent(elements) {
		var index, parent, maxIndex;

		elements = elements.filter(function (x) {
			return x !== null;
		});

		maxIndex = elements.length - 1;
		index = 0;
		parent = elements[index].parentNode;

		while (true) {
			if (index < maxIndex) {
				if (!parent.contains(elements[index + 1])) {
					parent = parent.parentNode;

					if (!parent) {
						// parent = null;
						break;
					}
				} else {
					index += 1;
				}
			} else {
				break;
			}
		}

		return parent;
	}

	function createElem(nodeType, attributes, classes, text) {
		var element = document.createElement(nodeType);

		if (attributes && attributes.length) {
			attributes.forEach(function (attrib) {
				element.setAttribute(attrib.name, attrib.value);
			});
		}

		if (classes && classes.length) {
			element.classList.add.apply(element.classList, classes);
		}

		if (text) {
			element.textContent = text;
		}

		return element;
	}

	function empty(element) {
		while (element.firstChild) {
			element.removeChild(element.firstChild);
		}
	}

	function emptyText(element) {
		func.toArray(element.childNodes).filter(function (node) {
			return node.nodeType === Node.TEXT_NODE;
		}).forEach(remove);
	}

	exports.next = next;
	exports.prev = prev;
	exports.closest = closest;
	exports.is = is;
	exports.remove = remove;
	exports.createElem = createElem;
	exports.findCommonParent = findCommonParent;
	exports.empty = empty;
	exports.emptyText = emptyText;
});

},{"./func":2}],2:[function(require,module,exports){
(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(["exports"], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports);
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports);
		global.func = mod.exports;
	}
})(this, function (exports) {
	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	function index(array, cb) {
		for (var i = 0, al = array.length; i < al; i++) {
			if (cb(array[i])) {
				return i;
			}
		}

		return -1;
	}

	function first(array, cb) {
		var i = index(array, cb);

		if (i > -1) {
			return array[i];
		}

		return null;
	}

	/*
  * @param NodeList list
  * @return {HTMLDOMElement[]}
  */
	function toArray(list) {
		return Array.prototype.slice.call(list);
	}

	function partial(func) {
		var pArgs = toArray(arguments).slice(1);

		return function () {
			func.apply(this, pArgs.concat(toArray(arguments)));
		};
	}

	exports.index = index;
	exports.first = first;
	exports.partial = partial;
	exports.toArray = toArray;
});

},{}],3:[function(require,module,exports){
(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports);
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports);
		global.pref = mod.exports;
	}
})(this, function (exports) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	/*jshint esnext:true*/
	/*global define, exports*/
	var prefs = Object.create(null, {
		getCleanHighlightedUsers: {
			value: function value() {
				return this.getPref('highlightusers').then(function (highlightusers) {
					return new Promise(function (resolve) {
						var value = void 0;
						if (highlightusers === null) {
							value = [];
						} else {
							value = highlightusers.split(',').filter(function (user) {
								return user.trim() !== '';
							}).map(function (user) {
								return user.split(':');
							}).filter(function (user) {
								return user.length === 2 && Boolean(user[0]) && Boolean(user[1]);
							}).map(function (user) {
								return {
									name: user[0],
									color: user[1]
								};
							});
						}

						resolve(value);
					});
				});
			}
		},

		getCleanTrolls: {
			value: function value() {
				return this.getPref('trolls').then(function (trolls) {
					return new Promise(function (resolve) {
						var value = void 0;
						if (trolls === null) {
							value = [];
						} else {
							value = trolls.split(',').filter(function (troll) {
								return troll.trim() !== '';
							});
						}

						resolve(value);
					});
				});
			}
		},

		getCleanTaxonomies: {
			value: function value() {
				return this.getPref('hidetaxonomy').then(function (taxonomies) {
					return new Promise(function (resolve) {
						var value = void 0;
						if (taxonomies === null) {
							value = [];
						} else {
							value = taxonomies.split(',').filter(function (taxonomy) {
								return taxonomy.trim() !== '';
							});
						}

						resolve(value);
					});
				});
			}
		}
	});

	exports.default = prefs;
});

},{}],4:[function(require,module,exports){
(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', './pref', './core/dom'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('./pref'), require('./core/dom'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.pref, global.dom);
		global.editHighlightedusers = mod.exports;
	}
})(this, function (exports, _pref, _dom) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.run = exports.tpl = undefined;

	var dom = _interopRequireWildcard(_dom);

	function _interopRequireWildcard(obj) {
		if (obj && obj.__esModule) {
			return obj;
		} else {
			var newObj = {};

			if (obj != null) {
				for (var key in obj) {
					if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
				}
			}

			newObj.default = obj;
			return newObj;
		}
	}

	var editHighlightedUsersTpl = '<h1>Edit highlighted users</h1>\n\t\t<form action="" method="" id="HighlightUserForm">\n\t\t\t<div class="field-group">\n\t\t\t\t<label for="HighlightedUserName">User name</label>\n\t\t\t\t<input type="text" name="userName" id="HighlightedUserName" required />\n\t\t\t</div>\n\t\t\t<div class="field-group">\n\t\t\t\t\t<label for="HighlightedUserColor">Highlight color</label>\n\t\t\t\t\t<input type="text" name="userColor" id="HighlightedUserColor" required />\n\t\t\t</div>\n\t\t\t<button type="submit">Add</button>\n\t\t</form>\n\n\t\t<table id="ListOfHighlightedUsers">\n\t\t\t<thead>\n\t\t\t\t<th>User name</th>\n\t\t\t\t<th>User color</th>\n\t\t\t\t<th>Delete user</th>\n\t\t\t</thead>\n\t\t\t<tbody></tbody>\n\t\t</table>';

	function editHighlightedUsers() {
		function getForm() {
			return document.getElementById('HighlightUserForm');
		}

		function getList() {
			return document.getElementById('ListOfHighlightedUsers').querySelector('tbody');
		}

		function getUserNameField() {
			return document.getElementById('HighlightedUserName');
		}

		function getUserColorField() {
			return document.getElementById('HighlightedUserColor');
		}

		function createHighlightedUserItem(user) {
			var tr = dom.createElem('tr');
			var userNameTd = dom.createElem('td', null, ['user-name'], user.name);
			var userColorTd = dom.createElem('td');

			var userColor = dom.createElem('span', null, ['user-color'], user.color.toLowerCase());
			var btnTd = dom.createElem('td', null, ['delete-user']);
			var button = dom.createElem('button', [{ name: 'type', value: 'button' }], ['delete-highlighted-users'], 'Delete');

			button.dataset.name = user.name;
			button.dataset.action = 'unhighlight';
			userColor.style.backgroundColor = user.color;

			btnTd.appendChild(button);
			userColorTd.appendChild(userColor);

			tr.appendChild(userNameTd);
			tr.appendChild(userColorTd);
			tr.appendChild(btnTd);

			return tr;
		}

		function addHighlightedUser(name) {
			var container = getList();
			container.appendChild(createHighlightedUserItem(name));
		}

		function drawUsers() {
			dom.empty(getList());

			_pref.prefs.getCleanHighlightedUsers().then(function (users) {
				users.forEach(addHighlightedUser);
			});
		}

		function getUsersString(users) {
			return users.filter(function (user) {
				return user && user.name && user.color;
			}).map(function (user) {
				return user.name + ':' + user.color;
			}).join(',');
		}

		getList().addEventListener('click', function (e) {
			var target = e.target;

			if (target.dataset.action === 'unhighlight') {
				(function () {
					var userName = target.dataset.name;
					_pref.prefs.getCleanHighlightedUsers().then(function (users) {
						var filteredUsers = users.filter(function (user) {
							return user.name !== userName;
						});
						_pref.prefs.setPref('highlightusers', getUsersString(filteredUsers));
						drawUsers();
					});
				})();
			}
		}, false);

		getForm().addEventListener('submit', function (e) {
			e.preventDefault();
			var user = {
				name: getUserNameField().value,
				color: getUserColorField().value
			};
			// prefs
			_pref.prefs.getCleanHighlightedUsers().then(function (users) {
				users.push(user);
				_pref.prefs.setPref('highlightusers', getUsersString(users));
				drawUsers();
			});
		});

		drawUsers();
	}

	exports.tpl = editHighlightedUsersTpl;
	exports.run = editHighlightedUsers;
});

},{"./core/dom":1,"./pref":7}],5:[function(require,module,exports){
(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', './pref', './edit-trolls'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('./pref'), require('./edit-trolls'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.pref, global.editTrolls);
		global.editTrolls = mod.exports;
	}
})(this, function (exports, _pref, _editTrolls) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.run = exports.tpl = undefined;

	var editTrolls = _interopRequireWildcard(_editTrolls);

	function _interopRequireWildcard(obj) {
		if (obj && obj.__esModule) {
			return obj;
		} else {
			var newObj = {};

			if (obj != null) {
				for (var key in obj) {
					if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
				}
			}

			newObj.default = obj;
			return newObj;
		}
	}

	/*jshint esnext:true*/
	/*global require, define*/
	var editTrollsTpl = '<h1>Edit trolls</h1>\n\n<form action="" method="" id="AddTrollForm">\n\t<div class="field-group">\n\t\t<label for="TrollName">Troll name</label>\n\t\t<input type="text" name="trollName" id="TrollName" />\n\t</div>\n\t<button type="submit">Add</button>\n</form>\n\n<table id="ListOfTrolls"><tbody></tbody></table>';

	function run() {
		function removeTroll(troll) {
			_pref.prefs.getCleanTrolls().then(function (trolls) {
				var filteredTrolls = trolls.filter(function (n) {
					return n !== troll;
				});
				_pref.prefs.setPref('trolls', filteredTrolls.join(','));
				editTrolls.drawTrolls(filteredTrolls);
			});
		}

		function addTroll(troll) {
			_pref.prefs.getCleanTrolls().then(function (trolls) {
				if (trolls.indexOf(troll) === -1) {
					trolls.push(troll);
					_pref.prefs.setPref('trolls', trolls.join(','));
					editTrolls.drawTrolls(trolls);
				}
			});
		}

		editTrolls.events.on('troll', function (name) {
			addTroll(name);
		});

		editTrolls.events.on('untroll', function (name) {
			removeTroll(name);
		});
		_pref.prefs.getCleanTrolls().then(function (trolls) {

			editTrolls.drawTrolls(trolls);
		});

		editTrolls.init();
	}

	exports.tpl = editTrollsTpl;
	exports.run = run;
});

},{"./edit-trolls":5,"./pref":7}],6:[function(require,module,exports){
(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['./pref', './core/dom', './core/func', './edit-highlightedusers', './edit-trolls'], factory);
	} else if (typeof exports !== "undefined") {
		factory(require('./pref'), require('./core/dom'), require('./core/func'), require('./edit-highlightedusers'), require('./edit-trolls'));
	} else {
		var mod = {
			exports: {}
		};
		factory(global.pref, global.dom, global.func, global.editHighlightedusers, global.editTrolls);
		global.main = mod.exports;
	}
})(this, function (_pref, _dom, _func, _editHighlightedusers, _editTrolls) {
	'use strict';

	var dom = _interopRequireWildcard(_dom);

	var func = _interopRequireWildcard(_func);

	var editHighlightedUsers = _interopRequireWildcard(_editHighlightedusers);

	var editTrolls = _interopRequireWildcard(_editTrolls);

	function _interopRequireWildcard(obj) {
		if (obj && obj.__esModule) {
			return obj;
		} else {
			var newObj = {};

			if (obj != null) {
				for (var key in obj) {
					if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
				}
			}

			newObj.default = obj;
			return newObj;
		}
	}

	function createControlGroup() {
		var div = dom.createElem('div');

		div.classList.add('control-group');

		return div;
	}

	function camelConcat() {
		return func.toArray(arguments).map(function (i) {
			return i[0].toUpperCase() + i.slice(1);
		}).join('');
	}

	function getElemId(item) {
		return camelConcat('Item', item.name);
	}

	function createInput(item) {
		var input = dom.createElem('input');

		input.dataset.type = item.type;
		input.name = item.name;
		input.id = getElemId(item);

		if (item.type === 'bool') {
			input.type = 'checkbox';
			input.value = '1';
			input.checked = item.value;
		} else {
			input.value = item.value;

			if (item.type === 'integer') {
				input.type = 'number';
			} else if (item.type === 'color') {
				input.type = 'color';
			} else {
				input.type = 'text';
			}
		}

		return input;
	}

	function createLabel(item) {
		var label = dom.createElem('label');
		label.textContent = item.title;
		label.setAttribute('for', getElemId(item));
		return label;
	}

	function createBr() {
		var br = dom.createElem('br');
		return br;
	}

	function composeGroup(item) {
		var fragment = document.createDocumentFragment();
		var input = createInput(item);
		var label = createLabel(item);
		var div = createControlGroup();

		if (item.type === 'bool') {
			div.appendChild(input);
			div.appendChild(label);
		} else {
			div.appendChild(label);
			div.appendChild(createBr());
			div.appendChild(input);
		}

		fragment.appendChild(div);

		return fragment;
	}

	function createControl(item) {
		var fragment = document.createDocumentFragment();
		var button = dom.createElem('button');
		var div = dom.createElem('div');

		button.type = 'button';
		button.id = 'control-' + item.name;
		button.textContent = item.title;
		button.dataset.type = item.type;

		div.appendChild(button);
		fragment.appendChild(div);
		return fragment;
	}

	function createPanel(options, html) {
		var div = dom.createElem('div');
		var close = dom.createElem('button');
		var panelContent = dom.createElem('div');

		panelContent.classList.add('panel-content');

		div.appendChild(panelContent);

		close.classList.add('close');
		close.setAttribute('type', 'button');
		close.appendChild(document.createTextNode('X'));

		div.classList.add('panel');

		if (options.id) {
			div.setAttribute('id', options.id);
		}

		panelContent.insertAdjacentHTML('afterbegin', html);
		div.insertBefore(close, div.firstChild);

		function closePanel() {
			div.addEventListener('transitionend', function removeDiv() {
				div.parentNode.removeChild(div);
				div.removeEventListener('transitionend', removeDiv);
			}, false);

			var panelBg = document.getElementById('panel-bg');
			panelBg.addEventListener('transitionend', function removePanel() {
				panelBg.parentNode.removeChild(panelBg);
				div.removeEventListener('transitionend', removePanel);
			}, false);

			div.classList.remove('show');
			panelBg.classList.remove('show');
		}

		close.addEventListener('click', function onClose() {
			close.removeEventListener('click', onClose);
			closePanel();
		});
		document.getElementById('panel-bg').addEventListener('click', function onClose() {
			document.getElementById('panel-bg').removeEventListener('click', onClose);
		});

		window.addEventListener('keyup', function c(ev) {
			if (ev.keyCode === 27) {
				if (!ev.target.matches('.panel input,.panel textarea,.panel select')) {
					closePanel();
					window.removeEventListener('keyup', c);
				}
			}
		}, false);

		return div;
	}

	function createPanelBg() {
		var div = dom.createElem('div');
		div.setAttribute('id', 'panel-bg');

		return div;
	}

	_pref.prefs.getAllPrefs().then(function (pref) {
		var msg = document.querySelector('#Messages');

		pref.forEach(function (x) {
			var elem = void 0;

			if (x.hidden) {
				return;
			}

			if (x.type === 'control') {
				elem = createControl(x);
			} else {
				elem = composeGroup(x);
			}

			if (elem) {
				msg.appendChild(elem);
			}
		});

		msg.addEventListener('change', function (e) {
			var target = e.target;
			var name = target.name;
			var type = target.dataset.type;
			var value = void 0;

			if (type === 'bool') {
				value = target.checked;
			} else if (['string', 'color'].indexOf(type) > -1) {
				value = target.value;
			} else if (type === 'integer') {
				value = parseInt(target.value, 10);
			} else {
				throw new Error('Unkown type');
			}

			_pref.prefs.setPref(name, value);
		}, false);

		msg.addEventListener('click', function (e) {
			var target = e.target;

			if (target.dataset.type === 'control') {
				(function () {

					var id = 'panel-' + target.id;
					var panel = document.getElementById(id);
					var panelBg = document.getElementById('panel-bg');

					var html = void 0;

					if (target.id === 'control-edithighlightusers') {
						html = editHighlightedUsers.tpl;
					} else if (target.id === 'control-edittrolls') {
						html = editTrolls.tpl;
					}

					if (!panelBg) {
						panelBg = createPanelBg();
						document.body.appendChild(panelBg);
					}

					if (!panel) {
						panel = createPanel({ id: id }, html);
					}

					document.body.appendChild(panel);
					panel.querySelector('input').focus();
					setTimeout(function () {
						panelBg.classList.add('show');
						setTimeout(function () {
							panel.classList.add('show');

							if (target.id === 'control-edithighlightusers') {
								editHighlightedUsers.run();
							} else if (target.id === 'control-edittrolls') {
								editTrolls.run();
							}
						}, 10);
					}, 10);
				})();
			}
		});
	});
});

},{"./core/dom":1,"./core/func":2,"./edit-highlightedusers":4,"./edit-trolls":5,"./pref":7}],7:[function(require,module,exports){
(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', './core/pref', './core/func'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('./core/pref'), require('./core/func'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.pref, global.func);
		global.pref = mod.exports;
	}
})(this, function (exports, _pref, _func) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.prefs = undefined;

	var corePrefs = _interopRequireWildcard(_pref);

	var func = _interopRequireWildcard(_func);

	function _interopRequireWildcard(obj) {
		if (obj && obj.__esModule) {
			return obj;
		} else {
			var newObj = {};

			if (obj != null) {
				for (var key in obj) {
					if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
				}
			}

			newObj.default = obj;
			return newObj;
		}
	}

	var _slicedToArray = function () {
		function sliceIterator(arr, i) {
			var _arr = [];
			var _n = true;
			var _d = false;
			var _e = undefined;

			try {
				for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
					_arr.push(_s.value);

					if (i && _arr.length === i) break;
				}
			} catch (err) {
				_d = true;
				_e = err;
			} finally {
				try {
					if (!_n && _i["return"]) _i["return"]();
				} finally {
					if (_d) throw _e;
				}
			}

			return _arr;
		}

		return function (arr, i) {
			if (Array.isArray(arr)) {
				return arr;
			} else if (Symbol.iterator in Object(arr)) {
				return sliceIterator(arr, i);
			} else {
				throw new TypeError("Invalid attempt to destructure non-iterable instance");
			}
		};
	}();

	var defaultPrefs = [{
		'name': 'replacenewcommenttext',
		'title': 'Replace the \"új\" text of new comments to a better searchable one',
		'type': 'bool',
		'value': true
	}, {
		'name': 'newcommenttext',
		'title': 'The text to show instead of \"új\"',
		'type': 'string',
		'value': '[new]'
	}, {
		'name': 'filtertrolls',
		'title': 'Enable trollfilter',
		'type': 'bool',
		'value': true
	}, {
		'name': 'edittrolls',
		'title': 'Edit trolls',
		'label': 'Click to edit trolls',
		'type': 'control'
	}, {
		'name': 'trolls',
		'title': 'List of trolls',
		'type': 'string',
		'value': '',
		'hidden': true
	}, {
		'name': 'huppercolor',
		'title': 'Default highlighted user\'s comment header color',
		'type': 'color',
		'value': '#B5D7BE'
	}, {
		'name': 'edithighlightusers',
		'title': 'Edit highlighted users',
		'label': 'Click to edit highlighted users',
		'type': 'control'
	}, {
		'name': 'highlightusers',
		'title': 'Highlight comments of the users',
		'type': 'string',
		'value': 'username:#fff999,username2:#999fff',
		'hidden': true
	}, {
		'name': 'hidetaxonomy',
		'title': 'Hidable article types',
		'type': 'string',
		'value': ''
	}, {
		'name': 'blocks',
		'title': 'Block settings',
		'type': 'string',
		'value': '{}',
		'hidden': true
	}, {
		'name': 'parseblocks',
		'title': 'Parse blocks',
		'type': 'bool',
		'value': true
	}, {
		'name': 'style_accessibility',
		'title': 'Load accessibility styles',
		'type': 'bool',
		'value': true
	}, {
		'name': 'style_wider_sidebar',
		'title': 'Width of sidebars',
		'type': 'integer',
		'value': 0
	}, {
		'name': 'style_min_fontsize',
		'title': 'Minimum font size',
		'type': 'integer',
		'value': 0
	}, {
		'name': 'style_hide_left_sidebar',
		'title': 'Hide left sidebar',
		'type': 'bool',
		'value': false
	}, {
		'name': 'style_hide_right_sidebar',
		'title': 'Hide right sidebar',
		'type': 'bool',
		'value': false
	}, {
		'name': 'hideboringcomments',
		'title': 'Hide boring comments',
		'type': 'bool',
		'value': true
	}, {
		'name': 'boringcommentcontents',
		'title': 'Regular expression to identify boring comments',
		'type': 'string',
		'value': '^([-_]|-1|\\\\+1)$'
	}, {
		'name': 'setunlimitedlinks',
		'title': 'Show as many comments as possible on a page',
		'type': 'bool',
		'value': true
	}];

	function storage() {
		return chrome.storage.sync || chrome.storage.local;
	}

	function createDefaultPrefs() {
		return Promise.all(defaultPrefs.map(function (pref) {
			return new Promise(function (resolve) {
				storage().get(pref.name, function (result) {
					if (typeof result[pref.name] === 'undefined') {
						// storage().set(value);
						resolve([pref.name, pref.value]);
					} else {
						resolve(null);
					}
				});
			});
		})).then(function (values) {
			var saveObj = values.reduce(function (prev, curr) {
				if (curr !== null) {
					var _curr = _slicedToArray(curr, 2);

					var name = _curr[0];
					var value = _curr[1];

					if (typeof value === 'undefined') {
						value = ':noSuchValue';
					}
					prev[name] = value;
				}
				return prev;
			}, {});

			return new Promise(function (resolve) {
				storage().set(saveObj, function () {
					resolve();
				});
			});
		});
		/* */
	}

	var events = function () {
		var listeners = new Map();
		return {
			on: function on(name, cb) {
				if (!listeners.has(name)) {
					listeners.set(name, []);
				}

				listeners.get(name).push(cb);
			},
			off: function off(name, cb) {
				if (listeners.get(name)) {
					for (var i = 0, ll = listeners.get(name).length; i < ll; i++) {
						if (listeners.get(name)[i] === cb) {
							listeners.get(name)[i] = null;
						}
					}

					listeners.set(name, listeners[name].filter(function (listener) {
						return listener !== null;
					}));
				}
			},
			emit: function emit(name, args) {
				if (listeners.get(name)) {
					listeners.get(name).forEach(function (cb) {
						cb(args);
					});
				}
			}
		};
	}();

	function validateType(prefType, value) {
		var isValid = false;

		switch (prefType) {
			case 'string':
				isValid = typeof value === 'string';
				break;
			case 'bool':
				isValid = typeof value === 'boolean';
				break;
			case 'integer':
				isValid = typeof value === 'number';
				break;
			case 'color':
				isValid = typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
				break;
			default:
				isValid = true;
				console.info('Unknown type %s', prefType);
				break;
		}

		return isValid;
	}

	function findPref(pref) {
		return new Promise(function (resolve) {
			storage().get(pref, function (results) {
				if (typeof results[pref] !== 'undefined') {
					resolve(results[pref]);
				} else {
					resolve(null);
				}
			});
		});
	}

	function savePref(pref, value) {
		return new Promise(function (resolve) {
			var item = func.first(defaultPrefs, function (item) {
				return item.name === pref;
			});

			if (item) {
				if (validateType(item.type, value)) {
					var newValue = Object.create(null);
					newValue[pref] = value;
					storage().set(newValue);
					resolve();
				} else {
					throw new Error('Pref: ' + pref + ' value is not valid type for: ' + item.type);
				}
			} else {
				throw new Error('Pref: ' + pref + ' not found');
			}
		});
	}

	createDefaultPrefs();

	var prefs = exports.prefs = Object.create(corePrefs, {
		setPref: {
			value: function value(pref, _value) {
				savePref(pref, _value).catch(function (err) {
					throw err;
				});
			}
		},

		getPref: {
			value: function value(pref) {
				return findPref(pref).catch(function (err) {
					throw err;
				});
			}
		},

		getAllPrefs: {
			value: function value() {
				return Promise.all(defaultPrefs.map(function (pref) {
					return findPref(pref.name).then(function (value) {
						var output = Object.create(null);
						output.name = pref.name;
						output.title = pref.title;
						output.type = pref.type;
						output.hidden = pref.hidden;
						output.value = value;

						return new Promise(function (resolve) {
							resolve(output);
						});
					});
				}));
			}
		},
		on: events.on
	});
});

},{"./core/func":2,"./core/pref":3}]},{},[6]);
