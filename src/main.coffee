




require("./config")
require("./util/util")
require("./model/C")
require("./view/R")
require("./UI")




storageName = config.storageName

window.reset = ->
  delete window.localStorage[storageName]
  location.reload()

if json = window.localStorage[storageName]
  json = JSON.parse(json)
  window.appRoot = appRoot = C.reconstruct(json)
else
  window.appRoot = appRoot = new C.AppRoot()

saveState = ->
  json = C.deconstruct(appRoot)
  json = JSON.stringify(json)
  window.localStorage[storageName] = json


window.save = ->
  window.localStorage[storageName]

window.restore = (jsonString) ->
  window.localStorage[storageName] = jsonString
  location.reload()













willRefreshNextFrame = false
refresh = ->
  return if willRefreshNextFrame
  willRefreshNextFrame = true
  requestAnimationFrame ->
    refreshView()
    saveState()
    willRefreshNextFrame = false

refreshView = ->
  appRootEl = document.querySelector("#AppRoot")
  React.renderComponent(R.AppRootView({appRoot}), appRootEl)



refreshEventNames = [
  "mousedown"
  "mousemove"
  "mouseup"
  "keydown"
  "scroll"
  "change"
  "wheel"
  "mousewheel"
]

for eventName in refreshEventNames
  window.addEventListener(eventName, refresh)

refresh()





document.styleSheets.start_autoreload(1000)