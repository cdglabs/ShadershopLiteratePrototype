R.create "WordSpacerView",
  propTypes: {
    wordSpacerIndex: Number
  }

  handleInput: (newValue) ->
    wordListView = @lookupView("WordListView")
    wordListView.insertPlaceholderBefore(@wordSpacerIndex, newValue)

  handleBackSpace: ->
    if @wordSpacerIndex == 0
      console.log "TODO: remove line"
    else
      wordListView = @lookupView("WordListView")
      wordListView.removeWordAt(@wordSpacerIndex - 1)


  render: ->
    R.TextFieldView {
      className: "wordSpacer"
      onInput: @handleInput
      onBackSpace: @handleBackSpace
    }