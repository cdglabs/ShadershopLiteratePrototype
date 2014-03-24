window.C = C = {}

class C.Word
  constructor: ->

class C.Param extends C.Word
  constructor: (@valueString = "0", @label = "") ->

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

class C.Parens extends C.Word
  constructor: ->
    @wordList = new C.WordList()

class C.Application extends C.Word
  constructor: ->
    @fn = null
    @params = [] # list of WordLists


class C.WordList
  constructor: ->
    @words = []

  splice: (args...) ->
    @words.splice(args...)


class C.Line
  constructor: ->
    @wordList = new C.WordList()


class C.Editor
  constructor: ->
    @lines = []