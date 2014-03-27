R.create "ParamView",
  propTypes: {
    param: C.Param
  }

  handleMouseEnter: ->
    UI.setHoveredWord(@param)

  handleMouseLeave: ->
    UI.setHoveredWord(null)

  render: ->
    className = R.cx {
      word: true
      param: true
      highlighted: UI.getHighlightedWord() == @param
    }
    R.div {
      className: className
      onMouseEnter: @handleMouseEnter
      onMouseLeave: @handleMouseLeave
    },
      R.ParamLabelView {param: @param}
      R.ParamValueView {param: @param}


# =============================================================================

R.create "ParamLabelView",
  propTypes: {
    param: C.Param
  }

  mixins: [R.StartTranscludeMixin]

  handleInput: (newValue) ->
    @param.label = newValue

    if @param.label.slice(-1) == ":"
      @param.label = @param.label.slice(0, -1)
      @focusValue()

  focusValue: ->
    paramView = @lookupView("ParamView")
    UI.setAutoFocus {
      descendantOf: [paramView, "ParamValueView"]
      location: "start"
    }

  handleMouseDown: (e) ->
    return if @refs.textField?.isFocused()
    UI.preventDefault(e)

    paramView = @lookupView("ParamView")
    @startTransclude(e, @param, paramView.render.bind(paramView))

    util.onceDragConsummated e, null, =>
      @refs.textField?.selectAll()

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
        className: "paramLabel"
        value: @param.label
        onInput: @handleInput
        ref: "textField"
      }


# =============================================================================

R.create "ParamValueView",
  propTypes: {
    param: C.Param
  }

  labelPart: ->
    matches = @param.valueString.match(/^[^0-9.-]+/)
    return matches?[0]

  placeholderPart: ->
    return null if @param.valueString == "-"
    matches = @param.valueString.match(/[^0-9.]+$/)
    return matches?[0]

  handleInput: (newValue) ->
    @param.valueString = newValue

    if labelPart = @labelPart()
      @param.valueString = @param.valueString.slice(labelPart.length)
      @param.label = @param.label + labelPart
      @focusLabel()

    else if placeholderPart = @placeholderPart()
      @param.valueString = @param.valueString.slice(0, -placeholderPart.length)
      wordListView = @lookupView("WordListView")
      wordIndex = @lookup("wordIndex")
      wordListView.insertPlaceholderBefore(wordIndex + 1, placeholderPart)

  focusLabel: ->
    paramView = @lookupView("ParamView")
    UI.setAutoFocus {
      descendantOf: [paramView, "ParamLabelView"]
    }

  handleMouseDown: (e) ->
    return if @refs.textField.isFocused()
    UI.preventDefault(e)

    originalX = e.clientX
    originalY = e.clientY
    originalValue = @param.value()

    UI.setActiveWord(@param)
    UI.dragging = {
      cursor: @cursor()
      onMove: (e) =>
        dx =   e.clientX - originalX
        dy = -(e.clientY - originalY)
        d  = dy
        value = originalValue + d
        @param.valueString = ""+value
      onUp: =>
        UI.setActiveWord(null)
    }

    util.onceDragConsummated e, null, =>
      @refs.textField.selectAll()

  cursor: ->
    if @isMounted()
      if @refs.textField.isFocused()
        return config.cursor.text
    return config.cursor.verticalScrub

  render: ->
    R.span {
      style: {cursor: @cursor()}
      onMouseDown: @handleMouseDown
    },
      R.TextFieldView {
        className: "paramValue"
        value: @param.valueString
        onInput: @handleInput
        ref: "textField"
      }

