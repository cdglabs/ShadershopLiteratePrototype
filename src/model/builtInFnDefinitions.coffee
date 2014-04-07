module.exports = builtInFnDefinitions = []

define = (fnName, defaultParamValues, label) ->
  label ?= fnName
  definition = {fnName, label, defaultParamValues}
  builtInFnDefinitions.push definition
  builtInFnDefinitions[fnName] = definition

define "identity", [0]

define "add", [0, 0], "+"
define "sub", [0, 0], "-"
define "mul", [1, 1], "*"
define "div", [1, 1], "/"

define "abs", [0]
define "fract", [0]
define "floor", [0]
define "ceil", [0]

define "min", [0, 0]
define "max", [0, 0]

define "sin", [0]
define "cos", [0]
define "sqrt", [0]
define "pow", [1, 1]
