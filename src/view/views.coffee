Selection = require("../Selection")


R.create "EditorView",
  render: ->
    {editor} = @props
    R.div {className: "editor"},
      editor.lines.map (line, index) ->
        R.LineView {line, editor, index, key: index}


R.create "LineView",
  handleKeyDown: (e) ->
    {line, editor, index} = @props
    if e.keyCode == 13 # enter
      host = Selection.getHost()
      lineHosts = @getDOMNode().querySelectorAll("[contenteditable]")
      if _.last(lineHosts) == host
        nextIndex = index + 1
      else
        nextIndex = index
      nextLine = new C.Line()
      editor.lines.splice(nextIndex, 0, nextLine)

  render: ->
    {line, editor, index} = @props
    R.div {className: "line", onKeyDown: @handleKeyDown},
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

    else if e.keyCode == 13 # enter
      e.preventDefault()

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

    param.valueString = string

  # html: ->
  #   {param} = @props
  #   string = param.valueString

  #   floatRegEx = /[-+]?[0-9]*\.?[0-9]+/
  #   matches = string.match(floatRegEx)
  #   if !matches or matches.length == 0
  #     return string
  #   else
  #     match = matches[0]
  #     sides = string.split(match)
  #     html = sides[0]
  #     html += '<span class="paramValue">' + match + '</span>'
  #     html += sides.slice(1).join(match)
  #     return html

  render: ->
    {param, wordListView, index} = @props
    R.div {
      className: "word param"
      contentEditable: true
      onInput: @handleInput
      onKeyDown: @handleKeyDown
    },
      param.valueString


R.create "OpView",
  render: ->
    {op, wordListView, index} = @props
    R.div {className: "word op"},
      op.opString


R.create "ThatView",
  render: ->
    R.div {className: "word that"}, "that"

