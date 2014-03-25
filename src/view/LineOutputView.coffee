compile = require("../compile/compile")

truncate = (value) ->
  s = value.toFixed(6)
  if s.indexOf(".") != -1
    s = s.replace(/\.?0*$/, "")
  s = "0" if s == "-0"
  return s

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
    return truncate(value)
  render: ->
    R.div {className: "word lineOutput"},
      @value()