R.create "LineView",
  propTypes: {
    line: C.Line
    lineIndex: Number
  }

  render: ->
    R.div {className: "line"},
      R.div {className: "lineLeft"},
        R.WordListView {wordList: @line.wordList}
      R.div {className: "lineRight"},
        R.LineOutputView {line: @line}