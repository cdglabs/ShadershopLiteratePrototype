R.create "GridView",
  propTypes:
    customFn: C.CustomFn

  getBounds: ->
    customFn = @lookup("customFn")
    return customFn.bounds

  drawFn: (canvas) ->
    ctx = canvas.getContext("2d")

    {xMin, xMax, yMin, yMax} = @getBounds()

    util.canvas.clear(ctx)

    util.canvas.drawGrid ctx,
      xMin: xMin
      xMax: xMax
      yMin: yMin
      yMax: yMax

  componentDidUpdate: ->
    {xMin, xMax, yMin, yMax} = @getBounds()
    lastDrawParameters = {xMin, xMax, yMin, yMax}
    unless _.isEqual(lastDrawParameters, @_lastDrawParameters)
      @refs.canvas.draw()
    @_lastDrawParameters = lastDrawParameters

  render: ->
    R.CanvasView {drawFn: @drawFn, ref: "canvas"}
