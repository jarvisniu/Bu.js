# line shape

import Object2D from '../base/Object2D.js'

import Point from '../shapes/Point.coffee'

class Line extends Object2D

  type: 'Line'
  fillable: no

  constructor: (p1, p2, p3, p4) ->
    super()

    if arguments.length < 2
      @points = [new Point(), new Point()]
    else if arguments.length < 4
      @points = [p1.clone(), p2.clone()]
    else  # len >= 4
      @points = [new Point(p1, p2), new Point(p3, p4)]

    @length = 0
    @midpoint = new Point()
    @keyPoints = @points

    @on "changed", =>
      @length = @points[0].distanceTo(@points[1])
      @midpoint.set((@points[0].x + @points[1].x) / 2, (@points[0].y + @points[1].y) / 2)

    @trigger "changed"

  clone: -> new Line @points[0], @points[1]

# edit

  set: (a1, a2, a3, a4) ->
    if p4?
      @points[0].set a1, a2
      @points[1].set a3, a4
    else
      @points[0] = a1
      @points[1] = a2
    @trigger "changed"
    @

  setPoint1: (a1, a2) ->
    if a2?
      @points[0].set a1, a2
    else
      @points[0].copy a1
    @trigger "changed"
    @

  setPoint2: (a1, a2) ->
    if a2?
      @points[1].set a1, a2
    else
      @points[1].copy a1
    @trigger "changed"
    @

export default Line
