R.create "AppRootView",
  propTypes:
    appRoot: C.AppRoot

  cursor: ->
    UI.dragging?.cursor ? ""

  render: ->
    R.div {style: {cursor: @cursor()}},

      R.WorkspaceView {workspace: @appRoot.workspaces[0]}

      R.div {className: "dragging"},
        R.DraggingView {}
