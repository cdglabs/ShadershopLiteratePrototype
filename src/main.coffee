require("view/R")






window.C = C = {}

class C.Word
  constructor: ->

class C.Param extends C.Word
  constructor: (@value = 0) ->
    @beforeString = ""
    @valueString = ""
    @afterString = ""

  setWithString: (string) ->
    floatRegEx = /[-+]?[0-9]*\.?[0-9]+/
    matches = string.match(floatRegEx)
    if !matches or matches.length == 0
      @beforeString = string
      @valueString = ""
      @afterString = ""
    else
      match = matches[0]
      sides = string.split(match)
      @beforeString = sides[0]
      @valueString = match
      @afterString = sides.slice(1).join(match)
      @value = parseFloat(@valueString)

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
      return new C.Param()
    else
      return null

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







window.editor = editor = new C.Editor()
do ->
  line = new C.Line()
  editor.lines.push(line)
  words = line.wordList.words
  words.push(new C.Param(3))
  words.push(new C.Op("+"))
  words.push(new C.Param(5))
  words.push(new C.Placeholder("asdf"))
  editor.lines.push(new C.Line())







window.UI = UI = new class
  constructor: ->
    @autofocus = null

  setAutoFocus: (match) ->
    @autofocus = {
      match
    }

  attemptAutoFocus: (props) ->
    return false if !@autofocus
    matches = true
    for own key, value of @autofocus.match
      matches = false if props[key] != value

    if matches
      @autofocus = null
      return true
    else
      return false











willRefreshNextFrame = false
refresh = ->
  return if willRefreshNextFrame
  willRefreshNextFrame = true
  requestAnimationFrame ->
    refreshView()
    willRefreshNextFrame = false

refreshView = ->
  editorEl = document.querySelector("#editor")
  React.renderComponent(R.EditorView({editor}), editorEl)




for eventName in ["mousedown", "mousemove", "mouseup", "keydown", "scroll", "change"]
  window.addEventListener(eventName, refresh)

refresh()





document.styleSheets.start_autoreload(1000)