R.create "EditorView",
  propTypes: {
    editor: C.Editor
  }

  cursor: ->
    UI.dragging?.cursor ? ""

  render: ->
    R.div {className: "editor", style: {cursor: @cursor()}},
      R.ProgramView {program: @editor.programs[0]}
      R.div {className: "dragging"},
        R.DraggingView {}