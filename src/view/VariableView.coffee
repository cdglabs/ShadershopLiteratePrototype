R.create "VariableView",
  propTypes:
    variable: C.Variable

  render: ->
    R.div {className: "Variable"},
      R.div {className: "VariableLabel", contentEditable: true},
        @variable.label
      R.div {className: "VariableValue", contentEditable: true},
        @variable.valueString