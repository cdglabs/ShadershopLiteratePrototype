Element::matches ?= Element::webkitMatchesSelector ? Element::mozMatchesSelector ? Element::oMatchesSelector

fnizeSelector = (selector) ->
  if _.isString(selector)
    return (node) ->
      return false if node.nodeType != Node.ELEMENT_NODE
      return node.matches(selector)
  else
    return selector


Node::closest = (selector) ->
  fn = fnizeSelector(selector)

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