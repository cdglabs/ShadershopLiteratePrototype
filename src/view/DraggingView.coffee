R.create "DraggingView",
  render: ->
    R.div {},
      if UI.dragging?.render
        R.div {
          className: "draggingObject"
          style: {
            left: UI.mousePosition.x - UI.dragging.offset.x
            top:  UI.mousePosition.y - UI.dragging.offset.y
          }
        },
          UI.dragging.render()
      if UI.dragging
        R.div {className: "draggingOverlay"}