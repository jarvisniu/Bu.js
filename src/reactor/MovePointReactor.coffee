# move a point by dragging it

class Geom2D.MovePointReactor

	constructor: (@renderer) ->
		@enabled = false

		buttonDown = false
		mousePos = new Geom2D.Point()
		mousePosDown = new Geom2D.Point()
		mousePosDownDelta = new Geom2D.Point()

		hoveredPoint = null

		# create new circles every time
		@onMouseDown = (e) ->
			mousePosDown.set e.offsetX, e.offsetY

			if hoveredPoint?
				mousePosDownDelta.set(
					mousePosDown.x - hoveredPoint.x
					mousePosDown.y - hoveredPoint.y
				)
			buttonDown = true

		# change radius
		@onMouseMove = (e) ->
			mousePos.set e.offsetX, e.offsetY
			if buttonDown
				hoveredPoint.set(
					mousePos.x - mousePosDownDelta.x
					mousePos.y - mousePosDownDelta.y
				)
			else
				if hoveredPoint?
				    if not hoveredPoint.isNear(mousePos)
					    hoveredPoint.stroke false
					    hoveredPoint = null
				else
					for shape in renderer.shapes
		                if shape.type is "Point" and shape.isNear mousePos
			                hoveredPoint = shape
			                hoveredPoint.stroke()
			                break

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