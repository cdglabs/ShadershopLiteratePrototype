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

  # TODO: Move a lot of this line manipulation logic to EditorView

  handleBackSpace: ->
    if @isFirstWord
      editorView = @lookupView("EditorView")
      lineIndex = @lookup("lineIndex")

      line = editorView.editor.lines[lineIndex]
      previousLine = editorView.editor.lines[lineIndex - 1]

      if previousLine?.wordList.isEmpty()
        editorView.removeLineAt(lineIndex - 1)
        UI.setAutoFocus {
          descendantOf: editorView
          props: {lineIndex: lineIndex - 1, isFirstWord: true}
        }
      else if line.wordList.isEmpty() and lineIndex > 0
        editorView.removeLineAt(lineIndex)
        UI.setAutoFocus {
          descendantOf: editorView
          props: {lineIndex: lineIndex - 1, isLastWord: true}
        }
    else
      wordListView = @lookupView("WordListView")
      wordListView.removeWordAt(@wordSpacerIndex - 1)

  handleEnter: ->
    wordListView = @lookupView("WordListView")
    editorView = @lookupView("EditorView")
    lineIndex = @lookup("lineIndex")
    if @isFirstWord
      editorView.insertLineBefore(lineIndex)
      UI.setAutoFocus {
        descendantOf: editorView
        props: {lineIndex: lineIndex + 1}
      }
    else if @isLastWord
      editorView.insertLineBefore(lineIndex + 1)
      UI.setAutoFocus {
        descendantOf: editorView
        props: {lineIndex: lineIndex + 1}
      }

  render: ->
    R.TextFieldView {
      className: "wordSpacer"
      onInput: @handleInput
      onBackSpace: @handleBackSpace
      onEnter: @handleEnter
    }