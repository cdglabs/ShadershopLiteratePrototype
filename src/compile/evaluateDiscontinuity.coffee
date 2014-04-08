module.exports = evaluateDiscontinuity = (jsString) ->
  try
    eval(jsString)
  catch
    console.warn "Unable to evaluate:", jsString


# =============================================================================
# GLSL built-in functions
# =============================================================================

identity = (a) -> a

add = (a, b) -> a + b
sub = (a, b) -> a - b
mul = (a, b) -> a * b
div = (a, b) -> a / b

abs = Math.abs
fract = (a) -> a - Math.floor(a)
floor = Math.floor
ceil = Math.ceil

min = Math.min
max = Math.max

sin = Math.sin
cos = Math.cos
sqrt = Math.sqrt
pow = (a, b) -> Math.pow(Math.abs(a), b)




convertFn = (fn, detector=null) ->
  return (args...) ->
    if _.any(args, (x) -> x == "found")
      return "found"

    if detector? and args[0][0]?
      if detector(args[0][0]) != detector(args[0][1])
        return "found"

    return [0, 1].map (index) ->
      fnArgs = args.map (arg) -> arg[index] ? arg
      return fn(fnArgs...)


identity = convertFn(identity)
add = convertFn(add)
sub = convertFn(sub)
mul = convertFn(mul)
div = convertFn(div)

abs = convertFn(abs)
fract = convertFn(fract, Math.floor)
floor = convertFn(floor, Math.floor)
ceil = convertFn(ceil, Math.ceil)

min = convertFn(min)
max = convertFn(max)

sin = convertFn(sin)
cos = convertFn(cos)
sqrt = convertFn(sqrt)
pow = convertFn(pow)
