R.create "WordView",
  propTypes: {
    word: C.Word
    wordIndex: Number
  }

  render: ->
    if @word instanceof C.Placeholder
      R.PlaceholderView {placeholder: @word}
    else if @word instanceof C.Param
      R.ParamView {param: @word}
    else if @word instanceof C.Op
      R.OpView {op: @word}
    else if @word instanceof C.That
      R.ThatView {}
    else if @word instanceof C.Line
      R.LineOutputView {line: @word}


# =============================================================================

R.create "PlaceholderView",
  propTypes: {
    placeholder: C.Placeholder
  }

  handleInput: (newValue) ->
    @placeholder.string = newValue

    wordListView = @lookupView("WordListView")
    wordIndex = @lookup("wordIndex")

    if newValue == ""
      wordListView.removeWordAt(wordIndex)
      return

    word = @placeholder.convert()
    if word != @placeholder
      wordListView.replaceWordAt(wordIndex, word)

  render: ->
    R.TextFieldView {
      className: "word placeholder"
      value: @placeholder.string
      onInput: @handleInput
    }


# =============================================================================

R.create "OpView",
  propTypes: {
    op: C.Op
  }

  render: ->
    R.div {className: "word op"},
      @op.opString


# =============================================================================

R.create "ThatView",
  render: ->
    R.div {className: "word that"}, "That"
