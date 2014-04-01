R.create "PlotView",
  propTypes: {
    plot: C.Plot
  }

  drawFn: (canvas) ->
    ctx = canvas.getContext("2d")
    util.canvas.drawCartesian(ctx, @plot.bounds, (x) -> Math.sin(x))
    ctx.strokeStyle = "#f00"
    ctx.lineWidth = 1
    ctx.stroke()

  render: ->
    R.div {},
      R.CanvasView {drawFn: @drawFn}
      R.div {style: {position: "absolute", bottom: 0, left: 0}},
        R.XParamView {plot: @plot}


R.create "XParamView",
  propTypes: {
    plot: C.Plot
  }

  handleTransclusionDrop: (word) ->
    if word instanceof C.Param
      @plot.x = word

  render: ->
    R.div {},
      if @plot.x
        R.WordView {word: @plot.x}
      else
        R.div {className: "slot"}