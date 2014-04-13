mainLineWidth = 1.25


window.config = config = {

  storageName: "spaceshader4"

  resolution: 0.5

  mainLineWidth: 1.25

  # In pixels:
  minGridSpacing: 70
  hitTolerance: 15
  snapTolerance: 5

  gridColor: "204,194,163"

  style: {
    mainExpr: {
      strokeStyle: "#000"
      lineWidth: mainLineWidth
      lineCap: "round"
    }
    hoveredExpr: {
      strokeStyle: "#900"
      lineWidth: mainLineWidth
      lineCap: "round"
    }
    paramExpr: {
      strokeStyle: "#bbb"
      lineWidth: mainLineWidth
      lineCap: "round"
    }
  }

  cursor: {
    text: "text"
    grab: "-webkit-grab"
    grabbing: "-webkit-grabbing"
    verticalScrub: "ns-resize"
    horizontalScrub: "ew-resize"
  }

}