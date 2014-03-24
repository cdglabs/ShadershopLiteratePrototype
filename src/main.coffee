






require("model/C")
require("view/R")






window.editor = editor = new C.Editor()
do ->
  line = new C.Line()
  editor.lines.push(line)
  words = line.wordList.words
  words.push(new C.Param("3", "a"))
  words.push(new C.Op("+"))
  words.push(new C.Param("5", "b"))
  editor.lines.push(new C.Line())






Selection = require("./Selection")

window.UI = UI = new class
  constructor: ->
    @autofocus = null

  setAutoFocus: (opts) ->
    opts.descendantOf ?= []
    if !_.isArray(opts.descendantOf)
      opts.descendantOf = [opts.descendantOf]

    opts.props ?= {}

    opts.location ?= "end"

    @autofocus = opts

  attemptAutoFocus: (textFieldView) ->
    return unless @autofocus

    matchesDescendantOf = _.every @autofocus.descendantOf, (ancestorView) =>
      textFieldView.lookupView(ancestorView)
    return unless matchesDescendantOf

    matchesProps = _.every @autofocus.props, (propValue, propName) =>
      textFieldView.lookup(propName) == propValue
    return unless matchesProps

    # Found a match, focus it.
    el = textFieldView.getDOMNode()
    if @autofocus.location == "start"
      Selection.setAtStart(el)
    else if @autofocus.location == "end"
      Selection.setAtEnd(el)

    @autofocus = null










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