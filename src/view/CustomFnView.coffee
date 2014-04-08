R.create "CustomFnView",
  propTypes:
    customFn: C.CustomFn

  handleCreateRootExprButtonClick: ->
    @customFn.createRootExpr()

  handleFnLabelInput: (newValue) ->
    @customFn.label = newValue

  render: ->
    R.div {className: "CustomFn"},
      R.div {className: "CustomFnHeader"},
        R.TextFieldView {
          className: "FnLabel",
          value: @customFn.getLabel()
          onInput: @handleFnLabelInput
        }
        @customFn.paramVariables.map (paramVariable) =>
          R.VariableView {variable: paramVariable}
      R.div {className: "CustomFnDefinition"},
        R.MainPlotView {customFn: @customFn}
        @customFn.rootExprs.map (rootExpr, rootIndex) =>
          R.RootExprTreeView {rootExpr, rootIndex}
        R.button {className: "CreateRootExprButton", onClick: @handleCreateRootExprButtonClick}


# =============================================================================

R.create "MainPlotView",
  propTypes:
    customFn: C.CustomFn

  startPan: (e) ->
    originalX = e.clientX
    originalY = e.clientY
    originalBounds = {
      xMin: @customFn.bounds.xMin
      xMax: @customFn.bounds.xMax
      yMin: @customFn.bounds.yMin
      yMax: @customFn.bounds.yMax
    }

    rect = @getDOMNode().getBoundingClientRect()
    xScale = (originalBounds.xMax - originalBounds.xMin) / rect.width
    yScale = (originalBounds.yMax - originalBounds.yMin) / rect.height

    UI.dragging = {
      cursor: config.cursor.grabbing
      onMove: (e) =>
        dx = e.clientX - originalX
        dy = e.clientY - originalY
        @customFn.bounds.xMin = originalBounds.xMin - dx * xScale
        @customFn.bounds.xMax = originalBounds.xMax - dx * xScale
        @customFn.bounds.yMin = originalBounds.yMin + dy * yScale
        @customFn.bounds.yMax = originalBounds.yMax + dy * yScale
    }

  handleMouseDown: (e) ->
    UI.preventDefault(e)
    @startPan(e)

  cursor: ->
    config.cursor.grab

  render: ->
    R.div {className: "MainPlot", onMouseDown: @handleMouseDown, style: {cursor: @cursor()}},
      R.GridView {customFn: @customFn}
      R.PlotView {expr: @customFn.rootExprs[0]}
