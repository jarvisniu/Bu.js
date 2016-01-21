# Draw circle by dragging out a radius

class Geom2D.DrawCircleReactor

	constructor: (@renderer) ->
		@enabled = false
		self = @

		mousePosDown = new Geom2D.Point()
		mousePos = new Geom2D.Point()
		buttonDown = false

		circle = null
		line = null

		# create new circles every time
		@onMouseDown = (e) ->
			mousePosDown.set e.offsetX, e.offsetY

			circle = new Geom2D.Circle mousePosDown.x, mousePosDown.y, 1
			self.renderer.append circle

			line = new Geom2D.Line mousePosDown, mousePosDown
			line.stroke "#f44"
			self.renderer.append line

			buttonDown = true

		# change radius
		@onMouseMove = (e) ->
			if buttonDown
				mousePos.set e.offsetX, e.offsetY
				circle.radius = mousePos.distanceTo mousePosDown
				line.setPoint1 mousePos

		@onMouseUp = =>
			buttonDown = false

	enable: =>
		@addListeners()
		@enabled = true

	disable: =>
		@removeListeners()
		@enabled = false

	addListeners: =>
		@renderer.dom.addEventListener "mousedown", @onMouseDown
		@renderer.dom.addEventListener "mousemove", @onMouseMove
		@renderer.dom.addEventListener "mouseup", @onMouseUp

	removeListeners: =>
		@renderer.dom.removeEventListener "mousedown", @onMouseDown
		@renderer.dom.removeEventListener "mousemove", @onMouseMove
		@renderer.dom.removeEventListener "mouseup", @onMouseUp
