R.create "WordListView",
  insertPlaceholderBefore: (string, index) ->
    {wordList} = @props
    placeholder = new C.Placeholder(string)
    word = placeholder.convert() ? placeholder
    wordList.splice(index, 0, word)
    @setAutoFocus(index)

  removeWordAt: (index) ->
    {wordList} = @props
    wordList.splice(index, 1)
    UI.setAutoFocus {wordListView: this, spacerIndex: index}

  replaceWordAt: (word, index) ->
    {wordList} = @props
    wordList.splice(index, 1, word)
    @setAutoFocus(index)

  setAutoFocus: (createdWordIndex) ->
    {wordList} = @props
    word = wordList.words[createdWordIndex]
    if word instanceof C.That or word instanceof C.Op
      UI.setAutoFocus {wordListView: this, spacerIndex: createdWordIndex + 1}
    else
      UI.setAutoFocus {wordListView: this, index: createdWordIndex}

  render: ->
    {wordList} = @props

    words = wordList.words

    result = []
    wordListView = this

    for word, index in words
      result.push(R.WordSpacerView {
        wordListView
        spacerIndex: index
        key: "spacer"+index
      })
      result.push(R.WordView {
        word: word
        wordListView
        index
        key: "word"+index
      })
    result.push(R.WordSpacerView {
      wordListView
      spacerIndex: index
      key: "spacer"+index
    })

    result = _.filter result, (instance) ->
      if (index = instance.props.spacerIndex)?
        previousWord = words[index-1]
        nextWord = words[index]
        if previousWord instanceof C.Placeholder or nextWord instanceof C.Placeholder
          return false
      return true

    R.div {className: "wordList"},
      result