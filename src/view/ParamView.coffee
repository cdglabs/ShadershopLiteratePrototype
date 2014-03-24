R.create "ParamView",
  propTypes: {
    param: C.Param
  }

  render: ->
    R.div {className: "word param"},
      if @param.label == ""
        R.div {className: "paramLabelEmpty"}
      else
        R.ParamLabelView {param: @param}
      R.ParamValueView {param: @param}


# =============================================================================

R.create "ParamLabelView",
  propTypes: {
    param: C.Param
  }

  handleInput: (newValue) ->
    @param.label = newValue

    if @param.label == ""
      @focusValue()
    else if @param.label.slice(-1) == ":"
      @param.label = @param.label.slice(0, -1)
      @focusValue()

  focusValue: ->
    paramView = @lookupView("ParamView")
    UI.setAutoFocus {
      descendantOf: [paramView, "ParamValueView"]
      location: "start"
    }

  render: ->
    R.TextFieldView {
      className: "paramLabel"
      value: @param.label
      onInput: @handleInput
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

  render: ->
    R.TextFieldView {
      className: "paramValue"
      value: @param.valueString
      onInput: @handleInput
    }

