
lerp = (x, dMin, dMax, rMin, rMax) ->
  ratio = (x - dMin) / (dMax - dMin)
  return ratio * (rMax - rMin) + rMin


canvasBounds = (ctx) ->
  canvas = ctx.canvas
  {
    cxMin: 0
    cxMax: canvas.width
    cyMin: canvas.height
    cyMax: 0
  }


clear = (ctx) ->
  canvas = ctx.canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)


drawCartesian = (ctx, opts) ->
  xMin = opts.xMin
  xMax = opts.xMax
  yMin = opts.yMin
  yMax = opts.yMax
  fn = opts.fn

  {cxMin, cxMax, cyMin, cyMax} = canvasBounds(ctx)

  ctx.beginPath()

  lastSample = cxMax / config.resolution

  lastCx = null
  lastCy = null
  dCy = null
  for i in [0..lastSample]
    cx = i * config.resolution
    x = lerp(cx, cxMin, cxMax, xMin, xMax)
    y = fn(x)
    cy = lerp(y, yMin, yMax, cyMin, cyMax)

    if !lastCy?
      ctx.moveTo(cx, cy)

    if dCy?
      if Math.abs((cy - lastCy) - dCy) > .000001
        ctx.lineTo(lastCx, lastCy)

    dCy = cy - lastCy if lastCy?
    lastCx = cx
    lastCy = cy

  ctx.lineTo(cx, cy)


drawVertical = (ctx, opts) ->
  xMin = opts.xMin
  xMax = opts.xMax
  x = opts.x

  {cxMin, cxMax, cyMin, cyMax} = canvasBounds(ctx)

  ctx.beginPath()
  cx = lerp(x, xMin, xMax, cxMin, cxMax)
  ctx.moveTo(cx, cyMin)
  ctx.lineTo(cx, cyMax)




util.canvas = {lerp, clear, drawCartesian, drawVertical}