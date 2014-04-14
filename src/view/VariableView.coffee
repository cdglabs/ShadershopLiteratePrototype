R.create "VariableView",
  propTypes:
    variable: C.Variable

  render: ->
    className = R.cx {
      Variable: true
      Hovered: UI.hoverData?.variable == @variable
    }
    R.HoverCaptureView {hoverData: {variable: @variable, customFn: @lookup("customFn")}},
      R.div {className: className},
        R.VariableLabelView {variable: @variable}
        R.VariableValueView {variable: @variable}


# =============================================================================

R.create "VariableLabelView",
  propTypes:
    variable: C.Variable

  handleInput: (newValue) ->
    @variable.label = newValue

  handleMouseDown: (e) ->
    return if @refs.textField.isFocused()
    UI.preventDefault(e)

    @startTransclude(e)

    util.onceDragConsummated e, null, =>
      @refs.textField.selectAll()

  startTransclude: (e) ->
    UI.dragging = {
      cursor: config.cursor.grabbing
    }

    util.onceDragConsummated e, =>
      UI.dragging = {
        cursor: config.cursor.grabbing
        offset: {x: -4, y: -10}
        render: =>
          R.VariableView {variable: @variable}
        onMove: (e) =>
          dropView = UI.getViewUnderMouse()
          dropView = dropView?.lookupViewWithKey("handleTransclusionDrop")
          UI.activeTransclusionDropView = dropView
        onUp: (e) =>
          if UI.activeTransclusionDropView
            UI.activeTransclusionDropView.handleTransclusionDrop(@variable)
          UI.activeTransclusionDropView = null

      }

  cursor: ->
    if @isMounted()
      if @refs.textField?.isFocused()
        return config.cursor.text
    return config.cursor.grab

  render: ->
    R.span {
      style: {cursor: @cursor()}
      onMouseDown: @handleMouseDown
    },
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

    @startScrub(e)

    util.onceDragConsummated e, null, =>
      @refs.textField.selectAll()

  startScrub: (e) ->
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
        @variable.valueString = util.floatToString(value, precision)
      onUp: =>
    }

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
