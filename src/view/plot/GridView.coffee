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
    @refs.canvas.draw()

  render: ->
    R.CanvasView {drawFn: @drawFn, ref: "canvas"}
