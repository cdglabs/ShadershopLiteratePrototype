
lerp = (x, dMin, dMax, rMin, rMax) ->
  ratio = (x - dMin) / (dMax - dMin)
  return ratio * (rMax - rMin) + rMin


drawGraph = (ctx, bounds, fn) ->
  {xMin, xMax, yMin, yMax} = bounds

  canvas = ctx.canvas

  cxMin = 0
  cxMax = canvas.width
  cyMin = canvas.height
  cyMax = 0

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




util.canvas = {lerp, drawGraph}