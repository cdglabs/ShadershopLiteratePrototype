R.create "SavedExamplesView",
  shouldComponentUpdate: ->
    return false

  load: (name) ->
    ->
      savedExamples.restore(name)

  render: ->
    R.div {className: "SavedExamples"},
      R.div {className: "TextButtonLabel"}, "Examples"
      R.div {className: "TextButton", onClick: @load("blank")}, "Blank"
      R.div {className: "TextButton", onClick: @load("waveforms")}, "Waveforms"
      R.div {className: "TextButton", onClick: @load("noise")}, "Fractal Noise"