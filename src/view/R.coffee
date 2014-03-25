window.R = R = {}

for own key, value of React.DOM
  R[key] = value

R.cx = React.addons.classSet


R.UniversalMixin = {
  # Extra traversal powers
  ownerView: ->
    @_owner ? @props.__owner__ # undocumented React property

  lookup: (keyName) ->
    return this[keyName] ? @ownerView()?.lookup(keyName)

  lookupView: (viewName) ->
    return this if this == viewName or @viewName() == viewName
    return @ownerView()?.lookupView(viewName)

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


R.create = (name, opts) ->
  # add name stuff
  opts.displayName = name
  opts.viewName = -> name

  # desugar propTypes
  opts.propTypes ?= {}
  for own propName, propType of opts.propTypes
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

    opts.propTypes[propName] = propType.isRequired

  # add the universal mixin
  opts.mixins ?= []
  opts.mixins.unshift(R.UniversalMixin)

  # create and register it
  R[name] = React.createClass(opts)




require("./TextFieldView")
require("./EditorView")
require("./ProgramView")
require("./LineView")
require("./LineOutputView")
require("./WordListView")
require("./WordView")
require("./ParamView")
require("./WordSpacerView")
