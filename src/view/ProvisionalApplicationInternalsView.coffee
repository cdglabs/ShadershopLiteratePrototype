builtInFnDefinitions = require("../model/builtInFnDefinitions")


R.create "ProvisionalApplicationInternalsView",
  propTypes:
    application: C.Application

  handleApplicationLabelInput: (newValue) ->
    @application.label = newValue

  possibleApplications: ->
    fns = builtInFnDefinitions.map (definition) =>
      new C.BuiltInFn(definition.fnName)

    thisCustomFn = @lookup("customFn")
    customFns = _.reject editor.customFns, (customFn) =>
      customFnDependencies = customFn.getCustomFnDependencies()
      _.contains(customFnDependencies, thisCustomFn)

    fns = fns.concat(customFns)

    fns = _.filter fns, (fn) =>
      fn.getLabel().indexOf(@application.label) != -1

    possibleApplications = fns.map (fn) =>
      possibleApplication = new C.Application()
      possibleApplication.fn = fn
      possibleApplication.paramExprs = fn.getDefaultParamValues().map (value) =>
        # TODO: make defaultParamValues defaultParamValueStrings
        new C.Variable(""+value)

      possibleApplication.paramExprs[0] = @application.paramExprs[0]
      return possibleApplication

    return possibleApplications


  render: ->


    R.div {className: "ExprInternals"},
      R.span {style: {cursor: config.cursor.text}},
        R.TextFieldView {
          className: "ApplicationLabel"
          value: @application.label
          onInput: @handleApplicationLabelInput
          ref: "text"
        }
      if @refs?.text?.isFocused()
        possibleApplications = @possibleApplications()
        if possibleApplications.length > 0
          R.div {className: "ApplicationAutoComplete"},
            R.div {className: "Scroller"},
              possibleApplications.map (possibleApplication) =>
                R.ApplicationAutoCompleteRowView {
                  application: @application
                  possibleApplication: possibleApplication
                }
      # R.ApplicationAutoCompleteView {application: @application}





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
    if @application.paramExprs.length > 1
      UI.hoverData = {variable: @application.paramExprs[1], customFn: @lookup("customFn")}

  handleMouseLeave: ->
    @application.clearStagedApplication()
    UI.hoverData = null

  handleMouseDown: (e) ->
    e.preventDefault() # Don't steal focus from the text field

  handleClick: ->
    @application.commitApplication()
    UI.hoverData = null

  render: ->
    R.div {
      className: "ApplicationAutoCompleteRow"
      onMouseEnter: @handleMouseEnter
      onMouseLeave: @handleMouseLeave
      onMouseDown: @handleMouseDown
      onClick: @handleClick
    },
      R.div {className: "ExprNode"},
        R.ExprThumbnailView {expr: @possibleApplication}
        R.ExprInternalsView {expr: @possibleApplication}
