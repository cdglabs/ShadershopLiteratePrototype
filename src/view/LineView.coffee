R.create "LineView",
  propTypes: {
    line: C.Line
    lineIndex: Number
  }

  render: ->
    R.div {className: "line"},
      R.WordListView {wordList: @line.wordList}