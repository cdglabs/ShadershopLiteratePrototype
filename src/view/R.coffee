module.exports = R = {}

for own key, value of React.DOM
  R[key] = value

R.cx = React.addons.classSet


R.UniversalMixin = {
  ownerView: ->
    @props.__owner__ # undocumented React property

  # lookupProp: (propName) ->
  #   return @props[propName] ? @ownerView()?.lookupProp[propName]

  # lookupMethod: (methodName) ->
  #   return this[methodName] ? @ownerView()?.lookupMethod(methodName)

  lookup: (keyName) ->
    return this[keyName] ? @ownerView()?.lookup(keyName)

  lookupView: (viewName) ->
    return this if this == viewName or @viewName() == viewName
    return @ownerView()?.lookupView(viewName)


  setPropsOnSelf: (nextProps) ->
    for own propName, propValue of nextProps
      this[propName] = propValue

  componentWillMount: ->
    @setPropsOnSelf(@props)

  componentWillUpdate: (nextProps) ->
    @setPropsOnSelf(nextProps)



  componentDidMount: ->
    el = @getDOMNode()
    el.dataFor ?= this

  componentWillUnmount: ->
    el = @getDOMNode()
    delete el.dataFor
}


R.create = (name, opts) ->
  opts.displayName = name
  opts.viewName = -> name

  opts.propTypes ?= {}
  for own propName, propType of opts.propTypes
    if propType == Number
      propType = React.PropTypes.number
    else if propType == String
      propType = React.PropTypes.string
    else if propType == Function
      propType = React.PropTypes.func
    else
      propType = React.PropTypes.instanceOf(propType)

    opts.propTypes[propName] = propType.isRequired

  opts.mixins ?= []
  opts.mixins.unshift(R.UniversalMixin)

  R[name] = React.createClass(opts)


window.R = R


require("./TextFieldView")
require("./EditorView")
require("./LineView")
require("./WordListView")
require("./WordView")
require("./WordSpacerView")

# require("./views")
# require("./WordListView")