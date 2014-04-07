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

  drawFn: (canvas) ->
    ctx = canvas.getContext("2d")

    compiled = @compile()
    return unless compiled
    fn = evaluate(compiled)

    util.canvas.clear(ctx)

    util.canvas.drawCartesian ctx,
      xMin: -5
      xMax: 5
      yMin: -5
      yMax: 5
      fn: fn

    ctx.strokeStyle = "#000"
    ctx.lineWidth = 1.5
    ctx.stroke()


  componentDidUpdate: ->
    @refs.canvas.draw()

  render: ->
    R.div {},
      R.CanvasView {drawFn: @drawFn, ref: "canvas"}
