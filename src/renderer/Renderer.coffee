# canvas renderer

class Geom2D.Renderer

	POINT_SIZE = 4

	constructor: (options) ->
		Za.EventListenerPattern.apply @

		# default options
		@width = 800
		@height = 600
		@fps = 60
		@isDrawVertexes = true

		if options?
			@width = options.width if options.width?
			@height = options.height if options.height?
			@fps = options.fps if options.fps?

		@type = "Renderer"
		_self = @

		# variables
		@dom = document.createElement("canvas")
		@context = @dom.getContext("2d")
		@context.textBaseline = 'top'

		tickCount = 0

		# API
		@shapes = []

		@dom.width = @width
		@dom.height = @height
		@dom.style.width = @width + "px"
		@dom.style.height = @height + "px"
		@dom.style.border = "solid 1px gray"
		@dom.style.cursor = "crosshair"
		@dom.style.background = "#eee"
		@dom.oncontextmenu = => false

		tick = =>
			tickCount += 1
			_self.triggerEvent "update", {"tickCount": tickCount}
			clearCanvas()
			@drawShapes()

		setInterval(tick, 1000 / @fps)
		clearCanvas = =>
			@context.clearRect(0, 0, _self.width, _self.height)


	append: (shape) ->
		@shapes.push shape


	drawShapes: =>
		for shape in @shapes
			switch shape.type
				when "Point" then @drawPoint(shape)
				when "Line" then @drawLine(shape)
				when "Circle" then @drawCircle(shape)
				when "Triangle" then @drawTriangle(shape)
				when "Rectangle" then @drawRectangle(shape)
				when "Fan" then @drawFan(shape)
				when "Bow" then @drawBow(shape)
				when "Polygon" then @drawPolygon(shape)
				when "Polyline" then @drawPolyline(shape)
				when "PointText" then @drawPointText(shape)
				else
					console.log("drawShapes(): unknown shape: ", shape)


	drawPoint: (shape) ->
		if shape.fillStyle?
			@context.fillStyle = shape.fillStyle
			@context.fillRect(
					shape.x - POINT_SIZE / 2
					shape.y - POINT_SIZE / 2
					POINT_SIZE
					POINT_SIZE
			)

		if shape.strokeStyle?
			@context.strokeStyle = shape.strokeStyle
			@context.strokeRect(
					shape.x - POINT_SIZE / 2
					shape.y - POINT_SIZE / 2
					POINT_SIZE
					POINT_SIZE
			)

		if shape.label?
			# console.log("drawPoint(): " + shape.label + ", x: " + shape.x + ", y: " + shape.y)
			style = @context.fillStyle
			@context.fillStyle = "black"
			@context.fillText(
					shape.label
					shape.x - POINT_SIZE / 2 + 9
					shape.y - POINT_SIZE / 2 + 6
			)
			@context.fillStyle = style


	drawVertexes: (points) ->
		if @isDrawVertexes
			for point in points
				@drawPoint point


	drawLine: (shape) ->
		if shape.strokeStyle?
			@context.strokeStyle = shape.strokeStyle
			@context.lineWidth = shape.lineWidth
			if shape.dashStyle
				@context.dashedLine(
						shape.points[0].x, shape.points[0].y,
						shape.points[1].x, shape.points[1].y,
						shape.dashStyle, shape.dashDelta
				)
			else
				@context.beginPath()
				@context.lineTo(shape.points[0].x, shape.points[0].y)
				@context.lineTo(shape.points[1].x, shape.points[1].y)
				@context.closePath()

			@context.stroke()
		@drawVertexes(shape.points)


	drawCircle: (shape) ->
		@context.beginPath()
		@context.arc(shape.cx, shape.cy, shape.radius, 0, Math.PI * 2)
		@context.closePath()
		# TODO add dashed arc support

		if shape.fillStyle?
			@context.fillStyle = shape.fillStyle
			@context.fill()

		if shape.strokeStyle?
			@context.strokeStyle = shape.strokeStyle
			@context.lineWidth = shape.lineWidth
			@context.stroke()
		@drawPoint(shape.centralPoint)


	drawTriangle: (shape) ->
		@context.beginPath()
		@context.lineTo(shape.points[0].x, shape.points[0].y)
		@context.lineTo(shape.points[1].x, shape.points[1].y)
		@context.lineTo(shape.points[2].x, shape.points[2].y)
		@context.closePath()

		if shape.fillStyle?
			@context.fillStyle = shape.fillStyle
			@context.fill()

		if shape.strokeStyle?
			@context.strokeStyle = shape.strokeStyle
			@context.lineWidth = shape.lineWidth
			if shape.dashStyle
				@context.beginPath()  # clear prev lineTo
				pts = shape.points
				@context.dashedLine(pts[0].x, pts[0].y, pts[1].x, pts[1].y, shape.dashStyle, shape.dashDelta)
				@context.dashedLine(pts[1].x, pts[1].y, pts[2].x, pts[2].y, shape.dashStyle, shape.dashDelta)
				@context.dashedLine(pts[2].x, pts[2].y, pts[0].x, pts[0].y, shape.dashStyle, shape.dashDelta)
			@context.stroke()
		@drawVertexes(shape.points)


	drawRectangle: (shape) ->
		if shape.fillStyle?
			@context.fillStyle = shape.fillStyle
			@context.fillRect(
					shape.position.x
					shape.position.y
					shape.size.width
					shape.size.height
			)

		if shape.strokeStyle?
			@context.strokeStyle = shape.strokeStyle
			@context.lineWidth = shape.lineWidth
			if not shape.dashStyle
				@context.strokeRect(
						shape.position.x
						shape.position.y
						shape.size.width
						shape.size.height)
			else
				@context.beginPath()
				xL = shape.position.x
				xR = shape.pointRB.x
				yT = shape.position.y
				yB = shape.pointRB.y
				@context.dashedLine(xL, yT, xR, yT, shape.dashStyle, shape.dashDelta)
				@context.dashedLine(xR, yT, xR, yB, shape.dashStyle, shape.dashDelta)
				@context.dashedLine(xR, yB, xL, yB, shape.dashStyle, shape.dashDelta)
				@context.dashedLine(xL, yB, xL, yT, shape.dashStyle, shape.dashDelta)
				@context.stroke()
		@drawVertexes(shape.points)


	drawFan: (shape) ->
		@context.beginPath()
		@context.arc(shape.cx, shape.cy, shape.radius, shape.aFrom, shape.aTo)
		@context.lineTo(shape.cx, shape.cy)
		@context.closePath()
		# TODO dashed arc

		if shape.fillStyle?
			@context.fillStyle = shape.fillStyle
			@context.fill()

		if shape.strokeStyle?
			@context.strokeStyle = shape.strokeStyle
			@context.lineWidth = shape.lineWidth
			@context.stroke()

		@drawVertexes(shape.string.points)


	drawBow: (shape) ->
		@context.beginPath()
		@context.arc(shape.cx, shape.cy, shape.radius, shape.aFrom, shape.aTo)
		@context.closePath()
		# TODO dashed arc

		if shape.fillStyle?
			@context.fillStyle = shape.fillStyle
			@context.fill()

		if shape.strokeStyle?
			@context.strokeStyle = shape.strokeStyle
			@context.lineWidth = shape.lineWidth
			@context.stroke()

		@drawVertexes(shape.string.points)


	drawPolygon: (shape) ->
		@context.beginPath()
		for point in shape.points
			@context.lineTo(point.x, point.y)
		@context.closePath()

		if shape.fillStyle?
			@context.fillStyle = shape.fillStyle
			@context.fill()

		if shape.strokeStyle?
			@context.strokeStyle = shape.strokeStyle
			@context.lineWidth = shape.lineWidth
			len = shape.points.length
			if shape.dashStyle && len > 0
				@context.beginPath()
				pts = shape.points
				for i in [0 ... len - 1]
					@context.dashedLine(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y, shape.dashStyle, shape.dashDelta)
				@context.dashedLine(pts[len - 1].x, pts[len - 1].y, pts[0].x, pts[0].y, shape.dashStyle, shape.dashDelta)
				@context.stroke()
			@context.stroke()
		@drawVertexes(shape.points)


	drawPolyline: (shape) ->
		if shape.strokeStyle?
			@context.strokeStyle = shape.strokeStyle
			@context.lineWidth = shape.lineWidth
			@context.beginPath()
			if not shape.dashStyle
				for point in shape.points
					@context.lineTo(point.x, point.y)
			else
				pts = shape.points
				for i in [ 0 ... pts.length - 1]
					@context.dashedLine(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y, shape.dashStyle, shape.dashDelta)
			@context.stroke()
		@drawVertexes(shape.points)


	drawPointText: (shape) ->
		@context.textAlign = shape.textAlign
		@context.textBaseline = shape.textBaseline
		@context.font = shape.font
		if shape.strokeStyle?
			@context.strokeStyle = shape.strokeStyle
			@context.lineWidth = shape.lineWidth
			@context.strokeText(shape.text, shape.x, shape.y)
		if shape.fillStyle?
			@context.fillStyle = shape.fillStyle
			@context.fillText(shape.text, shape.x, shape.y)


# Add draw dashed line feature to the canvas rendering context
# See: http://stackoverflow.com/questions/4576724/dotted-stroke-in-canvas
(=>
	CP = window.CanvasRenderingContext2D and CanvasRenderingContext2D.prototype
	if CP.lineTo?
		CP.dashedLine = (x, y, x2, y2, da, delta) ->
			da = Geom2D.Colorful.DEFAULT_DASH_STYLE if not da?
			delta = 0 if not delta?
			@save()
			dx = x2 - x
			dy = y2 - y
			len = Math.bevel(dx, dy)
			rot = Math.atan2(dy, dx)
			@translate(x, y)
			@moveTo(0, 0)
			@rotate(rot)
			dc = da.length
			di = 0
			draw = true

			lenU = 0
			for i in da
				lenU += i
			delta %= lenU
			x = delta

			# TODO need a small fix
			while len > x
				di += 1
				x += da[di % dc]
				x = len if x > len
				if draw
					@lineTo(x, 0)
				else
					@moveTo(x, 0)
				draw = not draw
			@restore()
			return @)()
