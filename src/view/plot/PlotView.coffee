Compiler = require("../../compile/Compiler")
evaluate = require("../../compile/evaluate")

R.create "PlotView",
  propTypes: {
    plot: C.Plot
  }

  drawFn: (canvas) ->
    ctx = canvas.getContext("2d")

    program = @lookup("program")
    compiler = new Compiler()
    compiler.substitute(@plot.x, "x")

    compiled = compiler.compile(program)

    compiled = """
    (function (x) {
      #{compiled}
      return that;
    })
    """

    f = evaluate(compiled)

    util.canvas.clear(ctx)
    util.canvas.drawCartesian(ctx, @plot.bounds, f)

    ctx.strokeStyle = "#f00"
    ctx.lineWidth = 1
    ctx.stroke()

  componentDidUpdate: ->
    @refs.canvas.draw()

  render: ->
    R.div {},
      R.CanvasView {drawFn: @drawFn, ref: "canvas"}
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