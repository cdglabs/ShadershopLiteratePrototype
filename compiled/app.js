
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
}).call(this)({"UI": function(exports, require, module) {(function() {
  var UI,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.UI = UI = new ((function() {
    function _Class() {
      this.handleWindowMouseUp = __bind(this.handleWindowMouseUp, this);
      this.handleWindowMouseMove = __bind(this.handleWindowMouseMove, this);
      this.dragging = null;
      this.autofocus = null;
      this.hoveredWord = null;
      this.activeWord = null;
      this.activeTransclusionDropView = null;
      this.registerEvents();
    }

    _Class.prototype.registerEvents = function() {
      window.addEventListener("mousemove", this.handleWindowMouseMove);
      return window.addEventListener("mouseup", this.handleWindowMouseUp);
    };

    _Class.prototype.preventDefault = function(e) {
      e.preventDefault();
      return util.selection.set(null);
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

    _Class.prototype.setHoveredWord = function(word) {
      return this.hoveredWord = word;
    };

    _Class.prototype.setActiveWord = function(word) {
      return this.activeWord = word;
    };

    _Class.prototype.getHighlightedWord = function() {
      var _ref;
      return (_ref = this.activeWord) != null ? _ref : this.hoveredWord;
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
        util.selection.setAtStart(el);
      } else if (this.autofocus.location === "end") {
        util.selection.setAtEnd(el);
      }
      return this.autofocus = null;
    };

    return _Class;

  })());

}).call(this);
}, "compile/Compiler": function(exports, require, module) {(function() {
  var Compiler;

  module.exports = Compiler = (function() {
    function Compiler() {
      this.substitutions = {};
    }

    Compiler.prototype.substitute = function(word, value) {
      var id;
      if (!word) {
        return;
      }
      id = C.id(word);
      return this.substitutions[id] = value;
    };

    Compiler.prototype.compile = function(program) {
      var line, result, _i, _len, _ref;
      result = [];
      result.push("var that = 0;");
      _ref = program.lines;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        result.push(this.compileLine(line));
      }
      return result.join("\n");
    };

    Compiler.prototype.compileLine = function(line) {
      var lineId, s, substitution, wordList;
      lineId = C.id(line);
      s = "var " + lineId + " = that = ";
      if (substitution = this.substitutions[lineId]) {
        s += substitution;
      } else {
        wordList = line.wordList.effectiveWordList();
        if (!wordList) {
          s += "that";
        } else {
          s += this.compileWordList(wordList);
        }
      }
      s += ";";
      return s;
    };

    Compiler.prototype.compileWordList = function(wordList) {
      var result;
      result = _.map(wordList.words, (function(_this) {
        return function(word) {
          return _this.compileWord(word);
        };
      })(this));
      return result.join(" ");
    };

    Compiler.prototype.compileWord = function(word) {
      var compiledParams, id, _ref, _ref1;
      if (word instanceof C.Op) {
        return word.opString;
      } else if (word instanceof C.That) {
        return "that";
      } else if (word instanceof C.Param) {
        id = C.id(word);
        return (_ref = this.substitutions[id]) != null ? _ref : "" + word.value();
      } else if (word instanceof C.Line) {
        id = C.id(word);
        return (_ref1 = this.substitutions[id]) != null ? _ref1 : id;
      } else if (word instanceof C.Application) {
        compiledParams = _.map(word.params, (function(_this) {
          return function(wordList) {
            return _this.compileWordList(wordList);
          };
        })(this));
        return word.fn.fnName + "(" + compiledParams.join(", ") + ")";
      } else {
        console.warn("Cannot compile:", word);
        return "that";
      }
    };

    return Compiler;

  })();

}).call(this);
}, "compile/evaluate": function(exports, require, module) {(function() {
  var abs, add, ceil, cos, div, evaluate, floor, fract, identity, max, min, mul, pow, sin, sqrt, sub;

  module.exports = evaluate = function(jsString) {
    try {
      return eval(jsString);
    } catch (_error) {
      return console.warn("Unable to evaluate:", jsString);
    }
  };

  identity = function(a) {
    return a;
  };

  add = function(a, b) {
    return a + b;
  };

  sub = function(a, b) {
    return a - b;
  };

  mul = function(a, b) {
    return a * b;
  };

  div = function(a, b) {
    return a / b;
  };

  abs = Math.abs;

  fract = function(a) {
    return a - Math.floor(a);
  };

  floor = Math.floor;

  ceil = Math.ceil;

  min = Math.min;

  max = Math.max;

  sin = Math.sin;

  cos = Math.cos;

  sqrt = Math.sqrt;

  pow = function(a, b) {
    return Math.pow(Math.abs(a), b);
  };

}).call(this);
}, "config": function(exports, require, module) {(function() {
  var config;

  window.config = config = {
    storageName: "spaceshader4",
    resolution: 0.25,
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

  storageName = config.storageName;

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
        if (!force && (object != null ? object.__className : void 0)) {
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
}, "model/builtInFnDefinitions": function(exports, require, module) {(function() {
  var builtInFnDefinitions, define;

  module.exports = builtInFnDefinitions = [];

  define = function(fnName, defaultParamValues, label) {
    var definition;
    if (label == null) {
      label = fnName;
    }
    definition = {
      fnName: fnName,
      label: label,
      defaultParamValues: defaultParamValues
    };
    builtInFnDefinitions.push(definition);
    return builtInFnDefinitions[fnName] = definition;
  };

  define("identity", [0]);

  define("add", [0, 0], "+");

  define("sub", [0, 0], "-");

  define("mul", [1, 1], "*");

  define("div", [1, 1], "/");

  define("abs", [0]);

  define("fract", [0]);

  define("floor", [0]);

  define("ceil", [0]);

  define("min", [0, 0]);

  define("max", [0, 0]);

  define("sin", [0]);

  define("cos", [0]);

  define("sqrt", [0]);

  define("pow", [1, 1]);

}).call(this);
}, "model/model": function(exports, require, module) {(function() {
  var builtInFnDefinitions,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  builtInFnDefinitions = require("./builtInFnDefinitions");

  C.Expr = (function() {
    function Expr() {}

    return Expr;

  })();

  C.Variable = (function(_super) {
    __extends(Variable, _super);

    function Variable(valueString, label) {
      this.valueString = valueString != null ? valueString : "0";
      this.label = label != null ? label : "";
    }

    Variable.prototype.getValue = function() {
      return parseFloat(this.valueString);
    };

    return Variable;

  })(C.Expr);

  C.Application = (function(_super) {
    __extends(Application, _super);

    function Application() {
      this.fn = new C.BuiltInFn("identity");
      this.paramExprs = [];
      this.isProvisional = false;
    }

    Application.prototype.getPossibleApplications = function() {
      return builtInFnDefinitions.map((function(_this) {
        return function(definition) {
          var application;
          application = new C.Application();
          application.fn = new C.BuiltInFn(definition.fnName);
          application.paramExprs = definition.defaultParamValues.map(function(value) {
            return new C.Variable("" + value);
          });
          application.paramExprs[0] = _this.paramExprs[0];
          return application;
        };
      })(this));
    };

    Application.prototype.setStagedApplication = function(application) {
      this.fn = application.fn;
      return this.paramExprs = application.paramExprs;
    };

    Application.prototype.commitApplication = function() {
      return this.isProvisional = false;
    };

    return Application;

  })(C.Expr);

  C.Fn = (function() {
    function Fn() {}

    return Fn;

  })();

  C.BuiltInFn = (function(_super) {
    __extends(BuiltInFn, _super);

    function BuiltInFn(fnName) {
      this.fnName = fnName;
    }

    BuiltInFn.prototype.getLabel = function() {
      return builtInFnDefinitions[this.fnName].label;
    };

    return BuiltInFn;

  })(C.Fn);

  C.CustomFn = (function(_super) {
    __extends(CustomFn, _super);

    function CustomFn() {
      var variable;
      this.label = "";
      variable = new C.Variable("0", "x");
      this.paramVariables = [variable];
      this.rootExprs = [variable];
    }

    CustomFn.prototype.getLabel = function() {
      return this.label;
    };

    CustomFn.prototype.createRootExpr = function() {
      var variable;
      variable = new C.Variable();
      return this.rootExprs.push(variable);
    };

    CustomFn.prototype._findExpr = function(refExpr) {
      var search, _ref;
      search = (function(_this) {
        return function(array) {
          var expr, found, index, _i, _len;
          found = null;
          for (index = _i = 0, _len = array.length; _i < _len; index = ++_i) {
            expr = array[index];
            if (expr === refExpr) {
              if (found == null) {
                found = {
                  array: array,
                  index: index
                };
              }
            }
            if (expr instanceof C.Application) {
              if (found == null) {
                found = search(expr.paramExprs);
              }
            }
          }
          return found;
        };
      })(this);
      return (_ref = search(this.rootExprs)) != null ? _ref : {
        array: null,
        index: null
      };
    };

    CustomFn.prototype.insertApplicationAfter = function(application, refExpr) {
      var array, index, _ref;
      _ref = this._findExpr(refExpr), array = _ref.array, index = _ref.index;
      application.paramExprs[0] = refExpr;
      return array[index] = application;
    };

    CustomFn.prototype.createApplicationAfter = function(refExpr) {
      var application;
      application = new C.Application();
      application.isProvisional = true;
      return this.insertApplicationAfter(application, refExpr);
    };

    CustomFn.prototype.removeApplication = function(refApplication) {
      var array, index, previousExpr, _ref;
      _ref = this._findExpr(refApplication), array = _ref.array, index = _ref.index;
      if (array == null) {
        return;
      }
      previousExpr = refApplication.paramExprs[0];
      return array[index] = previousExpr;
    };

    return CustomFn;

  })(C.Fn);

  C.Editor = (function() {
    function Editor() {
      this.customFns = [];
      this.createCustomFn();
    }

    Editor.prototype.createCustomFn = function() {
      var customFn;
      customFn = new C.CustomFn();
      return this.customFns.push(customFn);
    };

    return Editor;

  })();

}).call(this);
}, "util/canvas": function(exports, require, module) {(function() {
  var canvasBounds, clear, drawCartesian, drawVertical, lerp;

  lerp = function(x, dMin, dMax, rMin, rMax) {
    var ratio;
    ratio = (x - dMin) / (dMax - dMin);
    return ratio * (rMax - rMin) + rMin;
  };

  canvasBounds = function(ctx) {
    var canvas;
    canvas = ctx.canvas;
    return {
      cxMin: 0,
      cxMax: canvas.width,
      cyMin: canvas.height,
      cyMax: 0
    };
  };

  clear = function(ctx) {
    var canvas;
    canvas = ctx.canvas;
    return ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  drawCartesian = function(ctx, opts) {
    var cx, cxMax, cxMin, cy, cyMax, cyMin, dCy, fn, i, lastCx, lastCy, lastSample, x, xMax, xMin, y, yMax, yMin, _i, _ref;
    xMin = opts.xMin;
    xMax = opts.xMax;
    yMin = opts.yMin;
    yMax = opts.yMax;
    fn = opts.fn;
    _ref = canvasBounds(ctx), cxMin = _ref.cxMin, cxMax = _ref.cxMax, cyMin = _ref.cyMin, cyMax = _ref.cyMax;
    ctx.beginPath();
    lastSample = cxMax / config.resolution;
    lastCx = null;
    lastCy = null;
    dCy = null;
    for (i = _i = 0; 0 <= lastSample ? _i <= lastSample : _i >= lastSample; i = 0 <= lastSample ? ++_i : --_i) {
      cx = i * config.resolution;
      x = lerp(cx, cxMin, cxMax, xMin, xMax);
      y = fn(x);
      cy = lerp(y, yMin, yMax, cyMin, cyMax);
      if (lastCy == null) {
        ctx.moveTo(cx, cy);
      }
      if (dCy != null) {
        if (Math.abs((cy - lastCy) - dCy) > .000001) {
          ctx.lineTo(lastCx, lastCy);
        }
      }
      if (lastCy != null) {
        dCy = cy - lastCy;
      }
      lastCx = cx;
      lastCy = cy;
    }
    return ctx.lineTo(cx, cy);
  };

  drawVertical = function(ctx, opts) {
    var cx, cxMax, cxMin, cyMax, cyMin, x, xMax, xMin, _ref;
    xMin = opts.xMin;
    xMax = opts.xMax;
    x = opts.x;
    _ref = canvasBounds(ctx), cxMin = _ref.cxMin, cxMax = _ref.cxMax, cyMin = _ref.cyMin, cyMax = _ref.cyMax;
    ctx.beginPath();
    cx = lerp(x, xMin, xMax, cxMin, cxMax);
    ctx.moveTo(cx, cyMin);
    return ctx.lineTo(cx, cyMax);
  };

  util.canvas = {
    lerp: lerp,
    clear: clear,
    drawCartesian: drawCartesian,
    drawVertical: drawVertical
  };

}).call(this);
}, "util/selection": function(exports, require, module) {(function() {
  var afterSelection, beforeSelection, findEditingHost, focusBody, get, getHost, isAtEnd, isAtStart, set, setAll, setAtEnd, setAtStart;

  get = function() {
    var range, selection;
    selection = window.getSelection();
    if (selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
      return range;
    } else {
      return null;
    }
  };

  set = function(range) {
    var host, selection;
    selection = window.getSelection();
    if (range == null) {
      focusBody();
      return selection.removeAllRanges();
    } else {
      host = findEditingHost(range.commonAncestorContainer);
      if (host != null) {
        host.focus();
      }
      selection.removeAllRanges();
      return selection.addRange(range);
    }
  };

  getHost = function() {
    var selectedRange;
    selectedRange = get();
    if (!selectedRange) {
      return null;
    }
    return findEditingHost(selectedRange.commonAncestorContainer);
  };

  beforeSelection = function() {
    var host, range, selectedRange;
    selectedRange = get();
    if (!selectedRange) {
      return null;
    }
    host = getHost();
    range = document.createRange();
    range.selectNodeContents(host);
    range.setEnd(selectedRange.startContainer, selectedRange.startOffset);
    return range;
  };

  afterSelection = function() {
    var host, range, selectedRange;
    selectedRange = get();
    if (!selectedRange) {
      return null;
    }
    host = getHost();
    range = document.createRange();
    range.selectNodeContents(host);
    range.setStart(selectedRange.endContainer, selectedRange.endOffset);
    return range;
  };

  isAtStart = function() {
    var _ref;
    if (!((_ref = get()) != null ? _ref.collapsed : void 0)) {
      return false;
    }
    return beforeSelection().toString() === "";
  };

  isAtEnd = function() {
    var _ref;
    if (!((_ref = get()) != null ? _ref.collapsed : void 0)) {
      return false;
    }
    return afterSelection().toString() === "";
  };

  setAtStart = function(el) {
    var range;
    range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(true);
    return set(range);
  };

  setAtEnd = function(el) {
    var range;
    range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    return set(range);
  };

  setAll = function(el) {
    var range;
    range = document.createRange();
    range.selectNodeContents(el);
    return set(range);
  };

  focusBody = function() {
    var body;
    body = document.body;
    if (!body.hasAttribute("tabindex")) {
      body.setAttribute("tabindex", "0");
    }
    return body.focus();
  };

  findEditingHost = function(node) {
    if (node == null) {
      return null;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return findEditingHost(node.parentNode);
    }
    if (!node.isContentEditable) {
      return null;
    }
    if (!node.parentNode.isContentEditable) {
      return node;
    }
    return findEditingHost(node.parentNode);
  };

  util.selection = {
    get: get,
    set: set,
    getHost: getHost,
    beforeSelection: beforeSelection,
    afterSelection: afterSelection,
    isAtStart: isAtStart,
    isAtEnd: isAtEnd,
    setAtStart: setAtStart,
    setAtEnd: setAtEnd,
    setAll: setAll
  };

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
      precision = 4;
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

  require("./selection");

  require("./canvas");

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
    var propName, propType, required, _ref1;
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
      if (propType.optional) {
        propType = propType.optional;
        required = false;
      } else {
        required = true;
      }
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
      if (required) {
        propType = propType.isRequired;
      }
      opts.propTypes[propName] = propType;
    }
    if (opts.mixins == null) {
      opts.mixins = [];
    }
    opts.mixins.unshift(R.UniversalMixin);
    return R[name] = React.createClass(opts);
  };

  require("./editor/EditorView");

  require("./editor/DraggingView");

  require("./VariableView");

}).call(this);
}, "view/VariableView": function(exports, require, module) {(function() {
  R.create("VariableView", {
    propTypes: {
      variable: C.Variable
    },
    render: function() {
      return R.div({
        className: "Variable"
      }, R.div({
        className: "VariableLabel",
        contentEditable: true
      }, this.variable.label), R.div({
        className: "VariableValue",
        contentEditable: true
      }, this.variable.valueString));
    }
  });

}).call(this);
}, "view/editor/DraggingView": function(exports, require, module) {(function() {
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
}, "view/editor/EditorView": function(exports, require, module) {(function() {
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
      }, R.div({
        className: "customFns"
      }, this.editor.customFns.map((function(_this) {
        return function(customFn) {
          return R.CustomFnView({
            customFn: customFn
          });
        };
      })(this))), R.div({
        className: "dragging"
      }, R.DraggingView({})));
    }
  });

  R.create("CustomFnView", {
    propTypes: {
      customFn: C.CustomFn
    },
    render: function() {
      return R.div({
        className: "CustomFn"
      }, R.div({
        className: "CustomFnHeader"
      }, R.div({
        className: "FnLabel"
      }, this.customFn.getLabel()), this.customFn.paramVariables.map((function(_this) {
        return function(paramVariable) {
          return R.VariableView({
            variable: paramVariable
          });
        };
      })(this))), R.div({
        className: "CustomFnDefinition"
      }), this.customFn.rootExprs.map((function(_this) {
        return function(rootExpr) {
          return R.ExprTreeView({
            expr: rootExpr
          });
        };
      })(this)));
    }
  });

  R.create("ExprTreeView", {
    propTypes: {
      expr: C.Expr
    },
    render: function() {
      return R.div({
        className: "ExprTree"
      }, this.expr instanceof C.Application ? R.div({
        className: "ExprTreeChildren"
      }, this.expr.paramExprs.map((function(_this) {
        return function(paramExpr, paramIndex) {
          if (paramIndex === 0) {
            return R.ExprTreeView({
              expr: paramExpr
            });
          } else if (paramExpr instanceof C.Application) {
            return R.ExprTreeView({
              expr: paramExpr
            });
          }
        };
      })(this))) : void 0, R.ExprNodeView({
        expr: this.expr
      }));
    }
  });

  R.create("ExprNodeView", {
    propTypes: {
      expr: C.Expr,
      isDraggingCopy: Boolean
    },
    getDefaultProps: function() {
      return {
        isDraggingCopy: false
      };
    },
    handleCreateExprButtonClick: function() {
      var customFn;
      customFn = this.lookup("customFn");
      return customFn.createApplicationAfter(this.expr);
    },
    isReorderable: function() {
      return this.expr instanceof C.Application;
    },
    isPlaceholder: function() {
      var _ref;
      return !this.isDraggingCopy && ((_ref = UI.dragging) != null ? _ref.application : void 0) === this.expr;
    },
    cursor: function() {
      if (this.isReorderable()) {
        return config.cursor.grab;
      } else {
        return "";
      }
    },
    handleMouseDown: function(e) {
      var customFn, el, expr, myHeight, myWidth, offset, rect;
      if (e.target.closest(".CreateExprButton, .ApplicationAutoComplete, .Variable")) {
        return;
      }
      UI.preventDefault(e);
      if (this.isReorderable()) {
        el = this.getDOMNode();
        rect = el.getBoundingClientRect();
        myWidth = rect.width;
        myHeight = rect.height;
        offset = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
        UI.dragging = {
          cursor: "-webkit-grabbing"
        };
        expr = this.expr;
        customFn = this.lookup("customFn");
        return util.onceDragConsummated(e, function() {
          return UI.dragging = {
            cursor: "-webkit-grabbing",
            offset: offset,
            placeholderHeight: myHeight,
            application: expr,
            render: function() {
              return R.div({
                style: {
                  "min-width": myWidth,
                  height: myHeight,
                  overflow: "hidden",
                  "background-color": "#fff"
                }
              }, R.ExprNodeView({
                expr: expr,
                isDraggingCopy: true
              }));
            },
            onMove: function(e) {
              var exprNodeEl, exprNodeEls, exprView, insertAfterEl, refCustomFn, refExpr, _i, _len, _ref, _ref1;
              if (customFn != null) {
                customFn.removeApplication(expr);
                customFn = null;
              }
              insertAfterEl = null;
              exprNodeEls = document.querySelectorAll(".CustomFn .ExprNode");
              for (_i = 0, _len = exprNodeEls.length; _i < _len; _i++) {
                exprNodeEl = exprNodeEls[_i];
                rect = exprNodeEl.getBoundingClientRect();
                if ((rect.bottom + myHeight * 1.5 > (_ref = e.clientY) && _ref > rect.top + myHeight) && (rect.left < (_ref1 = e.clientX) && _ref1 < rect.right)) {
                  insertAfterEl = exprNodeEl;
                }
              }
              if (insertAfterEl) {
                exprView = insertAfterEl.dataFor;
                refExpr = exprView.lookup("expr");
                refCustomFn = exprView.lookup("customFn");
                customFn = refCustomFn;
                return customFn.insertApplicationAfter(expr, refExpr);
              }
            }
          };
        });
      }
    },
    render: function() {
      if (this.isPlaceholder()) {
        return R.div({
          className: "ExprNodePlaceholder"
        });
      } else {
        return R.div({
          className: "ExprNode",
          onMouseDown: this.handleMouseDown,
          style: {
            cursor: this.cursor()
          }
        }, R.ExprThumbnailView({
          expr: this.expr
        }), R.ExprInternalsView({
          expr: this.expr
        }), this.expr.isProvisional ? R.ApplicationAutoCompleteView({
          application: this.expr
        }) : R.button({
          className: "CreateExprButton",
          onClick: this.handleCreateExprButtonClick
        }));
      }
    }
  });

  R.create("ExprInternalsView", {
    propTypes: {
      expr: C.Expr
    },
    render: function() {
      if (this.expr instanceof C.Application) {
        if (this.expr.isProvisional) {
          return R.div({
            className: "ExprInternals"
          });
        } else {
          return R.div({
            className: "ExprInternals"
          }, R.div({
            className: "FnLabel"
          }, this.expr.fn.getLabel()), this.expr.paramExprs.map((function(_this) {
            return function(paramExpr, paramIndex) {
              if (paramIndex > 0) {
                return R.ParamExprView({
                  expr: paramExpr
                });
              }
            };
          })(this)));
        }
      } else if (this.expr instanceof C.Variable) {
        return R.div({
          className: "ExprInternals"
        }, R.VariableView({
          variable: this.expr
        }));
      }
    }
  });

  R.create("ParamExprView", {
    propTypes: {
      expr: C.Expr
    },
    render: function() {
      if (this.expr instanceof C.Application) {
        return R.ExprThumbnailView({
          expr: this.expr
        });
      } else if (this.expr instanceof C.Variable) {
        return R.VariableView({
          variable: this.expr
        });
      }
    }
  });

  R.create("ExprThumbnailView", {
    propTypes: {
      expr: C.Expr
    },
    render: function() {
      return R.div({
        className: "ExprThumbnail"
      });
    }
  });

  R.create("ApplicationAutoCompleteView", {
    propTypes: {
      application: C.Application
    },
    render: function() {
      return R.div({
        className: "ApplicationAutoComplete"
      }, R.div({
        className: "Scroller"
      }, this.application.getPossibleApplications().map((function(_this) {
        return function(possibleApplication) {
          return R.ApplicationAutoCompleteRowView({
            application: _this.application,
            possibleApplication: possibleApplication
          });
        };
      })(this))));
    }
  });

  R.create("ApplicationAutoCompleteRowView", {
    propTypes: {
      application: C.Application,
      possibleApplication: C.Application
    },
    handleMouseEnter: function() {
      return this.application.setStagedApplication(this.possibleApplication);
    },
    handleClick: function() {
      return this.application.commitApplication();
    },
    render: function() {
      return R.div({
        onMouseEnter: this.handleMouseEnter,
        onClick: this.handleClick
      }, R.ExprNodeView({
        expr: this.possibleApplication
      }));
    }
  });

}).call(this);
}, "view/plot/CanvasView": function(exports, require, module) {(function() {
  R.create("CanvasView", {
    propTypes: {
      drawFn: Function
    },
    draw: function() {
      var canvas;
      canvas = this.getDOMNode();
      return this.drawFn(canvas);
    },
    sizeCanvas: function() {
      var canvas, rect;
      canvas = this.getDOMNode();
      rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
        return true;
      }
      return false;
    },
    handleResize: function() {
      if (this.sizeCanvas()) {
        return this.draw();
      }
    },
    componentDidMount: function() {
      this.sizeCanvas();
      this.draw();
      return window.addEventListener("resize", this.handleResize);
    },
    componentWillUnmount: function() {
      return window.removeEventListener("resize", this.handleResize);
    },
    render: function() {
      return R.canvas({});
    }
  });

}).call(this);
}, "view/plot/PlotView": function(exports, require, module) {(function() {
  var Compiler, evaluate;

  Compiler = require("../../compile/Compiler");

  evaluate = require("../../compile/evaluate");

  R.create("PlotView", {
    propTypes: {
      plot: C.Plot,
      line: C.Line
    },
    drawFn: function(canvas) {
      var compiled, compiler, ctx, f, lineId, program, value;
      ctx = canvas.getContext("2d");
      program = this.lookup("program");
      lineId = C.id(this.line);
      compiler = new Compiler();
      compiler.substitute(this.plot.x, "x");
      compiled = compiler.compile(program);
      compiled = "(function (x) {\n  " + compiled + "\n  return " + lineId + ";\n})";
      f = evaluate(compiled);
      util.canvas.clear(ctx);
      util.canvas.drawCartesian(ctx, {
        xMin: this.plot.bounds.domain.min,
        xMax: this.plot.bounds.domain.max,
        yMin: this.plot.bounds.range.min,
        yMax: this.plot.bounds.range.max,
        fn: f
      });
      ctx.strokeStyle = "#f00";
      ctx.lineWidth = 1;
      ctx.stroke();
      if (this.plot.x instanceof C.Param) {
        value = this.plot.x.value();
      } else {
        compiler = new Compiler();
        compiled = compiler.compile(program);
        compiled += "\n" + (C.id(this.plot.x)) + ";";
        value = evaluate(compiled);
      }
      util.canvas.drawVertical(ctx, {
        xMin: this.plot.bounds.domain.min,
        xMax: this.plot.bounds.domain.max,
        x: value
      });
      ctx.strokeStyle = "#090";
      ctx.lineWidth = 1;
      return ctx.stroke();
    },
    componentDidUpdate: function() {
      return this.refs.canvas.draw();
    },
    render: function() {
      return R.div({}, R.CanvasView({
        drawFn: this.drawFn,
        ref: "canvas"
      }));
    }
  });

  R.create("XParamView", {
    propTypes: {
      plot: C.Plot
    },
    handleTransclusionDrop: function(word) {
      return this.plot.x = word;
    },
    render: function() {
      return R.div({}, this.plot.x ? R.WordView({
        word: this.plot.x
      }) : R.div({
        className: "slot"
      }));
    }
  });

}).call(this);
}, "view/program/LineView": function(exports, require, module) {(function() {
  R.create("LineView", {
    propTypes: {
      line: C.Line,
      lineIndex: Number
    },
    plots: function() {
      return this.lookup("program").plots;
    },
    shouldRenderPlot: function(plot) {
      var deepDependencies;
      deepDependencies = this.lookup("program").getDeepDependencies(this.line);
      return _.contains(deepDependencies, plot.x) || this.line === plot.x;
    },
    render: function() {
      var className;
      className = R.cx({
        line: true,
        isIndependent: !this.line.hasReferenceToThat()
      });
      return R.div({
        className: className
      }, R.div({
        className: "lineCell"
      }, R.WordListView({
        wordList: this.line.wordList
      })), R.div({
        className: "lineCell"
      }, R.LineOutputView({
        line: this.line
      })), this.plots().map((function(_this) {
        return function(plot, index) {
          return R.div({
            className: "lineCell",
            key: index
          }, _this.shouldRenderPlot(plot) ? R.div({
            className: "plotThumbnail"
          }, R.PlotView({
            plot: plot,
            line: _this.line
          })) : void 0);
        };
      })(this)));
    }
  });

}).call(this);
}, "view/program/ProgramView": function(exports, require, module) {(function() {
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
    lastLineForPlot: function(plot) {
      var deepDependencies, lastLine, line, _i, _len, _ref;
      lastLine = null;
      _ref = this.program.lines;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        deepDependencies = this.program.getDeepDependencies(line);
        if (_.contains(deepDependencies, plot.x)) {
          lastLine = line;
        }
      }
      return lastLine;
    },
    render: function() {
      return R.div({
        className: "program"
      }, R.div({
        className: "mainPlot"
      }, R.PlotView({
        plot: this.program.plots[0],
        line: this.lastLineForPlot(this.program.plots[0])
      })), R.div({
        className: "programTable"
      }, R.ProgramTableHeadersView({
        program: this.program
      }), this.program.lines.map((function(_this) {
        return function(line, lineIndex) {
          return R.LineView({
            line: line,
            lineIndex: lineIndex,
            key: lineIndex
          });
        };
      })(this))));
    }
  });

  R.create("ProgramTableHeadersView", {
    propTypes: {
      program: C.Program
    },
    addPlot: function() {
      return this.program.plots.push(new C.CartesianPlot());
    },
    render: function() {
      return R.div({
        className: "programHeader"
      }, R.div({
        className: "lineCell"
      }, "Program"), R.div({
        className: "lineCell"
      }, "Result"), this.program.plots.map((function(_this) {
        return function(plot, index) {
          return R.PlotHeaderView({
            plot: plot,
            key: index
          });
        };
      })(this)), R.div({
        className: "lineCell"
      }, R.button({
        onClick: this.addPlot
      }, "+")));
    }
  });

  R.create("PlotHeaderView", {
    propTypes: {
      plot: C.Plot
    },
    render: function() {
      return R.div({
        className: "lineCell"
      }, R.div({}, "Cartesian"), R.XParamView({
        plot: this.plot
      }));
    }
  });

}).call(this);
}, "view/word/LineOutputView": function(exports, require, module) {(function() {
  var Compiler, evaluate;

  Compiler = require("../../compile/Compiler");

  evaluate = require("../../compile/evaluate");

  R.create("LineOutputView", {
    propTypes: {
      line: C.Line
    },
    mixins: [R.StartTranscludeMixin],
    evaluate: function() {
      var compiled, compiler, id, program, value;
      program = this.lookup("program");
      id = C.id(this.line);
      compiler = new Compiler();
      compiled = compiler.compile(program);
      compiled += "\n" + id + ";";
      value = evaluate(compiled);
      return util.formatFloat(value);
    },
    handleMouseDown: function(e) {
      UI.preventDefault(e);
      return this.startTransclude(e, this.line, this.render.bind(this));
    },
    cursor: function() {
      return config.cursor.grab;
    },
    handleMouseEnter: function() {
      return UI.setHoveredWord(this.line);
    },
    handleMouseLeave: function() {
      return UI.setHoveredWord(null);
    },
    render: function() {
      var className;
      className = R.cx({
        word: true,
        lineOutput: true,
        highlighted: UI.getHighlightedWord() === this.line
      });
      return R.div({
        className: className,
        style: {
          cursor: this.cursor()
        },
        onMouseDown: this.handleMouseDown,
        onMouseEnter: this.handleMouseEnter,
        onMouseLeave: this.handleMouseLeave
      }, this.evaluate());
    }
  });

}).call(this);
}, "view/word/ParamView": function(exports, require, module) {(function() {
  R.create("ParamView", {
    propTypes: {
      param: C.Param
    },
    handleMouseEnter: function() {
      return UI.setHoveredWord(this.param);
    },
    handleMouseLeave: function() {
      return UI.setHoveredWord(null);
    },
    render: function() {
      var className;
      className = R.cx({
        word: true,
        param: true,
        highlighted: UI.getHighlightedWord() === this.param
      });
      return R.div({
        className: className,
        onMouseEnter: this.handleMouseEnter,
        onMouseLeave: this.handleMouseLeave
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
    mixins: [R.StartTranscludeMixin],
    handleInput: function(newValue) {
      this.param.label = newValue;
      if (this.param.label.slice(-1) === ":") {
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
      var paramView, _ref;
      if ((_ref = this.refs.textField) != null ? _ref.isFocused() : void 0) {
        return;
      }
      UI.preventDefault(e);
      paramView = this.lookupView("ParamView");
      this.startTransclude(e, this.param, paramView.render.bind(paramView));
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
      }, R.TextFieldView({
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
    handleBlur: function() {
      return this.param.fixPrecision();
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
      UI.setActiveWord(this.param);
      UI.dragging = {
        cursor: this.cursor(),
        onMove: (function(_this) {
          return function(e) {
            var d, digitPrecision, dx, dy, value;
            dx = e.clientX - originalX;
            dy = -(e.clientY - originalY);
            d = dy;
            value = originalValue + d * _this.param.precision;
            if (_this.param.precision < 1) {
              digitPrecision = -Math.round(Math.log(_this.param.precision) / Math.log(10));
              return _this.param.valueString = value.toFixed(digitPrecision);
            } else {
              return _this.param.valueString = value.toFixed(0);
            }
          };
        })(this),
        onUp: (function(_this) {
          return function() {
            return UI.setActiveWord(null);
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
        onBlur: this.handleBlur,
        ref: "textField"
      }));
    }
  });

}).call(this);
}, "view/word/TextFieldView": function(exports, require, module) {(function() {
  var findAdjacentHost;

  R.create("TextFieldView", {
    propTypes: {
      value: String,
      className: String,
      onInput: Function,
      onBackSpace: Function,
      onFocus: Function,
      onBlur: Function
    },
    getDefaultProps: function() {
      return {
        value: "",
        className: "",
        onInput: function(newValue) {},
        onBackSpace: function() {},
        onEnter: function() {},
        onFocus: function() {},
        onBlur: function() {}
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
      host = util.selection.getHost();
      if (e.keyCode === 37) {
        if (util.selection.isAtStart()) {
          previousHost = findAdjacentHost(host, -1);
          if (previousHost) {
            e.preventDefault();
            return util.selection.setAtEnd(previousHost);
          }
        }
      } else if (e.keyCode === 39) {
        if (util.selection.isAtEnd()) {
          nextHost = findAdjacentHost(host, 1);
          if (nextHost) {
            e.preventDefault();
            return util.selection.setAtStart(nextHost);
          }
        }
      } else if (e.keyCode === 8) {
        if (util.selection.isAtStart()) {
          e.preventDefault();
          return this.onBackSpace();
        }
      } else if (e.keyCode === 13) {
        e.preventDefault();
        return this.onEnter();
      }
    },
    handleFocus: function() {
      return this.onFocus();
    },
    handleBlur: function() {
      return this.onBlur();
    },
    selectAll: function() {
      var el;
      el = this.getDOMNode();
      return util.selection.setAll(el);
    },
    isFocused: function() {
      var el, host;
      el = this.getDOMNode();
      host = util.selection.getHost();
      return el === host;
    },
    render: function() {
      return R.div({
        className: this.className,
        contentEditable: true,
        onInput: this.handleInput,
        onKeyDown: this.handleKeyDown,
        onFocus: this.handleFocus,
        onBlur: this.handleBlur
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
    getDefaultProps: function() {
      return {
        wordIndex: -1
      };
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
      } else if (this.word instanceof C.Application) {
        return R.ApplicationView({
          application: this.word
        });
      } else if (this.word instanceof C.Line) {
        return R.LineOutputView({
          line: this.word
        });
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

  R.create("ApplicationView", {
    propTypes: {
      application: C.Application
    },
    renderParameters: function() {
      var i, result, wordList, _i, _len, _ref;
      result = [];
      _ref = this.application.params;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        wordList = _ref[i];
        result.push(R.WordListView({
          wordList: wordList,
          key: "param" + i
        }));
        result.push(R.div({
          className: "word comma",
          key: "comma" + i
        }, ","));
      }
      result.pop();
      return result;
    },
    render: function() {
      return R.div({
        className: "application"
      }, R.div({
        className: "word builtInFn"
      }, this.application.fn.fnName), R.div({
        className: "word paren"
      }, "("), this.renderParameters(), R.div({
        className: "word paren"
      }, ")"));
    }
  });

}).call(this);
}});
