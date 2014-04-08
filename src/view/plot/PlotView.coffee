Compiler = require("../../compile/Compiler")
evaluate = require("../../compile/evaluate")

R.create "PlotView",
  propTypes:
    expr: C.Expr

  compile: ->
    customFn = @lookup("customFn")
    return unless customFn
    xVariable = customFn.paramVariables[0]

    compiler = new Compiler()
    compiler.substitute(xVariable, "x")

    compiled = compiler.compile(@expr)

    compiled = "(function (x) { return #{compiled} ; })"

  getBounds: ->
    customFn = @lookup("customFn")
    return customFn.bounds

  drawFn: (canvas) ->
    ctx = canvas.getContext("2d")

    compiled = @compile()
    return unless compiled
    fn = evaluate(compiled)

    util.canvas.clear(ctx)

    {xMin, xMax, yMin, yMax} = @getBounds()
    util.canvas.drawCartesian ctx,
      xMin: xMin
      xMax: xMax
      yMin: yMin
      yMax: yMax
      fn: fn

    ctx.strokeStyle = "#000"
    ctx.lineWidth = 1.5
    ctx.stroke()


  componentDidUpdate: ->
    @refs.canvas.draw()

  render: ->
    R.CanvasView {drawFn: @drawFn, ref: "canvas"}
