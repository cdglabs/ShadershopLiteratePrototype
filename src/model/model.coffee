class C.Word
  constructor: ->
  effectiveWord: ->
    return this

class C.Param extends C.Word
  constructor: (@valueString = "0", @label = "") ->
  value: ->
    number = parseFloat(@valueString)
    return 0 if _.isNaN(number) or !_.isFinite(number)
    return number


class C.Op extends C.Word
  constructor: (@opString = "+") ->

class C.That extends C.Word
  constructor: ->

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
      application = new C.Application()
      application.fn = new C.BuiltInFn(fnName)
      application.params = [new C.WordList([new C.That])]
      return application

    return this

  effectiveWord: ->
    return null

class C.Parens extends C.Word
  constructor: ->
    @wordList = new C.WordList()

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


class C.BuiltInFn
  constructor: (@fnName) ->


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


class C.Line extends C.Word
  constructor: ->
    @wordList = new C.WordList()


class C.Program
  constructor: ->
    @lines = [new C.Line()]


class C.Editor
  constructor: ->
    @programs = [new C.Program()]
