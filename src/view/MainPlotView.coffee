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
    UI.hoverIsActive = true
    UI.startVariableScrub {
      variable: variable
      cursor: @cursor()
      onMove: (e) =>
        {x, y} = @getLocalMouseCoords()
        if variable.domain == "domain" # vertical
          value = x
        else if variable.domain == "range" # horizontal
          value = y

        precision = @getPrecision()
        return util.floatToString(value, precision)
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

  handleMouseMove: ->
    return if UI.hoverIsActive
    variable = @hitDetect()
    if variable
      UI.hoverData = {variable, customFn: @customFn}
    else
      UI.hoverData = null

  handleMouseLeave: ->
    return if UI.hoverIsActive
    UI.hoverData = null

  render: ->
    R.div {
      className: "MainPlot"
      onMouseDown: @handleMouseDown
      onMouseMove: @handleMouseMove
      onMouseLeave: @handleMouseLeave
      onWheel: @handleWheel
      style: {cursor: @cursor()}
    },
      R.GridView {customFn: @customFn}

      R.PlotWithSpreadView {expr: @customFn.rootExprs[0]}

      if UI.hoverData?.expr and UI.hoverData?.customFn == @customFn
        R.PlotWithParametersView {expr: UI.hoverData.expr}
      for variable in @getDisplayVariables()
        R.PlotVariableView {variable}


# =============================================================================

Compiler = require("../../compile/Compiler")

R.create "PlotWithSpreadView",
  propTypes:
    expr: C.Expr

  renderSpreads: ->
    spreadVariable = UI.hoverData?.variable
    return unless spreadVariable

    customFn = @lookup("customFn")
    return unless UI.hoverData?.customFn == customFn

    xVariable = customFn.paramVariables[0]
    return if xVariable == spreadVariable

    spreadDistance = 0.5
    spreadNum = 4
    maxSpreadOffset = spreadDistance * spreadNum

    value = spreadVariable.getValue()
    roundedValue = Math.round(value / spreadDistance) * spreadDistance

    views = []

    for i in [-spreadNum .. spreadNum]
      spreadOffset = i * spreadDistance
      spreadValue = roundedValue + spreadOffset
      actualSpreadOffset = spreadValue - value

      if actualSpreadOffset < 0
        style = _.clone(config.style.spreadNegativeExpr)
      else
        style = _.clone(config.style.spreadPositiveExpr)

      style.globalAlpha = util.lerp(
        Math.abs(spreadOffset),
        0, maxSpreadOffset,
        config.spreadOpacityMax, config.spreadOpacityMin)

      compiler = new Compiler()

      compiler.substitute(xVariable, "x")
      compiler.substitute(spreadVariable, ""+spreadValue)

      fnString = compiler.compile(@expr)
      fnString = "(function (x) { return #{fnString} ; })"

      view = R.PlotCartesianView {fnString, style}
      views.push(view)

    return views


  render: ->
    R.span {},
      @renderSpreads()
      R.PlotView {expr: @expr, style: config.style.mainExpr}

# =============================================================================

R.create "PlotWithParametersView",
  propTypes:
    expr: C.Expr

  render: ->
    style = if UI.hoverData?.expr == @expr then config.style.hoveredExpr else config.style.mainExpr
    R.span {},
      # Parameters
      if @expr instanceof C.Application
        @expr.paramExprs.map (paramExpr) =>
          R.PlotView {expr: paramExpr, style: config.style.paramExpr}
      # Expr itself
      R.PlotView {expr: @expr, style: style}


# =============================================================================

R.create "PlotVariableView",
  propTypes:
    variable: C.Variable

  getDrawInfo: ->
    {xMin, xMax, yMin, yMax} = @lookup("customFn").bounds
    domain = @variable.domain
    value = @variable.getValue()
    hovered = (@variable == UI.hoverData?.variable)
    return {xMin, xMax, yMin, yMax, domain, value, hovered}

  drawFn: (canvas) ->
    {xMin, xMax, yMin, yMax, domain, value} = @_lastDrawInfo = @getDrawInfo()

    ctx = canvas.getContext("2d")
    util.canvas.clear(ctx)
    if domain == "domain"
      util.canvas.drawVertical ctx,
        xMin: xMin
        xMax: xMax
        x: value
    else if domain == "range"
      util.canvas.drawHorizontal ctx,
        yMin: yMin
        yMax: yMax
        y: value

    if (@variable == UI.hoverData?.variable)
      style = config.style.hoveredVariable
    else
      style = config.style.variable
    util.canvas.setStyle(ctx, style)

    ctx.stroke()

  componentDidUpdate: ->
    @refs.canvas.draw()

  shouldComponentUpdate: ->
    drawInfo = @getDrawInfo()
    return !_.isEqual(drawInfo, @_lastDrawInfo)

  render: ->
    R.CanvasView {drawFn: @drawFn, ref: "canvas"}
