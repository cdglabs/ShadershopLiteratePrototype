Selection = require("../Selection")


R.create "EditorView",
  render: ->
    {editor} = @props
    R.div {className: "editor"},
      editor.lines.map (line, index) ->
        R.LineView {line, key: index}


R.create "LineView",
  render: ->
    {line} = @props
    R.div {className: "line"},
      # R.div {className: "preview"},
      #   R.StackView {stack: line._evaluated}
      R.WordListView {wordList: line.wordList}





findAdjacentHost = (el, direction) ->
  hosts = document.querySelectorAll("[contenteditable]")
  hosts = _.toArray(hosts)
  index = hosts.indexOf(el)
  return hosts[index + direction]



ContentEditableMixin = {
  handleKeyDown: (e) ->
    host = Selection.getHost()
    if e.keyCode == 37 # left
      if Selection.isAtStart()
        previousHost = findAdjacentHost(host, -1)
        if previousHost
          e.preventDefault()
          Selection.setAtEnd(previousHost)

    else if e.keyCode == 39 # right
      if Selection.isAtEnd()
        nextHost = findAdjacentHost(host, 1)
        if nextHost
          e.preventDefault()
          Selection.setAtStart(nextHost)

    else if e.keyCode == 8 # backspace
      if Selection.isAtStart()
        e.preventDefault()
        @handleBackspace?()

    # enter, backspace, delete, up, down, shift+arrowkey


  attemptAutoFocus: ->
    if UI.attemptAutoFocus(@props)
      el = @getDOMNode()
      Selection.setAtEnd(el)

  componentDidUpdate: -> @attemptAutoFocus()
  componentDidMount: -> @attemptAutoFocus()

}

R.create "WordView",
  render: ->
    {word, wordListView, index} = @props
    if word instanceof C.Placeholder
      R.PlaceholderView {placeholder: word, wordListView, index}
    else if word instanceof C.Param
      R.ParamView {param: word, wordListView, index}
    else if word instanceof C.Op
      R.OpView {op: word, wordListView, index}
    else if word instanceof C.That
      R.ThatView {}



R.create "WordSpacerView",
  mixins: [ContentEditableMixin]
  handleInput: ->
    {wordListView, spacerIndex} = @props

    el = @getDOMNode()
    string = el.textContent
    el.innerHTML = ""

    wordListView.insertPlaceholderBefore(string, spacerIndex)

  handleBackspace: ->
    {wordListView, spacerIndex} = @props
    if spacerIndex > 0
      wordListView.removeWordAt(spacerIndex - 1)

  render: ->
    {wordListView, spacerIndex} = @props
    R.div {
      className: "wordSpacer"
      contentEditable: true
      onInput: @handleInput
      onKeyDown: @handleKeyDown
    }


R.create "PlaceholderView",
  mixins: [ContentEditableMixin]
  handleInput: ->
    {placeholder, wordListView, index} = @props
    string = @getDOMNode().textContent
    placeholder.string = string

    if string == ""
      wordListView.removeWordAt(index)

    else
      converted = placeholder.convert()
      if converted
        wordListView.replaceWordAt(converted, index)

  render: ->
    {placeholder, wordListView, index} = @props
    R.div {
      className: "word placeholder"
      contentEditable: true
      onInput: @handleInput
      onKeyDown: @handleKeyDown
    },
      placeholder.string





R.create "ParamView",
  mixins: [ContentEditableMixin]
  handleInput: ->
    {param, wordListView, index} = @props
    el = @getDOMNode()
    string = el.textContent

    @_preserveCursor = Selection.beforeSelection()?.toString().length

    for childNode in _.toArray(el.childNodes)
      el.removeChild(childNode) if childNode.nodeType != Node.ELEMENT_NODE

    el.childNodes[0].innerHTML = param.beforeString
    el.childNodes[1].innerHTML = param.valueString
    el.childNodes[2].innerHTML = param.afterString

    param.setWithString(string)

  componentDidUpdate: ->
    {param} = @props
    if @_preserveCursor
      el = @getDOMNode()
      range = document.createRange()
      if @_preserveCursor <= param.beforeString.length
        range.setStart(el.childNodes[0].firstChild, @_preserveCursor)

      range.collapse(true)
      Selection.set(range)
      console.log @_preserveCursor
      @_preserveCursor = null

  render: ->
    {param, wordListView, index} = @props
    R.div {
      className: "word param"
      contentEditable: true
      onInput: @handleInput
      onKeyDown: @handleKeyDown
    },
      R.span {}, param.beforeString
      R.span {className: "paramValue"}, param.valueString
      R.span {}, param.afterString





# R.create "ParamView",
#   mixins: [ContentEditableMixin]
#   handleInput: ->
#     {param, wordListView, index} = @props
#     string = @getDOMNode().textContent
#     param.setWithString(string)

#   componentWillUpdate: ->
#     el = @getDOMNode()
#     if Selection.getHost() == el
#       @_selectStart = Selection.beforeSelection().toString().length
#       @_selectEnd = @_selectStart + Selection.get().toString().length
#     else
#       @_selectStart = null
#       @_selectEnd = null

#   componentDidUpdate: ->
#     return unless @_selectStart
#     {param} = @props
#     el = @getDOMNode()
#     findPoint = (index) ->
#       if index <= param.beforeString.length
#         [el.childNodes[0], index]
#       else if index <= param.beforeString.length + param.valueString.length
#         [el.childNodes[1].firstChild, index - param.beforeString.length]
#       else
#         [el.childNodes[2], index - param.beforeString.length + param.valueString.length]
#     console.log "here", el.innerHTML, findPoint(@_selectStart)
#     range = document.createRange()
#     range.setStart(findPoint(@_selectStart)...)
#     range.setEnd(findPoint(@_selectEnd)...)
#     Selection.set(range)
#     Selection.setAtEnd(el)
#     @_selectStart = null
#     @_selectEnd = null


#   html: ->
#     {param} = @props
#     """#{param.beforeString}<span class="paramValue">#{param.valueString}</span>#{param.afterString}"""

#   render: ->
#     {param, wordListView, index} = @props
#     R.div {
#       className: "word param"
#       contentEditable: true
#       onInput: @handleInput
#       onKeyDown: @handleKeyDown
#       dangerouslySetInnerHTML: {
#         __html: @html()
#       }
#     }


R.create "OpView",
  render: ->
    {op, wordListView, index} = @props
    R.div {className: "word op"},
      op.opString


R.create "ThatView",
  render: ->
    R.div {className: "word that"}, "that"

