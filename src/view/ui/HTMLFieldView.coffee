R.create "HTMLFieldView",
  propTypes: {
    value: String
    className: String
    onInput: Function
  }
  getDefaultProps: ->
    {
      value: ""
      className: ""
      onInput: (newValue) ->
    }

  shouldComponentUpdate: (nextProps) ->
    return @_isDirty or nextProps.value != @props.value

  refresh: ->
    el = @getDOMNode()
    if el.innerHTML != @value
      el.innerHTML = @value
    @_isDirty = false

  componentDidMount: -> @refresh()
  componentDidUpdate: -> @refresh()

  handleInput: ->
    @_isDirty = true
    el = @getDOMNode()
    newValue = el.innerHTML
    @onInput(newValue)

  render: ->
    R.div {
      className: @className
      contentEditable: true
      onInput: @handleInput
    }
