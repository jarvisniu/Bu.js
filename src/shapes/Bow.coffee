# Bow shape
class Geom2D.Bow extends Geom2D.Object2D

	constructor: (@cx, @cy, @radius, @aFrom, @aTo) ->
		super()
		[@aFrom, @aTo] = [@aTo, @aFrom] if @aFrom > @aTo

		@type = "Bow"

		@center = new Geom2D.Point(@cx, @cy)
		@string = new Geom2D.Line(
				@center.arcTo(@radius, @aFrom)
				@center.arcTo(@radius, @aTo)
		)

	containsPoint: (point) ->
		if Math.bevel(@cx - point.x, @cy - point.y) < @radius
			sameSide = @string.isTwoPointsSameSide(@center, point)
			smallThanHalfCircle = @aTo - @aFrom < Math.PI
			return sameSide ^ smallThanHalfCircle
		else
			return false
