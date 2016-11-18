# 2d vector

class Bu.Vector

	constructor: (@x = 0, @y = 0) ->

	clone: ->
		new Bu.Vector @x, @y

	add: (v) ->
		@x += v.x
		@y += v.y
		@

	set: (@x, @y) ->
		@

	offset: (dx, dy) ->
		@x += dx
		@y += dy
		@

	copy: (v) ->
		@x = v.x
		@y = v.y
		@

	multiplyScalar: (scalar) ->
		@x *= scalar
		@y *= scalar
		@

	project: (obj) ->
		# scale
		@x *= obj.scale.x
		@y *= obj.scale.y
		# rotation
		len = Bu.bevel(@x, @y)
		a = Math.atan2(@y, @x) + obj.rotation
		@x = len * Math.cos(a)
		@y = len * Math.sin(a)
		# translate
		@x += obj.position.x
		@y += obj.position.y
		@

	unProject: (obj) ->
		# translate
		@x -= obj.position.x
		@y -= obj.position.y
		# rotation
		len = Bu.bevel(@x, @y)
		a = Math.atan2(@y, @x) - obj.rotation
		@x = len * Math.cos(a)
		@y = len * Math.sin(a)
		# scale
		@x /= obj.scale.x
		@y /= obj.scale.y
		@
