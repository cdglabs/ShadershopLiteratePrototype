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
      R.div {className: "lineCell"},
        R.WordListView {wordList: @line.wordList}
      R.div {className: "lineCell"},
        R.LineOutputView {line: @line}