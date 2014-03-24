Selection = require("../Selection")


R.create "TextFieldView",
  propTypes: {
    value: String
    className: String
    onInput: Function
    onBackSpace: Function
  }
  getDefaultProps: ->
    {
      value: ""
      className: ""
      onInput: (newValue) ->
      onBackSpace: ->
      onEnter: ->
    }

  refresh: ->
    el = @getDOMNode()
    if el.textContent != @value
      el.textContent = @value

    if UI.attemptAutoFocus(this)
      Selection.setAtEnd(el)

  componentDidMount: -> @refresh()
  componentDidUpdate: -> @refresh()

  handleInput: ->
    el = @getDOMNode()
    newValue = el.textContent
    @onInput(newValue)

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
        @onBackSpace()

    else if e.keyCode == 13 # enter
      e.preventDefault()
      @onEnter()


  render: ->
    R.div {
      className: @className
      contentEditable: true
      onInput: @handleInput
      onKeyDown: @handleKeyDown
    }





findAdjacentHost = (el, direction) ->
  hosts = document.querySelectorAll("[contenteditable]")
  hosts = _.toArray(hosts)
  index = hosts.indexOf(el)
  return hosts[index + direction]