module.exports = Selection = new class
  get: ->
    selection = window.getSelection()
    if selection.rangeCount > 0
      range = selection.getRangeAt(0)
      return range
    else
      return null

  set: (range) ->
    selection = window.getSelection()
    if !range?
      @focusBody()
      selection.removeAllRanges()
    else
      # Focusing the host is necessary in FF for the text cursor to show up.
      host = @findEditingHost(range.commonAncestorContainer)
      host?.focus()

      selection.removeAllRanges()
      selection.addRange(range)


  getHost: ->
    selectedRange = @get()
    return null unless selectedRange
    return @findEditingHost(selectedRange.commonAncestorContainer)


  beforeSelection: ->
    selectedRange = @get()
    return null unless selectedRange
    host = @getHost()
    beforeSelection = document.createRange()
    beforeSelection.selectNodeContents(host)
    beforeSelection.setEnd(selectedRange.startContainer, selectedRange.startOffset)
    return beforeSelection


  afterSelection: ->
    selectedRange = @get()
    return null unless selectedRange
    host = @getHost()
    afterSelection = document.createRange()
    afterSelection.selectNodeContents(host)
    afterSelection.setStart(selectedRange.endContainer, selectedRange.endOffset)
    return afterSelection


  isAtStart: ->
    return false unless @get()?.collapsed
    return @beforeSelection().toString() == ""

  isAtEnd: ->
    return false unless @get()?.collapsed
    return @afterSelection().toString() == ""


  setAtStart: (el) ->
    range = document.createRange()
    range.selectNodeContents(el)
    range.collapse(true)
    @set(range)

  setAtEnd: (el) ->
    range = document.createRange()
    range.selectNodeContents(el)
    range.collapse(false)
    @set(range)


  focusBody: ->
    body = document.body
    if !body.hasAttribute("tabindex")
      body.setAttribute("tabindex", "0")
    body.focus()

  findEditingHost: (node) ->
    return null if !node?
    return @findEditingHost(node.parentNode) if node.nodeType != Node.ELEMENT_NODE

    return null if !node.isContentEditable
    return node if !node.parentNode.isContentEditable

    return @findEditingHost(node.parentNode)