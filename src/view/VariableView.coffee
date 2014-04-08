R.create "VariableView",
  propTypes:
    variable: C.Variable

  render: ->
    R.div {className: "Variable"},
      R.VariableLabelView {variable: @variable}
      R.VariableValueView {variable: @variable}


# =============================================================================

R.create "VariableLabelView",
  propTypes:
    variable: C.Variable

  handleInput: (newValue) ->
    @variable.label = newValue

  render: ->
    R.span {},
      R.TextFieldView {
        ref: "textField"
        className: "VariableLabel"
        value: @variable.label
        onInput: @handleInput
      }


# =============================================================================

R.create "VariableValueView",
  propTypes:
    variable: C.Variable

  handleInput: (newValue) ->
    @variable.valueString = newValue

  handleMouseDown: (e) ->
    return if @refs.textField.isFocused()
    UI.preventDefault(e)

    originalX = e.clientX
    originalY = e.clientY
    originalValue = @variable.getValue()

    precision = 0.1

    UI.dragging = {
      cursor: @cursor()
      onMove: (e) =>
        dx =   e.clientX - originalX
        dy = -(e.clientY - originalY)

        if @variable.domain == "domain"
          d = dx
        else
          d = dy

        value = originalValue + d * precision
        if precision < 1
          digitPrecision = -Math.round(Math.log(precision)/Math.log(10))
          @variable.valueString = value.toFixed(digitPrecision)
        else
          @variable.valueString = value.toFixed(0)
      onUp: =>
    }

    util.onceDragConsummated e, null, =>
      @refs.textField.selectAll()

  cursor: ->
    if @isMounted()
      if @refs.textField.isFocused()
        return config.cursor.text
    if @variable.domain == "domain"
      return config.cursor.horizontalScrub
    else
      return config.cursor.verticalScrub

  render: ->
    R.span {
      style: {cursor: @cursor()}
      onMouseDown: @handleMouseDown
    },
      R.TextFieldView {
        ref: "textField"
        className: "VariableValue"
        value: @variable.valueString
        onInput: @handleInput
      }
