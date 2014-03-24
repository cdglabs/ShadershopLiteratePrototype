






window.C = C = {}

class C.Word
  constructor: ->

class C.Param extends C.Word
  constructor: (@valueString = "0") ->
    @label = ""

class C.Op extends C.Word
  constructor: (@opString = "+") ->

class C.That extends C.Word
  constructor: ->

class C.Placeholder extends C.Word
  constructor: (@string = "") ->
  convert: ->
    if @string == "that"
      return new C.That()
    else if _.contains(["+", "-", "*", "/"], @string)
      return new C.Op(@string)
    else if /[0-9]/.test(@string)
      return new C.Param(@string)
    else
      return this

class C.Parens extends C.Word
  constructor: ->
    @wordList = new C.WordList()

class C.Application extends C.Word
  constructor: ->
    @fn = null
    @params = [] # list of WordLists


class C.WordList
  constructor: ->
    @words = []

  splice: (args...) ->
    @words.splice(args...)


class C.Line
  constructor: ->
    @wordList = new C.WordList()


class C.Editor
  constructor: ->
    @lines = []




require("view/R")






window.editor = editor = new C.Editor()
do ->
  line = new C.Line()
  editor.lines.push(line)
  words = line.wordList.words
  words.push(new C.Param("3"))
  words.push(new C.Op("+"))
  words.push(new C.Param("5"))
  words.push(new C.Placeholder("asdf"))
  editor.lines.push(new C.Line())







window.UI = UI = new class
  constructor: ->
    @autofocus = null

  setAutoFocus: (opts) ->
    opts.descendantOf ?= []
    opts.props ?= {}
    if !_.isArray(opts.descendantOf)
      opts.descendantOf = [opts.descendantOf]
    @autofocus = opts

  attemptAutoFocus: (textFieldView) ->
    return false unless @autofocus

    matchesDescendantOf = _.every @autofocus.descendantOf, (ancestorView) =>
      textFieldView.lookupView(ancestorView)
    return false unless matchesDescendantOf

    matchesProps = _.every @autofocus.props, (propValue, propName) =>
      textFieldView.lookup(propName) == propValue
    return false unless matchesProps

    @autofocus = null
    return true










willRefreshNextFrame = false
refresh = ->
  return if willRefreshNextFrame
  willRefreshNextFrame = true
  requestAnimationFrame ->
    refreshView()
    willRefreshNextFrame = false

refreshView = ->
  editorEl = document.querySelector("#editor")
  React.renderComponent(R.EditorView({editor}), editorEl)




for eventName in ["mousedown", "mousemove", "mouseup", "keydown", "scroll", "change"]
  window.addEventListener(eventName, refresh)

refresh()





document.styleSheets.start_autoreload(1000)