R.create "WorkspaceView",
  propTypes:
    workspace: C.Workspace

  render: ->
    R.div {className: "Workspace"},
      R.WorkspaceExtrasView {workspace: @workspace, workspaceIndex: -1}

      @workspace.workspaceEntries.map (workspaceEntry, workspaceIndex) =>
        R.div {className: "WorkspaceEntry", key: C.id(workspaceEntry)},
          if workspaceEntry instanceof C.CustomFn
            R.CustomFnView {customFn: workspaceEntry}
          else if workspaceEntry instanceof C.Paragraph
            R.ParagraphView {paragraph: workspaceEntry}
          R.WorkspaceExtrasView {workspace: @workspace, workspaceIndex}


# =============================================================================

R.create "WorkspaceExtrasView",
  propTypes:
    workspace: C.Workspace
    workspaceIndex: Number

  addEntry: (entry) ->
    @workspace.workspaceEntries.splice(@workspaceIndex+1, 0, entry)

  addFunction: ->
    @addEntry(new C.CustomFn())

  addParagraph: ->
    @addEntry(new C.Paragraph())

  remove: ->
    @workspace.workspaceEntries.splice(@workspaceIndex, 1)

  moveTop: ->
    return if @workspaceIndex == 0
    entry = @workspace.workspaceEntries[@workspaceIndex]
    @workspace.workspaceEntries.splice(@workspaceIndex, 1)
    @workspace.workspaceEntries.splice(0, 0, entry)

  moveUp: ->
    return if @workspaceIndex == 0
    entry = @workspace.workspaceEntries[@workspaceIndex]
    @workspace.workspaceEntries.splice(@workspaceIndex, 1)
    @workspace.workspaceEntries.splice(@workspaceIndex-1, 0, entry)

  moveDown: ->
    return if @workspaceIndex == @workspace.workspaceEntries.length - 1
    entry = @workspace.workspaceEntries[@workspaceIndex]
    @workspace.workspaceEntries.splice(@workspaceIndex, 1)
    @workspace.workspaceEntries.splice(@workspaceIndex+1, 0, entry)

  moveBottom: ->
    return if @workspaceIndex == @workspace.workspaceEntries.length - 1
    entry = @workspace.workspaceEntries[@workspaceIndex]
    @workspace.workspaceEntries.splice(@workspaceIndex, 1)
    @workspace.workspaceEntries.splice(@workspace.workspaceEntries.length, 0, entry)

  render: ->
    R.div {className: "WorkspaceExtras"},
      R.div {className: "CellHorizontal"},
        R.div {className: "CellHorizontal TextButtonLabel"}, "add:"
        R.div {className: "CellHorizontal TextButton", onClick: @addFunction}, "function"
        R.div {className: "CellHorizontal TextButton", onClick: @addParagraph}, "paragraph"

      if @workspaceIndex >= 0
        R.span {},
          R.div {className: "CellHorizontal"},
            R.div {className: "CellHorizontal TextButtonLabel"}, "move:"
            R.div {className: "CellHorizontal TextButton", onClick: @moveTop}, "top"
            R.div {className: "CellHorizontal TextButton", onClick: @moveUp}, "up"
            R.div {className: "CellHorizontal TextButton", onClick: @moveDown}, "down"
            R.div {className: "CellHorizontal TextButton", onClick: @moveBottom}, "bottom"

          R.div {className: "CellHorizontal"},
            R.div {className: "CellHorizontal TextButtonLabel"}, ""
            R.div {className: "CellHorizontal TextButton", onClick: @remove}, "remove"


# =============================================================================

R.create "ParagraphView",
  propTypes:
    paragraph: C.Paragraph

  handleInput: (newValue) ->
    @paragraph.text = newValue

  render: ->
    R.TextFieldView {
      className: "Paragraph"
      value: @paragraph.text
      onInput: @handleInput
      allowEnter: true
    }
