R.create "EditorView",
  propTypes: {
    editor: C.Editor
  }

  render: ->
    R.div {className: "editor"},
      @editor.lines.map (line, index) =>
        R.LineView {line, index, key: index}