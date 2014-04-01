builtInFns = require("./builtInFns")


# =============================================================================

class C.Word
  constructor: ->
  effectiveWord: ->
    return this

# =============================================================================

class C.Param extends C.Word
  constructor: (@valueString = "0", @label = "", @precision = 1) ->
  value: ->
    number = parseFloat(@valueString)
    return 0 if _.isNaN(number) or !_.isFinite(number)
    return number
  fixPrecision: ->
    if @valueString.indexOf(".") == -1
      zeros = @valueString.match(/0*$/)[0]
      numZeros = zeros.length
      @precision = Math.pow(10, numZeros)
    else
      digits = @valueString.match(/\..*$/)[0]
      numDigits = digits.length - 1 # -1 for the .
      @precision = Math.pow(0.1, numDigits)


# =============================================================================

class C.Op extends C.Word
  constructor: (@opString = "+") ->

# =============================================================================

class C.That extends C.Word
  constructor: ->

# =============================================================================

class C.Placeholder extends C.Word
  constructor: (@string = "") ->
  convert: ->
    string = @string.trim()
    if string == "that"
      return new C.That()

    if _.contains(["+", "-", "*", "/"], string)
      return new C.Op(string)

    if /[0-9]/.test(string)
      return new C.Param(string)

    if /:$/.test(string)
      return new C.Param("", string.slice(0, -1))

    if /.+\($/.test(string)
      fnName = string.slice(0, -1)
      fnDefinition = builtInFns[fnName]
      if fnDefinition
        params = fnDefinition.map (value) ->
          new C.Param(""+value)
        params[0] = new C.That
        params = params.map (word) ->
          new C.WordList([word])

        application = new C.Application()
        application.fn = new C.BuiltInFn(fnName)
        application.params = params

        return application

    return this

  effectiveWord: ->
    return null

# =============================================================================

class C.Parens extends C.Word
  constructor: ->
    @wordList = new C.WordList()

# =============================================================================

class C.Application extends C.Word
  constructor: ->
    @fn = null
    @params = [] # list of WordLists

  effectiveWord: ->
    effectiveParams = _.map @params, (wordList) =>
      wordList.effectiveWordList()
    return null unless _.all(effectiveParams)
    result = new C.Application()
    result.fn = @fn
    result.params = effectiveParams
    return result

# =============================================================================

class C.BuiltInFn
  constructor: (@fnName) ->

# =============================================================================

class C.WordList
  constructor: (@words = []) ->

  splice: (args...) ->
    @words.splice(args...)

  isEmpty: ->
    @words.length == 0

  effectiveWordList: ->
    words = []

    # Words need to alternate non-op, op, non-op, etc.
    lookingForOp = false
    for word in @words
      word = word.effectiveWord()
      continue unless word
      wordIsOp = word instanceof C.Op
      if wordIsOp == lookingForOp
        words.push(word)
        lookingForOp = !lookingForOp

    # Last word can't be an op.
    if _.last(words) instanceof C.Op
      words = _.initial(words)

    return null if words.length == 0
    return new C.WordList(words)

# =============================================================================

class C.Line extends C.Word
  constructor: ->
    @wordList = new C.WordList()

  hasReferenceToThat: ->
    return true if !@wordList.effectiveWordList()
    found = false
    recurse = (wordList) ->
      wordList = wordList.effectiveWordList()
      return unless wordList
      for word in wordList.words
        found = true if word instanceof C.That
        if word instanceof C.Application
          word = word.effectiveWord()
          for wordList in word.params
            recurse(wordList)
    recurse(@wordList)
    return found

# =============================================================================

class C.Program
  constructor: ->
    @lines = [new C.Line()]
    @plots = [new C.CartesianPlot()]

  getDependencies: (line) ->
    # returns a list of Lines and Params that are directly referenced by line
    index = @lines.indexOf(line)
    that = @lines[index - 1]

    return [that] if !line.wordList.effectiveWordList()

    dependencies = []
    recurse = (wordList) =>
      wordList = wordList.effectiveWordList()
      return unless wordList
      for word in wordList.words
        if word instanceof C.That
          dependencies.push(that)
        else if word instanceof C.Param or word instanceof C.Line
          dependencies.push(word)
        else if word instanceof C.Application
          word = word.effectiveWord()
          for wordList in word.params
            recurse(wordList)
    recurse(line.wordList)

    dependencies = _.unique(dependencies)
    return dependencies

  getDeepDependencies: (line) ->
    deepDependencies = []
    recurse = (line) =>
      dependencies = @getDependencies(line)
      deepDependencies = deepDependencies.concat(dependencies)
      for word in dependencies
        if word instanceof C.Line
          recurse(word)
    recurse(line)

    deepDependencies = _.unique(deepDependencies)
    return deepDependencies


# =============================================================================

class C.Plot
  constructor: ->

class C.CartesianPlot extends C.Plot
  constructor: ->
    @x = null
    @bounds = {
      domain: {min: -10, max: 10}
      range: {min: -10, max: 10}
    }

# =============================================================================

class C.Editor
  constructor: ->
    @programs = [new C.Program()]
