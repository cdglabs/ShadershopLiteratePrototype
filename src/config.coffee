mainLineWidth = 1.2

mainLineStyle = {
  lineWidth: mainLineWidth
}

extend = (style) ->
  _.defaults(style, mainLineStyle)



window.config = config = {

  storageName: "spaceshader4"

  resolution: 0.5

  mainLineWidth: 1.25

  # In pixels:
  minGridSpacing: 70
  hitTolerance: 10
  snapTolerance: 5

  gridColor: "204,194,163"

  style: {
    mainExpr: extend {
      strokeStyle: "#000"
    }
    hoveredExpr: extend {
      strokeStyle: "#900"
    }
    paramExpr: extend {
      strokeStyle: "#ccc"
    }
    spreadPositiveExpr: extend {
      strokeStyle: "#900"
    }
    spreadNegativeExpr: extend {
      strokeStyle: "#009"
    }
    variable: extend {
      strokeStyle: "rgba(77,158,51,0.5)"
      # strokeStyle: "rgba(0,153,0,0.5)"
      lineWidth: 1
    }
    hoveredVariable: extend {
      strokeStyle: "rgba(77,158,51,1)"
      # strokeStyle: "rgba(0,153,0,1)"
      lineWidth: 2
    }
  }

  spreadOpacityMax: 0.22
  spreadOpacityMin: 0.015


  cursor: {
    text: "text"
    grab: "-webkit-grab"
    grabbing: "-webkit-grabbing"
    verticalScrub: "ns-resize"
    horizontalScrub: "ew-resize"
  }

}
