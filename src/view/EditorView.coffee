R.create "EditorView",
  propTypes: {
    editor: C.Editor
  }

  render: ->
    R.div {className: "editor"},
      R.ProgramView {program: @editor.programs[0]}