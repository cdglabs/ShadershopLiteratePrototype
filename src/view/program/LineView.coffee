R.create "LineView",
  propTypes: {
    line: C.Line
    lineIndex: Number
  }

  plots: -> @lookup("program").plots

  shouldRenderPlot: (plot) ->
    deepDependencies = @lookup("program").getDeepDependencies(@line)
    return _.contains(deepDependencies, plot.x)

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
          if @shouldRenderPlot(plot)
            R.div {className: "plotThumbnail"},
              R.PlotView {plot: plot, line: @line}