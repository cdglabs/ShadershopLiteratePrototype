




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
  window.editor = editor = C.reconstruct(json)
else
  window.editor = editor = new C.Editor()

saveState = ->
  json = C.deconstruct(editor)
  json = JSON.stringify(json)
  window.localStorage[storageName] = json















willRefreshNextFrame = false
refresh = ->
  return if willRefreshNextFrame
  willRefreshNextFrame = true
  requestAnimationFrame ->
    refreshView()
    saveState()
    willRefreshNextFrame = false

refreshView = ->
  editorEl = document.querySelector("#editor")
  React.renderComponent(R.EditorView({editor}), editorEl)




for eventName in ["mousedown", "mousemove", "mouseup", "keydown", "scroll", "change"]
  window.addEventListener(eventName, refresh)

refresh()





document.styleSheets.start_autoreload(1000)