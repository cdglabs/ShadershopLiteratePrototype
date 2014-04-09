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

  handleWheel: (e) ->
    e.preventDefault()

    rect = @getDOMNode().getBoundingClientRect()
    bounds = @customFn.bounds
    centerX = util.lerp(e.clientX, rect.left, rect.right, bounds.xMin, bounds.xMax)
    centerY = util.lerp(e.clientY, rect.bottom, rect.top, bounds.yMin, bounds.yMax)

    scaleFactor = 1.2
    scale = if e.deltaY > 0 then scaleFactor else 1/scaleFactor

    bounds.xMin = (bounds.xMin - centerX) * scale + centerX
    bounds.xMax = (bounds.xMax - centerX) * scale + centerX
    bounds.yMin = (bounds.yMin - centerY) * scale + centerY
    bounds.yMax = (bounds.yMax - centerY) * scale + centerY


  cursor: ->
    config.cursor.grab

  render: ->
    R.div {
      className: "MainPlot"
      onMouseDown: @handleMouseDown
      onWheel: @handleWheel
      style: {cursor: @cursor()}
    },
      R.GridView {customFn: @customFn}
      R.PlotView {expr: @customFn.rootExprs[0]}
