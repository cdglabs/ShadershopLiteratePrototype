R.create "CustomFnView",
  propTypes:
    customFn: C.CustomFn

  handleCreateRootExprButtonClick: ->
    @customFn.createRootExpr()

  render: ->
    R.div {className: "CustomFn"},
      R.div {className: "CustomFnHeader"},
        R.div {className: "FnLabel"},
          @customFn.getLabel()
        @customFn.paramVariables.map (paramVariable) =>
          R.VariableView {variable: paramVariable}
      R.div {className: "CustomFnDefinition"},
        R.div {className: "MainPlot"},
          R.GridView {customFn: @customFn}
          R.PlotView {expr: @customFn.rootExprs[0]}
        @customFn.rootExprs.map (rootExpr) =>
          R.RootExprTreeView {rootExpr: rootExpr}
        R.button {className: "CreateRootExprButton", onClick: @handleCreateRootExprButtonClick}
