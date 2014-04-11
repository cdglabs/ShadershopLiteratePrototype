R.create "EditorView",
  propTypes:
    editor: C.Editor

  handleCreateCustomFnClick: ->
    @editor.createCustomFn()

  cursor: ->
    UI.dragging?.cursor ? ""

  render: ->
    R.div {className: "editor", style: {cursor: @cursor()}},

      R.div {className: "customFns"},
        @editor.customFns.map (customFn) =>
          R.CustomFnView {customFn: customFn}
        R.button {className: "CreateCustomFn", onClick: @handleCreateCustomFnClick}

      R.div {className: "dragging"},
        R.DraggingView {}
