R.create "LineView",
  propTypes: {
    line: C.Line
    lineIndex: Number
  }

  plots: ->
    @lookup("program").plots

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
      @plots().map (plot, index) =>
        R.div {className: "lineCell", key: index},
          R.div {style: {position: "relative", width: "100", height: "100"}},
            R.PlotView {plot: plot, line: @line}