R.StartTranscludeMixin = {
  startTransclude: (e, word, render) ->
    UI.dragging = {
      cursor: config.cursor.grabbing
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
      }
}