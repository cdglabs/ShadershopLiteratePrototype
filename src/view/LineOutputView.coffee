compile = require("../compile/compile")

R.create "LineOutputView",
  propTypes: {
    line: C.Line
  }
  value: ->
    program = @lookup("program")
    id = C.id(@line)
    compiled = compile(program)
    compiled += "\n#{id};"
    value = eval(compiled)
    return util.formatFloat(value)
  render: ->
    R.div {className: "word lineOutput"},
      @value()