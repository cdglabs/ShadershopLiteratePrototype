window.util = util = {}


# =============================================================================
# Underscore Addons
# =============================================================================

_.concatMap = (array, fn) ->
  _.flatten(_.map(array, fn), true)


# =============================================================================
# DOM Addons
# =============================================================================

Element::matches ?= Element::webkitMatchesSelector ? Element::mozMatchesSelector ? Element::oMatchesSelector

Element::closest = (selector) ->
  if _.isString(selector)
    fn = (el) -> el.matches(selector)
  else
    fn = selector

  if fn(this)
    return this
  else
    parent = @parentNode
    if parent? && parent.nodeType == Node.ELEMENT_NODE
      return parent.closest(fn)
    else
      return undefined

Element::getMarginRect = ->
  rect = @getBoundingClientRect()
  style = window.getComputedStyle(this)
  result = {
    top: rect.top - parseInt(style["margin-top"], 10)
    left: rect.left - parseInt(style["margin-left"], 10)
    bottom: rect.bottom + parseInt(style["margin-bottom"], 10)
    right: rect.right + parseInt(style["margin-right"], 10)
  }
  result.width = result.right - result.left
  result.height = result.bottom - result.top
  return result


# =============================================================================
# Util functions
# =============================================================================

util.lerp = (x, dMin, dMax, rMin, rMax) ->
  ratio = (x - dMin) / (dMax - dMin)
  return ratio * (rMax - rMin) + rMin


util.floatToString = (value, precision = 0.1) ->
  if precision < 1
    digitPrecision = -Math.round(Math.log(precision)/Math.log(10))
    string = value.toFixed(digitPrecision)
  else
    string = value.toFixed(0)

  if /^-0(\.0*)?$/.test(string)
    # Remove extraneous negative sign
    string = string.slice(1)

  return string


util.onceDragConsummated = (downEvent, callback, notConsummatedCallback=null) ->
  consummated = false
  originalX = downEvent.clientX
  originalY = downEvent.clientY

  handleMove = (moveEvent) ->
    dx = moveEvent.clientX - originalX
    dy = moveEvent.clientY - originalY
    d  = Math.max(Math.abs(dx), Math.abs(dy))
    if d > 3
      consummated = true
      removeListeners()
      callback?(moveEvent)

  handleUp = (upEvent) ->
    if !consummated
      notConsummatedCallback?(upEvent)
    removeListeners()

  removeListeners = ->
    window.removeEventListener("mousemove", handleMove)
    window.removeEventListener("mouseup", handleUp)

  window.addEventListener("mousemove", handleMove)
  window.addEventListener("mouseup", handleUp)


# =============================================================================
# Additional
# =============================================================================

require("./selection")
require("./canvas")
