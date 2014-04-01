Compiler = require("../../compile/Compiler")
evaluate = require("../../compile/evaluate")

R.create "PlotView",
  propTypes: {
    plot: C.Plot
    line: C.Line
  }

  drawFn: (canvas) ->
    ctx = canvas.getContext("2d")

    program = @lookup("program")
    lineId = C.id(@line)

    compiler = new Compiler()
    compiler.substitute(@plot.x, "x")

    compiled = compiler.compile(program)

    compiled = """
    (function (x) {
      #{compiled}
      return #{lineId};
    })
    """

    f = evaluate(compiled)

    util.canvas.clear(ctx)

    util.canvas.drawCartesian ctx,
      xMin: @plot.bounds.domain.min
      xMax: @plot.bounds.domain.max
      yMin: @plot.bounds.range.min
      yMax: @plot.bounds.range.max
      fn: f

    ctx.strokeStyle = "#f00"
    ctx.lineWidth = 1
    ctx.stroke()

    if @plot.x instanceof C.Param
      value = @plot.x.value()
    else
      compiler = new Compiler()
      compiled = compiler.compile(program)

      compiled += "\n#{C.id(@plot.x)};"
      value = evaluate(compiled)

    util.canvas.drawVertical ctx,
      xMin: @plot.bounds.domain.min
      xMax: @plot.bounds.domain.max
      x: value

    ctx.strokeStyle = "#090"
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
    @plot.x = word

  render: ->
    R.div {},
      if @plot.x
        R.WordView {word: @plot.x}
      else
        R.div {className: "slot"}