Compiler = require("../../compile/Compiler")
evaluate = require("../../compile/evaluate")
evaluateDiscontinuity = require("../../compile/evaluateDiscontinuity")


R.create "PlotView",
  propTypes:
    expr: C.Expr
    style: Object

  compile: ->
    customFn = @lookup("customFn")
    return unless customFn
    xVariable = customFn.paramVariables[0]

    compiler = new Compiler()
    compiler.substitute(xVariable, "x")

    compiled = compiler.compile(@expr)

    compiled = "(function (x) { return #{compiled} ; })"

  render: ->
    R.PlotCartesianView {fnString: @compile(), style: @style}
