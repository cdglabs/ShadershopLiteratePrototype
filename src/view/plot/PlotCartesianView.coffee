evaluate = require("../../compile/evaluate")
evaluateDiscontinuity = require("../../compile/evaluateDiscontinuity")


R.create "PlotCartesianView",
  propTypes:
    fnString: String
    style: Object

  getBounds: ->
    customFn = @lookup("customFn")
    return customFn.bounds

  drawFn: (canvas) ->
    ctx = canvas.getContext("2d")

    fn = evaluate(@fnString)

    # isDiscontinuous = /floor\(|ceil\(|fract\(/.test(compiled)
    # if isDiscontinuous
    #   testDiscontinuityHelper = evaluateDiscontinuity(compiled)
    #   testDiscontinuity = (range) -> testDiscontinuityHelper(range) == "found"
    # else
    #   testDiscontinuity = null

    testDiscontinuity = null

    util.canvas.clear(ctx)

    {xMin, xMax, yMin, yMax} = @getBounds()
    util.canvas.drawCartesian ctx,
      xMin: xMin
      xMax: xMax
      yMin: yMin
      yMax: yMax
      fn: fn
      testDiscontinuity: testDiscontinuity

    util.canvas.setStyle(ctx, @style)
    ctx.stroke()


  shouldComponentUpdate: (nextProps) ->
    return nextProps.fnString != @fnString or !_.isEqual(nextProps.style, @style)

  componentDidUpdate: ->
    @refs.canvas.draw()

  render: ->
    R.CanvasView {drawFn: @drawFn, ref: "canvas"}