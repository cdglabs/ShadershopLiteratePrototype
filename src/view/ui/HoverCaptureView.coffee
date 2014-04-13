R.create "HoverCaptureView",
  propTypes:
    hoverData: Object

  handleMouseDown: ->
    UI.hoverIsActive = true

  handleMouseEnter: ->
    UI.hoverData = @hoverData

  handleMouseLeave: ->
    return if UI.hoverIsActive
    UI.hoverData = null

  render: ->
    R.span {
      onMouseDown: @handleMouseDown
      onMouseEnter: @handleMouseEnter
      onMouseLeave: @handleMouseLeave
    },
      @props.children
