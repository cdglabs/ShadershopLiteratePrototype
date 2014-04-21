
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
  var eventName, json, refresh, refreshEventNames, refreshView, saveState, storageName, willRefreshNextFrame, _i, _len;

  require("./config");

  require("./util/util");

  require("./model/C");

  require("./view/R");

  require("./UI");

  require("./savedExamples");

  storageName = config.storageName;

  window.reset = function() {
    delete window.localStorage[storageName];
    return location.reload();
  };

  if (json = window.localStorage[storageName]) {
    json = JSON.parse(json);
    window.appRoot = C.reconstruct(json);
  } else {
    window.appRoot = new C.AppRoot();
  }

  saveState = function() {
    json = C.deconstruct(appRoot);
    json = JSON.stringify(json);
    return window.localStorage[storageName] = json;
  };

  window.save = function() {
    return window.localStorage[storageName];
  };

  window.restore = function(jsonString) {
    if (!_.isString(jsonString)) {
      jsonString = JSON.stringify(jsonString);
    }
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
    var appRootEl;
    appRootEl = document.querySelector("#AppRoot");
    return React.renderComponent(R.AppRootView({
      appRoot: appRoot
    }), appRootEl);
  };

  refreshEventNames = ["mousedown", "mousemove", "mouseup", "keydown", "scroll", "change", "wheel", "mousewheel"];

  for (_i = 0, _len = refreshEventNames.length; _i < _len; _i++) {
    eventName = refreshEventNames[_i];
    window.addEventListener(eventName, refresh);
  }

  refresh();

  if (location.protocol === "file:") {
    document.styleSheets.start_autoreload(1000);
  }

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

  C.Paragraph = (function() {
    function Paragraph() {
      this.html = "<p>---</p>";
    }

    return Paragraph;

  })();

  C.Workspace = (function() {
    function Workspace() {
      this.workspaceEntries = [new C.CustomFn()];
    }

    Workspace.prototype.getAvailableFns = function(originCustomFn) {
      var customFns, fns;
      fns = builtInFnDefinitions.map((function(_this) {
        return function(definition) {
          return new C.BuiltInFn(definition.fnName);
        };
      })(this));
      customFns = _.filter(this.workspaceEntries, (function(_this) {
        return function(workspaceEntry) {
          return workspaceEntry instanceof C.CustomFn;
        };
      })(this));
      customFns = _.reject(customFns, (function(_this) {
        return function(customFn) {
          var customFnDependencies;
          customFnDependencies = customFn.getCustomFnDependencies();
          return _.contains(customFnDependencies, originCustomFn);
        };
      })(this));
      fns = fns.concat(customFns);
      return fns;
    };

    return Workspace;

  })();

  C.AppRoot = (function() {
    function AppRoot() {
      this.workspaces = [new C.Workspace()];
    }

    return AppRoot;

  })();

}).call(this);
}, "savedExamples": function(exports, require, module) {(function() {
  var savedExamples;

  savedExamples = window.savedExamples = {};

  savedExamples.noise = {
    "objects": {
      "id60621397674581882363047513": {
        "html": "<p>In this example we'll implement <b>fractal noise</b>.</p>",
        "__id": "id60621397674581882363047513",
        "__className": "Paragraph"
      },
      "id60641397674912222468505647": {
        "valueString": "7.32",
        "label": "x",
        "domain": "domain",
        "domainCoord": 0,
        "__id": "id60641397674912222468505647",
        "__className": "Variable"
      },
      "id37631397672744985842801324": {
        "valueString": "0",
        "label": "x",
        "domain": "domain",
        "domainCoord": 0,
        "__id": "id37631397672744985842801324",
        "__className": "Variable"
      },
      "id60081397672896080202692229": {
        "fnName": "add",
        "__id": "id60081397672896080202692229",
        "__className": "BuiltInFn"
      },
      "id55681397672852248781407171": {
        "fnName": "add",
        "__id": "id55681397672852248781407171",
        "__className": "BuiltInFn"
      },
      "id53541397672845052963149318": {
        "fnName": "add",
        "__id": "id53541397672845052963149318",
        "__className": "BuiltInFn"
      },
      "id51411397672838914149840812": {
        "fnName": "add",
        "__id": "id51411397672838914149840812",
        "__className": "BuiltInFn"
      },
      "id44771397672808882694025554": {
        "fnName": "add",
        "__id": "id44771397672808882694025554",
        "__className": "BuiltInFn"
      },
      "id44071397672808671248708599": {
        "valueString": "0",
        "label": "",
        "domain": "range",
        "domainCoord": 0,
        "__id": "id44071397672808671248708599",
        "__className": "Variable"
      },
      "id45841397672815189246173400": {
        "fnName": "identity",
        "__id": "id45841397672815189246173400",
        "__className": "BuiltInFn"
      },
      "id17231397672626128618531094": {
        "valueString": "0",
        "label": "x",
        "domain": "domain",
        "domainCoord": 0,
        "__id": "id17231397672626128618531094",
        "__className": "Variable"
      },
      "id24381397672677656881140444": {
        "valueString": "2",
        "label": "octave",
        "domain": "range",
        "domainCoord": 0,
        "__id": "id24381397672677656881140444",
        "__className": "Variable"
      },
      "id35631397672711278426397396": {
        "fnName": "div",
        "__id": "id35631397672711278426397396",
        "__className": "BuiltInFn"
      },
      "id8871397672552245295384721": {
        "valueString": "0",
        "label": "x",
        "domain": "domain",
        "domainCoord": 0,
        "__id": "id8871397672552245295384721",
        "__className": "Variable"
      },
      "id18521397606090181995060606": {
        "valueString": "0",
        "label": "x",
        "domain": "domain",
        "domainCoord": 0,
        "__id": "id18521397606090181995060606",
        "__className": "Variable"
      },
      "id20091397606109865982236105": {
        "valueString": "0.96",
        "label": "edge 0",
        "domain": "range",
        "domainCoord": 0,
        "__id": "id20091397606109865982236105",
        "__className": "Variable"
      },
      "id20101397606109866173217725": {
        "valueString": "2.61",
        "label": "edge 1",
        "domain": "range",
        "domainCoord": 0,
        "__id": "id20101397606109866173217725",
        "__className": "Variable"
      },
      "id21397605414806194341558": {
        "valueString": "-0.81",
        "label": "x",
        "domain": "domain",
        "domainCoord": 0,
        "__id": "id21397605414806194341558",
        "__className": "Variable"
      },
      "id2081397605673099642823816": {
        "valueString": "0.99",
        "label": "edge 0",
        "domain": "range",
        "domainCoord": 0,
        "__id": "id2081397605673099642823816",
        "__className": "Variable"
      },
      "id21397605670038186761684": {
        "valueString": "2.46",
        "label": "edge 1",
        "domain": "range",
        "domainCoord": 0,
        "__id": "id21397605670038186761684",
        "__className": "Variable"
      },
      "id6471397605719046957650591": {
        "fnName": "add",
        "__id": "id6471397605719046957650591",
        "__className": "BuiltInFn"
      },
      "id4731397605700819168007263": {
        "fnName": "mul",
        "__id": "id4731397605700819168007263",
        "__className": "BuiltInFn"
      },
      "id3391397605690795196264996": {
        "fnName": "identity",
        "__id": "id3391397605690795196264996",
        "__className": "BuiltInFn"
      },
      "id2491397605673174795752112": {
        "fnName": "sub",
        "__id": "id2491397605673174795752112",
        "__className": "BuiltInFn"
      },
      "id31397605671891668527791": {
        "fn": {
          "__ref": "id2491397605673174795752112"
        },
        "label": "",
        "paramExprs": [
          {
            "__ref": "id21397605670038186761684"
          }, {
            "__ref": "id2081397605673099642823816"
          }
        ],
        "isProvisional": false,
        "__id": "id31397605671891668527791",
        "__className": "Application"
      },
      "id3381397605690790625460566": {
        "fn": {
          "__ref": "id3391397605690795196264996"
        },
        "label": "slope",
        "paramExprs": [
          {
            "__ref": "id31397605671891668527791"
          }
        ],
        "isProvisional": true,
        "__id": "id3381397605690790625460566",
        "__className": "Application"
      },
      "id3851397605695560935189690": {
        "fn": {
          "__ref": "id4731397605700819168007263"
        },
        "label": "*",
        "paramExprs": [
          {
            "__ref": "id21397605414806194341558"
          }, {
            "__ref": "id3381397605690790625460566"
          }
        ],
        "isProvisional": false,
        "__id": "id3851397605695560935189690",
        "__className": "Application"
      },
      "id4901397605717196387199655": {
        "fn": {
          "__ref": "id6471397605719046957650591"
        },
        "label": "",
        "paramExprs": [
          {
            "__ref": "id3851397605695560935189690"
          }, {
            "__ref": "id2081397605673099642823816"
          }
        ],
        "isProvisional": false,
        "__id": "id4901397605717196387199655",
        "__className": "Application"
      },
      "id11397605414790587874259": {
        "label": "mix",
        "paramVariables": [
          {
            "__ref": "id21397605414806194341558"
          }, {
            "__ref": "id2081397605673099642823816"
          }, {
            "__ref": "id21397605670038186761684"
          }
        ],
        "rootExprs": [
          {
            "__ref": "id4901397605717196387199655"
          }, {
            "__ref": "id3381397605690790625460566"
          }
        ],
        "bounds": {
          "xMin": -6,
          "xMax": 6,
          "yMin": -6,
          "yMax": 6
        },
        "__id": "id11397605414790587874259",
        "__className": "CustomFn"
      },
      "id7161397605984675631414022": {
        "valueString": "0",
        "label": "x",
        "domain": "domain",
        "domainCoord": 0,
        "__id": "id7161397605984675631414022",
        "__className": "Variable"
      },
      "id16431397606044491268788006": {
        "fnName": "identity",
        "__id": "id16431397606044491268788006",
        "__className": "BuiltInFn"
      },
      "id7191397606001864212514753": {
        "valueString": "0",
        "label": "x",
        "domain": "domain",
        "domainCoord": 0,
        "__id": "id7191397606001864212514753",
        "__className": "Variable"
      },
      "id9851397606008610381570517": {
        "fnName": "mul",
        "__id": "id9851397606008610381570517",
        "__className": "BuiltInFn"
      },
      "id7201397606006712283742655": {
        "fn": {
          "__ref": "id9851397606008610381570517"
        },
        "label": "",
        "paramExprs": [
          {
            "__ref": "id7191397606001864212514753"
          }, {
            "__ref": "id7191397606001864212514753"
          }
        ],
        "isProvisional": false,
        "__id": "id7201397606006712283742655",
        "__className": "Application"
      },
      "id7181397606001835372801593": {
        "label": "square",
        "paramVariables": [
          {
            "__ref": "id7191397606001864212514753"
          }
        ],
        "rootExprs": [
          {
            "__ref": "id7201397606006712283742655"
          }
        ],
        "bounds": {
          "xMin": -6,
          "xMax": 6,
          "yMin": -6,
          "yMax": 6
        },
        "__id": "id7181397606001835372801593",
        "__className": "CustomFn"
      },
      "id10901397606012920754219142": {
        "fn": {
          "__ref": "id7181397606001835372801593"
        },
        "label": "sq",
        "paramExprs": [
          {
            "__ref": "id7161397605984675631414022"
          }
        ],
        "isProvisional": false,
        "__id": "id10901397606012920754219142",
        "__className": "Application"
      },
      "id16421397606044480564947843": {
        "fn": {
          "__ref": "id16431397606044491268788006"
        },
        "label": "parabola 0",
        "paramExprs": [
          {
            "__ref": "id10901397606012920754219142"
          }
        ],
        "isProvisional": true,
        "__id": "id16421397606044480564947843",
        "__className": "Application"
      },
      "id16991397606050073488603224": {
        "fnName": "identity",
        "__id": "id16991397606050073488603224",
        "__className": "BuiltInFn"
      },
      "id14211397606025156843866812": {
        "fnName": "sub",
        "__id": "id14211397606025156843866812",
        "__className": "BuiltInFn"
      },
      "id1372139760602502863500741": {
        "valueString": "1",
        "label": "",
        "domain": "range",
        "domainCoord": 0,
        "__id": "id1372139760602502863500741",
        "__className": "Variable"
      },
      "id11831397606023270749790135": {
        "fn": {
          "__ref": "id14211397606025156843866812"
        },
        "label": "",
        "paramExprs": [
          {
            "__ref": "id7161397605984675631414022"
          }, {
            "__ref": "id1372139760602502863500741"
          }
        ],
        "isProvisional": false,
        "__id": "id11831397606023270749790135",
        "__className": "Application"
      },
      "id1448139760602889887911835": {
        "fn": {
          "__ref": "id7181397606001835372801593"
        },
        "label": "sq",
        "paramExprs": [
          {
            "__ref": "id11831397606023270749790135"
          }
        ],
        "isProvisional": false,
        "__id": "id1448139760602889887911835",
        "__className": "Application"
      },
      "id1614139760603526315851766": {
        "valueString": "1",
        "label": "",
        "domain": "range",
        "domainCoord": 0,
        "__id": "id1614139760603526315851766",
        "__className": "Variable"
      },
      "id16151397606035264579519868": {
        "valueString": "0",
        "label": "",
        "domain": "range",
        "domainCoord": 0,
        "__id": "id16151397606035264579519868",
        "__className": "Variable"
      },
      "id15301397606032865945801681": {
        "fn": {
          "__ref": "id11397605414790587874259"
        },
        "label": "mi",
        "paramExprs": [
          {
            "__ref": "id1448139760602889887911835"
          }, {
            "__ref": "id1614139760603526315851766"
          }, {
            "__ref": "id16151397606035264579519868"
          }
        ],
        "isProvisional": false,
        "__id": "id15301397606032865945801681",
        "__className": "Application"
      },
      "id16981397606050046204370032": {
        "fn": {
          "__ref": "id16991397606050073488603224"
        },
        "label": "parabola 1",
        "paramExprs": [
          {
            "__ref": "id15301397606032865945801681"
          }
        ],
        "isProvisional": true,
        "__id": "id16981397606050046204370032",
        "__className": "Application"
      },
      "id17551397606060621920156318": {
        "fn": {
          "__ref": "id11397605414790587874259"
        },
        "label": "mix",
        "paramExprs": [
          {
            "__ref": "id7161397605984675631414022"
          }, {
            "__ref": "id16421397606044480564947843"
          }, {
            "__ref": "id16981397606050046204370032"
          }
        ],
        "isProvisional": false,
        "__id": "id17551397606060621920156318",
        "__className": "Application"
      },
      "id7151397605984654812277229": {
        "label": "smooth cubic",
        "paramVariables": [
          {
            "__ref": "id7161397605984675631414022"
          }
        ],
        "rootExprs": [
          {
            "__ref": "id17551397606060621920156318"
          }, {
            "__ref": "id16421397606044480564947843"
          }, {
            "__ref": "id16981397606050046204370032"
          }
        ],
        "bounds": {
          "xMin": -0.5202827997589926,
          "xMax": 1.8053975938547868,
          "yMin": -0.7663053043076519,
          "yMax": 1.5593750893061276
        },
        "__id": "id7151397605984654812277229",
        "__className": "CustomFn"
      },
      "id18531397606102419671988059": {
        "fn": {
          "__ref": "id7151397605984654812277229"
        },
        "label": "smoo",
        "paramExprs": [
          {
            "__ref": "id18521397606090181995060606"
          }
        ],
        "isProvisional": false,
        "__id": "id18531397606102419671988059",
        "__className": "Application"
      },
      "id19281397606107278665564633": {
        "fn": {
          "__ref": "id11397605414790587874259"
        },
        "label": "mix",
        "paramExprs": [
          {
            "__ref": "id18531397606102419671988059"
          }, {
            "__ref": "id20091397606109865982236105"
          }, {
            "__ref": "id20101397606109866173217725"
          }
        ],
        "isProvisional": false,
        "__id": "id19281397606107278665564633",
        "__className": "Application"
      },
      "id1851139760609015539169492": {
        "label": "smooth mix",
        "paramVariables": [
          {
            "__ref": "id18521397606090181995060606"
          }, {
            "__ref": "id20091397606109865982236105"
          }, {
            "__ref": "id20101397606109866173217725"
          }
        ],
        "rootExprs": [
          {
            "__ref": "id19281397606107278665564633"
          }
        ],
        "bounds": {
          "xMin": -2.6337037037037057,
          "xMax": 3.1533333333333338,
          "yMin": -1.2074768518518517,
          "yMax": 4.579560185185186
        },
        "__id": "id1851139760609015539169492",
        "__className": "CustomFn"
      },
      "id16031397672601632702459508": {
        "fnName": "fract",
        "__id": "id16031397672601632702459508",
        "__className": "BuiltInFn"
      },
      "id15291397672600123697801885": {
        "fn": {
          "__ref": "id16031397672601632702459508"
        },
        "label": "fr",
        "paramExprs": [
          {
            "__ref": "id8871397672552245295384721"
          }
        ],
        "isProvisional": false,
        "__id": "id15291397672600123697801885",
        "__className": "Application"
      },
      "id1359139767258101656568105": {
        "fnName": "identity",
        "__id": "id1359139767258101656568105",
        "__className": "BuiltInFn"
      },
      "id7141397672535476396812256": {
        "valueString": "-0.60",
        "label": "x",
        "domain": "domain",
        "domainCoord": 0,
        "__id": "id7141397672535476396812256",
        "__className": "Variable"
      },
      "id21397672502447168273659": {
        "valueString": "0",
        "label": "x",
        "domain": "domain",
        "domainCoord": 0,
        "__id": "id21397672502447168273659",
        "__className": "Variable"
      },
      "id7071397672518891560312329": {
        "fnName": "fract",
        "__id": "id7071397672518891560312329",
        "__className": "BuiltInFn"
      },
      "id4251397672515148795457683": {
        "fnName": "mul",
        "__id": "id4251397672515148795457683",
        "__className": "BuiltInFn"
      },
      "id1651397672511183894870947": {
        "fnName": "sin",
        "__id": "id1651397672511183894870947",
        "__className": "BuiltInFn"
      },
      "id31397672508882835274063": {
        "fn": {
          "__ref": "id1651397672511183894870947"
        },
        "label": "s",
        "paramExprs": [
          {
            "__ref": "id21397672502447168273659"
          }
        ],
        "isProvisional": false,
        "__id": "id31397672508882835274063",
        "__className": "Application"
      },
      "id3701397672515009498690029": {
        "valueString": "99999",
        "label": "generator",
        "domain": "range",
        "domainCoord": 0,
        "__id": "id3701397672515009498690029",
        "__className": "Variable"
      },
      "id2111397672513319155541622": {
        "fn": {
          "__ref": "id4251397672515148795457683"
        },
        "label": "",
        "paramExprs": [
          {
            "__ref": "id31397672508882835274063"
          }, {
            "__ref": "id3701397672515009498690029"
          }
        ],
        "isProvisional": false,
        "__id": "id2111397672513319155541622",
        "__className": "Application"
      },
      "id5761397672516758970134017": {
        "fn": {
          "__ref": "id7071397672518891560312329"
        },
        "label": "fra",
        "paramExprs": [
          {
            "__ref": "id2111397672513319155541622"
          }
        ],
        "isProvisional": false,
        "__id": "id5761397672516758970134017",
        "__className": "Application"
      },
      "id11397672502440877422195": {
        "label": "noise",
        "paramVariables": [
          {
            "__ref": "id21397672502447168273659"
          }
        ],
        "rootExprs": [
          {
            "__ref": "id5761397672516758970134017"
          }
        ],
        "bounds": {
          "xMin": -6,
          "xMax": 6,
          "yMin": -6,
          "yMax": 6
        },
        "__id": "id11397672502440877422195",
        "__className": "CustomFn"
      },
      "id8001397672543517318546580": {
        "fnName": "floor",
        "__id": "id8001397672543517318546580",
        "__className": "BuiltInFn"
      },
      "id71513976725420822420355": {
        "fn": {
          "__ref": "id8001397672543517318546580"
        },
        "label": "f",
        "paramExprs": [
          {
            "__ref": "id7141397672535476396812256"
          }
        ],
        "isProvisional": false,
        "__id": "id71513976725420822420355",
        "__className": "Application"
      },
      "id8091397672545416813967240": {
        "fn": {
          "__ref": "id11397672502440877422195"
        },
        "label": "noi",
        "paramExprs": [
          {
            "__ref": "id71513976725420822420355"
          }
        ],
        "isProvisional": false,
        "__id": "id8091397672545416813967240",
        "__className": "Application"
      },
      "id7131397672535462674735110": {
        "label": "step noise",
        "paramVariables": [
          {
            "__ref": "id7141397672535476396812256"
          }
        ],
        "rootExprs": [
          {
            "__ref": "id8091397672545416813967240"
          }
        ],
        "bounds": {
          "xMin": -6,
          "xMax": 6,
          "yMin": -6,
          "yMax": 6
        },
        "__id": "id7131397672535462674735110",
        "__className": "CustomFn"
      },
      "id8881397672562664611455659": {
        "fn": {
          "__ref": "id7131397672535462674735110"
        },
        "label": "st",
        "paramExprs": [
          {
            "__ref": "id8871397672552245295384721"
          }
        ],
        "isProvisional": false,
        "__id": "id8881397672562664611455659",
        "__className": "Application"
      },
      "id13581397672581000287260818": {
        "fn": {
          "__ref": "id1359139767258101656568105"
        },
        "label": "step noise 0",
        "paramExprs": [
          {
            "__ref": "id8881397672562664611455659"
          }
        ],
        "isProvisional": true,
        "__id": "id13581397672581000287260818",
        "__className": "Application"
      },
      "id14441397672585588612247866": {
        "fnName": "identity",
        "__id": "id14441397672585588612247866",
        "__className": "BuiltInFn"
      },
      "id11401397672574694574920948": {
        "fnName": "add",
        "__id": "id11401397672574694574920948",
        "__className": "BuiltInFn"
      },
      "id10761397672574569958331120": {
        "valueString": "1",
        "label": "",
        "domain": "range",
        "domainCoord": 0,
        "__id": "id10761397672574569958331120",
        "__className": "Variable"
      },
      "id9771397672573146817430417": {
        "fn": {
          "__ref": "id11401397672574694574920948"
        },
        "label": "",
        "paramExprs": [
          {
            "__ref": "id8871397672552245295384721"
          }, {
            "__ref": "id10761397672574569958331120"
          }
        ],
        "isProvisional": false,
        "__id": "id9771397672573146817430417",
        "__className": "Application"
      },
      "id12691397672577151581049190": {
        "fn": {
          "__ref": "id7131397672535462674735110"
        },
        "label": "st",
        "paramExprs": [
          {
            "__ref": "id9771397672573146817430417"
          }
        ],
        "isProvisional": false,
        "__id": "id12691397672577151581049190",
        "__className": "Application"
      },
      "id14431397672585575634747131": {
        "fn": {
          "__ref": "id14441397672585588612247866"
        },
        "label": "step noise 1",
        "paramExprs": [
          {
            "__ref": "id12691397672577151581049190"
          }
        ],
        "isProvisional": true,
        "__id": "id14431397672585575634747131",
        "__className": "Application"
      },
      "id16091397672603450513922751": {
        "fn": {
          "__ref": "id1851139760609015539169492"
        },
        "label": "smoo",
        "paramExprs": [
          {
            "__ref": "id15291397672600123697801885"
          }, {
            "__ref": "id13581397672581000287260818"
          }, {
            "__ref": "id14431397672585575634747131"
          }
        ],
        "isProvisional": false,
        "__id": "id16091397672603450513922751",
        "__className": "Application"
      },
      "id8861397672552228499661046": {
        "label": "smooth noise",
        "paramVariables": [
          {
            "__ref": "id8871397672552245295384721"
          }
        ],
        "rootExprs": [
          {
            "__ref": "id16091397672603450513922751"
          }, {
            "__ref": "id13581397672581000287260818"
          }, {
            "__ref": "id14431397672585575634747131"
          }
        ],
        "bounds": {
          "xMin": -6,
          "xMax": 6,
          "yMin": -6,
          "yMax": 6
        },
        "__id": "id8861397672552228499661046",
        "__className": "CustomFn"
      },
      "id28291397672699562295140799": {
        "fnName": "mul",
        "__id": "id28291397672699562295140799",
        "__className": "BuiltInFn"
      },
      "id24501397672694041220233699": {
        "fnName": "identity",
        "__id": "id24501397672694041220233699",
        "__className": "BuiltInFn"
      },
      "id24421397672677746480660189": {
        "fnName": "pow",
        "__id": "id24421397672677746480660189",
        "__className": "BuiltInFn"
      },
      "id23541397672669905847763568": {
        "valueString": "2",
        "label": "",
        "domain": "range",
        "domainCoord": 0,
        "__id": "id23541397672669905847763568",
        "__className": "Variable"
      },
      "id23551397672674556439946233": {
        "fn": {
          "__ref": "id24421397672677746480660189"
        },
        "label": "pow",
        "paramExprs": [
          {
            "__ref": "id23541397672669905847763568"
          }, {
            "__ref": "id24381397672677656881140444"
          }
        ],
        "isProvisional": false,
        "__id": "id23551397672674556439946233",
        "__className": "Application"
      },
      "id24491397672694034645006026": {
        "fn": {
          "__ref": "id24501397672694041220233699"
        },
        "label": "scale factor",
        "paramExprs": [
          {
            "__ref": "id23551397672674556439946233"
          }
        ],
        "isProvisional": true,
        "__id": "id24491397672694034645006026",
        "__className": "Application"
      },
      "id17241397672642092498872477": {
        "fn": {
          "__ref": "id28291397672699562295140799"
        },
        "label": "",
        "paramExprs": [
          {
            "__ref": "id17231397672626128618531094"
          }, {
            "__ref": "id24491397672694034645006026"
          }
        ],
        "isProvisional": false,
        "__id": "id17241397672642092498872477",
        "__className": "Application"
      },
      "id29621397672703279814642731": {
        "fn": {
          "__ref": "id8861397672552228499661046"
        },
        "label": "smoo",
        "paramExprs": [
          {
            "__ref": "id17241397672642092498872477"
          }
        ],
        "isProvisional": false,
        "__id": "id29621397672703279814642731",
        "__className": "Application"
      },
      "id30971397672708589256372422": {
        "fn": {
          "__ref": "id35631397672711278426397396"
        },
        "label": "",
        "paramExprs": [
          {
            "__ref": "id29621397672703279814642731"
          }, {
            "__ref": "id24491397672694034645006026"
          }
        ],
        "isProvisional": false,
        "__id": "id30971397672708589256372422",
        "__className": "Application"
      },
      "id17221397672626100341402376": {
        "label": "noise octave",
        "paramVariables": [
          {
            "__ref": "id17231397672626128618531094"
          }, {
            "__ref": "id24381397672677656881140444"
          }
        ],
        "rootExprs": [
          {
            "__ref": "id30971397672708589256372422"
          }, {
            "__ref": "id24491397672694034645006026"
          }
        ],
        "bounds": {
          "xMin": -6,
          "xMax": 6,
          "yMin": -6,
          "yMax": 6
        },
        "__id": "id17221397672626100341402376",
        "__className": "CustomFn"
      },
      "id38581397672760642938412809": {
        "valueString": "0",
        "label": "",
        "domain": "range",
        "domainCoord": 0,
        "__id": "id38581397672760642938412809",
        "__className": "Variable"
      },
      "id37651397672757240939045609": {
        "fn": {
          "__ref": "id17221397672626100341402376"
        },
        "label": "oct",
        "paramExprs": [
          {
            "__ref": "id37631397672744985842801324"
          }, {
            "__ref": "id38581397672760642938412809"
          }
        ],
        "isProvisional": false,
        "__id": "id37651397672757240939045609",
        "__className": "Application"
      },
      "id45831397672815153458609346": {
        "fn": {
          "__ref": "id45841397672815189246173400"
        },
        "label": "octave 0",
        "paramExprs": [
          {
            "__ref": "id37651397672757240939045609"
          }
        ],
        "isProvisional": true,
        "__id": "id45831397672815153458609346",
        "__className": "Application"
      },
      "id42991397672807076474492207": {
        "fn": {
          "__ref": "id44771397672808882694025554"
        },
        "label": "",
        "paramExprs": [
          {
            "__ref": "id44071397672808671248708599"
          }, {
            "__ref": "id45831397672815153458609346"
          }
        ],
        "isProvisional": false,
        "__id": "id42991397672807076474492207",
        "__className": "Application"
      },
      "id46791397672821482843881502": {
        "fnName": "identity",
        "__id": "id46791397672821482843881502",
        "__className": "BuiltInFn"
      },
      "id39831397672774956633418342": {
        "valueString": "1",
        "label": "",
        "domain": "range",
        "domainCoord": 0,
        "__id": "id39831397672774956633418342",
        "__className": "Variable"
      },
      "id38691397672771979898054729": {
        "fn": {
          "__ref": "id17221397672626100341402376"
        },
        "label": "nois",
        "paramExprs": [
          {
            "__ref": "id37631397672744985842801324"
          }, {
            "__ref": "id39831397672774956633418342"
          }
        ],
        "isProvisional": false,
        "__id": "id38691397672771979898054729",
        "__className": "Application"
      },
      "id46781397672821453891259740": {
        "fn": {
          "__ref": "id46791397672821482843881502"
        },
        "label": "octave 1",
        "paramExprs": [
          {
            "__ref": "id38691397672771979898054729"
          }
        ],
        "isProvisional": true,
        "__id": "id46781397672821453891259740",
        "__className": "Application"
      },
      "id49631397672837290259506201": {
        "fn": {
          "__ref": "id51411397672838914149840812"
        },
        "label": "",
        "paramExprs": [
          {
            "__ref": "id42991397672807076474492207"
          }, {
            "__ref": "id46781397672821453891259740"
          }
        ],
        "isProvisional": false,
        "__id": "id49631397672837290259506201",
        "__className": "Application"
      },
      "id47741397672825582227248003": {
        "fnName": "identity",
        "__id": "id47741397672825582227248003",
        "__className": "BuiltInFn"
      },
      "id41351397672783434301259227": {
        "valueString": "2",
        "label": "",
        "domain": "range",
        "domainCoord": 0,
        "__id": "id41351397672783434301259227",
        "__className": "Variable"
      },
      "id40161397672780712912015904": {
        "fn": {
          "__ref": "id17221397672626100341402376"
        },
        "label": "nois",
        "paramExprs": [
          {
            "__ref": "id37631397672744985842801324"
          }, {
            "__ref": "id41351397672783434301259227"
          }
        ],
        "isProvisional": false,
        "__id": "id40161397672780712912015904",
        "__className": "Application"
      },
      "id4773139767282555159229774": {
        "fn": {
          "__ref": "id47741397672825582227248003"
        },
        "label": "octave 2",
        "paramExprs": [
          {
            "__ref": "id40161397672780712912015904"
          }
        ],
        "isProvisional": true,
        "__id": "id4773139767282555159229774",
        "__className": "Application"
      },
      "id52121397672843269856883959": {
        "fn": {
          "__ref": "id53541397672845052963149318"
        },
        "label": "",
        "paramExprs": [
          {
            "__ref": "id49631397672837290259506201"
          }, {
            "__ref": "id4773139767282555159229774"
          }
        ],
        "isProvisional": false,
        "__id": "id52121397672843269856883959",
        "__className": "Application"
      },
      "id48691397672829789317065491": {
        "fnName": "identity",
        "__id": "id48691397672829789317065491",
        "__className": "BuiltInFn"
      },
      "id42771397672796938472848302": {
        "valueString": "3",
        "label": "",
        "domain": "range",
        "domainCoord": 0,
        "__id": "id42771397672796938472848302",
        "__className": "Variable"
      },
      "id41581397672793425717311336": {
        "fn": {
          "__ref": "id17221397672626100341402376"
        },
        "label": "nois",
        "paramExprs": [
          {
            "__ref": "id37631397672744985842801324"
          }, {
            "__ref": "id42771397672796938472848302"
          }
        ],
        "isProvisional": false,
        "__id": "id41581397672793425717311336",
        "__className": "Application"
      },
      "id48681397672829753333664463": {
        "fn": {
          "__ref": "id48691397672829789317065491"
        },
        "label": "octave 3",
        "paramExprs": [
          {
            "__ref": "id41581397672793425717311336"
          }
        ],
        "isProvisional": true,
        "__id": "id48681397672829753333664463",
        "__className": "Application"
      },
      "id5390139767285009957950373": {
        "fn": {
          "__ref": "id55681397672852248781407171"
        },
        "label": "",
        "paramExprs": [
          {
            "__ref": "id52121397672843269856883959"
          }, {
            "__ref": "id48681397672829753333664463"
          }
        ],
        "isProvisional": false,
        "__id": "id5390139767285009957950373",
        "__className": "Application"
      },
      "id57371397672887262269237275": {
        "fnName": "identity",
        "__id": "id57371397672887262269237275",
        "__className": "BuiltInFn"
      },
      "id57191397672883241338382899": {
        "valueString": "4",
        "label": "",
        "domain": "range",
        "domainCoord": 0,
        "__id": "id57191397672883241338382899",
        "__className": "Variable"
      },
      "id56051397672879733304292238": {
        "fn": {
          "__ref": "id17221397672626100341402376"
        },
        "label": "noise",
        "paramExprs": [
          {
            "__ref": "id37631397672744985842801324"
          }, {
            "__ref": "id57191397672883241338382899"
          }
        ],
        "isProvisional": false,
        "__id": "id56051397672879733304292238",
        "__className": "Application"
      },
      "id57361397672887231983162506": {
        "fn": {
          "__ref": "id57371397672887262269237275"
        },
        "label": "octave 4",
        "paramExprs": [
          {
            "__ref": "id56051397672879733304292238"
          }
        ],
        "isProvisional": true,
        "__id": "id57361397672887231983162506",
        "__className": "Application"
      },
      "id58311397672894035990968903": {
        "fn": {
          "__ref": "id60081397672896080202692229"
        },
        "label": "",
        "paramExprs": [
          {
            "__ref": "id5390139767285009957950373"
          }, {
            "__ref": "id57361397672887231983162506"
          }
        ],
        "isProvisional": false,
        "__id": "id58311397672894035990968903",
        "__className": "Application"
      },
      "id37621397672744958885944092": {
        "label": "fractal noise",
        "paramVariables": [
          {
            "__ref": "id37631397672744985842801324"
          }
        ],
        "rootExprs": [
          {
            "__ref": "id58311397672894035990968903"
          }, {
            "__ref": "id45831397672815153458609346"
          }, {
            "__ref": "id46781397672821453891259740"
          }, {
            "__ref": "id4773139767282555159229774"
          }, {
            "__ref": "id48681397672829753333664463"
          }, {
            "__ref": "id57361397672887231983162506"
          }
        ],
        "bounds": {
          "xMin": 2.7614506172839492,
          "xMax": 7.583981481481481,
          "yMin": -1.802403549382716,
          "yMax": 3.020127314814816
        },
        "__id": "id37621397672744958885944092",
        "__className": "CustomFn"
      },
      "id60651397674916201948514484": {
        "fn": {
          "__ref": "id37621397672744958885944092"
        },
        "label": "frac",
        "paramExprs": [
          {
            "__ref": "id60641397674912222468505647"
          }
        ],
        "isProvisional": false,
        "__id": "id60651397674916201948514484",
        "__className": "Application"
      },
      "id60631397674912215788185779": {
        "label": "",
        "paramVariables": [
          {
            "__ref": "id60641397674912222468505647"
          }
        ],
        "rootExprs": [
          {
            "__ref": "id60651397674916201948514484"
          }
        ],
        "bounds": {
          "xMin": 5.220738269441747,
          "xMax": 11.00777530647878,
          "yMin": -2.2192232366405986,
          "yMax": 3.56781380039644
        },
        "__id": "id60631397674912215788185779",
        "__className": "CustomFn"
      },
      "id61751397674930552174886188": {
        "html": "<p><b>fractal noise</b> has the characteristic that as you zoom in, the features you see resemble the shape of the function zoomed out. The graph resembles the skyline of a mountain.</p><p>The goal of this essay is to understand in a deeper way why this function looks the way it does.</p><p>In implementing it, we'll also learn how to make a rudimentary pseudorandom number generator, strategies for sampling functions, and how to use <b>mix</b> and <b>smooth mix</b> to interpolate between values.<br></p>",
        "__id": "id61751397674930552174886188",
        "__className": "Paragraph"
      },
      "id60441397673034639527574003": {
        "html": "<p><b>noise</b> is a pseudorandom number generator. We desire a function such that as <b>x</b> varies, the result seems to vary randomly.</p><p>To see how this implementation works, try setting <b>generator</b> to <b>0</b> and then slowly increasing it. As it increases, the graph becomes more and more haphazard. When it is a very large number, we're essentially sampling floating point rounding errors.</p><p>Note: I've used this function as a pseudorandom number generator in shaders for a while. But until playing with it in this interface, I never appreciated one of its disadvantages: that it is <b>0</b> at multiples of pi, and in particular at <b>x = 0</b>, which has implications for how we use it later.</p>",
        "__id": "id60441397673034639527574003",
        "__className": "Paragraph"
      },
      "id60451397673430757425463410": {
        "html": "<p>We'll want our noise to have a controllable characteristic frequency. Whereas <b>noise</b> varies essentially instantaneously as <b>x</b> increases, <b>step noise</b> varies at a specific rate, namely at every integer step.</p><p>To implement this, we sample <b>noise</b> only at the integers by first taking <b>floor</b> of <b>x</b> before <b>noise</b>.</p><p>If you don't see why the result has the stepped look that it does, try manipulating <b>x</b> to see how this sampling strategy works.</p>",
        "__id": "id60451397673430757425463410",
        "__className": "Paragraph"
      },
      "id60461397673699194592589865": {
        "html": "<p>Instead of immediately jumping to the next random value when <b>x</b> crosses an integer boundary in <b>step noise</b>, <b>smooth noise</b> smoothly interpolates between the sampled values of <b>step noise</b>.</p><p>To implement this, we take the <b>step noise</b> value on either side of <b>x</b> (e.g. the <b>floor</b> of <b>x</b> and the <b>floor + 1</b> of <b>x</b>). We then use <b>fract</b> of <b>x</b> as the interpolation control for the <b>smooth mix</b> between these two sampled values.</p><p><b>smooth mix</b> is defined in the appendix.</p>",
        "__id": "id60461397673699194592589865",
        "__className": "Paragraph"
      },
      "id60471397674032308242938221": {
        "html": "<p>Now we can make <b>fractal noise</b>!</p><p>A fractal has the characteristic that as you zoom in, the features you see seem to have the same character as the entire shape when zoomed out.</p><p>Since <b>smooth noise</b> has a definite characteristic frequency, we can build fractal noise by taking several scaled versions of <b>smooth noise</b> and adding them together.</p><p>This construction can be easily seen by inspecting the graphs down the left column to see how the shape evolves as smaller and smaller <b>smooth noise</b> is added in.</p>",
        "__id": "id60471397674032308242938221",
        "__className": "Paragraph"
      },
      "id60481397674409509319780840": {
        "html": "<p>Here is the implementation for <b>noise octave</b>, which uniformly scales (i.e. in domain and range) the shape of <b>smooth noise</b>.</p>",
        "__id": "id60481397674409509319780840",
        "__className": "Paragraph"
      },
      "id6061139767451790339751134": {
        "html": "<p>APPENDIX</p>",
        "__id": "id6061139767451790339751134",
        "__className": "Paragraph"
      },
      "id11397605452784514260357": {
        "html": "<p><b>mix</b> linearly interpolates between two values.</p><p>When <b>x</b> is <b>0</b>, the result is <b>edge 0</b>. When <b>x</b> is <b>1</b>, the result is <b>edge 1</b>. When <b>x</b> is between <b>0</b> and <b>1</b>, the result is proportionally between <b>edge 0</b> and <b>edge 1</b>.</p><p><b>mix</b> is implemented by first determining the <i>slope</i> of the desired line as the difference betwen <b>edge 1</b> and <b>edge 0</b>. We then multiply <b>x</b> by this slope and add <b>edge 0</b>.</p>",
        "__id": "id11397605452784514260357",
        "__className": "Paragraph"
      },
      "id71413976057641944587366": {
        "html": "<p><b>smooth mix</b> is a smooth interpolation between two values.</p><p>Like <b>mix</b>, when <b>x</b> is <b>0</b>, the result is <b>edge 0</b> and when <b>x</b> is <b>1</b>, the result is <b>edge 1</b>. However, interpolation is not linear in between <b>0</b> and <b>1</b>. Instead, we want the <i>derivative</i> at <b>x = 0</b> and <b>x = 1</b> to be <b>0</b>, so that the result starts horizontonal at <b>0</b>, ramps up, then ramps down to horizontal at <b>1</b>.</p><p><b>smooth mix</b> is implemented by first applying <b>smooth cubic</b> (see below) to <b>x</b> and then using the resulting smooth value in a linear <b>mix</b> between <b>edge 0</b> and <b>edge 1</b>.</p>",
        "__id": "id71413976057641944587366",
        "__className": "Paragraph"
      },
      "id2024139760615345761183924": {
        "html": "<p>For <b>smooth cubic</b>, we desire a function which passes through <b>(0, 0)</b> and <b>(1, 1)</b> whose derivative is <b>0</b> at <b>x = 0</b> and <b>x = 1</b>.</p><p>We construct this by making two parabolas, <b>parabola 0</b> and <b>parabola 1</b>, and mixing between them.</p><p>Note: this polynomial is usually written x*x*(3 - 2*x) in graphics programming references and is derived symbolically by solving for the coefficients of the cubic equation based on the above constraints. But I feel that mixing two parabolas, is a more visual construction...</p>",
        "__id": "id2024139760615345761183924",
        "__className": "Paragraph"
      },
      "id41397605414868186858579": {
        "workspaceEntries": [
          {
            "__ref": "id60621397674581882363047513"
          }, {
            "__ref": "id60631397674912215788185779"
          }, {
            "__ref": "id61751397674930552174886188"
          }, {
            "__ref": "id60441397673034639527574003"
          }, {
            "__ref": "id11397672502440877422195"
          }, {
            "__ref": "id60451397673430757425463410"
          }, {
            "__ref": "id7131397672535462674735110"
          }, {
            "__ref": "id60461397673699194592589865"
          }, {
            "__ref": "id8861397672552228499661046"
          }, {
            "__ref": "id60471397674032308242938221"
          }, {
            "__ref": "id37621397672744958885944092"
          }, {
            "__ref": "id60481397674409509319780840"
          }, {
            "__ref": "id17221397672626100341402376"
          }, {
            "__ref": "id6061139767451790339751134"
          }, {
            "__ref": "id11397605452784514260357"
          }, {
            "__ref": "id11397605414790587874259"
          }, {
            "__ref": "id71413976057641944587366"
          }, {
            "__ref": "id1851139760609015539169492"
          }, {
            "__ref": "id2024139760615345761183924"
          }, {
            "__ref": "id7151397605984654812277229"
          }, {
            "__ref": "id7181397606001835372801593"
          }
        ],
        "__id": "id41397605414868186858579",
        "__className": "Workspace"
      },
      "id31397605414867264503688": {
        "workspaces": [
          {
            "__ref": "id41397605414868186858579"
          }
        ],
        "__id": "id31397605414867264503688",
        "__className": "AppRoot"
      }
    },
    "root": {
      "__ref": "id31397605414867264503688"
    }
  };

  savedExamples.blank = {
    "objects": {
      "id2139768443678581197550": {
        "valueString": "0",
        "label": "x",
        "domain": "domain",
        "domainCoord": 0,
        "__id": "id2139768443678581197550",
        "__className": "Variable"
      },
      "id11397684436769471798380": {
        "label": "",
        "paramVariables": [
          {
            "__ref": "id2139768443678581197550"
          }
        ],
        "rootExprs": [
          {
            "__ref": "id2139768443678581197550"
          }
        ],
        "bounds": {
          "xMin": -6,
          "xMax": 6,
          "yMin": -6,
          "yMax": 6
        },
        "__id": "id11397684436769471798380",
        "__className": "CustomFn"
      },
      "id41397684436854440944728": {
        "workspaceEntries": [
          {
            "__ref": "id11397684436769471798380"
          }
        ],
        "__id": "id41397684436854440944728",
        "__className": "Workspace"
      },
      "id31397684436854753274288": {
        "workspaces": [
          {
            "__ref": "id41397684436854440944728"
          }
        ],
        "__id": "id31397684436854753274288",
        "__className": "AppRoot"
      }
    },
    "root": {
      "__ref": "id31397684436854753274288"
    }
  };

  savedExamples.waveforms = {
    "objects": {
      "id91991397685717041419512019": {
        "html": "<p>Here are some basic wave forms.</p><p>I've normalized these to all range from <b>0</b> to <b>1</b> and have wavelength <b>1</b>.</p>",
        "__id": "id91991397685717041419512019",
        "__className": "Paragraph"
      },
      "id88251397685559642601110611": {
        "valueString": "0",
        "label": "x",
        "domain": "domain",
        "domainCoord": 0,
        "__id": "id88251397685559642601110611",
        "__className": "Variable"
      },
      "id100721397685790022183844098": {
        "fnName": "mul",
        "__id": "id100721397685790022183844098",
        "__className": "BuiltInFn"
      },
      "id97661397685784301961487331": {
        "fnName": "add",
        "__id": "id97661397685784301961487331",
        "__className": "BuiltInFn"
      },
      "id89991397685580567689726342": {
        "fnName": "sin",
        "__id": "id89991397685580567689726342",
        "__className": "BuiltInFn"
      },
      "id89211397685567889246926002": {
        "fnName": "mul",
        "__id": "id89211397685567889246926002",
        "__className": "BuiltInFn"
      },
      "id89171397685567796692214487": {
        "valueString": "6.2832",
        "label": "TAU",
        "domain": "range",
        "domainCoord": 0,
        "__id": "id89171397685567796692214487",
        "__className": "Variable"
      },
      "id88261397685565425221616330": {
        "fn": {
          "__ref": "id89211397685567889246926002"
        },
        "label": "*",
        "paramExprs": [
          {
            "__ref": "id88251397685559642601110611"
          }, {
            "__ref": "id89171397685567796692214487"
          }
        ],
        "isProvisional": false,
        "__id": "id88261397685565425221616330",
        "__className": "Application"
      },
      "id89281397685578224849468435": {
        "fn": {
          "__ref": "id89991397685580567689726342"
        },
        "label": "sin",
        "paramExprs": [
          {
            "__ref": "id88261397685565425221616330"
          }
        ],
        "isProvisional": false,
        "__id": "id89281397685578224849468435",
        "__className": "Application"
      },
      "id97071397685784127316020818": {
        "valueString": "1",
        "label": "",
        "domain": "range",
        "domainCoord": 0,
        "__id": "id97071397685784127316020818",
        "__className": "Variable"
      },
      "id95831397685782515901345022": {
        "fn": {
          "__ref": "id97661397685784301961487331"
        },
        "label": "",
        "paramExprs": [
          {
            "__ref": "id89281397685578224849468435"
          }, {
            "__ref": "id97071397685784127316020818"
          }
        ],
        "isProvisional": false,
        "__id": "id95831397685782515901345022",
        "__className": "Application"
      },
      "id100171397685789894316440623": {
        "valueString": ".5",
        "label": "",
        "domain": "range",
        "domainCoord": 0,
        "__id": "id100171397685789894316440623",
        "__className": "Variable"
      },
      "id97971397685787905336374163": {
        "fn": {
          "__ref": "id100721397685790022183844098"
        },
        "label": "",
        "paramExprs": [
          {
            "__ref": "id95831397685782515901345022"
          }, {
            "__ref": "id100171397685789894316440623"
          }
        ],
        "isProvisional": false,
        "__id": "id97971397685787905336374163",
        "__className": "Application"
      },
      "id88241397685559598841987922": {
        "label": "sine wave",
        "paramVariables": [
          {
            "__ref": "id88251397685559642601110611"
          }
        ],
        "rootExprs": [
          {
            "__ref": "id97971397685787905336374163"
          }
        ],
        "bounds": {
          "xMin": -2.1984803444992527,
          "xMax": 4.745964099945195,
          "yMin": -2.851993546369979,
          "yMax": 4.092450898074467
        },
        "__id": "id88241397685559598841987922",
        "__className": "CustomFn"
      },
      "id90051397685623775723458270": {
        "valueString": "0",
        "label": "x",
        "domain": "domain",
        "domainCoord": 0,
        "__id": "id90051397685623775723458270",
        "__className": "Variable"
      },
      "id95781397685774918549297834": {
        "fnName": "fract",
        "__id": "id95781397685774918549297834",
        "__className": "BuiltInFn"
      },
      "id95051397685772046232708418": {
        "fn": {
          "__ref": "id95781397685774918549297834"
        },
        "label": "fr",
        "paramExprs": [
          {
            "__ref": "id90051397685623775723458270"
          }
        ],
        "isProvisional": false,
        "__id": "id95051397685772046232708418",
        "__className": "Application"
      },
      "id90041397685623746183695973": {
        "label": "sawtooth wave",
        "paramVariables": [
          {
            "__ref": "id90051397685623775723458270"
          }
        ],
        "rootExprs": [
          {
            "__ref": "id95051397685772046232708418"
          }
        ],
        "bounds": {
          "xMin": -1.6221509559327845,
          "xMax": 3.2003799082647477,
          "yMin": -1.8509811171124835,
          "yMax": 2.9715497470850476
        },
        "__id": "id90041397685623746183695973",
        "__className": "CustomFn"
      },
      "id85141397685487420532484404": {
        "valueString": "0",
        "label": "x",
        "domain": "domain",
        "domainCoord": 0,
        "__id": "id85141397685487420532484404",
        "__className": "Variable"
      },
      "id69041397685375693840812314": {
        "valueString": "0",
        "label": "x",
        "domain": "domain",
        "domainCoord": 0,
        "__id": "id69041397685375693840812314",
        "__className": "Variable"
      },
      "id7080139768538233192798803": {
        "valueString": "1.62",
        "label": "level",
        "domain": "range",
        "domainCoord": 0,
        "__id": "id7080139768538233192798803",
        "__className": "Variable"
      },
      "id75951397685398749881813211": {
        "valueString": "1",
        "label": "direction",
        "domain": "range",
        "domainCoord": 0,
        "__id": "id75951397685398749881813211",
        "__className": "Variable"
      },
      "id73611397685395118930048504": {
        "fnName": "add",
        "__id": "id73611397685395118930048504",
        "__className": "BuiltInFn"
      },
      "id82601397685411125222323918": {
        "fnName": "div",
        "__id": "id82601397685411125222323918",
        "__className": "BuiltInFn"
      },
      "id78561397685404328287943928": {
        "fnName": "abs",
        "__id": "id78561397685404328287943928",
        "__className": "BuiltInFn"
      },
      "id76461397685398856469849693": {
        "fnName": "mul",
        "__id": "id76461397685398856469849693",
        "__className": "BuiltInFn"
      },
      "id71331397685382462584599721": {
        "fnName": "sub",
        "__id": "id71331397685382462584599721",
        "__className": "BuiltInFn"
      },
      "id69051397685379146166726138": {
        "fn": {
          "__ref": "id71331397685382462584599721"
        },
        "label": "",
        "paramExprs": [
          {
            "__ref": "id69041397685375693840812314"
          }, {
            "__ref": "id7080139768538233192798803"
          }
        ],
        "isProvisional": false,
        "__id": "id69051397685379146166726138",
        "__className": "Application"
      },
      "id74461397685397113944028009": {
        "fn": {
          "__ref": "id76461397685398856469849693"
        },
        "label": "",
        "paramExprs": [
          {
            "__ref": "id69051397685379146166726138"
          }, {
            "__ref": "id75951397685398749881813211"
          }
        ],
        "isProvisional": false,
        "__id": "id74461397685397113944028009",
        "__className": "Application"
      },
      "id77871397685402632125449156": {
        "fn": {
          "__ref": "id78561397685404328287943928"
        },
        "label": "abs",
        "paramExprs": [
          {
            "__ref": "id74461397685397113944028009"
          }
        ],
        "isProvisional": false,
        "__id": "id77871397685402632125449156",
        "__className": "Application"
      },
      "id78621397685406023687478137": {
        "fn": {
          "__ref": "id82601397685411125222323918"
        },
        "label": "",
        "paramExprs": [
          {
            "__ref": "id77871397685402632125449156"
          }, {
            "__ref": "id75951397685398749881813211"
          }
        ],
        "isProvisional": false,
        "__id": "id78621397685406023687478137",
        "__className": "Application"
      },
      "id71901397685393292854127717": {
        "fn": {
          "__ref": "id73611397685395118930048504"
        },
        "label": "",
        "paramExprs": [
          {
            "__ref": "id78621397685406023687478137"
          }, {
            "__ref": "id7080139768538233192798803"
          }
        ],
        "isProvisional": false,
        "__id": "id71901397685393292854127717",
        "__className": "Application"
      },
      "id69031397685375663487705911": {
        "label": "reflect",
        "paramVariables": [
          {
            "__ref": "id69041397685375693840812314"
          }, {
            "__ref": "id7080139768538233192798803"
          }, {
            "__ref": "id75951397685398749881813211"
          }
        ],
        "rootExprs": [
          {
            "__ref": "id71901397685393292854127717"
          }
        ],
        "bounds": {
          "xMin": -6,
          "xMax": 6,
          "yMin": -6,
          "yMax": 6
        },
        "__id": "id69031397685375663487705911",
        "__className": "CustomFn"
      },
      "id47281397685228716604656407": {
        "valueString": "0",
        "label": "x",
        "domain": "domain",
        "domainCoord": 0,
        "__id": "id47281397685228716604656407",
        "__className": "Variable"
      },
      "id49761397685233283704187805": {
        "valueString": "3",
        "label": "base",
        "domain": "range",
        "domainCoord": 0,
        "__id": "id49761397685233283704187805",
        "__className": "Variable"
      },
      "id53911397685237407611622568": {
        "fnName": "mul",
        "__id": "id53911397685237407611622568",
        "__className": "BuiltInFn"
      },
      "id597113976852428994469442": {
        "fnName": "fract",
        "__id": "id597113976852428994469442",
        "__className": "BuiltInFn"
      },
      "id50211397685233385929339610": {
        "fnName": "div",
        "__id": "id50211397685233385929339610",
        "__className": "BuiltInFn"
      },
      "id47291397685231546846500888": {
        "fn": {
          "__ref": "id50211397685233385929339610"
        },
        "label": "",
        "paramExprs": [
          {
            "__ref": "id47281397685228716604656407"
          }, {
            "__ref": "id49761397685233283704187805"
          }
        ],
        "isProvisional": false,
        "__id": "id47291397685231546846500888",
        "__className": "Application"
      },
      "id54961397685239782722896646": {
        "fn": {
          "__ref": "id597113976852428994469442"
        },
        "label": "",
        "paramExprs": [
          {
            "__ref": "id47291397685231546846500888"
          }
        ],
        "isProvisional": false,
        "__id": "id54961397685239782722896646",
        "__className": "Application"
      },
      "id51261397685235241557465054": {
        "fn": {
          "__ref": "id53911397685237407611622568"
        },
        "label": "",
        "paramExprs": [
          {
            "__ref": "id54961397685239782722896646"
          }, {
            "__ref": "id49761397685233283704187805"
          }
        ],
        "isProvisional": false,
        "__id": "id51261397685235241557465054",
        "__className": "Application"
      },
      "id47271397685228702618763849": {
        "label": "mod",
        "paramVariables": [
          {
            "__ref": "id47281397685228716604656407"
          }, {
            "__ref": "id49761397685233283704187805"
          }
        ],
        "rootExprs": [
          {
            "__ref": "id51261397685235241557465054"
          }
        ],
        "bounds": {
          "xMin": -6,
          "xMax": 6,
          "yMin": -6,
          "yMax": 6
        },
        "__id": "id47271397685228702618763849",
        "__className": "CustomFn"
      },
      "id88171397685523952793248873": {
        "fnName": "mul",
        "__id": "id88171397685523952793248873",
        "__className": "BuiltInFn"
      },
      "id88131397685523865133736824": {
        "valueString": "2",
        "label": "",
        "domain": "range",
        "domainCoord": 0,
        "__id": "id88131397685523865133736824",
        "__className": "Variable"
      },
      "id8708139768552146669658139": {
        "fn": {
          "__ref": "id88171397685523952793248873"
        },
        "label": "*",
        "paramExprs": [
          {
            "__ref": "id85141397685487420532484404"
          }, {
            "__ref": "id88131397685523865133736824"
          }
        ],
        "isProvisional": false,
        "__id": "id8708139768552146669658139",
        "__className": "Application"
      },
      "id85901397685499218664434190": {
        "valueString": "2",
        "label": "",
        "domain": "range",
        "domainCoord": 0,
        "__id": "id85901397685499218664434190",
        "__className": "Variable"
      },
      "id8515139768549663392305718": {
        "fn": {
          "__ref": "id47271397685228702618763849"
        },
        "label": "mo",
        "paramExprs": [
          {
            "__ref": "id8708139768552146669658139"
          }, {
            "__ref": "id85901397685499218664434190"
          }
        ],
        "isProvisional": false,
        "__id": "id8515139768549663392305718",
        "__className": "Application"
      },
      "id8687139768551002215618620": {
        "valueString": "1",
        "label": "",
        "domain": "range",
        "domainCoord": 0,
        "__id": "id8687139768551002215618620",
        "__className": "Variable"
      },
      "id86881397685510023275998615": {
        "valueString": "-1",
        "label": "",
        "domain": "range",
        "domainCoord": 0,
        "__id": "id86881397685510023275998615",
        "__className": "Variable"
      },
      "id86081397685507955455455011": {
        "fn": {
          "__ref": "id69031397685375663487705911"
        },
        "label": "ref",
        "paramExprs": [
          {
            "__ref": "id8515139768549663392305718"
          }, {
            "__ref": "id8687139768551002215618620"
          }, {
            "__ref": "id86881397685510023275998615"
          }
        ],
        "isProvisional": false,
        "__id": "id86081397685507955455455011",
        "__className": "Application"
      },
      "id85131397685487384915090007": {
        "label": "triangle wave",
        "paramVariables": [
          {
            "__ref": "id85141397685487420532484404"
          }
        ],
        "rootExprs": [
          {
            "__ref": "id86081397685507955455455011"
          }
        ],
        "bounds": {
          "xMin": -0.8958980624142658,
          "xMax": 2.453081704389575,
          "yMin": -1.1986837705761324,
          "yMax": 2.15029599622771
        },
        "__id": "id85131397685487384915090007",
        "__className": "CustomFn"
      },
      "id39061397685161815180682671": {
        "valueString": "0",
        "label": "x",
        "domain": "domain",
        "domainCoord": 0,
        "__id": "id39061397685161815180682671",
        "__className": "Variable"
      },
      "id39681397685166966980687001": {
        "fnName": "floor",
        "__id": "id39681397685166966980687001",
        "__className": "BuiltInFn"
      },
      "id67401397685336915366357938": {
        "fnName": "mul",
        "__id": "id67401397685336915366357938",
        "__className": "BuiltInFn"
      },
      "id66911397685336815830956615": {
        "valueString": "2",
        "label": "",
        "domain": "range",
        "domainCoord": 0,
        "__id": "id66911397685336815830956615",
        "__className": "Variable"
      },
      "id65751397685335202435986140": {
        "fn": {
          "__ref": "id67401397685336915366357938"
        },
        "label": "",
        "paramExprs": [
          {
            "__ref": "id39061397685161815180682671"
          }, {
            "__ref": "id66911397685336815830956615"
          }
        ],
        "isProvisional": false,
        "__id": "id65751397685335202435986140",
        "__className": "Application"
      },
      "id39071397685164259634749789": {
        "fn": {
          "__ref": "id39681397685166966980687001"
        },
        "label": "fl",
        "paramExprs": [
          {
            "__ref": "id65751397685335202435986140"
          }
        ],
        "isProvisional": false,
        "__id": "id39071397685164259634749789",
        "__className": "Application"
      },
      "id6121139768526761025811830": {
        "valueString": "2",
        "label": "",
        "domain": "range",
        "domainCoord": 0,
        "__id": "id6121139768526761025811830",
        "__className": "Variable"
      },
      "id60501397685265064199658204": {
        "fn": {
          "__ref": "id47271397685228702618763849"
        },
        "label": "mo",
        "paramExprs": [
          {
            "__ref": "id39071397685164259634749789"
          }, {
            "__ref": "id6121139768526761025811830"
          }
        ],
        "isProvisional": false,
        "__id": "id60501397685265064199658204",
        "__className": "Application"
      },
      "id39051397685161790292303428": {
        "label": "square wave",
        "paramVariables": [
          {
            "__ref": "id39061397685161815180682671"
          }
        ],
        "rootExprs": [
          {
            "__ref": "id60501397685265064199658204"
          }
        ],
        "bounds": {
          "xMin": -1.1731520061728413,
          "xMax": 3.6493788580246913,
          "yMin": -1.9088425925925936,
          "yMax": 2.9136882716049386
        },
        "__id": "id39051397685161790292303428",
        "__className": "CustomFn"
      },
      "id103131397685806285692087027": {
        "html": "<p>APPENDIX</p>",
        "__id": "id103131397685806285692087027",
        "__className": "Paragraph"
      },
      "id41397684436854440944728": {
        "workspaceEntries": [
          {
            "__ref": "id91991397685717041419512019"
          }, {
            "__ref": "id88241397685559598841987922"
          }, {
            "__ref": "id90041397685623746183695973"
          }, {
            "__ref": "id85131397685487384915090007"
          }, {
            "__ref": "id39051397685161790292303428"
          }, {
            "__ref": "id103131397685806285692087027"
          }, {
            "__ref": "id47271397685228702618763849"
          }, {
            "__ref": "id69031397685375663487705911"
          }
        ],
        "__id": "id41397684436854440944728",
        "__className": "Workspace"
      },
      "id31397684436854753274288": {
        "workspaces": [
          {
            "__ref": "id41397684436854440944728"
          }
        ],
        "__id": "id31397684436854753274288",
        "__className": "AppRoot"
      }
    },
    "root": {
      "__ref": "id31397684436854753274288"
    }
  };

  savedExamples.restore = function(name) {
    var json;
    json = savedExamples[name];
    return window.appRoot = C.reconstruct(json);
  };

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
}, "view/AppRoot/AppRootView": function(exports, require, module) {(function() {
  R.create("AppRootView", {
    propTypes: {
      appRoot: C.AppRoot
    },
    cursor: function() {
      var _ref, _ref1;
      return (_ref = (_ref1 = UI.dragging) != null ? _ref1.cursor : void 0) != null ? _ref : "";
    },
    render: function() {
      return R.div({
        style: {
          cursor: this.cursor()
        }
      }, R.WorkspaceView({
        workspace: this.appRoot.workspaces[0]
      }), R.SavedExamplesView({}), R.div({
        className: "dragging"
      }, R.DraggingView({})));
    }
  });

}).call(this);
}, "view/AppRoot/DraggingView": function(exports, require, module) {(function() {
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
}, "view/AppRoot/SavedExamplesView": function(exports, require, module) {(function() {
  R.create("SavedExamplesView", {
    shouldComponentUpdate: function() {
      return false;
    },
    load: function(name) {
      return function() {
        return savedExamples.restore(name);
      };
    },
    render: function() {
      return R.div({
        className: "SavedExamples"
      }, R.div({
        className: "TextButtonLabel"
      }, "Examples"), R.div({
        className: "TextButton",
        onClick: this.load("blank")
      }, "Blank"), R.div({
        className: "TextButton",
        onClick: this.load("waveforms")
      }, "Waveforms"), R.div({
        className: "TextButton",
        onClick: this.load("noise")
      }, "Fractal Noise"));
    }
  });

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
      var variable, _ref, _ref1, _ref2, _ref3;
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
      }).call(this), ((_ref2 = UI.hoverData) != null ? _ref2.variable : void 0) && ((_ref3 = UI.hoverData) != null ? _ref3.customFn : void 0) === this.customFn && !_.contains(this.getDisplayVariables(), UI.hoverData.variable) ? R.PlotVariableView({
        variable: UI.hoverData.variable
      }) : void 0);
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
      var customFn, fns, possibleApplications, workspace;
      customFn = this.lookup("customFn");
      workspace = this.lookup("workspace");
      fns = workspace.getAvailableFns(customFn);
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
      this.application.setStagedApplication(this.possibleApplication);
      if (this.application.paramExprs.length > 1) {
        return UI.hoverData = {
          variable: this.application.paramExprs[1],
          customFn: this.lookup("customFn")
        };
      }
    },
    handleMouseLeave: function() {
      this.application.clearStagedApplication();
      return UI.hoverData = null;
    },
    handleMouseDown: function(e) {
      return e.preventDefault();
    },
    handleClick: function() {
      this.application.commitApplication();
      return UI.hoverData = null;
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
  var R, desugarPropType, key, value, _ref,
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

  desugarPropType = function(propType, optional) {
    var required;
    if (optional == null) {
      optional = false;
    }
    if (propType.optional) {
      propType = propType.optional;
      required = false;
    } else if (optional) {
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
    } else if (_.isArray(propType)) {
      propType = React.PropTypes.any;
    } else {
      propType = React.PropTypes.instanceOf(propType);
    }
    if (required) {
      propType = propType.isRequired;
    }
    return propType;
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
      opts.propTypes[propName] = desugarPropType(propType);
    }
    if (opts.mixins == null) {
      opts.mixins = [];
    }
    opts.mixins.unshift(R.UniversalMixin);
    return R[name] = React.createClass(opts);
  };

  require("./ui/TextFieldView");

  require("./ui/HTMLFieldView");

  require("./ui/HoverCaptureView");

  require("./AppRoot/AppRootView");

  require("./AppRoot/SavedExamplesView");

  require("./AppRoot/DraggingView");

  require("./Workspace/WorkspaceView");

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
        className: "TextButton",
        onClick: this.remove
      }, "remove")), R.div({
        className: "ExtrasLine"
      }, R.span({
        className: "TextButton",
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
}, "view/Workspace/WorkspaceView": function(exports, require, module) {(function() {
  R.create("WorkspaceView", {
    propTypes: {
      workspace: C.Workspace
    },
    render: function() {
      return R.div({
        className: "Workspace"
      }, R.WorkspaceExtrasView({
        workspace: this.workspace,
        workspaceIndex: -1
      }), this.workspace.workspaceEntries.map((function(_this) {
        return function(workspaceEntry, workspaceIndex) {
          return R.div({
            className: "WorkspaceEntry",
            key: C.id(workspaceEntry)
          }, workspaceEntry instanceof C.CustomFn ? R.CustomFnView({
            customFn: workspaceEntry
          }) : workspaceEntry instanceof C.Paragraph ? R.ParagraphView({
            paragraph: workspaceEntry
          }) : void 0, R.WorkspaceExtrasView({
            workspace: _this.workspace,
            workspaceIndex: workspaceIndex
          }));
        };
      })(this)));
    }
  });

  R.create("WorkspaceExtrasView", {
    propTypes: {
      workspace: C.Workspace,
      workspaceIndex: Number
    },
    shouldComponentUpdate: function(nextProps) {
      return nextProps.workspace !== this.workspace || nextProps.workspaceIndex !== this.workspaceIndex;
    },
    addEntry: function(entry) {
      return this.workspace.workspaceEntries.splice(this.workspaceIndex + 1, 0, entry);
    },
    addFunction: function() {
      return this.addEntry(new C.CustomFn());
    },
    addParagraph: function() {
      return this.addEntry(new C.Paragraph());
    },
    remove: function() {
      return this.workspace.workspaceEntries.splice(this.workspaceIndex, 1);
    },
    moveTop: function() {
      var entry;
      if (this.workspaceIndex === 0) {
        return;
      }
      entry = this.workspace.workspaceEntries[this.workspaceIndex];
      this.workspace.workspaceEntries.splice(this.workspaceIndex, 1);
      return this.workspace.workspaceEntries.splice(0, 0, entry);
    },
    moveUp: function() {
      var entry;
      if (this.workspaceIndex === 0) {
        return;
      }
      entry = this.workspace.workspaceEntries[this.workspaceIndex];
      this.workspace.workspaceEntries.splice(this.workspaceIndex, 1);
      return this.workspace.workspaceEntries.splice(this.workspaceIndex - 1, 0, entry);
    },
    moveDown: function() {
      var entry;
      if (this.workspaceIndex === this.workspace.workspaceEntries.length - 1) {
        return;
      }
      entry = this.workspace.workspaceEntries[this.workspaceIndex];
      this.workspace.workspaceEntries.splice(this.workspaceIndex, 1);
      return this.workspace.workspaceEntries.splice(this.workspaceIndex + 1, 0, entry);
    },
    moveBottom: function() {
      var entry;
      if (this.workspaceIndex === this.workspace.workspaceEntries.length - 1) {
        return;
      }
      entry = this.workspace.workspaceEntries[this.workspaceIndex];
      this.workspace.workspaceEntries.splice(this.workspaceIndex, 1);
      return this.workspace.workspaceEntries.splice(this.workspace.workspaceEntries.length, 0, entry);
    },
    render: function() {
      return R.div({
        className: "WorkspaceExtras"
      }, R.div({
        className: "CellHorizontal"
      }, R.div({
        className: "CellHorizontal TextButtonLabel"
      }, "add:"), R.div({
        className: "CellHorizontal TextButton",
        onClick: this.addFunction
      }, "function"), R.div({
        className: "CellHorizontal TextButton",
        onClick: this.addParagraph
      }, "text")), this.workspaceIndex >= 0 ? R.span({}, R.div({
        className: "CellHorizontal"
      }, R.div({
        className: "CellHorizontal TextButtonLabel"
      }, "move:"), R.div({
        className: "CellHorizontal TextButton",
        onClick: this.moveTop
      }, "top"), R.div({
        className: "CellHorizontal TextButton",
        onClick: this.moveUp
      }, "up"), R.div({
        className: "CellHorizontal TextButton",
        onClick: this.moveDown
      }, "down"), R.div({
        className: "CellHorizontal TextButton",
        onClick: this.moveBottom
      }, "bottom")), R.div({
        className: "CellHorizontal"
      }, R.div({
        className: "CellHorizontal TextButtonLabel"
      }, ""), R.div({
        className: "CellHorizontal TextButton",
        onClick: this.remove
      }, "remove"))) : void 0);
    }
  });

  R.create("ParagraphView", {
    propTypes: {
      paragraph: C.Paragraph
    },
    handleInput: function(newValue) {
      return this.paragraph.html = newValue;
    },
    render: function() {
      return R.HTMLFieldView({
        className: "Paragraph",
        value: this.paragraph.html,
        onInput: this.handleInput
      });
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
}, "view/ui/HTMLFieldView": function(exports, require, module) {(function() {
  R.create("HTMLFieldView", {
    propTypes: {
      value: String,
      className: String,
      onInput: Function
    },
    getDefaultProps: function() {
      return {
        value: "",
        className: "",
        onInput: function(newValue) {}
      };
    },
    shouldComponentUpdate: function(nextProps) {
      return this._isDirty || nextProps.value !== this.props.value;
    },
    refresh: function() {
      var el;
      el = this.getDOMNode();
      if (el.innerHTML !== this.value) {
        el.innerHTML = this.value;
      }
      return this._isDirty = false;
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
      newValue = el.innerHTML;
      return this.onInput(newValue);
    },
    render: function() {
      return R.div({
        className: this.className,
        contentEditable: true,
        onInput: this.handleInput
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
      onBlur: Function,
      allowEnter: Boolean
    },
    getDefaultProps: function() {
      return {
        value: "",
        className: "",
        onInput: function(newValue) {},
        onBackSpace: function() {},
        onEnter: function() {},
        onFocus: function() {},
        onBlur: function() {},
        allowEnter: false
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
        if (!this.allowEnter) {
          e.preventDefault();
          return this.onEnter();
        }
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
