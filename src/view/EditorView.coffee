R.create "EditorView",
  propTypes: {
    editor: C.Editor
  }

  render: ->
    R.div {className: "editor"},
      @editor.lines.map (line, lineIndex) =>
        R.LineView {line, lineIndex, key: lineIndex}