module.exports = compile = (program) ->
  result = []

  result.push "var that = 0;"

  for line in program.lines
    result.push compileLine(line)

  return result.join("\n")

compileLine = (line) ->
  lineId = C.id(line)
  s = "var #{lineId} = that = "

  wordList = line.wordList.effectiveWordList()
  if !wordList
    s += "that"
  else
    s += compileWordList(wordList)

  s += ";"
  return s


compileWordList = (wordList) ->
  result = _.map wordList.words, compileWord
  return result.join(" ")

compileWord = (word) ->
  if word instanceof C.Op
    return word.opString

  else if word instanceof C.That
    return "that"

  else if word instanceof C.Param
    return ""+word.value()

  else if word instanceof C.Line
    return C.id(word)

  else if word instanceof C.Application
    compiledParams = _.map word.params, (wordList) ->
      compileWordList(wordList)
    return word.fn.fnName + "(" + compiledParams.join(", ") + ")"

  else
    console.warn "Cannot compile:", word
    return "that"