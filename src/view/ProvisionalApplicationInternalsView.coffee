R.create "ProvisionalApplicationInternalsView",
  propTypes:
    application: C.Application

  handleApplicationLabelInput: (newValue) ->
    @application.label = newValue

  possibleApplications: ->
    possibleApplications = @application.getPossibleApplications()
    possibleApplications = _.filter possibleApplications, (possibleApplication) =>
      possibleApplication.fn.getLabel().indexOf(@application.label) != -1

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

  handleMouseLeave: ->
    @application.clearStagedApplication()

  handleMouseDown: (e) ->
    e.preventDefault() # Don't steal focus from the text field

  handleClick: ->
    @application.commitApplication()

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
