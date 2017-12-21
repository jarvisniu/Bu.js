import Bu from './Bu.coffee'

# math
import Bounds from './math/Bounds.coffee'
import Color from './math/Color.coffee'
import Size from './math/Size.coffee'
import Vector from './math/Vector.coffee'

Bu.Bounds = Bounds
Bu.Color = Color
Bu.Size = Size
Bu.Vector = Vector

# base
import Event from './base/Event.coffee'
import Object2D from './base/Object2D.coffee'
import Styled from './base/Styled.coffee'

Bu.Event = Event
Bu.Object2D = Object2D
Bu.Styled = Styled

# core
import App from './core/App.coffee'
import Audio from './core/Audio.coffee'
import Camera from './core/Camera.coffee'
import Renderer from './core/Renderer.coffee'
import Scene from './core/Scene.coffee'

Bu.App = App
Bu.Audio = Audio
Bu.Camera = Camera
Bu.Renderer = Renderer
Bu.Scene = Scene

# shapes
import Bow from './shapes/Bow.coffee'
import Circle from './shapes/Circle.coffee'
import Ellipse from './shapes/Ellipse.coffee'
import Fan from './shapes/Fan.coffee'
import Line from './shapes/Line.coffee'
import Point from './shapes/Point.coffee'
import Polygon from './shapes/Polygon.coffee'
import Polyline from './shapes/Polyline.coffee'
import Rectangle from './shapes/Rectangle.coffee'
import Spline from './shapes/Spline.coffee'
import Triangle from './shapes/Triangle.coffee'

Bu.Bow = Bow
Bu.Circle = Circle
Bu.Ellipse = Ellipse
Bu.Fan = Fan
Bu.Line = Line
Bu.Point = Point
Bu.Polygon = Polygon
Bu.Polyline = Polyline
Bu.Rectangle = Rectangle
Bu.Spline = Spline
Bu.Triangle = Triangle

# drawable
import Image from './drawable/Image.coffee'
import PointText from './drawable/PointText.coffee'

Bu.Image = Image
Bu.PointText = PointText

# animation
import Animation from './anim/Animation.coffee'
import AnimationRunner from './anim/AnimationRunner.coffee'
import AnimationTask from './anim/AnimationTask.coffee'
import DashFlowManager from './anim/DashFlowManager.coffee'
import SpriteSheet from './anim/SpriteSheet.coffee'

Bu.Animation = Animation
Bu.AnimationRunner = AnimationRunner
Bu.AnimationTask = AnimationTask
Bu.DashFlowManager = DashFlowManager
Bu.SpriteSheet = SpriteSheet

# input
import InputManager from './input/InputManager.coffee'
import MouseControl from './input/MouseControl.coffee'

Bu.InputManager = InputManager
Bu.MouseControl = MouseControl

# extra
import geometryAlgorithm from './extra/geometryAlgorithm.coffee'
import ShapeRandomizer from './extra/ShapeRandomizer.coffee'

Bu.geometryAlgorithm = geometryAlgorithm
Bu.ShapeRandomizer = ShapeRandomizer

export default Bu
