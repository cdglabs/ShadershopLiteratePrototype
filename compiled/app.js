
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
  var C, UI, editor, eventName, refresh, refreshView, willRefreshNextFrame, _i, _len, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  require("view/R");

  window.C = C = {};

  C.Word = (function() {
    function Word() {}

    return Word;

  })();

  C.Param = (function(_super) {
    __extends(Param, _super);

    function Param(value) {
      this.value = value != null ? value : 0;
      this.beforeString = "";
      this.valueString = "";
      this.afterString = "";
    }

    Param.prototype.setWithString = function(string) {
      var floatRegEx, match, matches, sides;
      floatRegEx = /[-+]?[0-9]*\.?[0-9]+/;
      matches = string.match(floatRegEx);
      if (!matches || matches.length === 0) {
        this.beforeString = string;
        this.valueString = "";
        return this.afterString = "";
      } else {
        match = matches[0];
        sides = string.split(match);
        this.beforeString = sides[0];
        this.valueString = match;
        this.afterString = sides.slice(1).join(match);
        return this.value = parseFloat(this.valueString);
      }
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
        return new C.Param();
      } else {
        return null;
      }
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
    function WordList() {
      this.words = [];
    }

    WordList.prototype.splice = function() {
      var args, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (_ref = this.words).splice.apply(_ref, args);
    };

    return WordList;

  })();

  C.Line = (function() {
    function Line() {
      this.wordList = new C.WordList();
    }

    return Line;

  })();

  C.Editor = (function() {
    function Editor() {
      this.lines = [];
    }

    return Editor;

  })();

  window.editor = editor = new C.Editor();

  (function() {
    var line, words;
    line = new C.Line();
    editor.lines.push(line);
    words = line.wordList.words;
    words.push(new C.Param(3));
    words.push(new C.Op("+"));
    words.push(new C.Param(5));
    words.push(new C.Placeholder("asdf"));
    return editor.lines.push(new C.Line());
  })();

  window.UI = UI = new ((function() {
    function _Class() {
      this.autofocus = null;
    }

    _Class.prototype.setAutoFocus = function(match) {
      return this.autofocus = {
        match: match
      };
    };

    _Class.prototype.attemptAutoFocus = function(props) {
      var key, matches, value, _ref;
      if (!this.autofocus) {
        return false;
      }
      matches = true;
      _ref = this.autofocus.match;
      for (key in _ref) {
        if (!__hasProp.call(_ref, key)) continue;
        value = _ref[key];
        if (props[key] !== value) {
          matches = false;
        }
      }
      if (matches) {
        this.autofocus = null;
        return true;
      } else {
        return false;
      }
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
}, "view/R": function(exports, require, module) {(function() {
  var R, key, value, _ref,
    __hasProp = {}.hasOwnProperty;

  module.exports = R = {};

  _ref = React.DOM;
  for (key in _ref) {
    if (!__hasProp.call(_ref, key)) continue;
    value = _ref[key];
    R[key] = value;
  }

  R.cx = React.addons.classSet;

  R.create = function(name, opts) {
    opts.displayName = name;
    return R[name] = React.createClass(opts);
  };

  window.R = R;

  require("./views");

  require("./WordListView");

}).call(this);
}, "view/WordListView": function(exports, require, module) {(function() {
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
}, "view/views": function(exports, require, module) {(function() {
  var ContentEditableMixin, Selection, findAdjacentHost;

  Selection = require("../Selection");

  R.create("EditorView", {
    render: function() {
      var editor;
      editor = this.props.editor;
      return R.div({
        className: "editor"
      }, editor.lines.map(function(line, index) {
        return R.LineView({
          line: line,
          key: index
        });
      }));
    }
  });

  R.create("LineView", {
    render: function() {
      var line;
      line = this.props.line;
      return R.div({
        className: "line"
      }, R.WordListView({
        wordList: line.wordList
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
    render: function() {
      var index, word, wordListView, _ref;
      _ref = this.props, word = _ref.word, wordListView = _ref.wordListView, index = _ref.index;
      if (word instanceof C.Placeholder) {
        return R.PlaceholderView({
          placeholder: word,
          wordListView: wordListView,
          index: index
        });
      } else if (word instanceof C.Param) {
        return R.ParamView({
          param: word,
          wordListView: wordListView,
          index: index
        });
      } else if (word instanceof C.Op) {
        return R.OpView({
          op: word,
          wordListView: wordListView,
          index: index
        });
      } else if (word instanceof C.That) {
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
      var childNode, el, index, param, string, wordListView, _i, _len, _ref, _ref1, _ref2;
      _ref = this.props, param = _ref.param, wordListView = _ref.wordListView, index = _ref.index;
      el = this.getDOMNode();
      string = el.textContent;
      this._preserveCursor = (_ref1 = Selection.beforeSelection()) != null ? _ref1.toString().length : void 0;
      _ref2 = _.toArray(el.childNodes);
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        childNode = _ref2[_i];
        if (childNode.nodeType !== Node.ELEMENT_NODE) {
          el.removeChild(childNode);
        }
      }
      el.childNodes[0].innerHTML = param.beforeString;
      el.childNodes[1].innerHTML = param.valueString;
      el.childNodes[2].innerHTML = param.afterString;
      return param.setWithString(string);
    },
    componentDidUpdate: function() {
      var el, param, range;
      param = this.props.param;
      if (this._preserveCursor) {
        el = this.getDOMNode();
        range = document.createRange();
        if (this._preserveCursor <= param.beforeString.length) {
          range.setStart(el.childNodes[0].firstChild, this._preserveCursor);
        }
        range.collapse(true);
        Selection.set(range);
        console.log(this._preserveCursor);
        return this._preserveCursor = null;
      }
    },
    render: function() {
      var index, param, wordListView, _ref;
      _ref = this.props, param = _ref.param, wordListView = _ref.wordListView, index = _ref.index;
      return R.div({
        className: "word param",
        contentEditable: true,
        onInput: this.handleInput,
        onKeyDown: this.handleKeyDown
      }, R.span({}, param.beforeString), R.span({
        className: "paramValue"
      }, param.valueString), R.span({}, param.afterString));
    }
  });

  R.create("OpView", {
    render: function() {
      var index, op, wordListView, _ref;
      _ref = this.props, op = _ref.op, wordListView = _ref.wordListView, index = _ref.index;
      return R.div({
        className: "word op"
      }, op.opString);
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
