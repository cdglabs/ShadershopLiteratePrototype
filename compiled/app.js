
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
}, "dom": function(exports, require, module) {(function() {
  var dom, fnizeSelector;

  dom = {};

  dom.traverseUntil = function(node, selector, traverse) {
    if (!node) {
      return null;
    }
    selector = fnizeSelector(selector);
    if (selector(node)) {
      return node;
    } else {
      return dom.traverseUntil(traverse(node), selector, traverse);
    }
  };

  dom.isEditingHost = function(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return false;
    }
    return node.isContentEditable && !node.parentNode.isContentEditable;
  };

  dom.parentNode = function(node) {
    return node.parentNode;
  };

  dom.nextSibling = function(node) {
    return node.nextSibling;
  };

  dom.previousSibling = function(node) {
    return node.previousSibling;
  };

  dom.next = function(node) {};

  fnizeSelector = function(selector) {
    if (_.isString(selector)) {
      return function(node) {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          return false;
        }
        return node.matches(selector);
      };
    } else {
      return selector;
    }
  };

}).call(this);
}, "domAddons": function(exports, require, module) {(function() {
  var fnizeSelector, _base, _ref, _ref1;

  if ((_base = Element.prototype).matches == null) {
    _base.matches = (_ref = (_ref1 = Element.prototype.webkitMatchesSelector) != null ? _ref1 : Element.prototype.mozMatchesSelector) != null ? _ref : Element.prototype.oMatchesSelector;
  }

  fnizeSelector = function(selector) {
    if (_.isString(selector)) {
      return function(node) {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          return false;
        }
        return node.matches(selector);
      };
    } else {
      return selector;
    }
  };

  Node.prototype.closest = function(selector) {
    var fn, parent;
    fn = fnizeSelector(selector);
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

}).call(this);
}, "main": function(exports, require, module) {(function() {
  var Selection, UI, editor, eventName, json, refresh, refreshView, saveState, storageName, willRefreshNextFrame, _i, _len, _ref;

  require("model/C");

  require("view/R");

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

  Selection = require("./Selection");

  window.UI = UI = new ((function() {
    function _Class() {
      this.autofocus = null;
    }

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
      if (this.string === "that") {
        return new C.That();
      } else if (_.contains(["+", "-", "*", "/"], this.string)) {
        return new C.Op(this.string);
      } else if (/[0-9]/.test(this.string)) {
        return new C.Param(this.string);
      } else if (/:$/.test(this.string)) {
        return new C.Param("", this.string.slice(0, -1));
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
}, "view/EditorView": function(exports, require, module) {(function() {
  R.create("EditorView", {
    propTypes: {
      editor: C.Editor
    },
    render: function() {
      return R.div({
        className: "editor"
      }, R.ProgramView({
        program: this.editor.programs[0]
      }));
    }
  });

}).call(this);
}, "view/LineOutputView": function(exports, require, module) {(function() {
  var compile, truncate;

  compile = require("../compile/compile");

  truncate = function(value) {
    var s;
    s = value.toFixed(8);
    if (s.indexOf(".") !== -1) {
      s = s.replace(/\.?0*$/, "");
    }
    if (s === "-0") {
      s = "0";
    }
    return s;
  };

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
      return truncate(value);
    },
    render: function() {
      return R.div({
        className: "word lineOutput"
      }, this.value());
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
}, "view/ParamView": function(exports, require, module) {(function() {
  R.create("ParamView", {
    propTypes: {
      param: C.Param
    },
    render: function() {
      return R.div({
        className: "word param"
      }, this.param.label === "" ? R.div({
        className: "paramLabelEmpty"
      }) : R.ParamLabelView({
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
    render: function() {
      return R.TextFieldView({
        className: "paramLabel",
        value: this.param.label,
        onInput: this.handleInput
      });
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
    render: function() {
      return R.TextFieldView({
        className: "paramValue",
        value: this.param.valueString,
        onInput: this.handleInput
      });
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
      return this.props.__owner__;
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

  require("./TextFieldView");

  require("./EditorView");

  require("./ProgramView");

  require("./LineView");

  require("./LineOutputView");

  require("./WordListView");

  require("./WordView");

  require("./ParamView");

  require("./WordSpacerView");

}).call(this);
}, "view/TextFieldView": function(exports, require, module) {(function() {
  var Selection, findAdjacentHost;

  Selection = require("../Selection");

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
}, "view/WordListView": function(exports, require, module) {(function() {
  R.create("WordListView", {
    propTypes: {
      wordList: C.WordList
    },
    insertPlaceholderBefore: function(index, string) {
      var placeholder, word;
      placeholder = new C.Placeholder(string);
      word = placeholder.convert();
      this.wordList.splice(index, 0, word);
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
}, "view/WordSpacerView": function(exports, require, module) {(function() {
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
    render: function() {
      return R.TextFieldView({
        className: "wordSpacer",
        onInput: this.handleInput,
        onBackSpace: this.handleBackSpace,
        onEnter: this.handleEnter
      });
    }
  });

}).call(this);
}, "view/WordView": function(exports, require, module) {(function() {
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
      }, "that");
    }
  });

}).call(this);
}, "view/old/WordListView": function(exports, require, module) {(function() {
  R.create("WordListView", {
    insertPlaceholderBefore: function(string, index) {
      var placeholder, word, wordList, _ref;
      wordList = this.props.wordList;
      placeholder = new C.Placeholder(string);
      word = (_ref = placeholder.convert()) != null ? _ref : placeholder;
      wordList.splice(index, 0, word);
      return this.setAutoFocus(index);
    },
    removeWordAt: function(index) {
      var wordList;
      wordList = this.props.wordList;
      wordList.splice(index, 1);
      return UI.setAutoFocus({
        wordListView: this,
        spacerIndex: index
      });
    },
    replaceWordAt: function(word, index) {
      var wordList;
      wordList = this.props.wordList;
      wordList.splice(index, 1, word);
      return this.setAutoFocus(index);
    },
    setAutoFocus: function(createdWordIndex) {
      var word, wordList;
      wordList = this.props.wordList;
      word = wordList.words[createdWordIndex];
      if (word instanceof C.That || word instanceof C.Op) {
        return UI.setAutoFocus({
          wordListView: this,
          spacerIndex: createdWordIndex + 1
        });
      } else {
        return UI.setAutoFocus({
          wordListView: this,
          index: createdWordIndex
        });
      }
    },
    render: function() {
      var index, result, word, wordList, wordListView, words, _i, _len;
      wordList = this.props.wordList;
      words = wordList.words;
      result = [];
      wordListView = this;
      for (index = _i = 0, _len = words.length; _i < _len; index = ++_i) {
        word = words[index];
        result.push(R.WordSpacerView({
          wordListView: wordListView,
          spacerIndex: index,
          key: "spacer" + index
        }));
        result.push(R.WordView({
          word: word,
          wordListView: wordListView,
          index: index,
          key: "word" + index
        }));
      }
      result.push(R.WordSpacerView({
        wordListView: wordListView,
        spacerIndex: index,
        key: "spacer" + index
      }));
      result = _.filter(result, function(instance) {
        var nextWord, previousWord;
        if ((index = instance.props.spacerIndex) != null) {
          previousWord = words[index - 1];
          nextWord = words[index];
          if (previousWord instanceof C.Placeholder || nextWord instanceof C.Placeholder) {
            return false;
          }
        }
        return true;
      });
      return R.div({
        className: "wordList"
      }, result);
    }
  });

}).call(this);
}, "view/old/views": function(exports, require, module) {(function() {
  var ContentEditableMixin, Selection, findAdjacentHost;

  Selection = require("../Selection");

  R.create("EditorView", {
    propTypes: {
      editor: C.Editor
    },
    render: function() {
      return R.div({
        className: "editor"
      }, this.editor.lines.map((function(_this) {
        return function(line, index) {
          return R.LineView({
            line: line,
            index: index,
            key: index
          });
        };
      })(this)));
    }
  });

  R.create("LineView", {
    propTypes: {
      line: C.Line,
      index: Number
    },
    handleKeyDown: function(e) {
      var host, insertIndex, insertLine, lineHosts;
      if (e.keyCode === 13) {
        host = Selection.getHost();
        lineHosts = this.getDOMNode().querySelectorAll("[contenteditable]");
        if (_.last(lineHosts) === host) {
          insertIndex = this.index + 1;
        } else {
          insertIndex = this.index;
        }
        insertLine = new C.Line();
        return this.lookup("editor").lines.splice(insertIndex, 0, insertLine);
      }
    },
    render: function() {
      return R.div({
        className: "line",
        onKeyDown: this.handleKeyDown
      }, R.WordListView({
        wordList: this.line.wordList
      }));
    }
  });

  findAdjacentHost = function(el, direction) {
    var hosts, index;
    hosts = document.querySelectorAll("[contenteditable]");
    hosts = _.toArray(hosts);
    index = hosts.indexOf(el);
    return hosts[index + direction];
  };

  ContentEditableMixin = {
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
          return typeof this.handleBackspace === "function" ? this.handleBackspace() : void 0;
        }
      } else if (e.keyCode === 13) {
        return e.preventDefault();
      }
    },
    attemptAutoFocus: function() {
      var el;
      if (UI.attemptAutoFocus(this.props)) {
        el = this.getDOMNode();
        return Selection.setAtEnd(el);
      }
    },
    componentDidUpdate: function() {
      return this.attemptAutoFocus();
    },
    componentDidMount: function() {
      return this.attemptAutoFocus();
    }
  };

  R.create("WordView", {
    propTypes: {
      word: C.Word,
      index: Number
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

  R.create("WordSpacerView", {
    mixins: [ContentEditableMixin],
    handleInput: function() {
      var el, spacerIndex, string, wordListView, _ref;
      _ref = this.props, wordListView = _ref.wordListView, spacerIndex = _ref.spacerIndex;
      el = this.getDOMNode();
      string = el.textContent;
      el.innerHTML = "";
      return wordListView.insertPlaceholderBefore(string, spacerIndex);
    },
    handleBackspace: function() {
      var spacerIndex, wordListView, _ref;
      _ref = this.props, wordListView = _ref.wordListView, spacerIndex = _ref.spacerIndex;
      if (spacerIndex > 0) {
        return wordListView.removeWordAt(spacerIndex - 1);
      }
    },
    render: function() {
      var spacerIndex, wordListView, _ref;
      _ref = this.props, wordListView = _ref.wordListView, spacerIndex = _ref.spacerIndex;
      return R.div({
        className: "wordSpacer",
        contentEditable: true,
        onInput: this.handleInput,
        onKeyDown: this.handleKeyDown
      });
    }
  });

  R.create("PlaceholderView", {
    placeholder: function() {
      return this.props.placeholder;
    },
    mixins: [ContentEditableMixin],
    handleInput: function() {
      var converted, index, placeholder, string, wordListView, _ref;
      _ref = this.props, placeholder = _ref.placeholder, wordListView = _ref.wordListView, index = _ref.index;
      string = this.getDOMNode().textContent;
      placeholder.string = string;
      if (string === "") {
        return wordListView.removeWordAt(index);
      } else {
        converted = placeholder.convert();
        if (converted) {
          return wordListView.replaceWordAt(converted, index);
        }
      }
    },
    render: function() {
      var index, placeholder, wordListView, _ref;
      _ref = this.props, placeholder = _ref.placeholder, wordListView = _ref.wordListView, index = _ref.index;
      return R.div({
        className: "word placeholder",
        contentEditable: true,
        onInput: this.handleInput,
        onKeyDown: this.handleKeyDown
      }, placeholder.string);
    }
  });

  R.create("ParamView", {
    mixins: [ContentEditableMixin],
    handleInput: function() {
      var el, index, param, string, wordListView, _ref;
      _ref = this.props, param = _ref.param, wordListView = _ref.wordListView, index = _ref.index;
      el = this.getDOMNode();
      string = el.textContent;
      return param.valueString = string;
    },
    render: function() {
      var index, param, wordListView, _ref;
      _ref = this.props, param = _ref.param, wordListView = _ref.wordListView, index = _ref.index;
      return R.div({
        className: "word param",
        contentEditable: true,
        onInput: this.handleInput,
        onKeyDown: this.handleKeyDown
      }, param.valueString);
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
      }, "that");
    }
  });

}).call(this);
}});
