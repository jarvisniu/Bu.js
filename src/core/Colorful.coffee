# Add color to the shapes

Geom2D.Colorful = () ->
	@strokeStyle = Geom2D.Colorful.DEFAULT_STROKE_STYLE
	@fillStyle = Geom2D.Colorful.DEFAULT_FILL_STYLE
	@dashStyle = false

	@stroke = (v) ->
		v = true if not v?
		switch v
			when true then @strokeStyle = Geom2D.Colorful.DEFAULT_STROKE_STYLE
			when false then @strokeStyle = null
			else
				@strokeStyle = v

	@fill = (v) ->
		v = true if not v?
		switch v
			when false then @fillStyle = null
			when true then @fillStyle = Geom2D.Colorful.DEFAULT_FILL_STYLE
			else
				@fillStyle = v

	@dash = (v) ->
		v = true if not v?
		v = [v, v] if typeof v is "number"
		switch v
			when false then @dashStyle = null
			when true then @dashStyle = Geom2D.Colorful.DEFAULT_DASH_STYLE
			else
				@dashStyle = v

Geom2D.Colorful.DEFAULT_STROKE_STYLE = "#048"
Geom2D.Colorful.DEFAULT_FILL_STYLE = "rgba(64, 128, 192, 0.5)"
Geom2D.Colorful.DEFAULT_FILL_STYLE_HOVER = "rgba(255, 192, 0, 0.5)"
Geom2D.Colorful.DEFAULT_DASH_STYLE = [8, 4]
