# Circle shape

class Geom2D.Circle

	constructor: (@cx, @cy, @radius) ->
		Geom2D.Colorful.apply @
		@type = "Circle"
		@centralPoint = new Geom2D.Point(@cx, @cy)

	# edit
	setCenter: (p) ->
		@centralPoint.copy p
		@cx = p.x
		@cy = p.y
		return @

	# point related
	containsPoint: (p) ->
		dx = p.x - @cx
		dy = p.y - @cy
		return Math.bevel(dx, dy) < @radius
