Compiler = require("../../compile/Compiler")
evaluate = require("../../compile/evaluate")
evaluateDiscontinuity = require("../../compile/evaluateDiscontinuity")

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
    testDiscontinuityHelper = evaluateDiscontinuity(compiled)
    testDiscontinuity = (range) -> testDiscontinuityHelper(range) == "found"

    util.canvas.clear(ctx)

    {xMin, xMax, yMin, yMax} = @getBounds()
    util.canvas.drawCartesian ctx,
      xMin: xMin
      xMax: xMax
      yMin: yMin
      yMax: yMax
      fn: fn
      testDiscontinuity: testDiscontinuity

    ctx.strokeStyle = "#000"
    ctx.lineWidth = 1.5
    ctx.lineCap = "round"
    ctx.stroke()


  componentDidUpdate: ->
    @refs.canvas.draw()

  render: ->
    R.CanvasView {drawFn: @drawFn, ref: "canvas"}