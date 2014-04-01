Compiler = require("../../compile/Compiler")
evaluate = require("../../compile/evaluate")

R.create "LineOutputView",
  propTypes: {
    line: C.Line
  }

  mixins: [R.StartTranscludeMixin]

  evaluate: ->
    program = @lookup("program")
    id = C.id(@line)

    compiler = new Compiler()
    compiled = compiler.compile(program)

    compiled += "\n#{id};"
    value = evaluate(compiled)
    return util.formatFloat(value)

  handleMouseDown: (e) ->
    UI.preventDefault(e)
    @startTransclude(e, @line, @render.bind(this))

  cursor: ->
    config.cursor.grab

  handleMouseEnter: ->
    UI.setHoveredWord(@line)

  handleMouseLeave: ->
    UI.setHoveredWord(null)

  render: ->
    className = R.cx {
      word: true
      lineOutput: true
      highlighted: UI.getHighlightedWord() == @line
    }
    R.div {
      className: className
      style: {cursor: @cursor()}
      onMouseDown: @handleMouseDown
      onMouseEnter: @handleMouseEnter
      onMouseLeave: @handleMouseLeave
    },
      @evaluate()