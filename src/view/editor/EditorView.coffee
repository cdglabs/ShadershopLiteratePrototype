R.create "EditorView",
  propTypes:
    editor: C.Editor

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
  propTypes:
    customFn: C.CustomFn

  render: ->
    R.div {className: "CustomFn"},
      R.div {className: "CustomFnHeader"},
        R.div {className: "FnLabel"},
          @customFn.getLabel()
        @customFn.paramVariables.map (paramVariable) =>
          R.VariableView {variable: paramVariable}
      R.div {className: "CustomFnDefinition"}
        R.div {className: "MainPlot"},
          R.GridView {customFn: @customFn}
          R.PlotView {expr: @customFn.rootExprs[0]}
        @customFn.rootExprs.map (rootExpr) =>
          R.ExprTreeView {expr: rootExpr}


R.create "ExprTreeView",
  propTypes:
    expr: C.Expr

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
  propTypes:
    expr: C.Expr
    isDraggingCopy: Boolean

  getDefaultProps: ->
    isDraggingCopy: false

  handleCreateExprButtonClick: ->
    customFn = @lookup("customFn")
    customFn.createApplicationAfter(@expr)

  isReorderable: ->
    @expr instanceof C.Application

  isPlaceholder: ->
    !@isDraggingCopy and UI.dragging?.application == @expr

  cursor: ->
    if @isReorderable() then config.cursor.grab else ""

  handleMouseDown: (e) ->
    return if e.target.closest(".CreateExprButton, .ApplicationAutoComplete, .Variable")

    UI.preventDefault(e)

    if @isReorderable()
      el = @getDOMNode()
      rect = el.getBoundingClientRect()
      myWidth = rect.width
      myHeight = rect.height
      offset = {
        x: e.clientX - rect.left
        y: e.clientY - rect.top
      }

      UI.dragging = {
        cursor: "-webkit-grabbing"
      }

      # The View object is fragile so we need to close over properties here.
      expr = @expr
      customFn = @lookup("customFn") # the CustomFn which has expr

      util.onceDragConsummated e, ->
        UI.dragging = {
          cursor: "-webkit-grabbing"
          offset: offset
          placeholderHeight: myHeight
          application: expr
          render: ->
            R.div {style: {"min-width": myWidth, height: myHeight, overflow: "hidden", "background-color": "#fff"}},
              # HACK: This is a really loopy way to pass in customFn
              R.ExprNodeView {expr, customFn, isDraggingCopy: true}
          onMove: (e) ->
            if customFn?
              customFn.removeApplication(expr)
              customFn = null
              # TODO: Maybe we'll want to preserve sub-Applications somewhere.

            insertAfterEl = null

            exprNodeEls = document.querySelectorAll(".CustomFn .ExprNode")
            for exprNodeEl in exprNodeEls
              rect = exprNodeEl.getBoundingClientRect()
              if rect.bottom + myHeight * 1.5 > e.clientY > rect.top + myHeight and rect.left < e.clientX < rect.right
                insertAfterEl = exprNodeEl

            if insertAfterEl
              exprView = insertAfterEl.dataFor
              refExpr = exprView.lookup("expr")
              refCustomFn = exprView.lookup("customFn")

              customFn = refCustomFn
              customFn.insertApplicationAfter(expr, refExpr)
              # TODO: Maybe we'll need to clean up references to variables here.
        }

  render: ->
    if @isPlaceholder()
      R.div {className: "ExprNodePlaceholder"}
    else
      R.div {className: "ExprNode", onMouseDown: @handleMouseDown, style: {cursor: @cursor()}},
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
  propTypes:
    expr: C.Expr

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
  propTypes:
    expr: C.Expr

  render: ->
    if @expr instanceof C.Application
      R.ExprThumbnailView {expr: @expr}
    else if @expr instanceof C.Variable
      R.VariableView {variable: @expr}


R.create "ExprThumbnailView",
  propTypes:
    expr: C.Expr

  render: ->
    R.div {className: "ExprThumbnail"},
      R.PlotView {expr: @expr}











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


































