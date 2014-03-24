R.create "EditorView",
  propTypes: {
    editor: C.Editor
  }

  insertLineBefore: (index) ->
    line = new C.Line()
    @editor.lines.splice(index, 0, line)

  removeLineAt: (index) ->
    @editor.lines.splice(index, 1)

  render: ->
    R.div {className: "editor"},
      @editor.lines.map (line, lineIndex) =>
        R.LineView {line, lineIndex, key: lineIndex}