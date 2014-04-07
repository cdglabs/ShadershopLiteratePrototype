R.create "ProgramView",
  propTypes: {
    program: C.Program
  }

  insertLineBefore: (index) ->
    line = new C.Line()
    @program.lines.splice(index, 0, line)

  removeLineAt: (index) ->
    @program.lines.splice(index, 1)

  lastLineForPlot: (plot) ->
    lastLine = null
    for line in @program.lines
      deepDependencies = @program.getDeepDependencies(line)
      if _.contains deepDependencies, plot.x
        lastLine = line
    return lastLine

  render: ->
    R.div {className: "program"},
      R.div {className: "mainPlot"},
        R.PlotView {plot: @program.plots[0], line: @lastLineForPlot(@program.plots[0])}
      R.div {className: "programTable"},
        R.ProgramTableHeadersView {program: @program}
        @program.lines.map (line, lineIndex) =>
          R.LineView {line, lineIndex, key: lineIndex}


R.create "ProgramTableHeadersView",
  propTypes: {
    program: C.Program
  }

  addPlot: ->
    @program.plots.push(new C.CartesianPlot())

  render: ->
    R.div {className: "programHeader"},
      R.div {className: "lineCell"}, "Program"
      R.div {className: "lineCell"}, "Result"
      @program.plots.map (plot, index) =>
        R.PlotHeaderView {plot: plot, key: index}
      R.div {className: "lineCell"},
        R.button {onClick: @addPlot}, "+"


R.create "PlotHeaderView",
  propTypes: {
    plot: C.Plot
  }

  render: ->
    R.div {className: "lineCell"},
      R.div {}, "Cartesian"
      R.XParamView {plot: @plot}