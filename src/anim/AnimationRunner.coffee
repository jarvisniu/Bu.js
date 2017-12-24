# Run the animation tasks

import utils from '../utils.js'

class AnimationRunner

  constructor: () ->
    @runningAnimations = []

  add: (task) ->
    task.init()
    if task.animation.isLegal()
      task.startTime = utils.now()
      @runningAnimations.push task
    else
      console.error 'AnimationRunner: animation setting is illegal: ', task.animation

  update: ->
    now = utils.now()
    for task in @runningAnimations
      continue if task.finished

      anim = task.animation
      t = (now - task.startTime) / (anim.duration * 1000)
      if t >= 1
        finish = true
        if anim.repeat
          t = 0
          task.startTime = utils.now()
        else
# TODO remove the finished tasks out
          t = 1
          task.finished = yes

      if anim.easing == true
        t = easingFunctions[DEFAULT_EASING_FUNCTION] t
      else if easingFunctions[anim.easing]?
        t = easingFunctions[anim.easing] t

      task.t = t
      task.interpolate()

      anim.update.call task.target, task
      if finish then anim.finish?.call task.target, task

# Hook up on an renderer, remove own setInternal
  hookUp: (renderer) ->
    renderer.on 'update', => @update()

  #----------------------------------------------------------------------
  # Private variables
  #----------------------------------------------------------------------

  DEFAULT_EASING_FUNCTION = 'quad'
  easingFunctions =
    quadIn: (t) -> t * t
    quadOut: (t) -> t * (2 - t)
    quad: (t) ->
      if t < 0.5
        2 * t * t
      else
        -2 * t * t + 4 * t - 1

    cubicIn: (t) -> t ** 3
    cubicOut: (t) -> (t - 1) ** 3 + 1
    cubic: (t) ->
      if t < 0.5
        4 * t ** 3
      else
        4 * (t - 1) ** 3 + 1

    sineIn: (t) -> Math.sin((t - 1) * utils.HALF_PI) + 1
    sineOut: (t) -> Math.sin t * utils.HALF_PI
    sine: (t) ->
      if t < 0.5
        (Math.sin((t * 2 - 1) * utils.HALF_PI) + 1) / 2
      else
        Math.sin((t - 0.5) * Math.PI) / 2 + 0.5

# TODO add quart, quint, expo, circ, back, elastic, bounce

export default AnimationRunner
