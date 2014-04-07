module.exports = class Compiler
  constructor: ->
    @substitutions = {}

  substitute: (expr, value) ->
    return unless expr
    id = C.id(expr)
    @substitutions[id] = value


  compile: (expr) ->
    # TODO: Doesn't work with calling other CustomFn's yet.
    id = C.id(expr)

    if found = @substitutions[id]
      return found

    if expr instanceof C.Variable
      return ""+expr.getValue()

    if expr instanceof C.Application
      fn = expr.fn
      paramExprs = expr.paramExprs

      compiledParamExprs = paramExprs.map (expr) =>
        @compile(expr)

      return fn.fnName + "(" + compiledParamExprs.join(",") + ")"
