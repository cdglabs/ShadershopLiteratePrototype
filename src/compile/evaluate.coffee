module.exports = evaluate = (jsString) ->
  try
    return eval(jsString)
  catch
    console.warn "Unable to evaluate:", jsString


# =============================================================================
# GLSL built-in functions
# =============================================================================

sin = Math.sin
cos = Math.cos
abs = Math.abs
sqrt = Math.sqrt
pow = (a, b) -> Math.pow(Math.abs(a), b)
floor = Math.floor
ceil = Math.ceil
min = Math.min
max = Math.max
fract = (a) -> a - Math.floor(a)
