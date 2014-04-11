builtInFnDefinitions = require("./builtInFnDefinitions")


class C.Expr
  constructor: ->


class C.Variable extends C.Expr
  constructor: (@valueString="0", @label="") ->
    @domain = "range" # "domain" or "range"
    @domainCoord = 0
  getValue: ->
    parseFloat(@valueString)


class C.Application extends C.Expr
  constructor: ->
    @fn = new C.BuiltInFn("identity")
    @label = ""
    @paramExprs = []
    @isProvisional = false

  setStagedApplication: (application) ->
    @fn = application.fn
    @paramExprs = application.paramExprs

  clearStagedApplication: ->
    @fn = new C.BuiltInFn("identity")
    @paramExprs = @paramExprs.slice(0, 1)

  commitApplication: ->
    @isProvisional = false



class C.Fn
  constructor: ->


class C.BuiltInFn extends C.Fn
  constructor: (@fnName) ->
  getLabel: ->
    builtInFnDefinitions[@fnName].label
  getDefaultParamValues: ->
    builtInFnDefinitions[@fnName].defaultParamValues


class C.CustomFn extends C.Fn
  constructor: ->
    @label = ""
    variable = new C.Variable("0", "x")
    variable.domain = "domain"
    @paramVariables = [variable]
    @rootExprs = [variable]
    # For plotting
    @bounds = {xMin: -6, xMax: 6, yMin: -6, yMax: 6}

  getLabel: -> @label
  getDefaultParamValues: ->
    @paramVariables.map (paramVariable) =>
      paramVariable.getValue()

  createRootExpr: ->
    variable = new C.Variable()
    @rootExprs.push(variable)

  getCustomFnDependencies: ->
    dependencies = [this]

    recurse = (expr) =>
      if expr instanceof C.Application
        fn = expr.fn
        if fn instanceof C.CustomFn
          dependencies.push(fn)
          dependencies = dependencies.concat(fn.getCustomFnDependencies())

        for paramExpr in expr.paramExprs
          recurse(paramExpr)

    for rootExpr in @rootExprs
      recurse(rootExpr)

    return _.unique(dependencies)


class C.Editor
  constructor: ->
    @customFns = []
    @createCustomFn()

  createCustomFn: ->
    customFn = new C.CustomFn()
    @customFns.push(customFn)
