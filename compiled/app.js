
(function(/*! Stitch !*/) {
  if (!this.require) {
    var modules = {}, cache = {}, require = function(name, root) {
      var path = expand(root, name), module = cache[path], fn;
      if (module) {
        return module.exports;
      } else if (fn = modules[path] || modules[path = expand(path, './index')]) {
        module = {id: path, exports: {}};
        try {
          cache[path] = module;
          fn(module.exports, function(name) {
            return require(name, dirname(path));
          }, module);
          return module.exports;
        } catch (err) {
          delete cache[path];
          throw err;
        }
      } else {
        throw 'module \'' + name + '\' not found';
      }
    }, expand = function(root, name) {
      var results = [], parts, part;
      if (/^\.\.?(\/|$)/.test(name)) {
        parts = [root, name].join('/').split('/');
      } else {
        parts = name.split('/');
      }
      for (var i = 0, length = parts.length; i < length; i++) {
        part = parts[i];
        if (part == '..') {
          results.pop();
        } else if (part != '.' && part != '') {
          results.push(part);
        }
      }
      return results.join('/');
    }, dirname = function(path) {
      return path.split('/').slice(0, -1).join('/');
    };
    this.require = function(name) {
      return require(name, '');
    }
    this.require.define = function(bundle) {
      for (var key in bundle)
        modules[key] = bundle[key];
    };
  }
  return this.require.define;
}).call(this)({"Selection": function(exports, require, module) {(function() {
  var Selection;

  module.exports = Selection = new ((function() {
    function _Class() {}

    _Class.prototype.get = function() {
      var range, selection;
      selection = window.getSelection();
      if (selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
        return range;
      } else {
        return null;
      }
    };

    _Class.prototype.set = function(range) {
      var host, selection;
      selection = window.getSelection();
      if (range == null) {
        this.focusBody();
        return selection.removeAllRanges();
      } else {
        host = this.findEditingHost(range.commonAncestorContainer);
        if (host != null) {
          host.focus();
        }
        selection.removeAllRanges();
        return selection.addRange(range);
      }
    };

    _Class.prototype.getHost = function() {
      var selectedRange;
      selectedRange = this.get();
      if (!selectedRange) {
        return null;
      }
      return this.findEditingHost(selectedRange.commonAncestorContainer);
    };

    _Class.prototype.beforeSelection = function() {
      var beforeSelection, host, selectedRange;
      selectedRange = this.get();
      if (!selectedRange) {
        return null;
      }
      host = this.getHost();
      beforeSelection = document.createRange();
      beforeSelection.selectNodeContents(host);
      beforeSelection.setEnd(selectedRange.startContainer, selectedRange.startOffset);
      return beforeSelection;
    };

    _Class.prototype.afterSelection = function() {
      var afterSelection, host, selectedRange;
      selectedRange = this.get();
      if (!selectedRange) {
        return null;
      }
      host = this.getHost();
      afterSelection = document.createRange();
      afterSelection.selectNodeContents(host);
      afterSelection.setStart(selectedRange.endContainer, selectedRange.endOffset);
      return afterSelection;
    };

    _Class.prototype.isAtStart = function() {
      var _ref;
      if (!((_ref = this.get()) != null ? _ref.collapsed : void 0)) {
        return false;
      }
      return this.beforeSelection().toString() === "";
    };

    _Class.prototype.isAtEnd = function() {
      var _ref;
      if (!((_ref = this.get()) != null ? _ref.collapsed : void 0)) {
        return false;
      }
      return this.afterSelection().toString() === "";
    };

    _Class.prototype.setAtStart = function(el) {
      var range;
      range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(true);
      return this.set(range);
    };

    _Class.prototype.setAtEnd = function(el) {
      var range;
      range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      return this.set(range);
    };

    _Class.prototype.setAll = function(el) {
      var range;
      range = document.createRange();
      range.selectNodeContents(el);
      return this.set(range);
    };

    _Class.prototype.focusBody = function() {
      var body;
      body = document.body;
      if (!body.hasAttribute("tabindex")) {
        body.setAttribute("tabindex", "0");
      }
      return body.focus();
    };

    _Class.prototype.findEditingHost = function(node) {
      if (node == null) {
        return null;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return this.findEditingHost(node.parentNode);
      }
      if (!node.isContentEditable) {
        return null;
      }
      if (!node.parentNode.isContentEditable) {
        return node;
      }
      return this.findEditingHost(node.parentNode);
    };

    return _Class;

  })());

}).call(this);
}, "UI": function(exports, require, module) {(function() {
  var Selection, UI,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Selection = require("./Selection");

  window.UI = UI = new ((function() {
    function _Class() {
      this.handleWindowMouseUp = __bind(this.handleWindowMouseUp, this);
      this.handleWindowMouseMove = __bind(this.handleWindowMouseMove, this);
      this.dragging = null;
      this.autofocus = null;
      this.activeTransclusionDropView = null;
      this.registerEvents();
    }

    _Class.prototype.registerEvents = function() {
      window.addEventListener("mousemove", this.handleWindowMouseMove);
      return window.addEventListener("mouseup", this.handleWindowMouseUp);
    };

    _Class.prototype.preventDefault = function(e) {
      e.preventDefault();
      return Selection.set(null);
    };

    _Class.prototype.handleWindowMouseMove = function(e) {
      var _ref;
      this.mousePosition = {
        x: e.clientX,
        y: e.clientY
      };
      return (_ref = this.dragging) != null ? typeof _ref.onMove === "function" ? _ref.onMove(e) : void 0 : void 0;
    };

    _Class.prototype.handleWindowMouseUp = function(e) {
      var _ref;
      if ((_ref = this.dragging) != null) {
        if (typeof _ref.onUp === "function") {
          _ref.onUp(e);
        }
      }
      return this.dragging = null;
    };

    _Class.prototype.getElementUnderMouse = function() {
      var draggingOverlayEl, el;
      draggingOverlayEl = document.querySelector(".draggingOverlay");
      if (draggingOverlayEl != null) {
        draggingOverlayEl.style.pointerEvents = "none";
      }
      el = document.elementFromPoint(this.mousePosition.x, this.mousePosition.y);
      if (draggingOverlayEl != null) {
        draggingOverlayEl.style.pointerEvents = "";
      }
      return el;
    };

    _Class.prototype.getViewUnderMouse = function() {
      var el;
      el = this.getElementUnderMouse();
      el = el != null ? el.closest(function(el) {
        return el.dataFor != null;
      }) : void 0;
      return el != null ? el.dataFor : void 0;
    };

    _Class.prototype.setAutoFocus = function(opts) {
      if (opts.descendantOf == null) {
        opts.descendantOf = [];
      }
      if (!_.isArray(opts.descendantOf)) {
        opts.descendantOf = [opts.descendantOf];
      }
      if (opts.props == null) {
        opts.props = {};
      }
      if (opts.location == null) {
        opts.location = "end";
      }
      return this.autofocus = opts;
    };

    _Class.prototype.attemptAutoFocus = function(textFieldView) {
      var el, matchesDescendantOf, matchesProps;
      if (!this.autofocus) {
        return;
      }
      matchesDescendantOf = _.every(this.autofocus.descendantOf, (function(_this) {
        return function(ancestorView) {
          return textFieldView.lookupView(ancestorView);
        };
      })(this));
      if (!matchesDescendantOf) {
        return;
      }
      matchesProps = _.every(this.autofocus.props, (function(_this) {
        return function(propValue, propName) {
          return textFieldView.lookup(propName) === propValue;
        };
      })(this));
      if (!matchesProps) {
        return;
      }
      el = textFieldView.getDOMNode();
      if (this.autofocus.location === "start") {
        Selection.setAtStart(el);
      } else if (this.autofocus.location === "end") {
        Selection.setAtEnd(el);
      }
      return this.autofocus = null;
    };

    return _Class;

  })());

}).call(this);
}, "compile/compile": function(exports, require, module) {(function() {
  var compile, compileLine, compileWord, compileWordList;

  module.exports = compile = function(program) {
    var line, result, _i, _len, _ref;
    result = [];
    result.push("var that = 0;");
    _ref = program.lines;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      line = _ref[_i];
      result.push(compileLine(line));
    }
    return result.join("\n");
  };

  compileLine = function(line) {
    var lineId, s, wordList;
    lineId = C.id(line);
    s = "var " + lineId + " = that = ";
    wordList = line.wordList.effectiveWordList();
    if (!wordList) {
      s += "that";
    } else {
      s += compileWordList(wordList);
    }
    s += ";";
    return s;
  };

  compileWordList = function(wordList) {
    var result;
    result = _.map(wordList.words, compileWord);
    return result.join(" ");
  };

  compileWord = function(word) {
    if (word instanceof C.Op) {
      return word.opString;
    } else if (word instanceof C.That) {
      return "that";
    } else if (word instanceof C.Param) {
      return "" + word.value();
    }
  };

}).call(this);
}, "config": function(exports, require, module) {(function() {
  var config;

  window.config = config = {
    cursor: {
      text: "text",
      grab: "-webkit-grab",
      grabbing: "-webkit-grabbing",
      verticalScrub: "ns-resize",
      horizontalScrub: "ew-resize"
    }
  };

}).call(this);
}, "main": function(exports, require, module) {(function() {
  var editor, eventName, json, refresh, refreshView, saveState, storageName, willRefreshNextFrame, _i, _len, _ref;

  require("./config");

  require("./util/util");

  require("./model/C");

  require("./view/R");

  require("./UI");

  storageName = "spaceShaderTyper";

  window.reset = function() {
    delete window.localStorage[storageName];
    return location.reload();
  };

  if (json = window.localStorage[storageName]) {
    json = JSON.parse(json);
    window.editor = editor = C.reconstruct(json);
  } else {
    window.editor = editor = new C.Editor();
  }

  saveState = function() {
    json = C.deconstruct(editor);
    json = JSON.stringify(json);
    return window.localStorage[storageName] = json;
  };

  willRefreshNextFrame = false;

  refresh = function() {
    if (willRefreshNextFrame) {
      return;
    }
    willRefreshNextFrame = true;
    return requestAnimationFrame(function() {
      refreshView();
      saveState();
      return willRefreshNextFrame = false;
    });
  };

  refreshView = function() {
    var editorEl;
    editorEl = document.querySelector("#editor");
    return React.renderComponent(R.EditorView({
      editor: editor
    }), editorEl);
  };

  _ref = ["mousedown", "mousemove", "mouseup", "keydown", "scroll", "change"];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    eventName = _ref[_i];
    window.addEventListener(eventName, refresh);
  }

  refresh();

  document.styleSheets.start_autoreload(1000);

}).call(this);
}, "model/C": function(exports, require, module) {(function() {
  var C, className, constructor,
    __hasProp = {}.hasOwnProperty;

  window.C = C = {};

  require("./model");

  for (className in C) {
    if (!__hasProp.call(C, className)) continue;
    constructor = C[className];
    constructor.prototype.__className = className;
  }

  C._idCounter = 0;

  C._assignId = function(obj) {
    var id;
    this._idCounter++;
    id = "id" + this._idCounter + Date.now() + Math.floor(1e9 * Math.random());
    return obj.__id = id;
  };

  C.id = function(obj) {
    var _ref;
    return (_ref = obj.__id) != null ? _ref : C._assignId(obj);
  };

  C.deconstruct = function(object) {
    var objects, root, serialize;
    objects = {};
    serialize = (function(_this) {
      return function(object, force) {
        var entry, id, key, result, value, _i, _len;
        if (force == null) {
          force = false;
        }
        if (!force && object.__className) {
          id = C.id(object);
          if (!objects[id]) {
            objects[id] = serialize(object, true);
          }
          return {
            __ref: id
          };
        }
        if (_.isArray(object)) {
          result = [];
          for (_i = 0, _len = object.length; _i < _len; _i++) {
            entry = object[_i];
            result.push(serialize(entry));
          }
          return result;
        }
        if (_.isObject(object)) {
          result = {};
          for (key in object) {
            if (!__hasProp.call(object, key)) continue;
            value = object[key];
            result[key] = serialize(value);
          }
          if (object.__className) {
            result.__className = object.__className;
          }
          return result;
        }
        return object != null ? object : null;
      };
    })(this);
    root = serialize(object);
    return {
      objects: objects,
      root: root
    };
  };

  C.reconstruct = function(_arg) {
    var constructObject, constructedObjects, derefObject, id, object, objects, root;
    objects = _arg.objects, root = _arg.root;
    constructedObjects = {};
    constructObject = (function(_this) {
      return function(object) {
        var classConstructor, constructedObject, key, value;
        className = object.__className;
        classConstructor = C[className];
        constructedObject = new classConstructor();
        for (key in object) {
          if (!__hasProp.call(object, key)) continue;
          value = object[key];
          if (key === "__className") {
            continue;
          }
          constructedObject[key] = value;
        }
        return constructedObject;
      };
    })(this);
    for (id in objects) {
      if (!__hasProp.call(objects, id)) continue;
      object = objects[id];
      constructedObjects[id] = constructObject(object);
    }
    derefObject = (function(_this) {
      return function(object) {
        var key, value, _results;
        if (!_.isObject(object)) {
          return;
        }
        _results = [];
        for (key in object) {
          if (!__hasProp.call(object, key)) continue;
          value = object[key];
          if (id = value != null ? value.__ref : void 0) {
            _results.push(object[key] = constructedObjects[id]);
          } else {
            _results.push(derefObject(value));
          }
        }
        return _results;
      };
    })(this);
    for (id in constructedObjects) {
      if (!__hasProp.call(constructedObjects, id)) continue;
      object = constructedObjects[id];
      derefObject(object);
    }
    return constructedObjects[root.__ref];
  };

}).call(this);
}, "model/model": function(exports, require, module) {(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  C.Word = (function() {
    function Word() {}

    Word.prototype.effectiveWord = function() {
      return this;
    };

    return Word;

  })();

  C.Param = (function(_super) {
    __extends(Param, _super);

    function Param(valueString, label) {
      this.valueString = valueString != null ? valueString : "0";
      this.label = label != null ? label : "";
    }

    Param.prototype.value = function() {
      var number;
      number = parseFloat(this.valueString);
      if (_.isNaN(number) || !_.isFinite(number)) {
        return 0;
      }
      return number;
    };

    return Param;

  })(C.Word);

  C.Op = (function(_super) {
    __extends(Op, _super);

    function Op(opString) {
      this.opString = opString != null ? opString : "+";
    }

    return Op;

  })(C.Word);

  C.That = (function(_super) {
    __extends(That, _super);

    function That() {}

    return That;

  })(C.Word);

  C.Placeholder = (function(_super) {
    __extends(Placeholder, _super);

    function Placeholder(string) {
      this.string = string != null ? string : "";
    }

    Placeholder.prototype.convert = function() {
      var string;
      string = this.string.trim();
      if (string === "that") {
        return new C.That();
      } else if (_.contains(["+", "-", "*", "/"], string)) {
        return new C.Op(string);
      } else if (/[0-9]/.test(string)) {
        return new C.Param(string);
      } else if (/:$/.test(string)) {
        return new C.Param("", string.slice(0, -1));
      } else {
        return this;
      }
    };

    Placeholder.prototype.effectiveWord = function() {
      return null;
    };

    return Placeholder;

  })(C.Word);

  C.Parens = (function(_super) {
    __extends(Parens, _super);

    function Parens() {
      this.wordList = new C.WordList();
    }

    return Parens;

  })(C.Word);

  C.Application = (function(_super) {
    __extends(Application, _super);

    function Application() {
      this.fn = null;
      this.params = [];
    }

    return Application;

  })(C.Word);

  C.WordList = (function() {
    function WordList(words) {
      this.words = words != null ? words : [];
    }

    WordList.prototype.splice = function() {
      var args, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (_ref = this.words).splice.apply(_ref, args);
    };

    WordList.prototype.isEmpty = function() {
      return this.words.length === 0;
    };

    WordList.prototype.effectiveWordList = function() {
      var lookingForOp, word, wordIsOp, words, _i, _len, _ref;
      words = [];
      lookingForOp = false;
      _ref = this.words;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        word = _ref[_i];
        word = word.effectiveWord();
        if (!word) {
          continue;
        }
        wordIsOp = word instanceof C.Op;
        if (wordIsOp === lookingForOp) {
          words.push(word);
          lookingForOp = !lookingForOp;
        }
      }
      if (_.last(words) instanceof C.Op) {
        words = _.initial(words);
      }
      if (words.length === 0) {
        return null;
      }
      return new C.WordList(words);
    };

    return WordList;

  })();

  C.Line = (function() {
    function Line() {
      this.wordList = new C.WordList();
    }

    return Line;

  })();

  C.Program = (function() {
    function Program() {
      this.lines = [new C.Line()];
    }

    return Program;

  })();

  C.Editor = (function() {
    function Editor() {
      this.programs = [new C.Program()];
    }

    return Editor;

  })();

}).call(this);
}, "util/util": function(exports, require, module) {(function() {
  var util, _base, _ref, _ref1;

  window.util = util = {};

  _.concatMap = function(array, fn) {
    return _.flatten(_.map(array, fn), true);
  };

  if ((_base = Element.prototype).matches == null) {
    _base.matches = (_ref = (_ref1 = Element.prototype.webkitMatchesSelector) != null ? _ref1 : Element.prototype.mozMatchesSelector) != null ? _ref : Element.prototype.oMatchesSelector;
  }

  Element.prototype.closest = function(selector) {
    var fn, parent;
    if (_.isString(selector)) {
      fn = function(el) {
        return el.matches(selector);
      };
    } else {
      fn = selector;
    }
    if (fn(this)) {
      return this;
    } else {
      parent = this.parentNode;
      if ((parent != null) && parent.nodeType === Node.ELEMENT_NODE) {
        return parent.closest(fn);
      } else {
        return void 0;
      }
    }
  };

  Element.prototype.getMarginRect = function() {
    var rect, result, style;
    rect = this.getBoundingClientRect();
    style = window.getComputedStyle(this);
    result = {
      top: rect.top - parseInt(style["margin-top"], 10),
      left: rect.left - parseInt(style["margin-left"], 10),
      bottom: rect.bottom + parseInt(style["margin-bottom"], 10),
      right: rect.right + parseInt(style["margin-right"], 10)
    };
    result.width = result.right - result.left;
    result.height = result.bottom - result.top;
    return result;
  };

  util.formatFloat = function(value, precision) {
    var s;
    if (precision == null) {
      precision = 6;
    }
    s = value.toFixed(precision);
    if (s.indexOf(".") !== -1) {
      s = s.replace(/\.?0*$/, "");
    }
    if (s === "-0") {
      s = "0";
    }
    return s;
  };

  util.onceDragConsummated = function(downEvent, callback, notConsummatedCallback) {
    var consummated, handleMove, handleUp, originalX, originalY, removeListeners;
    if (notConsummatedCallback == null) {
      notConsummatedCallback = null;
    }
    consummated = false;
    originalX = downEvent.clientX;
    originalY = downEvent.clientY;
    handleMove = function(moveEvent) {
      var d, dx, dy;
      dx = moveEvent.clientX - originalX;
      dy = moveEvent.clientY - originalY;
      d = Math.max(Math.abs(dx), Math.abs(dy));
      if (d > 3) {
        consummated = true;
        removeListeners();
        return typeof callback === "function" ? callback(moveEvent) : void 0;
      }
    };
    handleUp = function(upEvent) {
      if (!consummated) {
        if (typeof notConsummatedCallback === "function") {
          notConsummatedCallback(upEvent);
        }
      }
      return removeListeners();
    };
    removeListeners = function() {
      window.removeEventListener("mousemove", handleMove);
      return window.removeEventListener("mouseup", handleUp);
    };
    window.addEventListener("mousemove", handleMove);
    return window.addEventListener("mouseup", handleUp);
  };

}).call(this);
}, "view/DraggingView": function(exports, require, module) {(function() {
  R.create("DraggingView", {
    render: function() {
      var _ref;
      return R.div({}, ((_ref = UI.dragging) != null ? _ref.render : void 0) ? R.div({
        className: "draggingObject",
        style: {
          left: UI.mousePosition.x - UI.dragging.offset.x,
          top: UI.mousePosition.y - UI.dragging.offset.y
        }
      }, UI.dragging.render()) : void 0, UI.dragging ? R.div({
        className: "draggingOverlay"
      }) : void 0);
    }
  });

}).call(this);
}, "view/EditorView": function(exports, require, module) {(function() {
  R.create("EditorView", {
    propTypes: {
      editor: C.Editor
    },
    cursor: function() {
      var _ref, _ref1;
      return (_ref = (_ref1 = UI.dragging) != null ? _ref1.cursor : void 0) != null ? _ref : "";
    },
    render: function() {
      return R.div({
        className: "editor",
        style: {
          cursor: this.cursor()
        }
      }, R.ProgramView({
        program: this.editor.programs[0]
      }), R.div({
        className: "dragging"
      }, R.DraggingView({})));
    }
  });

}).call(this);
}, "view/LineView": function(exports, require, module) {(function() {
  R.create("LineView", {
    propTypes: {
      line: C.Line,
      lineIndex: Number
    },
    render: function() {
      return R.div({
        className: "line"
      }, R.div({
        className: "lineLeft"
      }, R.WordListView({
        wordList: this.line.wordList
      })), R.div({
        className: "lineRight"
      }, R.LineOutputView({
        line: this.line
      })));
    }
  });

}).call(this);
}, "view/ProgramView": function(exports, require, module) {(function() {
  R.create("ProgramView", {
    propTypes: {
      program: C.Program
    },
    insertLineBefore: function(index) {
      var line;
      line = new C.Line();
      return this.program.lines.splice(index, 0, line);
    },
    removeLineAt: function(index) {
      return this.program.lines.splice(index, 1);
    },
    render: function() {
      return R.div({
        className: "program"
      }, this.program.lines.map((function(_this) {
        return function(line, lineIndex) {
          return R.LineView({
            line: line,
            lineIndex: lineIndex,
            key: lineIndex
          });
        };
      })(this)));
    }
  });

}).call(this);
}, "view/R": function(exports, require, module) {(function() {
  var R, key, value, _ref,
    __hasProp = {}.hasOwnProperty;

  window.R = R = {};

  _ref = React.DOM;
  for (key in _ref) {
    if (!__hasProp.call(_ref, key)) continue;
    value = _ref[key];
    R[key] = value;
  }

  R.cx = React.addons.classSet;

  R.UniversalMixin = {
    ownerView: function() {
      var _ref1;
      return (_ref1 = this._owner) != null ? _ref1 : this.props.__owner__;
    },
    lookup: function(keyName) {
      var _ref1, _ref2;
      return (_ref1 = this[keyName]) != null ? _ref1 : (_ref2 = this.ownerView()) != null ? _ref2.lookup(keyName) : void 0;
    },
    lookupView: function(viewName) {
      var _ref1;
      if (this === viewName || this.viewName() === viewName) {
        return this;
      }
      return (_ref1 = this.ownerView()) != null ? _ref1.lookupView(viewName) : void 0;
    },
    lookupViewWithKey: function(keyName) {
      var _ref1;
      if (this[keyName] != null) {
        return this;
      }
      return (_ref1 = this.ownerView()) != null ? _ref1.lookupViewWithKey(keyName) : void 0;
    },
    setPropsOnSelf: function(nextProps) {
      var propName, propValue, _results;
      _results = [];
      for (propName in nextProps) {
        if (!__hasProp.call(nextProps, propName)) continue;
        propValue = nextProps[propName];
        if (propName === "__owner__") {
          continue;
        }
        _results.push(this[propName] = propValue);
      }
      return _results;
    },
    componentWillMount: function() {
      return this.setPropsOnSelf(this.props);
    },
    componentWillUpdate: function(nextProps) {
      return this.setPropsOnSelf(nextProps);
    },
    componentDidMount: function() {
      var el;
      el = this.getDOMNode();
      return el.dataFor != null ? el.dataFor : el.dataFor = this;
    },
    componentWillUnmount: function() {
      var el;
      el = this.getDOMNode();
      return delete el.dataFor;
    }
  };

  R.create = function(name, opts) {
    var propName, propType, _ref1;
    opts.displayName = name;
    opts.viewName = function() {
      return name;
    };
    if (opts.propTypes == null) {
      opts.propTypes = {};
    }
    _ref1 = opts.propTypes;
    for (propName in _ref1) {
      if (!__hasProp.call(_ref1, propName)) continue;
      propType = _ref1[propName];
      if (propType === Number) {
        propType = React.PropTypes.number;
      } else if (propType === String) {
        propType = React.PropTypes.string;
      } else if (propType === Boolean) {
        propType = React.PropTypes.bool;
      } else if (propType === Function) {
        propType = React.PropTypes.func;
      } else {
        propType = React.PropTypes.instanceOf(propType);
      }
      opts.propTypes[propName] = propType.isRequired;
    }
    if (opts.mixins == null) {
      opts.mixins = [];
    }
    opts.mixins.unshift(R.UniversalMixin);
    return R[name] = React.createClass(opts);
  };

  require("./EditorView");

  require("./DraggingView");

  require("./ProgramView");

  require("./LineView");

  require("./word/TextFieldView");

  require("./word/LineOutputView");

  require("./word/WordListView");

  require("./word/WordView");

  require("./word/ParamView");

  require("./word/WordSpacerView");

}).call(this);
}, "view/word/LineOutputView": function(exports, require, module) {(function() {
  var compile;

  compile = require("../../compile/compile");

  R.create("LineOutputView", {
    propTypes: {
      line: C.Line
    },
    value: function() {
      var compiled, id, program, value;
      program = this.lookup("program");
      id = C.id(this.line);
      compiled = compile(program);
      compiled += "\n" + id + ";";
      value = eval(compiled);
      return util.formatFloat(value);
    },
    render: function() {
      return R.div({
        className: "word lineOutput"
      }, this.value());
    }
  });

}).call(this);
}, "view/word/ParamView": function(exports, require, module) {(function() {
  R.create("ParamView", {
    propTypes: {
      param: C.Param
    },
    render: function() {
      return R.div({
        className: "word param"
      }, R.ParamLabelView({
        param: this.param
      }), R.ParamValueView({
        param: this.param
      }));
    }
  });

  R.create("ParamLabelView", {
    propTypes: {
      param: C.Param
    },
    handleInput: function(newValue) {
      this.param.label = newValue;
      if (this.param.label === "") {
        return this.focusValue();
      } else if (this.param.label.slice(-1) === ":") {
        this.param.label = this.param.label.slice(0, -1);
        return this.focusValue();
      }
    },
    focusValue: function() {
      var paramView;
      paramView = this.lookupView("ParamView");
      return UI.setAutoFocus({
        descendantOf: [paramView, "ParamValueView"],
        location: "start"
      });
    },
    handleMouseDown: function(e) {
      var _ref;
      if ((_ref = this.refs.textField) != null ? _ref.isFocused() : void 0) {
        return;
      }
      UI.preventDefault(e);
      UI.dragging = {
        cursor: config.cursor.grabbing
      };
      util.onceDragConsummated(e, (function(_this) {
        return function() {
          return UI.dragging = {
            cursor: config.cursor.grabbing,
            offset: {
              x: -10,
              y: -10
            },
            render: function() {
              return R.ParamView({
                param: _this.param
              });
            },
            onMove: function(e) {
              var dropView;
              dropView = UI.getViewUnderMouse();
              dropView = dropView != null ? dropView.lookupViewWithKey("handleTransclusionDrop") : void 0;
              return UI.activeTransclusionDropView = dropView;
            },
            onUp: function(e) {
              if (UI.activeTransclusionDropView) {
                UI.activeTransclusionDropView.handleTransclusionDrop(_this.param);
              }
              return UI.activeTransclusionDropView = null;
            }
          };
        };
      })(this));
      return util.onceDragConsummated(e, null, (function(_this) {
        return function() {
          var _ref1;
          return (_ref1 = _this.refs.textField) != null ? _ref1.selectAll() : void 0;
        };
      })(this));
    },
    cursor: function() {
      var _ref;
      if (this.isMounted()) {
        if ((_ref = this.refs.textField) != null ? _ref.isFocused() : void 0) {
          return config.cursor.text;
        }
      }
      return config.cursor.grab;
    },
    render: function() {
      return R.span({
        style: {
          cursor: this.cursor()
        },
        onMouseDown: this.handleMouseDown
      }, this.param.label === "" ? R.div({
        className: "paramLabelEmpty"
      }) : R.TextFieldView({
        className: "paramLabel",
        value: this.param.label,
        onInput: this.handleInput,
        ref: "textField"
      }));
    }
  });

  R.create("ParamValueView", {
    propTypes: {
      param: C.Param
    },
    labelPart: function() {
      var matches;
      matches = this.param.valueString.match(/^[^0-9.-]+/);
      return matches != null ? matches[0] : void 0;
    },
    placeholderPart: function() {
      var matches;
      if (this.param.valueString === "-") {
        return null;
      }
      matches = this.param.valueString.match(/[^0-9.]+$/);
      return matches != null ? matches[0] : void 0;
    },
    handleInput: function(newValue) {
      var labelPart, placeholderPart, wordIndex, wordListView;
      this.param.valueString = newValue;
      if (labelPart = this.labelPart()) {
        this.param.valueString = this.param.valueString.slice(labelPart.length);
        this.param.label = this.param.label + labelPart;
        return this.focusLabel();
      } else if (placeholderPart = this.placeholderPart()) {
        this.param.valueString = this.param.valueString.slice(0, -placeholderPart.length);
        wordListView = this.lookupView("WordListView");
        wordIndex = this.lookup("wordIndex");
        return wordListView.insertPlaceholderBefore(wordIndex + 1, placeholderPart);
      }
    },
    focusLabel: function() {
      var paramView;
      paramView = this.lookupView("ParamView");
      return UI.setAutoFocus({
        descendantOf: [paramView, "ParamLabelView"]
      });
    },
    handleMouseDown: function(e) {
      var originalValue, originalX, originalY;
      if (this.refs.textField.isFocused()) {
        return;
      }
      UI.preventDefault(e);
      originalX = e.clientX;
      originalY = e.clientY;
      originalValue = this.param.value();
      UI.dragging = {
        cursor: this.cursor(),
        onMove: (function(_this) {
          return function(e) {
            var d, dx, dy, value;
            dx = e.clientX - originalX;
            dy = -(e.clientY - originalY);
            d = dy;
            value = originalValue + d;
            return _this.param.valueString = "" + value;
          };
        })(this)
      };
      return util.onceDragConsummated(e, null, (function(_this) {
        return function() {
          return _this.refs.textField.selectAll();
        };
      })(this));
    },
    cursor: function() {
      if (this.isMounted()) {
        if (this.refs.textField.isFocused()) {
          return config.cursor.text;
        }
      }
      return config.cursor.verticalScrub;
    },
    render: function() {
      return R.span({
        style: {
          cursor: this.cursor()
        },
        onMouseDown: this.handleMouseDown
      }, R.TextFieldView({
        className: "paramValue",
        value: this.param.valueString,
        onInput: this.handleInput,
        ref: "textField"
      }));
    }
  });

}).call(this);
}, "view/word/TextFieldView": function(exports, require, module) {(function() {
  var Selection, findAdjacentHost;

  Selection = require("../../Selection");

  R.create("TextFieldView", {
    propTypes: {
      value: String,
      className: String,
      onInput: Function,
      onBackSpace: Function
    },
    getDefaultProps: function() {
      return {
        value: "",
        className: "",
        onInput: function(newValue) {},
        onBackSpace: function() {},
        onEnter: function() {}
      };
    },
    refresh: function() {
      var el;
      el = this.getDOMNode();
      if (el.textContent !== this.value) {
        el.textContent = this.value;
      }
      return UI.attemptAutoFocus(this);
    },
    componentDidMount: function() {
      return this.refresh();
    },
    componentDidUpdate: function() {
      return this.refresh();
    },
    handleInput: function() {
      var el, newValue;
      el = this.getDOMNode();
      newValue = el.textContent;
      return this.onInput(newValue);
    },
    handleKeyDown: function(e) {
      var host, nextHost, previousHost;
      host = Selection.getHost();
      if (e.keyCode === 37) {
        if (Selection.isAtStart()) {
          previousHost = findAdjacentHost(host, -1);
          if (previousHost) {
            e.preventDefault();
            return Selection.setAtEnd(previousHost);
          }
        }
      } else if (e.keyCode === 39) {
        if (Selection.isAtEnd()) {
          nextHost = findAdjacentHost(host, 1);
          if (nextHost) {
            e.preventDefault();
            return Selection.setAtStart(nextHost);
          }
        }
      } else if (e.keyCode === 8) {
        if (Selection.isAtStart()) {
          e.preventDefault();
          return this.onBackSpace();
        }
      } else if (e.keyCode === 13) {
        e.preventDefault();
        return this.onEnter();
      }
    },
    selectAll: function() {
      var el;
      el = this.getDOMNode();
      return Selection.setAll(el);
    },
    isFocused: function() {
      var el, host;
      el = this.getDOMNode();
      host = Selection.getHost();
      return el === host;
    },
    render: function() {
      return R.div({
        className: this.className,
        contentEditable: true,
        onInput: this.handleInput,
        onKeyDown: this.handleKeyDown
      });
    }
  });

  findAdjacentHost = function(el, direction) {
    var hosts, index;
    hosts = document.querySelectorAll("[contenteditable]");
    hosts = _.toArray(hosts);
    index = hosts.indexOf(el);
    return hosts[index + direction];
  };

}).call(this);
}, "view/word/WordListView": function(exports, require, module) {(function() {
  R.create("WordListView", {
    propTypes: {
      wordList: C.WordList
    },
    insertWordBefore: function(index, word) {
      this.wordList.splice(index, 0, word);
      return this.setAutoFocusBefore(index + 1);
    },
    insertPlaceholderBefore: function(index, string) {
      var placeholder, that, word;
      placeholder = new C.Placeholder(string);
      word = placeholder.convert();
      this.wordList.splice(index, 0, word);
      if (index === 0 && word instanceof C.Op) {
        that = new C.That();
        this.wordList.splice(0, 0, that);
        index += 1;
      }
      return this.setAppropriateAutoFocus(index);
    },
    replaceWordAt: function(index, word) {
      this.wordList.splice(index, 1, word);
      return this.setAppropriateAutoFocus(index);
    },
    removeWordAt: function(index) {
      this.wordList.splice(index, 1);
      return this.setAutoFocusBefore(index);
    },
    setAppropriateAutoFocus: function(wordIndex) {
      var word;
      word = this.wordList.words[wordIndex];
      if (word instanceof C.Param) {
        return UI.setAutoFocus({
          descendantOf: [this, "ParamValueView"],
          props: {
            wordIndex: wordIndex
          }
        });
      } else if (word instanceof C.Placeholder) {
        return UI.setAutoFocus({
          descendantOf: [this],
          props: {
            wordIndex: wordIndex
          }
        });
      } else {
        return this.setAutoFocusBefore(wordIndex + 1);
      }
    },
    setAutoFocusBefore: function(wordIndex) {
      return UI.setAutoFocus({
        descendantOf: this,
        props: {
          wordSpacerIndex: wordIndex
        }
      });
    },
    render: function() {
      var index, result, word, words, _i, _len;
      words = this.wordList.words;
      result = [];
      for (index = _i = 0, _len = words.length; _i < _len; index = ++_i) {
        word = words[index];
        result.push(R.WordSpacerView({
          wordSpacerIndex: index,
          key: "spacer" + index
        }));
        result.push(R.WordView({
          word: word,
          wordIndex: index,
          key: "word" + index
        }));
      }
      result.push(R.WordSpacerView({
        wordSpacerIndex: index,
        key: "spacer" + index
      }));
      result = _.filter(result, function(instance) {
        var nextWord, previousWord;
        if ((index = instance.props.wordSpacerIndex) != null) {
          previousWord = words[index - 1];
          nextWord = words[index];
          if (previousWord instanceof C.Placeholder || nextWord instanceof C.Placeholder) {
            return false;
          }
        }
        return true;
      });
      _.first(result).props.isFirstWord = true;
      _.last(result).props.isLastWord = true;
      return R.div({
        className: "wordList"
      }, result);
    }
  });

}).call(this);
}, "view/word/WordSpacerView": function(exports, require, module) {(function() {
  R.create("WordSpacerView", {
    propTypes: {
      wordSpacerIndex: Number,
      isFirstWord: Boolean,
      isLastWord: Boolean
    },
    getDefaultProps: function() {
      return {
        isFirstWord: false,
        isLastWord: false
      };
    },
    handleInput: function(newValue) {
      var wordListView;
      wordListView = this.lookupView("WordListView");
      return wordListView.insertPlaceholderBefore(this.wordSpacerIndex, newValue);
    },
    handleBackSpace: function() {
      var line, lineIndex, previousLine, programView, wordListView;
      if (this.isFirstWord) {
        programView = this.lookupView("ProgramView");
        lineIndex = this.lookup("lineIndex");
        line = programView.program.lines[lineIndex];
        previousLine = programView.program.lines[lineIndex - 1];
        if (previousLine != null ? previousLine.wordList.isEmpty() : void 0) {
          programView.removeLineAt(lineIndex - 1);
          return UI.setAutoFocus({
            descendantOf: programView,
            props: {
              lineIndex: lineIndex - 1,
              isFirstWord: true
            }
          });
        } else if (line.wordList.isEmpty() && lineIndex > 0) {
          programView.removeLineAt(lineIndex);
          return UI.setAutoFocus({
            descendantOf: programView,
            props: {
              lineIndex: lineIndex - 1,
              isLastWord: true
            }
          });
        }
      } else {
        wordListView = this.lookupView("WordListView");
        return wordListView.removeWordAt(this.wordSpacerIndex - 1);
      }
    },
    handleEnter: function() {
      var lineIndex, programView, wordListView;
      wordListView = this.lookupView("WordListView");
      programView = this.lookupView("ProgramView");
      lineIndex = this.lookup("lineIndex");
      if (this.isFirstWord) {
        programView.insertLineBefore(lineIndex);
        return UI.setAutoFocus({
          descendantOf: programView,
          props: {
            lineIndex: lineIndex + 1
          }
        });
      } else if (this.isLastWord) {
        programView.insertLineBefore(lineIndex + 1);
        return UI.setAutoFocus({
          descendantOf: programView,
          props: {
            lineIndex: lineIndex + 1
          }
        });
      }
    },
    handleTransclusionDrop: function(word) {
      var wordListView;
      wordListView = this.lookupView("WordListView");
      return wordListView.insertWordBefore(this.wordSpacerIndex, word);
    },
    render: function() {
      var className;
      className = R.cx({
        wordSpacer: true,
        activeTransclusionDrop: this === UI.activeTransclusionDropView
      });
      return R.TextFieldView({
        className: className,
        onInput: this.handleInput,
        onBackSpace: this.handleBackSpace,
        onEnter: this.handleEnter
      });
    }
  });

}).call(this);
}, "view/word/WordView": function(exports, require, module) {(function() {
  R.create("WordView", {
    propTypes: {
      word: C.Word,
      wordIndex: Number
    },
    render: function() {
      if (this.word instanceof C.Placeholder) {
        return R.PlaceholderView({
          placeholder: this.word
        });
      } else if (this.word instanceof C.Param) {
        return R.ParamView({
          param: this.word
        });
      } else if (this.word instanceof C.Op) {
        return R.OpView({
          op: this.word
        });
      } else if (this.word instanceof C.That) {
        return R.ThatView({});
      }
    }
  });

  R.create("PlaceholderView", {
    propTypes: {
      placeholder: C.Placeholder
    },
    handleInput: function(newValue) {
      var word, wordIndex, wordListView;
      this.placeholder.string = newValue;
      wordListView = this.lookupView("WordListView");
      wordIndex = this.lookup("wordIndex");
      if (newValue === "") {
        wordListView.removeWordAt(wordIndex);
        return;
      }
      word = this.placeholder.convert();
      if (word !== this.placeholder) {
        return wordListView.replaceWordAt(wordIndex, word);
      }
    },
    render: function() {
      return R.TextFieldView({
        className: "word placeholder",
        value: this.placeholder.string,
        onInput: this.handleInput
      });
    }
  });

  R.create("OpView", {
    propTypes: {
      op: C.Op
    },
    render: function() {
      return R.div({
        className: "word op"
      }, this.op.opString);
    }
  });

  R.create("ThatView", {
    render: function() {
      return R.div({
        className: "word that"
      }, "That");
    }
  });

}).call(this);
}});
