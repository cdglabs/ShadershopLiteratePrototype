dom = {}

dom.traverseUntil = (node, selector, traverse) ->
  return null unless node
  selector = fnizeSelector(selector)
  if selector(node)
    return node
  else
    return dom.traverseUntil(traverse(node), selector, traverse)

# Selectors

dom.isEditingHost = (node) ->
  return false unless node.nodeType == Node.ELEMENT_NODE
  return node.isContentEditable and !node.parentNode.isContentEditable

# Traversers

dom.parentNode = (node) -> node.parentNode
dom.nextSibling = (node) -> node.nextSibling
dom.previousSibling = (node) -> node.previousSibling

dom.next = (node) ->






fnizeSelector = (selector) ->
  if _.isString(selector)
    return (node) ->
      return false if node.nodeType != Node.ELEMENT_NODE
      return node.matches(selector)
  else
    return selector