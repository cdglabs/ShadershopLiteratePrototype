Selection = require("./Selection")

window.UI = UI = new class
  constructor: ->
    @dragging = null
    @autofocus = null

    @activeTransclusionDropView = null

    @registerEvents()

  registerEvents: ->
    window.addEventListener("mousemove", @handleWindowMouseMove)
    window.addEventListener("mouseup", @handleWindowMouseUp)


  # ===========================================================================
  # Event Util
  # ===========================================================================

  preventDefault: (e) ->
    e.preventDefault()
    Selection.set(null)


  # ===========================================================================
  # Dragging and Mouse Position
  # ===========================================================================

  handleWindowMouseMove: (e) =>
    @mousePosition = {x: e.clientX, y: e.clientY}
    @dragging?.onMove?(e)

  handleWindowMouseUp: (e) =>
    @dragging?.onUp?(e)
    @dragging = null

  getElementUnderMouse: ->
    draggingOverlayEl = document.querySelector(".draggingOverlay")
    draggingOverlayEl?.style.pointerEvents = "none"

    el = document.elementFromPoint(@mousePosition.x, @mousePosition.y)

    draggingOverlayEl?.style.pointerEvents = ""

    return el

  getViewUnderMouse: ->
    el = @getElementUnderMouse()
    el = el?.closest (el) -> el.dataFor?
    return el?.dataFor


  # ===========================================================================
  # Auto Focus
  # ===========================================================================

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

