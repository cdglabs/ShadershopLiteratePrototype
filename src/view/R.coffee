module.exports = R = {}

for own key, value of React.DOM
  R[key] = value

R.cx = React.addons.classSet

R.create = (name, opts) ->
  opts.displayName = name
  R[name] = React.createClass(opts)

window.R = R

require("./views")
require("./WordListView")