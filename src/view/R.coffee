module.exports = R = {}

for own key, value of React.DOM
  R[key] = value

R.cx = React.addons.classSet

R.DataForMixin = {
  componentDidMount: ->
    el = @getDOMNode()
    el.dataFor ?= []
    el.dataFor.unshift(this)

  componentWillUnmount: ->
    el = @getDOMNode()
    delete el.dataFor

}

R.create = (name, opts) ->
  opts.displayName = name
  opts.name = -> name
  opts.mixins ?= []
  opts.mixins.unshift(R.DataForMixin)
  R[name] = React.createClass(opts)

window.R = R

require("./views")
require("./WordListView")