R.StartTranscludeMixin = {
  startTransclude: (e, word, render) ->
    UI.setActiveWord(word)

    UI.dragging = {
      cursor: config.cursor.grabbing
      onUp: =>
        UI.setActiveWord(null)
    }

    util.onceDragConsummated e, =>

      UI.dragging = {
        cursor: config.cursor.grabbing
        offset: {x: -10, y: -10}
        render: render
        onMove: (e) =>
          dropView = UI.getViewUnderMouse()
          dropView = dropView?.lookupViewWithKey("handleTransclusionDrop")

          UI.activeTransclusionDropView = dropView
        onUp: (e) =>
          if UI.activeTransclusionDropView
            UI.activeTransclusionDropView.handleTransclusionDrop(word)
          UI.activeTransclusionDropView = null
          UI.setActiveWord(null)
      }
}