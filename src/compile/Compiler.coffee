module.exports = class Compiler
  constructor: ->
    @substitutions = {}

  substitute: (word, value) ->
    return unless word
    id = C.id(word)
    @substitutions[id] = value


  compile: (program) ->
    result = []

    result.push "var that = 0;"

    for line in program.lines
      result.push @compileLine(line)

    return result.join("\n")

  compileLine: (line) ->
    lineId = C.id(line)
    s = "var #{lineId} = that = "

    if substitution = @substitutions[lineId]
      s += substitution

    else
      wordList = line.wordList.effectiveWordList()
      if !wordList
        s += "that"
      else
        s += @compileWordList(wordList)

    s += ";"
    return s


  compileWordList: (wordList) ->
    result = _.map wordList.words, (word) =>
      @compileWord(word)
    return result.join(" ")

  compileWord: (word) ->
    if word instanceof C.Op
      return word.opString

    else if word instanceof C.That
      return "that"

    else if word instanceof C.Param
      id = C.id(word)
      return @substitutions[id] ? ""+word.value()

    else if word instanceof C.Line
      id = C.id(word)
      return @substitutions[id] ? id

    else if word instanceof C.Application
      compiledParams = _.map word.params, (wordList) =>
        @compileWordList(wordList)
      return word.fn.fnName + "(" + compiledParams.join(", ") + ")"

    else
      console.warn "Cannot compile:", word
      return "that"