R.create "ProgramView",
  propTypes: {
    program: C.Program
  }

  insertLineBefore: (index) ->
    line = new C.Line()
    @program.lines.splice(index, 0, line)

  removeLineAt: (index) ->
    @program.lines.splice(index, 1)

  render: ->
    R.div {className: "program"},
      R.div {className: "mainPlot"},
        R.PlotView {plot: @program.plots[0]}
      R.div {className: "programTable"},
        @program.lines.map (line, lineIndex) =>
          R.LineView {line, lineIndex, key: lineIndex}