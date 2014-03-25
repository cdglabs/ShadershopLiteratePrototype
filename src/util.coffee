window.util = util = {}


util.formatFloat = (value, precision = 6) ->
  s = value.toFixed(precision)
  if s.indexOf(".") != -1
    s = s.replace(/\.?0*$/, "")
  s = "0" if s == "-0"
  return s

