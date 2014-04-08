R.create "EditorView",
  propTypes:
    editor: C.Editor

  cursor: ->
    UI.dragging?.cursor ? ""

  render: ->
    R.div {className: "editor", style: {cursor: @cursor()}},

      R.div {className: "customFns"},
        @editor.customFns.map (customFn) =>
          R.CustomFnView {customFn: customFn}

      R.div {className: "dragging"},
        R.DraggingView {}
