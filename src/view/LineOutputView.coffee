compile = require("../compile/compile")

truncate = (value) ->
  s = value.toFixed(8)
  if s.indexOf(".") != -1
    s = s.replace(/\.?0*$/, "")
  s = "0" if s == "-0"
  return s

R.create "LineOutputView",
  propTypes: {
    line: C.Line
  }
  value: ->
    id = C.id(@line)
    compiled = compile(editor)
    compiled += "\n#{id};"
    value = eval(compiled)
    return truncate(value)
  render: ->
    R.div {className: "word lineOutput"},
      @value()