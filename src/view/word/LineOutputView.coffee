compile = require("../../compile/compile")

R.create "LineOutputView",
  propTypes: {
    line: C.Line
  }

  mixins: [R.StartTranscludeMixin]

  evaluate: ->
    program = @lookup("program")
    id = C.id(@line)
    compiled = compile(program)
    compiled += "\n#{id};"
    try
      value = eval(compiled)
    catch
      console.warn "Could not eval", compiled
    return util.formatFloat(value)

  handleMouseDown: (e) ->
    UI.preventDefault(e)
    @startTransclude(e, @line, @render.bind(this))

  cursor: ->
    config.cursor.grab

  render: ->
    R.div {
      className: "word lineOutput"
      style: {cursor: @cursor()}
      onMouseDown: @handleMouseDown
    },
      @evaluate()