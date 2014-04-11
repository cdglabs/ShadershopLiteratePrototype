R.create "RootExprView",
  propTypes:
    rootExpr: C.Expr
    rootIndex: Number

  render: ->
    R.div {className: "RootExpr"},
      R.ExprListView {
        expr: @rootExpr
        parentArray: @lookup("customFn").rootExprs
        parentArrayIndex: @rootIndex
      }
      if @rootIndex > 0
        R.RootExprExtrasView {rootExpr: @rootExpr, rootIndex: @rootIndex}


R.create "RootExprExtrasView",
  propTypes:
    rootExpr: C.Expr
    rootIndex: Number

  promote: ->
    customFn = @lookup("customFn")
    @remove()
    customFn.rootExprs.splice(0, 0, @rootExpr)

  remove: ->
    customFn = @lookup("customFn")
    customFn.rootExprs.splice(@rootIndex, 1)

  render: ->
    R.div {className: "RootExprExtras"},
      R.div {className: "ExtrasLine"},
        R.span {className: "ExtrasButton", onClick: @remove}, "remove"
      R.div {className: "ExtrasLine"},
        R.span {className: "ExtrasButton", onClick: @promote}, "promote"





R.create "ExprListView",
  propTypes:
    expr: C.Expr
    parentArray: Array
    parentArrayIndex: Number

  render: ->
    R.span {},
      if @expr instanceof C.Application
        R.ExprListView {
          expr: @expr.paramExprs[0]
          parentArray: @expr.paramExprs
          parentArrayIndex: 0
        }
      R.ExprNodeView {expr: @expr}


R.create "ExprNodeView",
  propTypes:
    expr: C.Expr
    isDraggingCopy: Boolean

  getDefaultProps: ->
    isDraggingCopy: false

  insertApplicationAfter: (application) ->
    parentArray = @lookup("parentArray")
    parentArrayIndex = @lookup("parentArrayIndex")

    unless application == @expr
      application.paramExprs[0] = @expr
      parentArray[parentArrayIndex] = application

    return {parentArray, parentArrayIndex}

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
    return if e.target.closest(".CreateExprButton, .ApplicationAutoComplete, .Variable, .ExprThumbnail, .ApplicationLabel[contenteditable], .ApplicationAutoComplete")

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


      findInsertAfterEl = (e) ->
        insertAfterEl = null
        exprNodeEls = document.querySelectorAll(".CustomFn .ExprNode")
        for exprNodeEl in exprNodeEls
          rect = exprNodeEl.getBoundingClientRect()
          if rect.bottom + myHeight * 1.5 > e.clientY > rect.top + myHeight * 0.5 and rect.left < e.clientX < rect.right
            insertAfterEl = exprNodeEl
        return insertAfterEl


      # The View object is fragile so we need to close over properties here.
      application = @expr

      # The (current) CustomFn where application lives, used for the ghost
      customFn = @lookup("customFn")

      # The (current) parentArray and parentArrayIndex of application, used for removal
      parentArray = @lookup("parentArray")
      parentArrayIndex = @lookup("parentArrayIndex")

      removeApplication = ->
        return unless parentArray?
        parentArray[parentArrayIndex] = application.paramExprs[0]

      onMove = (e) ->
        insertAfterEl = findInsertAfterEl(e)

        if insertAfterEl
          insertAfterExprNodeView = insertAfterEl.dataFor.lookupView("ExprNodeView")

          if insertAfterExprNodeView.lookup("parentArray") == application.paramExprs
            return # Already in the right place

          removeApplication()
          {parentArray, parentArrayIndex} = insertAfterExprNodeView.insertApplicationAfter(application)
          customFn = insertAfterExprNodeView.lookup("customFn")

        else
          removeApplication()

      util.onceDragConsummated e, ->
        UI.dragging = {
          cursor: "-webkit-grabbing"
          offset: offset
          placeholderHeight: myHeight
          application: application
          render: ->
            R.div {style: {"min-width": myWidth, height: myHeight, overflow: "hidden", "background-color": "#fff"}},
              # HACK: This is a really loopy way to pass in customFn
              R.ExprNodeView {expr: application, customFn, isDraggingCopy: true}
          onMove: onMove
        }


  render: ->
    if @isPlaceholder()
      R.div {className: "ExprNodePlaceholder"}
    else
      R.div {className: "ExprNode", onMouseDown: @handleMouseDown, style: {cursor: @cursor()}},
        R.ExprThumbnailView {expr: @expr}
        R.ExprInternalsView {expr: @expr}
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
        R.ProvisionalApplicationInternalsView {application: @expr}
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
      "Param": true
      "ActiveTransclusionDrop": this == UI.activeTransclusionDropView
    }
    R.div {className: className},
      if @expr instanceof C.Application
        R.ParamApplicationView {application: @expr}
      else if @expr instanceof C.Variable
        R.VariableView {variable: @expr}



R.create "ParamApplicationView",
  propTypes:
    application: C.Application

  render: ->
    R.span {},
      R.ExprThumbnailView {expr: @application}
      R.div {className: "ApplicationLabel"},
        @application.label




R.create "ExprThumbnailView",
  propTypes:
    expr: C.Expr

  startTransclude: (e) ->
    UI.dragging = {
      cursor: config.cursor.grabbing
    }
    util.onceDragConsummated e, =>
      UI.dragging = {
        cursor: config.cursor.grabbing
        offset: {x: -4, y: -10}
        render: =>
          R.ExprThumbnailView {expr: @expr, customFn: @lookup("customFn")}
        onMove: (e) =>
          dropView = UI.getViewUnderMouse()
          dropView = dropView?.lookupViewWithKey("handleTransclusionDrop")
          UI.activeTransclusionDropView = dropView
        onUp: (e) =>
          if UI.activeTransclusionDropView
            UI.activeTransclusionDropView.handleTransclusionDrop(@expr)
          UI.activeTransclusionDropView = null
      }

  handleMouseDown: (e) ->
    UI.preventDefault(e)
    @startTransclude(e)

  render: ->
    R.div {className: "ExprThumbnail", onMouseDown: @handleMouseDown},
      R.PlotView {expr: @expr}









