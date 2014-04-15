R.create "WorkspaceView",
  propTypes:
    workspace: C.Workspace

  handleCreateCustomFnClick: ->
    @workspace.createCustomFn()

  render: ->
    R.div {className: "Workspace"},
      R.div {className: "customFns"},
        @workspace.customFns.map (customFn) =>
          R.div {className: "WorkspaceEntry"},
            R.CustomFnView {customFn: customFn}
            R.WorkspaceExtrasView {workspaceEntry: customFn}

        R.button {className: "CreateCustomFn", onClick: @handleCreateCustomFnClick}


R.create "WorkspaceExtrasView",
  propTypes:
    workspaceEntry: [C.CustomFn]

  render: ->
    R.div {className: "WorkspaceExtras"},
      R.div {className: "CellHorizontal"},
        R.div {className: "CellHorizontal TextButtonLabel"}, "add:"
        R.div {className: "CellHorizontal TextButton"}, "function"
        R.div {className: "CellHorizontal TextButton"}, "paragraph"

      R.div {className: "CellHorizontal"},
        R.div {className: "CellHorizontal TextButtonLabel"}, "move:"
        R.div {className: "CellHorizontal TextButton"}, "top"
        R.div {className: "CellHorizontal TextButton"}, "up"
        R.div {className: "CellHorizontal TextButton"}, "down"
        R.div {className: "CellHorizontal TextButton"}, "bottom"

      R.div {className: "CellHorizontal"},
        R.div {className: "CellHorizontal TextButtonLabel"}, ""
        R.div {className: "CellHorizontal TextButton"}, "remove"