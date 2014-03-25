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
    if @string == "that"
      return new C.That()
    else if _.contains(["+", "-", "*", "/"], @string)
      return new C.Op(@string)
    else if /[0-9]/.test(@string)
      return new C.Param(@string)
    else if /:$/.test(@string)
      return new C.Param("", @string.slice(0, -1))
    else
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


class C.Line
  constructor: ->
    @wordList = new C.WordList()


class C.Program
  constructor: ->
    @lines = [new C.Line()]


class C.Editor
  constructor: ->
    @programs = [new C.Program()]
