module.exports = class Compiler
  constructor: ->
    @substitutions = {}

  substitute: (expr, value) ->
    return unless expr
    id = C.id(expr)
    @substitutions[id] = value


  compile: (expr) ->
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

      if fn instanceof C.BuiltInFn
        return fn.fnName + "(" + compiledParamExprs.join(",") + ")"

      if fn instanceof C.CustomFn
        subCompiler = new Compiler()
        for paramVariable, paramIndex in fn.paramVariables
          subCompiler.substitute(paramVariable, compiledParamExprs[paramIndex])
        return subCompiler.compile(fn.rootExprs[0])