window.R = R = {}


# =============================================================================
# Provide easy access to React.DOM and React.addons.classSet
# =============================================================================

for own key, value of React.DOM
  R[key] = value

R.cx = React.addons.classSet


# =============================================================================
# UniversalMixin gets mixed in to every component
# =============================================================================

R.UniversalMixin = {
  # Extra traversal powers
  ownerView: ->
    @_owner ? @props.__owner__ # undocumented React property

  lookup: (keyName) ->
    return this[keyName] ? @ownerView()?.lookup(keyName)

  lookupView: (viewName) ->
    return this if this == viewName or @viewName() == viewName
    return @ownerView()?.lookupView(viewName)

  lookupViewWithKey: (keyName) ->
    return this if this[keyName]?
    return @ownerView()?.lookupViewWithKey(keyName)

  # Move props to be actual properties on the view
  setPropsOnSelf: (nextProps) ->
    for own propName, propValue of nextProps
      continue if propName == "__owner__"
      this[propName] = propValue

  componentWillMount: ->
    @setPropsOnSelf(@props)

  componentWillUpdate: (nextProps) ->
    @setPropsOnSelf(nextProps)

  # Annotate the created DOM Node
  componentDidMount: ->
    el = @getDOMNode()
    el.dataFor ?= this

  componentWillUnmount: ->
    el = @getDOMNode()
    delete el.dataFor
}


# =============================================================================
# Extra stuff on React.create
# =============================================================================

R.create = (name, opts) ->
  # add name stuff
  opts.displayName = name
  opts.viewName = -> name

  # desugar propTypes
  opts.propTypes ?= {}
  for own propName, propType of opts.propTypes
    if propType.optional
      propType = propType.optional
      required = false
    else
      required = true

    if propType == Number
      propType = React.PropTypes.number
    else if propType == String
      propType = React.PropTypes.string
    else if propType == Boolean
      propType = React.PropTypes.bool
    else if propType == Function
      propType = React.PropTypes.func
    else
      propType = React.PropTypes.instanceOf(propType)

    if required
      propType = propType.isRequired

    opts.propTypes[propName] = propType

  # add the universal mixin
  opts.mixins ?= []
  opts.mixins.unshift(R.UniversalMixin)

  # create and register it
  R[name] = React.createClass(opts)


# =============================================================================
# Include all the view code
# =============================================================================

require("./mixins/StartTranscludeMixin")

require("./editor/EditorView")
require("./editor/DraggingView")

require("./program/ProgramView")
require("./program/LineView")

require("./plot/PlotView")
require("./plot/CanvasView")

require("./word/TextFieldView")
require("./word/LineOutputView")
require("./word/WordListView")
require("./word/WordView")
require("./word/ParamView")
require("./word/WordSpacerView")
