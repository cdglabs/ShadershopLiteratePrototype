






require("model/C")
require("view/R")




storageName = "spaceShaderTyper"

window.reset = ->
  delete window.localStorage[storageName]
  location.reload()

if json = window.localStorage[storageName]
  json = JSON.parse(json)
  window.editor = editor = C.reconstruct(json)
else
  window.editor = editor = new C.Editor()

saveState = ->
  json = C.deconstruct(editor)
  json = JSON.stringify(json)
  window.localStorage[storageName] = json





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
    saveState()
    willRefreshNextFrame = false

refreshView = ->
  editorEl = document.querySelector("#editor")
  React.renderComponent(R.EditorView({editor}), editorEl)




for eventName in ["mousedown", "mousemove", "mouseup", "keydown", "scroll", "change"]
  window.addEventListener(eventName, refresh)

refresh()





document.styleSheets.start_autoreload(1000)