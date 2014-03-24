R.create "WordListView",
  propTypes: {
    wordList: C.WordList
  }

  insertPlaceholderBefore: (index, string) ->
    placeholder = new C.Placeholder(string)
    word = placeholder.convert()
    @wordList.splice(index, 0, word)
    @setAppropriateAutoFocus(index)

  replaceWordAt: (index, word) ->
    @wordList.splice(index, 1, word)
    @setAppropriateAutoFocus(index)

  removeWordAt: (index) ->
    @wordList.splice(index, 1)
    @setAutoFocusBefore(index)

  setAppropriateAutoFocus: (wordIndex) ->
    word = @wordList.words[wordIndex]
    if word instanceof C.Param
      UI.setAutoFocus {
        descendantOf: [this, "ParamValueView"]
        props: {wordIndex}
      }
    else if word instanceof C.Placeholder
      UI.setAutoFocus {
        descendantOf: [this]
        props: {wordIndex}
      }
    else
      @setAutoFocusBefore(wordIndex + 1)

  setAutoFocusBefore: (wordIndex) ->
    UI.setAutoFocus {
      descendantOf: this
      props: {wordSpacerIndex: wordIndex}
    }


  render: ->
    words = @wordList.words

    result = []

    for word, index in words
      result.push(R.WordSpacerView {
        wordSpacerIndex: index
        key: "spacer"+index
      })
      result.push(R.WordView {
        word: word
        wordIndex: index
        key: "word"+index
      })
    result.push(R.WordSpacerView {
      wordSpacerIndex: index
      key: "spacer"+index
    })

    result = _.filter result, (instance) ->
      if (index = instance.props.wordSpacerIndex)?
        previousWord = words[index-1]
        nextWord = words[index]
        if previousWord instanceof C.Placeholder or nextWord instanceof C.Placeholder
          return false
      return true

    _.first(result).props.isFirstWord = true
    _.last(result).props.isLastWord = true

    R.div {className: "wordList"},
      result