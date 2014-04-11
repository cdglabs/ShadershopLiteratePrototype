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

  getPossibleApplications: ->
    builtInFnDefinitions.map (definition) =>
      application = new C.Application()
      application.fn = new C.BuiltInFn(definition.fnName)
      application.paramExprs = definition.defaultParamValues.map (value) =>
        new C.Variable(""+value)
      application.paramExprs[0] = @paramExprs[0]
      return application

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

  createRootExpr: ->
    variable = new C.Variable()
    @rootExprs.push(variable)


class C.Editor
  constructor: ->
    @customFns = []
    @createCustomFn()

  createCustomFn: ->
    customFn = new C.CustomFn()
    @customFns.push(customFn)
