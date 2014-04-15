R.create "WorkspaceView",
  propTypes:
    workspace: C.Workspace

  handleCreateCustomFnClick: ->
    @workspace.createCustomFn()

  render: ->
    R.div {className: "Workspace"},
      R.div {className: "customFns"},
        @workspace.customFns.map (customFn) =>
          R.CustomFnView {customFn: customFn}
        R.button {className: "CreateCustomFn", onClick: @handleCreateCustomFnClick}
