R.create "CustomFnView",
  propTypes:
    customFn: C.CustomFn

  shouldComponentUpdate: ->
    el = @getDOMNode()
    return el.isOnScreen()

  handleCreateRootExprButtonClick: ->
    @customFn.createRootExpr()

  render: ->
    R.div {className: "CustomFn"},
      R.MainPlotView {customFn: @customFn}

      R.div {className: "CustomFnDefinition"},
        R.CustomFnHeaderView {customFn: @customFn}
        @customFn.rootExprs.map (rootExpr, rootIndex) =>
          R.RootExprView {rootExpr, rootIndex}
        R.button {className: "CreateRootExprButton", onClick: @handleCreateRootExprButtonClick}


# =============================================================================

R.create "CustomFnHeaderView",
  propTypes:
    customFn: C.CustomFn

  handleFnLabelInput: (newValue) ->
    @customFn.label = newValue

  render: ->
    R.div {className: "CustomFnHeader"},
      R.TextFieldView {
        className: "FnLabel",
        value: @customFn.getLabel()
        onInput: @handleFnLabelInput
      }
      @customFn.paramVariables.map (paramVariable) =>
        R.div {className: "Param"},
          R.VariableView {variable: paramVariable}
      R.CustomFnParamPlaceholderView {customFn: @customFn}


# =============================================================================

# TODO: this is temporary until I implement something nicer
R.create "CustomFnParamPlaceholderView",
  propTypes:
    customFn: C.CustomFn

  handleTransclusionDrop: (expr) ->
    return unless expr instanceof C.Variable
    paramVariables = @customFn.paramVariables
    return if _.contains(paramVariables, expr)
    paramVariables.push(expr)

  render: ->
    className = R.cx {
      ActiveTransclusionDrop: this == UI.activeTransclusionDropView
    }
    R.span {className: className},
      R.div {className: "ParamPlaceholder"}

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
    variable = @hitDetect()
    if variable
      @startScrub(variable, e)
    else
      @startPan(e)

  isMouseInBounds: ->
    rect = @getDOMNode().getBoundingClientRect()
    return rect.left <= UI.mousePosition.x <= rect.right and rect.top <= UI.mousePosition.y <= rect.bottom

  getLocalMouseCoords: ->
    rect = @getDOMNode().getBoundingClientRect()
    bounds = @customFn.bounds
    x = util.lerp(UI.mousePosition.x, rect.left, rect.right, bounds.xMin, bounds.xMax)
    y = util.lerp(UI.mousePosition.y, rect.bottom, rect.top, bounds.yMin, bounds.yMax)
    return {x, y}

  getCanvasCoords: (x, y) ->
    rect = @getDOMNode().getBoundingClientRect()
    bounds = @customFn.bounds
    cx = util.lerp(x, bounds.xMin, bounds.xMax, rect.left, rect.right)
    cy = util.lerp(y, bounds.yMin, bounds.yMax, rect.bottom, rect.top)
    return {cx, cy}

  handleWheel: (e) ->
    e.preventDefault()

    bounds = @customFn.bounds
    {x, y} = @getLocalMouseCoords()

    scaleFactor = 1.2
    scale = if e.deltaY > 0 then scaleFactor else 1/scaleFactor

    bounds.xMin = (bounds.xMin - x) * scale + x
    bounds.xMax = (bounds.xMax - x) * scale + x
    bounds.yMin = (bounds.yMin - y) * scale + y
    bounds.yMax = (bounds.yMax - y) * scale + y


  getDisplayVariables: ->
    @customFn.paramVariables

  hitDetect: ->
    found = null
    for variable in @getDisplayVariables()
      value = variable.getValue()
      if variable.domain == "domain" # vertical
        {cx, cy} = @getCanvasCoords(value, 0)
        hit = (Math.abs(cx - UI.mousePosition.x) < config.hitTolerance)
      else if variable.domain == "range" # horizontal
        {cx, cy} = @getCanvasCoords(0, value)
        hit = (Math.abs(cy - UI.mousePosition.y) < config.hitTolerance)
      if hit
        found = variable
        break
    return found

  startScrub: (variable, e) ->
    UI.dragging = {
      cursor: @cursor()
      onMove: (e) =>
        {x, y} = @getLocalMouseCoords()
        if variable.domain == "domain" # vertical
          value = x
        else if variable.domain == "range" # horizontal
          value = y

        precision = @getPrecision()
        variable.valueString = util.floatToString(value, precision)
    }

  getPrecision: ->
    rect = @getDOMNode().getBoundingClientRect()
    bounds = @customFn.bounds
    pixelWidth = (bounds.xMax - bounds.xMin) / rect.width

    digitPrecision = Math.floor(Math.log(pixelWidth) / Math.log(10))
    return Math.pow(10, digitPrecision)

  cursor: ->
    if @isMounted() and @isMouseInBounds()
      variable = @hitDetect()
      if variable
        return config.cursor.horizontalScrub if variable.domain == "domain"
        return config.cursor.verticalScrub if variable.domain == "range"
    return config.cursor.grab

  render: ->
    R.div {
      className: "MainPlot"
      onMouseDown: @handleMouseDown
      onWheel: @handleWheel
      style: {cursor: @cursor()}
    },
      R.GridView {customFn: @customFn}
      R.PlotView {expr: @customFn.rootExprs[0]}
      for variable in @getDisplayVariables()
        R.PlotVariableView {variable}


R.create "PlotVariableView",
  propTypes:
    variable: C.Variable

  drawFn: (canvas) ->
    bounds = @lookup("customFn").bounds

    ctx = canvas.getContext("2d")
    util.canvas.clear(ctx)
    if @variable.domain == "domain"
      util.canvas.drawVertical ctx,
        xMin: bounds.xMin
        xMax: bounds.xMax
        x: @variable.getValue()
    else if @variable.domain == "range"
      util.canvas.drawHorizontal ctx,
        yMin: bounds.yMin
        yMax: bounds.yMax
        y: @variable.getValue()

    ctx.strokeStyle = "#090"
    ctx.lineWidth = 1.5
    ctx.stroke()

  componentDidUpdate: ->
    @refs.canvas.draw()

  render: ->
    R.CanvasView {drawFn: @drawFn, ref: "canvas"}
