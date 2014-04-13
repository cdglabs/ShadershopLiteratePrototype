R.create "CustomFnView",
  propTypes:
    customFn: C.CustomFn

  shouldComponentUpdate: ->
    el = @getDOMNode()
    return el.isOnScreen()

  handleCreateRootExprButtonClick: ->
    @customFn.createRootExpr()

  render: ->
    R.div {className: "CustomFn"},
      R.MainPlotView {customFn: @customFn}

      R.div {className: "CustomFnDefinition"},
        R.CustomFnHeaderView {customFn: @customFn}
        @customFn.rootExprs.map (rootExpr, rootIndex) =>
          R.RootExprView {rootExpr, rootIndex}
        R.button {className: "CreateRootExprButton", onClick: @handleCreateRootExprButtonClick}


# =============================================================================

R.create "CustomFnHeaderView",
  propTypes:
    customFn: C.CustomFn

  handleFnLabelInput: (newValue) ->
    @customFn.label = newValue

  render: ->
    R.div {className: "CustomFnHeader"},
      R.TextFieldView {
        className: "FnLabel",
        value: @customFn.getLabel()
        onInput: @handleFnLabelInput
      }
      @customFn.paramVariables.map (paramVariable) =>
        R.div {className: "Param"},
          R.VariableView {variable: paramVariable}
      R.CustomFnParamPlaceholderView {customFn: @customFn}


# =============================================================================

# TODO: this is temporary until I implement something nicer
R.create "CustomFnParamPlaceholderView",
  propTypes:
    customFn: C.CustomFn

  handleTransclusionDrop: (expr) ->
    return unless expr instanceof C.Variable
    paramVariables = @customFn.paramVariables
    return if _.contains(paramVariables, expr)
    paramVariables.push(expr)

  render: ->
    className = R.cx {
      ActiveTransclusionDrop: this == UI.activeTransclusionDropView
    }
    R.span {className: className},
      R.div {className: "ParamPlaceholder"}
