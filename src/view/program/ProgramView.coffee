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
      @program.lines.map (line, lineIndex) =>
        R.LineView {line, lineIndex, key: lineIndex}