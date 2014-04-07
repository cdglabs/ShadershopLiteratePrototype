R.create "EditorView",
  propTypes: {
    editor: C.Editor
  }

  cursor: ->
    UI.dragging?.cursor ? ""

  render: ->
    R.div {className: "editor", style: {cursor: @cursor()}},

      R.div {className: "customFns"},
        @editor.customFns.map (customFn) =>
          R.CustomFnView {customFn: customFn}

      R.div {className: "dragging"},
        R.DraggingView {}


R.create "CustomFnView",
  propTypes: {
    customFn: C.CustomFn
  }

  render: ->
    R.div {className: "CustomFn"},
      R.div {className: "CustomFnHeader"},
        R.div {className: "FnLabel"},
          @customFn.getLabel()
        @customFn.paramVariables.map (paramVariable) =>
          R.VariableView {variable: paramVariable}
      R.div {className: "CustomFnDefinition"}
        @customFn.rootExprs.map (rootExpr) =>
          R.ExprTreeView {expr: rootExpr}


R.create "ExprTreeView",
  propTypes: {
    expr: C.Expr
  }
  render: ->
    R.div {className: "ExprTree"},
      if @expr instanceof C.Application
        R.div {className: "ExprTreeChildren"},
          @expr.paramExprs.map (paramExpr, paramIndex) =>
            if paramIndex == 0
              R.ExprTreeView {expr: paramExpr}
            else if paramExpr instanceof C.Application
              R.ExprTreeView {expr: paramExpr}
      R.ExprNodeView {expr: @expr}


R.create "ExprNodeView",
  propTypes: {
    expr: C.Expr
  }
  handleCreateExprButtonClick: ->
    customFn = @lookup("customFn")
    customFn.createApplicationAfter(@expr)
  render: ->
    R.div {className: "ExprNode"},
      R.ExprThumbnailView {expr: @expr}
      R.ExprInternalsView {expr: @expr}
      if @expr.isProvisional
        R.ApplicationAutoCompleteView {application: @expr}
      else
        R.button {
          className: "CreateExprButton"
          onClick: @handleCreateExprButtonClick
        }


R.create "ExprInternalsView",
  propTypes: {
    expr: C.Expr
  }
  render: ->
    if @expr instanceof C.Application
      if @expr.isProvisional
        R.div {className: "ExprInternals"}
      else
        R.div {className: "ExprInternals"},
          R.div {className: "FnLabel"},
            @expr.fn.getLabel()
          @expr.paramExprs.map (paramExpr, paramIndex) =>
            if paramIndex > 0
              R.ParamExprView {expr: paramExpr}
    else if @expr instanceof C.Variable
      R.div {className: "ExprInternals"},
        R.VariableView {variable: @expr}


R.create "ParamExprView",
  propTypes: {
    expr: C.Expr
  }
  render: ->
    if @expr instanceof C.Application
      R.ExprThumbnailView {expr: @expr}
    else if @expr instanceof C.Variable
      R.VariableView {variable: @expr}


R.create "ExprThumbnailView",
  propTypes: {
    expr: C.Expr
  }
  render: ->
    R.div {className: "ExprThumbnail"}


R.create "VariableView",
  propTypes: {
    variable: C.Variable
  }
  render: ->
    R.div {className: "Variable"},
      R.div {className: "VariableLabel", contentEditable: true},
        @variable.label
      R.div {className: "VariableValue", contentEditable: true},
        @variable.valueString








R.create "ApplicationAutoCompleteView",
  propTypes:
    application: C.Application

  render: ->
    R.div {className: "ApplicationAutoComplete"},
      R.div {className: "Scroller"},
        @application.getPossibleApplications().map (possibleApplication) =>
          R.ApplicationAutoCompleteRowView {
            application: @application
            possibleApplication: possibleApplication
          }

R.create "ApplicationAutoCompleteRowView",
  propTypes:
    application: C.Application
    possibleApplication: C.Application

  handleMouseEnter: ->
    @application.setStagedApplication(@possibleApplication)

  handleClick: ->
    @application.commitApplication()

  render: ->
    R.div {onMouseEnter: @handleMouseEnter, onClick: @handleClick},
      R.ExprNodeView {expr: @possibleApplication}


































