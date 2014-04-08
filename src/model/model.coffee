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

  _findExpr: (refExpr) ->
    # returns {array, index} such that
    #   array[index] == refExpr
    #   array is either @rootExprs or an Application.paramExprs
    search = (array) =>
      found = null
      for expr, index in array
        if expr == refExpr
          found ?= {array, index}
        if expr instanceof C.Application
          found ?= search(expr.paramExprs)
      return found
    return search(@rootExprs) ? {array: null, index: null}

  removeApplication: (refApplication) ->
    {array, index} = @_findExpr(refApplication)
    return unless array?
    previousExpr = refApplication.paramExprs[0]
    array[index] = previousExpr
    # TODO should look at refApplication.paramExprs[1...] and add them to
    # @rootExprs if they're Applications (maybe that's a separate method)




class C.Editor
  constructor: ->
    @customFns = []
    @createCustomFn()

  createCustomFn: ->
    customFn = new C.CustomFn()
    @customFns.push(customFn)
