R.create "LineView",
  propTypes: {
    line: C.Line
    lineIndex: Number
  }

  render: ->
    className = R.cx {
      line: true
      isIndependent: !@line.hasReferenceToThat()
    }
    R.div {className: className},
      R.div {className: "lineLeft"},
        R.WordListView {wordList: @line.wordList}
      R.div {className: "lineRight"},
        R.LineOutputView {line: @line}