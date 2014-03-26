R.create "WordSpacerView",
  propTypes: {
    wordSpacerIndex: Number
    isFirstWord: Boolean
    isLastWord: Boolean
  }
  getDefaultProps: ->
    {
      isFirstWord: false
      isLastWord: false
    }

  handleInput: (newValue) ->
    wordListView = @lookupView("WordListView")
    wordListView.insertPlaceholderBefore(@wordSpacerIndex, newValue)

  # TODO: Move a lot of this line manipulation logic to ProgramView

  handleBackSpace: ->
    if @isFirstWord
      programView = @lookupView("ProgramView")
      lineIndex = @lookup("lineIndex")

      line = programView.program.lines[lineIndex]
      previousLine = programView.program.lines[lineIndex - 1]

      if previousLine?.wordList.isEmpty()
        programView.removeLineAt(lineIndex - 1)
        UI.setAutoFocus {
          descendantOf: programView
          props: {lineIndex: lineIndex - 1, isFirstWord: true}
        }
      else if line.wordList.isEmpty() and lineIndex > 0
        programView.removeLineAt(lineIndex)
        UI.setAutoFocus {
          descendantOf: programView
          props: {lineIndex: lineIndex - 1, isLastWord: true}
        }
    else
      wordListView = @lookupView("WordListView")
      wordListView.removeWordAt(@wordSpacerIndex - 1)

  handleEnter: ->
    wordListView = @lookupView("WordListView")
    programView = @lookupView("ProgramView")
    lineIndex = @lookup("lineIndex")
    if @isFirstWord
      programView.insertLineBefore(lineIndex)
      UI.setAutoFocus {
        descendantOf: programView
        props: {lineIndex: lineIndex + 1}
      }
    else if @isLastWord
      programView.insertLineBefore(lineIndex + 1)
      UI.setAutoFocus {
        descendantOf: programView
        props: {lineIndex: lineIndex + 1}
      }

  handleTransclusionDrop: (word) ->
    wordListView = @lookupView("WordListView")
    wordListView.insertWordBefore(@wordSpacerIndex, word)

  render: ->
    className = R.cx {
      wordSpacer: true
      activeTransclusionDrop: this == UI.activeTransclusionDropView
    }
    R.TextFieldView {
      className: className
      onInput: @handleInput
      onBackSpace: @handleBackSpace
      onEnter: @handleEnter
    }