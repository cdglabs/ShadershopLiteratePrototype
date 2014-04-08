R.create "RootExprTreeView",
  propTypes:
    rootExpr: C.Expr
    rootIndex: Number

  render: ->
    R.div {className: "RootExprTree"},
      R.ExprTreeView {
        expr: @rootExpr
        parentArray: @lookup("customFn").rootExprs
        parentArrayIndex: @rootIndex
      }


R.create "ExprTreeView",
  propTypes:
    expr: C.Expr
    parentArray: Array
    parentArrayIndex: Number

  render: ->
    R.div {className: "ExprTree"},
      if @expr instanceof C.Application
        R.div {className: "ExprTreeChildren"},
          @expr.paramExprs.map (paramExpr, paramIndex) =>
            if paramIndex == 0 or paramExpr instanceof C.Application
              R.ExprTreeView {
                expr: paramExpr
                parentArray: @expr.paramExprs
                parentArrayIndex: paramIndex
              }
      R.ExprNodeView {expr: @expr}


R.create "ExprNodeView",
  propTypes:
    expr: C.Expr
    isDraggingCopy: Boolean

  getDefaultProps: ->
    isDraggingCopy: false

  insertApplicationAfter: (application) ->
    return if application == @expr
    application.paramExprs[0] = @expr
    @lookup("parentArray")[@lookup("parentArrayIndex")] = application

  handleCreateExprButtonClick: ->
    application = new C.Application()
    application.isProvisional = true
    @insertApplicationAfter(application)

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
            insertAfterEl = null

            exprNodeEls = document.querySelectorAll(".CustomFn .ExprNode")
            for exprNodeEl in exprNodeEls
              rect = exprNodeEl.getBoundingClientRect()
              if rect.bottom + myHeight * 1.5 > e.clientY > rect.top + myHeight * 0.5 and rect.left < e.clientX < rect.right
                insertAfterEl = exprNodeEl

            if insertAfterEl
              exprView = insertAfterEl.dataFor
              exprView = exprView.lookupView("ExprNodeView")
              insertAfterExpr = exprView.expr

              if exprView.lookup("parentArray") == expr.paramExprs
                return # done
              else
                if customFn?
                  customFn.removeApplication(expr)
                  customFn = null
                exprView.insertApplicationAfter(expr)
                customFn = exprView.lookup("customFn")
            else
              if customFn?
                customFn.removeApplication(expr)
                customFn = null
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
              R.ParamExprView {
                expr: paramExpr
                parentArray: @expr.paramExprs
                parentArrayIndex: paramIndex
              }
    else if @expr instanceof C.Variable
      R.div {className: "ExprInternals"},
        R.ParamExprView {
          expr: @expr
          parentArray: @lookup("parentArray")
          parentArrayIndex: @lookup("parentArrayIndex")
        }


R.create "ParamExprView",
  propTypes:
    expr: C.Expr
    parentArray: Array
    parentArrayIndex: Number

  handleTransclusionDrop: (droppedExpr) ->
    @parentArray[@parentArrayIndex] = droppedExpr

  render: ->
    className = R.cx {
      "ActiveTransclusionDrop": this == UI.activeTransclusionDropView
    }
    R.span {className: className},
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

