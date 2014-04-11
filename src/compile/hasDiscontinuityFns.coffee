discontinuityFns = ["floor", "ceil", "fract"]

module.exports = hasDiscontinuityFns = (expr) ->
  if expr instanceof C.Variable
    return false

  if expr instanceof C.Application
    fnName = expr.fn.fnName
    if _.contains(discontinuityFns, fnName)
      return true
    else
      return _.any(expr.paramExprs, hasDiscontinuityFns)
