
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
      this.hoverData = null;
      this.hoverIsActive = false;
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
      this.dragging = null;
      if (this.hoverIsActive) {
        this.hoverData = null;
        return this.hoverIsActive = false;
      }
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

    _Class.prototype.startVariableScrub = function(opts) {
      var cursor, onMove, variable;
      variable = opts.variable;
      cursor = opts.cursor;
      onMove = opts.onMove;
      return UI.dragging = {
        cursor: cursor,
        onMove: (function(_this) {
          return function(e) {
            var newValueString;
            newValueString = onMove(e);
            return variable.valueString = newValueString;
          };
        })(this)
      };
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

    Compiler.prototype.substitute = function(expr, value) {
      var id;
      if (!expr) {
        return;
      }
      id = C.id(expr);
      return this.substitutions[id] = value;
    };

    Compiler.prototype.compile = function(expr) {
      var compiledParamExprs, fn, found, id, paramExprs, paramIndex, paramVariable, subCompiler, _i, _len, _ref;
      id = C.id(expr);
      if (found = this.substitutions[id]) {
        return found;
      }
      if (expr instanceof C.Variable) {
        return "" + expr.getValue();
      }
      if (expr instanceof C.Application) {
        fn = expr.fn;
        paramExprs = expr.paramExprs;
        compiledParamExprs = paramExprs.map((function(_this) {
          return function(expr) {
            return _this.compile(expr);
          };
        })(this));
        if (fn instanceof C.BuiltInFn) {
          return fn.fnName + "(" + compiledParamExprs.join(",") + ")";
        }
        if (fn instanceof C.CustomFn) {
          subCompiler = new Compiler();
          _ref = fn.paramVariables;
          for (paramIndex = _i = 0, _len = _ref.length; _i < _len; paramIndex = ++_i) {
            paramVariable = _ref[paramIndex];
            subCompiler.substitute(paramVariable, compiledParamExprs[paramIndex]);
          }
          return subCompiler.compile(fn.rootExprs[0]);
        }
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
}, "compile/evaluateDiscontinuity": function(exports, require, module) {(function() {
  var abs, add, ceil, convertFn, cos, div, evaluateDiscontinuity, floor, fract, identity, max, min, mul, pow, sin, sqrt, sub,
    __slice = [].slice;

  module.exports = evaluateDiscontinuity = function(jsString) {
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

  convertFn = function(fn, detector) {
    if (detector == null) {
      detector = null;
    }
    return function() {
      var args, result;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (_.any(args, function(x) {
        return x === "found";
      })) {
        return "found";
      }
      if ((detector != null) && (args[0][0] != null)) {
        if (detector(args[0][0]) !== detector(args[0][1])) {
          return "found";
        }
      }
      result = [0, 1].map(function(index) {
        var fnArgs;
        fnArgs = args.map(function(arg) {
          var _ref;
          return (_ref = arg[index]) != null ? _ref : arg;
        });
        return fn.apply(null, fnArgs);
      });
      if ((result[0] != null) && result[0] === result[1]) {
        result = result[0];
      }
      return result;
    };
  };

  identity = convertFn(identity);

  add = convertFn(add);

  sub = convertFn(sub);

  mul = convertFn(mul);

  div = convertFn(div);

  abs = convertFn(abs);

  fract = convertFn(fract, Math.floor);

  floor = convertFn(floor, Math.floor);

  ceil = convertFn(ceil, Math.ceil);

  min = convertFn(min);

  max = convertFn(max);

  sin = convertFn(sin);

  cos = convertFn(cos);

  sqrt = convertFn(sqrt);

  pow = convertFn(pow);

}).call(this);
}, "config": function(exports, require, module) {(function() {
  var config, extend, mainLineStyle, mainLineWidth;

  mainLineWidth = 1.2;

  mainLineStyle = {
    lineWidth: mainLineWidth
  };

  extend = function(style) {
    return _.defaults(style, mainLineStyle);
  };

  window.config = config = {
    storageName: "spaceshader4",
    resolution: 0.5,
    mainPlotWidth: 400,
    mainPlotHeight: 400,
    mainLineWidth: 1.25,
    minGridSpacing: 70,
    hitTolerance: 10,
    snapTolerance: 5,
    gridColor: "204,194,163",
    style: {
      mainExpr: extend({
        strokeStyle: "#000"
      }),
      hoveredExpr: extend({
        strokeStyle: "#900"
      }),
      paramExpr: extend({
        strokeStyle: "#ccc"
      }),
      spreadPositiveExpr: extend({
        strokeStyle: "#900"
      }),
      spreadNegativeExpr: extend({
        strokeStyle: "#009"
      }),
      variable: extend({
        strokeStyle: "rgba(77,158,51,0.5)",
        lineWidth: 1
      }),
      hoveredVariable: extend({
        strokeStyle: "rgba(77,158,51,1)",
        lineWidth: 2
      })
    },
    spreadOpacityMax: 0.22,
    spreadOpacityMin: 0.015,
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
  var editor, eventName, json, refresh, refreshEventNames, refreshView, saveState, storageName, willRefreshNextFrame, _i, _len;

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

  window.save = function() {
    return window.localStorage[storageName];
  };

  window.restore = function(jsonString) {
    window.localStorage[storageName] = jsonString;
    return location.reload();
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

  refreshEventNames = ["mousedown", "mousemove", "mouseup", "keydown", "scroll", "change", "wheel", "mousewheel"];

  for (_i = 0, _len = refreshEventNames.length; _i < _len; _i++) {
    eventName = refreshEventNames[_i];
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
      this.domain = "range";
      this.domainCoord = 0;
    }

    Variable.prototype.getValue = function() {
      return parseFloat(this.valueString);
    };

    Variable.prototype.treeEach = function(iterator) {
      return iterator(this);
    };

    return Variable;

  })(C.Expr);

  C.Application = (function(_super) {
    __extends(Application, _super);

    function Application() {
      this.fn = new C.BuiltInFn("identity");
      this.label = "";
      this.paramExprs = [];
      this.isProvisional = false;
    }

    Application.prototype.setStagedApplication = function(application) {
      this.fn = application.fn;
      return this.paramExprs = application.paramExprs;
    };

    Application.prototype.clearStagedApplication = function() {
      this.fn = new C.BuiltInFn("identity");
      return this.paramExprs = this.paramExprs.slice(0, 1);
    };

    Application.prototype.commitApplication = function() {
      return this.isProvisional = false;
    };

    Application.prototype.treeEach = function(iterator) {
      var expr, _i, _len, _ref, _results;
      iterator(this);
      _ref = this.paramExprs;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        expr = _ref[_i];
        _results.push(expr.treeEach(iterator));
      }
      return _results;
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

    BuiltInFn.prototype.getDefaultParamValues = function() {
      return builtInFnDefinitions[this.fnName].defaultParamValues;
    };

    return BuiltInFn;

  })(C.Fn);

  C.CustomFn = (function(_super) {
    __extends(CustomFn, _super);

    function CustomFn() {
      var variable;
      this.label = "";
      variable = new C.Variable("0", "x");
      variable.domain = "domain";
      this.paramVariables = [variable];
      this.rootExprs = [variable];
      this.bounds = {
        xMin: -6,
        xMax: 6,
        yMin: -6,
        yMax: 6
      };
    }

    CustomFn.prototype.getLabel = function() {
      return this.label;
    };

    CustomFn.prototype.getDefaultParamValues = function() {
      return this.paramVariables.map((function(_this) {
        return function(paramVariable) {
          return paramVariable.getValue();
        };
      })(this));
    };

    CustomFn.prototype.createRootExpr = function() {
      var variable;
      variable = new C.Variable();
      return this.rootExprs.push(variable);
    };

    CustomFn.prototype.getCustomFnDependencies = function() {
      var dependencies, recurse, rootExpr, _i, _len, _ref;
      dependencies = [this];
      recurse = (function(_this) {
        return function(expr) {
          var fn, paramExpr, _i, _len, _ref, _results;
          if (expr instanceof C.Application) {
            fn = expr.fn;
            if (fn instanceof C.CustomFn) {
              dependencies.push(fn);
              dependencies = dependencies.concat(fn.getCustomFnDependencies());
            }
            _ref = expr.paramExprs;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              paramExpr = _ref[_i];
              _results.push(recurse(paramExpr));
            }
            return _results;
          }
        };
      })(this);
      _ref = this.rootExprs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        rootExpr = _ref[_i];
        recurse(rootExpr);
      }
      return _.unique(dependencies);
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
  var canvasBounds, clear, drawCartesian, drawGrid, drawHorizontal, drawLine, drawVertical, getSpacing, lerp, setStyle, ticks,
    __hasProp = {}.hasOwnProperty;

  lerp = util.lerp;

  canvasBounds = function(ctx) {
    var canvas;
    canvas = ctx.canvas;
    return {
      cxMin: 0,
      cxMax: canvas.width,
      cyMin: canvas.height,
      cyMax: 0,
      width: canvas.width,
      height: canvas.height
    };
  };

  clear = function(ctx) {
    var canvas;
    canvas = ctx.canvas;
    return ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  setStyle = function(ctx, styleOpts) {
    var key, value, _results;
    _results = [];
    for (key in styleOpts) {
      if (!__hasProp.call(styleOpts, key)) continue;
      value = styleOpts[key];
      _results.push(ctx[key] = value);
    }
    return _results;
  };

  drawCartesian = function(ctx, opts) {
    var cx, cxMax, cxMin, cy, cyMax, cyMin, dCy1, dCy2, end, fn, i, line, lineStart, lines, numSamples, piece, pieceStart, pieces, previousX, pushLine, pushPiece, sample, samples, start, testDiscontinuity, x, xMax, xMin, y, yMax, yMin, _i, _j, _k, _l, _len, _len1, _len2, _m, _ref, _ref1, _ref2, _ref3, _results;
    xMin = opts.xMin;
    xMax = opts.xMax;
    yMin = opts.yMin;
    yMax = opts.yMax;
    fn = opts.fn;
    testDiscontinuity = (_ref = opts.testDiscontinuity) != null ? _ref : function() {
      return false;
    };
    _ref1 = canvasBounds(ctx), cxMin = _ref1.cxMin, cxMax = _ref1.cxMax, cyMin = _ref1.cyMin, cyMax = _ref1.cyMax;
    ctx.beginPath();
    numSamples = cxMax / config.resolution;
    samples = [];
    for (i = _i = 0; 0 <= numSamples ? _i <= numSamples : _i >= numSamples; i = 0 <= numSamples ? ++_i : --_i) {
      cx = i * config.resolution;
      x = lerp(cx, cxMin, cxMax, xMin, xMax);
      y = fn(x);
      cy = lerp(y, yMin, yMax, cyMin, cyMax);
      samples.push({
        x: x,
        y: y,
        cx: cx,
        cy: cy
      });
    }
    pieces = [];
    pieceStart = 0;
    pushPiece = function(pieceEnd) {
      pieces.push({
        start: pieceStart,
        end: pieceEnd
      });
      return pieceStart = pieceEnd;
    };
    for (i = _j = 0, _len = samples.length; _j < _len; i = ++_j) {
      sample = samples[i];
      if (i === 0) {
        continue;
      }
      x = samples[i].x;
      previousX = samples[i - 1].x;
      if (testDiscontinuity([previousX, x])) {
        pushPiece(i - 1);
        pieceStart = i;
      }
    }
    pushPiece(samples.length - 1);
    lines = [];
    lineStart = 0;
    pushLine = function(lineEnd) {
      lines.push({
        start: lineStart,
        end: lineEnd
      });
      return lineStart = lineEnd;
    };
    for (_k = 0, _len1 = pieces.length; _k < _len1; _k++) {
      piece = pieces[_k];
      lineStart = piece.start;
      for (i = _l = _ref2 = piece.start + 1, _ref3 = piece.end; _ref2 <= _ref3 ? _l <= _ref3 : _l >= _ref3; i = _ref2 <= _ref3 ? ++_l : --_l) {
        if (i - 1 === lineStart) {
          continue;
        }
        dCy1 = samples[i].cy - samples[i - 1].cy;
        dCy2 = samples[i - 1].cy - samples[i - 2].cy;
        if (Math.abs(dCy1 - dCy2) > .000001) {
          pushLine(i - 1);
        }
        if (i === piece.end) {
          pushLine(i);
        }
      }
    }
    _results = [];
    for (_m = 0, _len2 = lines.length; _m < _len2; _m++) {
      line = lines[_m];
      start = samples[line.start];
      end = samples[line.end];
      if (start.cx === end.cx) {
        ctx.moveTo(start.cx, start.cy);
        _results.push(ctx.lineTo(end.cx + 0.1, end.cy));
      } else {
        ctx.moveTo(start.cx, start.cy);
        _results.push(ctx.lineTo(end.cx, end.cy));
      }
    }
    return _results;
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

  drawHorizontal = function(ctx, opts) {
    var cxMax, cxMin, cy, cyMax, cyMin, y, yMax, yMin, _ref;
    yMin = opts.yMin;
    yMax = opts.yMax;
    y = opts.y;
    _ref = canvasBounds(ctx), cxMin = _ref.cxMin, cxMax = _ref.cxMax, cyMin = _ref.cyMin, cyMax = _ref.cyMax;
    ctx.beginPath();
    cy = lerp(y, yMin, yMax, cyMin, cyMax);
    ctx.moveTo(cxMin, cy);
    return ctx.lineTo(cxMax, cy);
  };

  ticks = function(spacing, min, max) {
    var first, last, x, _i, _results;
    first = Math.ceil(min / spacing);
    last = Math.floor(max / spacing);
    _results = [];
    for (x = _i = first; first <= last ? _i <= last : _i >= last; x = first <= last ? ++_i : --_i) {
      _results.push(x * spacing);
    }
    return _results;
  };

  drawLine = function(ctx, _arg, _arg1) {
    var x1, x2, y1, y2;
    x1 = _arg[0], y1 = _arg[1];
    x2 = _arg1[0], y2 = _arg1[1];
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    return ctx.stroke();
  };

  getSpacing = function(opts) {
    var div, height, largeSpacing, minSpacing, smallSpacing, width, xMax, xMin, xMinSpacing, xSize, yMax, yMin, yMinSpacing, ySize, z, _ref, _ref1;
    xMin = opts.xMin, xMax = opts.xMax, yMin = opts.yMin, yMax = opts.yMax;
    width = (_ref = opts.width) != null ? _ref : config.mainPlotWidth;
    height = (_ref1 = opts.height) != null ? _ref1 : config.mainPlotHeight;
    xSize = xMax - xMin;
    ySize = yMax - yMin;
    xMinSpacing = (xSize / width) * config.minGridSpacing;
    yMinSpacing = (ySize / height) * config.minGridSpacing;
    minSpacing = Math.max(xMinSpacing, yMinSpacing);

    /*
    need to determine:
      largeSpacing = {1, 2, or 5} * 10^n
      smallSpacing = divide largeSpacing by 4 (if 1 or 2) or 5 (if 5)
    largeSpacing must be greater than minSpacing
     */
    div = 4;
    largeSpacing = z = Math.pow(10, Math.ceil(Math.log(minSpacing) / Math.log(10)));
    if (z / 5 > minSpacing) {
      largeSpacing = z / 5;
    } else if (z / 2 > minSpacing) {
      largeSpacing = z / 2;
      div = 5;
    }
    smallSpacing = largeSpacing / div;
    return {
      largeSpacing: largeSpacing,
      smallSpacing: smallSpacing
    };
  };

  drawGrid = function(ctx, opts) {
    var axesColor, axesOpacity, color, cx, cxMax, cxMin, cy, cyMax, cyMin, fromLocal, height, labelColor, labelDistance, labelOpacity, largeSpacing, majorColor, majorOpacity, minorColor, minorOpacity, smallSpacing, text, textHeight, toLocal, width, x, xMax, xMin, y, yMax, yMin, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
    xMin = opts.xMin;
    xMax = opts.xMax;
    yMin = opts.yMin;
    yMax = opts.yMax;
    _ref = canvasBounds(ctx), cxMin = _ref.cxMin, cxMax = _ref.cxMax, cyMin = _ref.cyMin, cyMax = _ref.cyMax, width = _ref.width, height = _ref.height;
    _ref1 = getSpacing({
      xMin: xMin,
      xMax: xMax,
      yMin: yMin,
      yMax: yMax,
      width: width,
      height: height
    }), largeSpacing = _ref1.largeSpacing, smallSpacing = _ref1.smallSpacing;
    toLocal = function(_arg) {
      var cx, cy;
      cx = _arg[0], cy = _arg[1];
      return [lerp(cx, cxMin, cxMax, xMin, xMax), lerp(cy, cyMin, cyMax, yMin, yMax)];
    };
    fromLocal = function(_arg) {
      var x, y;
      x = _arg[0], y = _arg[1];
      return [lerp(x, xMin, xMax, cxMin, cxMax), lerp(y, yMin, yMax, cyMin, cyMax)];
    };
    labelDistance = 5;
    color = config.gridColor;
    minorOpacity = 0.075;
    majorOpacity = 0.1;
    axesOpacity = 0.25;
    labelOpacity = 1.0;
    textHeight = 12;
    minorColor = "rgba(" + color + ", " + minorOpacity + ")";
    majorColor = "rgba(" + color + ", " + majorOpacity + ")";
    axesColor = "rgba(" + color + ", " + axesOpacity + ")";
    labelColor = "rgba(" + color + ", " + labelOpacity + ")";
    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = minorColor;
    _ref2 = ticks(smallSpacing, xMin, xMax);
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      x = _ref2[_i];
      drawLine(ctx, fromLocal([x, yMin]), fromLocal([x, yMax]));
    }
    _ref3 = ticks(smallSpacing, yMin, yMax);
    for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
      y = _ref3[_j];
      drawLine(ctx, fromLocal([xMin, y]), fromLocal([xMax, y]));
    }
    ctx.strokeStyle = majorColor;
    _ref4 = ticks(largeSpacing, xMin, xMax);
    for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
      x = _ref4[_k];
      drawLine(ctx, fromLocal([x, yMin]), fromLocal([x, yMax]));
    }
    _ref5 = ticks(largeSpacing, yMin, yMax);
    for (_l = 0, _len3 = _ref5.length; _l < _len3; _l++) {
      y = _ref5[_l];
      drawLine(ctx, fromLocal([xMin, y]), fromLocal([xMax, y]));
    }
    ctx.strokeStyle = axesColor;
    drawLine(ctx, fromLocal([0, yMin]), fromLocal([0, yMax]));
    drawLine(ctx, fromLocal([xMin, 0]), fromLocal([xMax, 0]));
    ctx.font = "" + textHeight + "px verdana";
    ctx.fillStyle = labelColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    _ref6 = ticks(largeSpacing, xMin, xMax);
    for (_m = 0, _len4 = _ref6.length; _m < _len4; _m++) {
      x = _ref6[_m];
      if (x !== 0) {
        text = parseFloat(x.toPrecision(12)).toString();
        _ref7 = fromLocal([x, 0]), cx = _ref7[0], cy = _ref7[1];
        cy += labelDistance;
        if (cy < labelDistance) {
          cy = labelDistance;
        }
        if (cy + textHeight + labelDistance > height) {
          cy = height - labelDistance - textHeight;
        }
        ctx.fillText(text, cx, cy);
      }
    }
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    _ref8 = ticks(largeSpacing, yMin, yMax);
    for (_n = 0, _len5 = _ref8.length; _n < _len5; _n++) {
      y = _ref8[_n];
      if (y !== 0) {
        text = parseFloat(y.toPrecision(12)).toString();
        _ref9 = fromLocal([0, y]), cx = _ref9[0], cy = _ref9[1];
        cx += labelDistance;
        if (cx < labelDistance) {
          cx = labelDistance;
        }
        if (cx + ctx.measureText(text).width + labelDistance > width) {
          cx = width - labelDistance - ctx.measureText(text).width;
        }
        ctx.fillText(text, cx, cy);
      }
    }
    return ctx.restore();
  };

  util.canvas = {
    lerp: lerp,
    clear: clear,
    setStyle: setStyle,
    drawCartesian: drawCartesian,
    drawVertical: drawVertical,
    drawHorizontal: drawHorizontal,
    getSpacing: getSpacing,
    drawGrid: drawGrid
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

  Element.prototype.isOnScreen = function() {
    var horizontal, rect, screenHeight, screenWidth, vertical, _ref2, _ref3, _ref4, _ref5;
    rect = this.getBoundingClientRect();
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;
    vertical = (0 <= (_ref2 = rect.top) && _ref2 <= screenHeight) || (0 <= (_ref3 = rect.bottom) && _ref3 <= screenHeight);
    horizontal = (0 <= (_ref4 = rect.left) && _ref4 <= screenWidth) || (0 <= (_ref5 = rect.right) && _ref5 <= screenWidth);
    return vertical && horizontal;
  };

  util.lerp = function(x, dMin, dMax, rMin, rMax) {
    var ratio;
    ratio = (x - dMin) / (dMax - dMin);
    return ratio * (rMax - rMin) + rMin;
  };

  util.floatToString = function(value, precision, removeExtraZeros) {
    var digitPrecision, string;
    if (precision == null) {
      precision = 0.1;
    }
    if (removeExtraZeros == null) {
      removeExtraZeros = false;
    }
    if (precision < 1) {
      digitPrecision = -Math.round(Math.log(precision) / Math.log(10));
      string = value.toFixed(digitPrecision);
    } else {
      string = value.toFixed(0);
    }
    if (removeExtraZeros) {
      string = string.replace(/\.?0*$/, "");
    }
    if (/^-0(\.0*)?$/.test(string)) {
      string = string.slice(1);
    }
    return string;
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
}, "view/CustomFnView": function(exports, require, module) {(function() {
  R.create("CustomFnView", {
    propTypes: {
      customFn: C.CustomFn
    },
    shouldComponentUpdate: function() {
      var el;
      el = this.getDOMNode();
      return el.isOnScreen();
    },
    handleCreateRootExprButtonClick: function() {
      return this.customFn.createRootExpr();
    },
    render: function() {
      return R.div({
        className: "CustomFn"
      }, R.MainPlotView({
        customFn: this.customFn
      }), R.div({
        className: "CustomFnDefinition"
      }, R.CustomFnHeaderView({
        customFn: this.customFn
      }), this.customFn.rootExprs.map((function(_this) {
        return function(rootExpr, rootIndex) {
          return R.RootExprView({
            rootExpr: rootExpr,
            rootIndex: rootIndex
          });
        };
      })(this)), R.button({
        className: "CreateRootExprButton",
        onClick: this.handleCreateRootExprButtonClick
      })));
    }
  });

  R.create("CustomFnHeaderView", {
    propTypes: {
      customFn: C.CustomFn
    },
    handleFnLabelInput: function(newValue) {
      return this.customFn.label = newValue;
    },
    render: function() {
      return R.div({
        className: "CustomFnHeader"
      }, R.TextFieldView({
        className: "FnLabel",
        value: this.customFn.getLabel(),
        onInput: this.handleFnLabelInput
      }), this.customFn.paramVariables.map((function(_this) {
        return function(paramVariable) {
          return R.div({
            className: "Param"
          }, R.VariableView({
            variable: paramVariable
          }));
        };
      })(this)), R.CustomFnParamPlaceholderView({
        customFn: this.customFn
      }));
    }
  });

  R.create("CustomFnParamPlaceholderView", {
    propTypes: {
      customFn: C.CustomFn
    },
    handleTransclusionDrop: function(expr) {
      var paramVariables;
      if (!(expr instanceof C.Variable)) {
        return;
      }
      paramVariables = this.customFn.paramVariables;
      if (_.contains(paramVariables, expr)) {
        return;
      }
      return paramVariables.push(expr);
    },
    render: function() {
      var className;
      className = R.cx({
        ActiveTransclusionDrop: this === UI.activeTransclusionDropView
      });
      return R.span({
        className: className
      }, R.div({
        className: "ParamPlaceholder"
      }));
    }
  });

}).call(this);
}, "view/MainPlotView": function(exports, require, module) {(function() {
  var Compiler;

  R.create("MainPlotView", {
    propTypes: {
      customFn: C.CustomFn
    },
    startPan: function(e) {
      var originalBounds, originalX, originalY, rect, xScale, yScale;
      originalX = e.clientX;
      originalY = e.clientY;
      originalBounds = {
        xMin: this.customFn.bounds.xMin,
        xMax: this.customFn.bounds.xMax,
        yMin: this.customFn.bounds.yMin,
        yMax: this.customFn.bounds.yMax
      };
      rect = this.getDOMNode().getBoundingClientRect();
      xScale = (originalBounds.xMax - originalBounds.xMin) / rect.width;
      yScale = (originalBounds.yMax - originalBounds.yMin) / rect.height;
      return UI.dragging = {
        cursor: config.cursor.grabbing,
        onMove: (function(_this) {
          return function(e) {
            var dx, dy;
            dx = e.clientX - originalX;
            dy = e.clientY - originalY;
            _this.customFn.bounds.xMin = originalBounds.xMin - dx * xScale;
            _this.customFn.bounds.xMax = originalBounds.xMax - dx * xScale;
            _this.customFn.bounds.yMin = originalBounds.yMin + dy * yScale;
            return _this.customFn.bounds.yMax = originalBounds.yMax + dy * yScale;
          };
        })(this)
      };
    },
    handleMouseDown: function(e) {
      var variable;
      UI.preventDefault(e);
      variable = this.hitDetect();
      if (variable) {
        return this.startScrub(variable, e);
      } else {
        return this.startPan(e);
      }
    },
    isMouseInBounds: function() {
      var rect, _ref, _ref1;
      rect = this.getDOMNode().getBoundingClientRect();
      return (rect.left <= (_ref = UI.mousePosition.x) && _ref <= rect.right) && (rect.top <= (_ref1 = UI.mousePosition.y) && _ref1 <= rect.bottom);
    },
    getLocalMouseCoords: function() {
      var bounds, rect, x, y;
      rect = this.getDOMNode().getBoundingClientRect();
      bounds = this.customFn.bounds;
      x = util.lerp(UI.mousePosition.x, rect.left, rect.right, bounds.xMin, bounds.xMax);
      y = util.lerp(UI.mousePosition.y, rect.bottom, rect.top, bounds.yMin, bounds.yMax);
      return {
        x: x,
        y: y
      };
    },
    getCanvasCoords: function(x, y) {
      var bounds, cx, cy, rect;
      rect = this.getDOMNode().getBoundingClientRect();
      bounds = this.customFn.bounds;
      cx = util.lerp(x, bounds.xMin, bounds.xMax, rect.left, rect.right);
      cy = util.lerp(y, bounds.yMin, bounds.yMax, rect.bottom, rect.top);
      return {
        cx: cx,
        cy: cy
      };
    },
    handleWheel: function(e) {
      var bounds, scale, scaleFactor, x, y, _ref;
      e.preventDefault();
      bounds = this.customFn.bounds;
      _ref = this.getLocalMouseCoords(), x = _ref.x, y = _ref.y;
      scaleFactor = 1.2;
      scale = e.deltaY > 0 ? scaleFactor : 1 / scaleFactor;
      bounds.xMin = (bounds.xMin - x) * scale + x;
      bounds.xMax = (bounds.xMax - x) * scale + x;
      bounds.yMin = (bounds.yMin - y) * scale + y;
      return bounds.yMax = (bounds.yMax - y) * scale + y;
    },
    getDisplayVariables: function() {
      return this.customFn.paramVariables;
    },
    hitDetect: function() {
      var cx, cy, found, hit, value, variable, _i, _len, _ref, _ref1, _ref2;
      found = null;
      _ref = this.getDisplayVariables();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        variable = _ref[_i];
        value = variable.getValue();
        if (variable.domain === "domain") {
          _ref1 = this.getCanvasCoords(value, 0), cx = _ref1.cx, cy = _ref1.cy;
          hit = Math.abs(cx - UI.mousePosition.x) < config.hitTolerance;
        } else if (variable.domain === "range") {
          _ref2 = this.getCanvasCoords(0, value), cx = _ref2.cx, cy = _ref2.cy;
          hit = Math.abs(cy - UI.mousePosition.y) < config.hitTolerance;
        }
        if (hit) {
          found = variable;
          break;
        }
      }
      return found;
    },
    startScrub: function(variable, e) {
      UI.hoverIsActive = true;
      return UI.startVariableScrub({
        variable: variable,
        cursor: this.cursor(),
        onMove: (function(_this) {
          return function(e) {
            var precision, value, x, y, _ref;
            _ref = _this.getLocalMouseCoords(), x = _ref.x, y = _ref.y;
            if (variable.domain === "domain") {
              value = x;
            } else if (variable.domain === "range") {
              value = y;
            }
            precision = _this.getPrecision();
            return util.floatToString(value, precision);
          };
        })(this)
      });
    },
    getPrecision: function() {
      var bounds, digitPrecision, pixelWidth, rect;
      rect = this.getDOMNode().getBoundingClientRect();
      bounds = this.customFn.bounds;
      pixelWidth = (bounds.xMax - bounds.xMin) / rect.width;
      digitPrecision = Math.floor(Math.log(pixelWidth) / Math.log(10));
      return Math.pow(10, digitPrecision);
    },
    cursor: function() {
      var variable;
      if (this.isMounted() && this.isMouseInBounds()) {
        variable = this.hitDetect();
        if (variable) {
          if (variable.domain === "domain") {
            return config.cursor.horizontalScrub;
          }
          if (variable.domain === "range") {
            return config.cursor.verticalScrub;
          }
        }
      }
      return config.cursor.grab;
    },
    handleMouseMove: function() {
      var variable;
      if (UI.hoverIsActive) {
        return;
      }
      variable = this.hitDetect();
      if (variable) {
        return UI.hoverData = {
          variable: variable,
          customFn: this.customFn
        };
      } else {
        return UI.hoverData = null;
      }
    },
    handleMouseLeave: function() {
      if (UI.hoverIsActive) {
        return;
      }
      return UI.hoverData = null;
    },
    render: function() {
      var variable, _ref, _ref1;
      return R.div({
        className: "MainPlot",
        onMouseDown: this.handleMouseDown,
        onMouseMove: this.handleMouseMove,
        onMouseLeave: this.handleMouseLeave,
        onWheel: this.handleWheel,
        style: {
          cursor: this.cursor()
        }
      }, R.GridView({
        customFn: this.customFn
      }), R.PlotWithSpreadView({
        expr: this.customFn.rootExprs[0]
      }), ((_ref = UI.hoverData) != null ? _ref.expr : void 0) && ((_ref1 = UI.hoverData) != null ? _ref1.customFn : void 0) === this.customFn ? R.PlotWithParametersView({
        expr: UI.hoverData.expr
      }) : void 0, (function() {
        var _i, _len, _ref2, _results;
        _ref2 = this.getDisplayVariables();
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          variable = _ref2[_i];
          _results.push(R.PlotVariableView({
            variable: variable
          }));
        }
        return _results;
      }).call(this));
    }
  });

  Compiler = require("../../compile/Compiler");

  R.create("PlotWithSpreadView", {
    propTypes: {
      expr: C.Expr
    },
    renderSpreads: function() {
      var actualSpreadOffset, compiler, customFn, fnString, i, largeSpacing, maxSpreadOffset, roundedValue, smallSpacing, spreadDistance, spreadNum, spreadOffset, spreadValue, spreadVariable, style, value, view, views, xVariable, _i, _ref, _ref1, _ref2;
      spreadVariable = (_ref = UI.hoverData) != null ? _ref.variable : void 0;
      if (!spreadVariable) {
        return;
      }
      customFn = this.lookup("customFn");
      if (((_ref1 = UI.hoverData) != null ? _ref1.customFn : void 0) !== customFn) {
        return;
      }
      xVariable = customFn.paramVariables[0];
      if (xVariable === spreadVariable) {
        return;
      }
      _ref2 = util.canvas.getSpacing(customFn.bounds), largeSpacing = _ref2.largeSpacing, smallSpacing = _ref2.smallSpacing;
      spreadDistance = smallSpacing;
      spreadNum = 4;
      maxSpreadOffset = spreadDistance * spreadNum;
      value = spreadVariable.getValue();
      roundedValue = Math.round(value / spreadDistance) * spreadDistance;
      views = [];
      for (i = _i = -spreadNum; -spreadNum <= spreadNum ? _i <= spreadNum : _i >= spreadNum; i = -spreadNum <= spreadNum ? ++_i : --_i) {
        spreadOffset = i * spreadDistance;
        spreadValue = roundedValue + spreadOffset;
        actualSpreadOffset = spreadValue - value;
        if (actualSpreadOffset < 0) {
          style = _.clone(config.style.spreadNegativeExpr);
        } else {
          style = _.clone(config.style.spreadPositiveExpr);
        }
        style.globalAlpha = util.lerp(Math.abs(spreadOffset), 0, maxSpreadOffset, config.spreadOpacityMax, config.spreadOpacityMin);
        compiler = new Compiler();
        compiler.substitute(xVariable, "x");
        compiler.substitute(spreadVariable, "" + spreadValue);
        fnString = compiler.compile(this.expr);
        fnString = "(function (x) { return " + fnString + " ; })";
        view = R.PlotCartesianView({
          fnString: fnString,
          style: style
        });
        views.push(view);
      }
      return views;
    },
    render: function() {
      return R.span({}, this.renderSpreads(), R.PlotView({
        expr: this.expr,
        style: config.style.mainExpr
      }));
    }
  });

  R.create("PlotWithParametersView", {
    propTypes: {
      expr: C.Expr
    },
    render: function() {
      var style, _ref;
      style = ((_ref = UI.hoverData) != null ? _ref.expr : void 0) === this.expr ? config.style.hoveredExpr : config.style.mainExpr;
      return R.span({}, this.expr instanceof C.Application ? this.expr.paramExprs.map((function(_this) {
        return function(paramExpr) {
          return R.PlotView({
            expr: paramExpr,
            style: config.style.paramExpr
          });
        };
      })(this)) : void 0, R.PlotView({
        expr: this.expr,
        style: style
      }));
    }
  });

  R.create("PlotVariableView", {
    propTypes: {
      variable: C.Variable
    },
    getDrawInfo: function() {
      var domain, hovered, value, xMax, xMin, yMax, yMin, _ref, _ref1;
      _ref = this.lookup("customFn").bounds, xMin = _ref.xMin, xMax = _ref.xMax, yMin = _ref.yMin, yMax = _ref.yMax;
      domain = this.variable.domain;
      value = this.variable.getValue();
      hovered = this.variable === ((_ref1 = UI.hoverData) != null ? _ref1.variable : void 0);
      return {
        xMin: xMin,
        xMax: xMax,
        yMin: yMin,
        yMax: yMax,
        domain: domain,
        value: value,
        hovered: hovered
      };
    },
    drawFn: function(canvas) {
      var ctx, domain, style, value, xMax, xMin, yMax, yMin, _ref, _ref1;
      _ref = this._lastDrawInfo = this.getDrawInfo(), xMin = _ref.xMin, xMax = _ref.xMax, yMin = _ref.yMin, yMax = _ref.yMax, domain = _ref.domain, value = _ref.value;
      ctx = canvas.getContext("2d");
      util.canvas.clear(ctx);
      if (domain === "domain") {
        util.canvas.drawVertical(ctx, {
          xMin: xMin,
          xMax: xMax,
          x: value
        });
      } else if (domain === "range") {
        util.canvas.drawHorizontal(ctx, {
          yMin: yMin,
          yMax: yMax,
          y: value
        });
      }
      if (this.variable === ((_ref1 = UI.hoverData) != null ? _ref1.variable : void 0)) {
        style = config.style.hoveredVariable;
      } else {
        style = config.style.variable;
      }
      util.canvas.setStyle(ctx, style);
      return ctx.stroke();
    },
    componentDidUpdate: function() {
      return this.refs.canvas.draw();
    },
    shouldComponentUpdate: function() {
      var drawInfo;
      drawInfo = this.getDrawInfo();
      return !_.isEqual(drawInfo, this._lastDrawInfo);
    },
    render: function() {
      return R.CanvasView({
        drawFn: this.drawFn,
        ref: "canvas"
      });
    }
  });

}).call(this);
}, "view/ProvisionalApplicationInternalsView": function(exports, require, module) {(function() {
  var builtInFnDefinitions;

  builtInFnDefinitions = require("../model/builtInFnDefinitions");

  R.create("ProvisionalApplicationInternalsView", {
    propTypes: {
      application: C.Application
    },
    handleApplicationLabelInput: function(newValue) {
      return this.application.label = newValue;
    },
    possibleApplications: function() {
      var customFns, fns, possibleApplications, thisCustomFn;
      fns = builtInFnDefinitions.map((function(_this) {
        return function(definition) {
          return new C.BuiltInFn(definition.fnName);
        };
      })(this));
      thisCustomFn = this.lookup("customFn");
      customFns = _.reject(editor.customFns, (function(_this) {
        return function(customFn) {
          var customFnDependencies;
          customFnDependencies = customFn.getCustomFnDependencies();
          return _.contains(customFnDependencies, thisCustomFn);
        };
      })(this));
      fns = fns.concat(customFns);
      fns = _.filter(fns, (function(_this) {
        return function(fn) {
          return fn.getLabel().indexOf(_this.application.label) !== -1;
        };
      })(this));
      possibleApplications = fns.map((function(_this) {
        return function(fn) {
          var possibleApplication;
          possibleApplication = new C.Application();
          possibleApplication.fn = fn;
          possibleApplication.paramExprs = fn.getDefaultParamValues().map(function(value) {
            return new C.Variable("" + value);
          });
          possibleApplication.paramExprs[0] = _this.application.paramExprs[0];
          return possibleApplication;
        };
      })(this));
      return possibleApplications;
    },
    render: function() {
      var possibleApplications, _ref, _ref1;
      return R.div({
        className: "ExprInternals"
      }, R.span({
        style: {
          cursor: config.cursor.text
        }
      }, R.TextFieldView({
        className: "ApplicationLabel",
        value: this.application.label,
        onInput: this.handleApplicationLabelInput,
        ref: "text"
      })), ((_ref = this.refs) != null ? (_ref1 = _ref.text) != null ? _ref1.isFocused() : void 0 : void 0) ? (possibleApplications = this.possibleApplications(), possibleApplications.length > 0 ? R.div({
        className: "ApplicationAutoComplete"
      }, R.div({
        className: "Scroller"
      }, possibleApplications.map((function(_this) {
        return function(possibleApplication) {
          return R.ApplicationAutoCompleteRowView({
            application: _this.application,
            possibleApplication: possibleApplication
          });
        };
      })(this)))) : void 0) : void 0);
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
    handleMouseLeave: function() {
      return this.application.clearStagedApplication();
    },
    handleMouseDown: function(e) {
      return e.preventDefault();
    },
    handleClick: function() {
      return this.application.commitApplication();
    },
    render: function() {
      return R.div({
        className: "ApplicationAutoCompleteRow",
        onMouseEnter: this.handleMouseEnter,
        onMouseLeave: this.handleMouseLeave,
        onMouseDown: this.handleMouseDown,
        onClick: this.handleClick
      }, R.div({
        className: "ExprNode"
      }, R.ExprThumbnailView({
        expr: this.possibleApplication
      }), R.ExprInternalsView({
        expr: this.possibleApplication
      })));
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
      } else if (propType === Array) {
        propType = React.PropTypes.array;
      } else if (propType === Object) {
        propType = React.PropTypes.object;
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

  require("./ui/TextFieldView");

  require("./ui/HoverCaptureView");

  require("./editor/EditorView");

  require("./editor/DraggingView");

  require("./CustomFnView");

  require("./MainPlotView");

  require("./RootExprTreeView");

  require("./ProvisionalApplicationInternalsView");

  require("./VariableView");

  require("./plot/PlotView");

  require("./plot/PlotCartesianView");

  require("./plot/CanvasView");

  require("./plot/GridView");

}).call(this);
}, "view/RootExprTreeView": function(exports, require, module) {(function() {
  var Compiler, evaluate;

  R.create("RootExprView", {
    propTypes: {
      rootExpr: C.Expr,
      rootIndex: Number
    },
    renderExprNodeViews: function() {
      var exprNodeViews, recurse;
      exprNodeViews = [];
      recurse = function(expr, parentArray, parentArrayIndex) {
        exprNodeViews.unshift(R.ExprNodeView({
          expr: expr,
          parentArray: parentArray,
          parentArrayIndex: parentArrayIndex
        }));
        if (expr instanceof C.Application) {
          return recurse(expr.paramExprs[0], expr.paramExprs, 0);
        }
      };
      recurse(this.rootExpr, this.lookup("customFn").rootExprs, this.rootIndex);
      return exprNodeViews;
    },
    render: function() {
      return R.div({
        className: "RootExpr"
      }, this.renderExprNodeViews(), this.rootIndex > 0 ? R.RootExprExtrasView({
        rootExpr: this.rootExpr,
        rootIndex: this.rootIndex
      }) : void 0);
    }
  });

  R.create("RootExprExtrasView", {
    propTypes: {
      rootExpr: C.Expr,
      rootIndex: Number
    },
    promote: function() {
      var customFn;
      customFn = this.lookup("customFn");
      this.remove();
      return customFn.rootExprs.splice(0, 0, this.rootExpr);
    },
    remove: function() {
      var customFn;
      customFn = this.lookup("customFn");
      return customFn.rootExprs.splice(this.rootIndex, 1);
    },
    render: function() {
      return R.div({
        className: "RootExprExtras"
      }, R.div({
        className: "ExtrasLine"
      }, R.span({
        className: "ExtrasButton",
        onClick: this.remove
      }, "remove")), R.div({
        className: "ExtrasLine"
      }, R.span({
        className: "ExtrasButton",
        onClick: this.promote
      }, "promote")));
    }
  });

  R.create("ExprNodeView", {
    propTypes: {
      expr: C.Expr,
      isDraggingCopy: Boolean,
      parentArray: Array,
      parentArrayIndex: Number
    },
    getDefaultProps: function() {
      return {
        isDraggingCopy: false
      };
    },
    insertApplicationAfter: function(application) {
      var parentArray, parentArrayIndex;
      parentArray = this.lookup("parentArray");
      parentArrayIndex = this.lookup("parentArrayIndex");
      if (application !== this.expr) {
        application.paramExprs[0] = this.expr;
        parentArray[parentArrayIndex] = application;
      }
      return {
        parentArray: parentArray,
        parentArrayIndex: parentArrayIndex
      };
    },
    handleCreateExprButtonClick: function() {
      var application;
      application = new C.Application();
      application.isProvisional = true;
      return this.insertApplicationAfter(application);
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
      var application, customFn, el, findInsertAfterEl, myHeight, myWidth, offset, onMove, parentArray, parentArrayIndex, rect, removeApplication;
      if (e.target.closest(".CreateExprButton, .ApplicationAutoComplete, .Variable, .ExprThumbnail, .ApplicationLabel[contenteditable], .ApplicationAutoComplete")) {
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
        findInsertAfterEl = function(e) {
          var exprNodeEl, exprNodeEls, insertAfterEl, _i, _len, _ref, _ref1;
          insertAfterEl = null;
          exprNodeEls = document.querySelectorAll(".CustomFn .ExprNode");
          for (_i = 0, _len = exprNodeEls.length; _i < _len; _i++) {
            exprNodeEl = exprNodeEls[_i];
            rect = exprNodeEl.getBoundingClientRect();
            if ((rect.bottom + myHeight * 1.5 > (_ref = e.clientY) && _ref > rect.top + myHeight * 0.5) && (rect.left < (_ref1 = e.clientX) && _ref1 < rect.right)) {
              insertAfterEl = exprNodeEl;
            }
          }
          return insertAfterEl;
        };
        application = this.expr;
        customFn = this.lookup("customFn");
        parentArray = this.lookup("parentArray");
        parentArrayIndex = this.lookup("parentArrayIndex");
        removeApplication = function() {
          if (parentArray == null) {
            return;
          }
          return parentArray[parentArrayIndex] = application.paramExprs[0];
        };
        onMove = function(e) {
          var insertAfterEl, insertAfterExprNodeView, _ref;
          insertAfterEl = findInsertAfterEl(e);
          if (insertAfterEl) {
            insertAfterExprNodeView = insertAfterEl.dataFor.lookupView("ExprNodeView");
            if (insertAfterExprNodeView.lookup("parentArray") === application.paramExprs) {
              return;
            }
            removeApplication();
            _ref = insertAfterExprNodeView.insertApplicationAfter(application), parentArray = _ref.parentArray, parentArrayIndex = _ref.parentArrayIndex;
            return customFn = insertAfterExprNodeView.lookup("customFn");
          } else {
            return removeApplication();
          }
        };
        return util.onceDragConsummated(e, function() {
          return UI.dragging = {
            cursor: "-webkit-grabbing",
            offset: offset,
            placeholderHeight: myHeight,
            application: application,
            render: function() {
              return R.div({
                style: {
                  "min-width": myWidth,
                  height: myHeight,
                  overflow: "hidden",
                  "background-color": "#fff"
                }
              }, R.ExprNodeView({
                expr: application,
                customFn: customFn,
                isDraggingCopy: true
              }));
            },
            onMove: onMove
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
        }), R.button({
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
          return R.ProvisionalApplicationInternalsView({
            application: this.expr
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
                  expr: paramExpr,
                  parentArray: _this.expr.paramExprs,
                  parentArrayIndex: paramIndex
                });
              }
            };
          })(this)));
        }
      } else if (this.expr instanceof C.Variable) {
        return R.div({
          className: "ExprInternals"
        }, R.ParamExprView({
          expr: this.expr,
          parentArray: this.lookup("parentArray"),
          parentArrayIndex: this.lookup("parentArrayIndex")
        }));
      }
    }
  });

  R.create("ParamExprView", {
    propTypes: {
      expr: C.Expr,
      parentArray: Array,
      parentArrayIndex: Number
    },
    handleTransclusionDrop: function(droppedExpr) {
      return this.parentArray[this.parentArrayIndex] = droppedExpr;
    },
    render: function() {
      var className;
      className = R.cx({
        "Param": true,
        "ActiveTransclusionDrop": this === UI.activeTransclusionDropView
      });
      return R.div({
        className: className
      }, this.expr instanceof C.Application ? R.ParamApplicationView({
        application: this.expr
      }) : this.expr instanceof C.Variable ? R.VariableView({
        variable: this.expr
      }) : void 0);
    }
  });

  R.create("ParamApplicationView", {
    propTypes: {
      application: C.Application
    },
    render: function() {
      return R.span({}, R.ExprThumbnailView({
        expr: this.application
      }), R.div({
        className: "ApplicationLabel"
      }, this.application.label));
    }
  });

  R.create("ExprThumbnailView", {
    propTypes: {
      expr: C.Expr
    },
    startTransclude: function(e) {
      UI.dragging = {
        cursor: config.cursor.grabbing
      };
      return util.onceDragConsummated(e, (function(_this) {
        return function() {
          return UI.dragging = {
            cursor: config.cursor.grabbing,
            offset: {
              x: -4,
              y: -10
            },
            render: function() {
              return R.ExprThumbnailView({
                expr: _this.expr,
                customFn: _this.lookup("customFn")
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
                UI.activeTransclusionDropView.handleTransclusionDrop(_this.expr);
              }
              return UI.activeTransclusionDropView = null;
            }
          };
        };
      })(this));
    },
    handleMouseDown: function(e) {
      UI.preventDefault(e);
      return this.startTransclude(e);
    },
    render: function() {
      var className, _ref;
      className = R.cx({
        ExprThumbnail: true,
        Hovered: ((_ref = UI.hoverData) != null ? _ref.expr : void 0) === this.expr
      });
      return R.HoverCaptureView({
        hoverData: {
          expr: this.expr,
          customFn: this.lookup("customFn")
        }
      }, R.div({
        className: className,
        onMouseDown: this.handleMouseDown
      }, R.PlotWithParametersView({
        expr: this.expr
      }), R.ExprValueView({
        expr: this.expr
      })));
    }
  });

  Compiler = require("../compile/Compiler");

  evaluate = require("../compile/evaluate");

  R.create("ExprValueView", {
    propTypes: {
      expr: C.Expr
    },
    getValue: function() {
      var compiled, compiler, value;
      compiler = new Compiler();
      compiled = compiler.compile(this.expr);
      value = evaluate(compiled);
      return util.floatToString(value, 0.001, true);
    },
    shouldRender: function() {
      var customFn, foundXVariable, xVariable, _ref;
      customFn = this.lookup("customFn");
      xVariable = customFn.paramVariables[0];
      if (xVariable === ((_ref = UI.hoverData) != null ? _ref.variable : void 0)) {
        return true;
      }
      foundXVariable = false;
      this.expr.treeEach((function(_this) {
        return function(expr) {
          return foundXVariable || (foundXVariable = expr === xVariable);
        };
      })(this));
      if (!foundXVariable) {
        return true;
      }
      return false;
    },
    render: function() {
      return R.div({
        className: "ExprValue"
      }, this.shouldRender() ? this.getValue() : void 0);
    }
  });

}).call(this);
}, "view/VariableView": function(exports, require, module) {(function() {
  R.create("VariableView", {
    propTypes: {
      variable: C.Variable
    },
    render: function() {
      var className, _ref;
      className = R.cx({
        Variable: true,
        Hovered: ((_ref = UI.hoverData) != null ? _ref.variable : void 0) === this.variable
      });
      return R.HoverCaptureView({
        hoverData: {
          variable: this.variable,
          customFn: this.lookup("customFn")
        }
      }, R.div({
        className: className
      }, R.VariableLabelView({
        variable: this.variable
      }), R.VariableValueView({
        variable: this.variable
      })));
    }
  });

  R.create("VariableLabelView", {
    propTypes: {
      variable: C.Variable
    },
    handleInput: function(newValue) {
      return this.variable.label = newValue;
    },
    handleMouseDown: function(e) {
      if (this.refs.textField.isFocused()) {
        return;
      }
      UI.preventDefault(e);
      this.startTransclude(e);
      return util.onceDragConsummated(e, null, (function(_this) {
        return function() {
          return _this.refs.textField.selectAll();
        };
      })(this));
    },
    startTransclude: function(e) {
      UI.dragging = {
        cursor: config.cursor.grabbing
      };
      return util.onceDragConsummated(e, (function(_this) {
        return function() {
          return UI.dragging = {
            cursor: config.cursor.grabbing,
            offset: {
              x: -4,
              y: -10
            },
            render: function() {
              return R.VariableView({
                variable: _this.variable
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
                UI.activeTransclusionDropView.handleTransclusionDrop(_this.variable);
              }
              return UI.activeTransclusionDropView = null;
            }
          };
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
        ref: "textField",
        className: "VariableLabel",
        value: this.variable.label,
        onInput: this.handleInput
      }));
    }
  });

  R.create("VariableValueView", {
    propTypes: {
      variable: C.Variable
    },
    handleInput: function(newValue) {
      return this.variable.valueString = newValue;
    },
    handleMouseDown: function(e) {
      if (this.refs.textField.isFocused()) {
        return;
      }
      UI.preventDefault(e);
      this.startScrub(e);
      return util.onceDragConsummated(e, null, (function(_this) {
        return function() {
          return _this.refs.textField.selectAll();
        };
      })(this));
    },
    startScrub: function(e) {
      var originalValue, originalX, originalY, precision;
      originalX = e.clientX;
      originalY = e.clientY;
      originalValue = this.variable.getValue();
      precision = 0.1;
      return UI.startVariableScrub({
        variable: this.variable,
        cursor: this.cursor(),
        onMove: (function(_this) {
          return function(e) {
            var d, dx, dy, value;
            dx = e.clientX - originalX;
            dy = -(e.clientY - originalY);
            if (_this.variable.domain === "domain") {
              d = dx;
            } else {
              d = dy;
            }
            value = originalValue + d * precision;
            return util.floatToString(value, precision);
          };
        })(this)
      });
    },
    cursor: function() {
      if (this.isMounted()) {
        if (this.refs.textField.isFocused()) {
          return config.cursor.text;
        }
      }
      if (this.variable.domain === "domain") {
        return config.cursor.horizontalScrub;
      } else {
        return config.cursor.verticalScrub;
      }
    },
    render: function() {
      return R.span({
        style: {
          cursor: this.cursor()
        },
        onMouseDown: this.handleMouseDown
      }, R.TextFieldView({
        ref: "textField",
        className: "VariableValue",
        value: this.variable.valueString,
        onInput: this.handleInput
      }));
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
    handleCreateCustomFnClick: function() {
      return this.editor.createCustomFn();
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
      })(this)), R.button({
        className: "CreateCustomFn",
        onClick: this.handleCreateCustomFnClick
      })), R.div({
        className: "dragging"
      }, R.DraggingView({})));
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
}, "view/plot/GridView": function(exports, require, module) {(function() {
  R.create("GridView", {
    propTypes: {
      customFn: C.CustomFn
    },
    getBounds: function() {
      var customFn;
      customFn = this.lookup("customFn");
      return customFn.bounds;
    },
    drawFn: function(canvas) {
      var ctx, xMax, xMin, yMax, yMin, _ref;
      ctx = canvas.getContext("2d");
      _ref = this.getBounds(), xMin = _ref.xMin, xMax = _ref.xMax, yMin = _ref.yMin, yMax = _ref.yMax;
      util.canvas.clear(ctx);
      return util.canvas.drawGrid(ctx, {
        xMin: xMin,
        xMax: xMax,
        yMin: yMin,
        yMax: yMax
      });
    },
    componentDidUpdate: function() {
      var lastDrawParameters, xMax, xMin, yMax, yMin, _ref;
      _ref = this.getBounds(), xMin = _ref.xMin, xMax = _ref.xMax, yMin = _ref.yMin, yMax = _ref.yMax;
      lastDrawParameters = {
        xMin: xMin,
        xMax: xMax,
        yMin: yMin,
        yMax: yMax
      };
      if (!_.isEqual(lastDrawParameters, this._lastDrawParameters)) {
        this.refs.canvas.draw();
      }
      return this._lastDrawParameters = lastDrawParameters;
    },
    render: function() {
      return R.CanvasView({
        drawFn: this.drawFn,
        ref: "canvas"
      });
    }
  });

}).call(this);
}, "view/plot/PlotCartesianView": function(exports, require, module) {(function() {
  var evaluate, evaluateDiscontinuity;

  evaluate = require("../../compile/evaluate");

  evaluateDiscontinuity = require("../../compile/evaluateDiscontinuity");

  R.create("PlotCartesianView", {
    propTypes: {
      fnString: String,
      style: Object
    },
    getBounds: function() {
      var customFn;
      customFn = this.lookup("customFn");
      return customFn.bounds;
    },
    drawFn: function(canvas) {
      var ctx, fn, testDiscontinuity, xMax, xMin, yMax, yMin, _ref;
      ctx = canvas.getContext("2d");
      fn = evaluate(this.fnString);
      testDiscontinuity = null;
      util.canvas.clear(ctx);
      _ref = this.getBounds(), xMin = _ref.xMin, xMax = _ref.xMax, yMin = _ref.yMin, yMax = _ref.yMax;
      util.canvas.drawCartesian(ctx, {
        xMin: xMin,
        xMax: xMax,
        yMin: yMin,
        yMax: yMax,
        fn: fn,
        testDiscontinuity: testDiscontinuity
      });
      util.canvas.setStyle(ctx, this.style);
      return ctx.stroke();
    },
    shouldComponentUpdate: function(nextProps) {
      if (nextProps.fnString !== this.fnString) {
        return true;
      }
      if (!_.isEqual(nextProps.style, this.style)) {
        return true;
      }
      if (!_.isEqual(this.getBounds(), this._lastBounds)) {
        return true;
      }
      return false;
    },
    componentDidUpdate: function() {
      this._lastBounds = _.clone(this.getBounds());
      return this.refs.canvas.draw();
    },
    render: function() {
      return R.CanvasView({
        drawFn: this.drawFn,
        ref: "canvas"
      });
    }
  });

}).call(this);
}, "view/plot/PlotView": function(exports, require, module) {(function() {
  var Compiler, evaluate, evaluateDiscontinuity;

  Compiler = require("../../compile/Compiler");

  evaluate = require("../../compile/evaluate");

  evaluateDiscontinuity = require("../../compile/evaluateDiscontinuity");

  R.create("PlotView", {
    propTypes: {
      expr: C.Expr,
      style: Object
    },
    compile: function() {
      var compiled, compiler, customFn, xVariable;
      customFn = this.lookup("customFn");
      if (!customFn) {
        return;
      }
      xVariable = customFn.paramVariables[0];
      compiler = new Compiler();
      compiler.substitute(xVariable, "x");
      compiled = compiler.compile(this.expr);
      return compiled = "(function (x) { return " + compiled + " ; })";
    },
    render: function() {
      return R.PlotCartesianView({
        fnString: this.compile(),
        style: this.style
      });
    }
  });

}).call(this);
}, "view/ui/HoverCaptureView": function(exports, require, module) {(function() {
  R.create("HoverCaptureView", {
    propTypes: {
      hoverData: Object
    },
    handleMouseDown: function() {
      return UI.hoverIsActive = true;
    },
    handleMouseEnter: function() {
      return UI.hoverData = this.hoverData;
    },
    handleMouseLeave: function() {
      if (UI.hoverIsActive) {
        return;
      }
      return UI.hoverData = null;
    },
    render: function() {
      return R.span({
        onMouseDown: this.handleMouseDown,
        onMouseEnter: this.handleMouseEnter,
        onMouseLeave: this.handleMouseLeave
      }, this.props.children);
    }
  });

}).call(this);
}, "view/ui/TextFieldView": function(exports, require, module) {(function() {
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
    shouldComponentUpdate: function(nextProps) {
      return this._isDirty || nextProps.value !== this.props.value;
    },
    refresh: function() {
      var el;
      el = this.getDOMNode();
      if (el.textContent !== this.value) {
        el.textContent = this.value;
      }
      this._isDirty = false;
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
      this._isDirty = true;
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
}});
