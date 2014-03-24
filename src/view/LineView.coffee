R.create "LineView",
  propTypes: {
    line: C.Line
    index: Number
  }

  render: ->
    R.div {className: "line"},
      R.WordListView {wordList: @line.wordList}