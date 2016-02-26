(function() {
  var base, base1, currentTime, global, lastBootTime, previousGlobal,
    hasProp = {}.hasOwnProperty;

  previousGlobal = global;

  global = window || this;

  global.Bu = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Bu.Renderer, arguments, function(){});
  };

  Bu.global = global;

  global = previousGlobal;


  /*
   * constants
   */

  Bu.VERSION = '0.3.3';

  Bu.DEFAULT_STROKE_STYLE = '#048';

  Bu.DEFAULT_FILL_STYLE = 'rgba(64, 128, 192, 0.5)';

  Bu.DEFAULT_DASH_STYLE = [8, 4];

  Bu.DEFAULT_SPLINE_SMOOTH = 0.25;

  Bu.DEFAULT_STROKE_STYLE_HOVER = 'rgba(255, 128, 0, 0.75)';

  Bu.DEFAULT_FILL_STYLE_HOVER = 'rgba(255, 128, 128, 0.5)';

  Bu.DEFAULT_TEXT_FILL_STYLE = 'black';

  Bu.DEFAULT_IMAGE_SIZE = 20;

  Bu.POINT_RENDER_SIZE = 2.25;

  Bu.POINT_LABEL_OFFSET = 5;

  Bu.DEFAULT_BOUND_STROKE_STYLE = '#444';

  Bu.DEFAULT_BOUND_DASH_STYLE = [6, 6];

  Bu.DEFAULT_NEAR_DIST = 5;

  Bu.MOUSE_BUTTON_NONE = -1;

  Bu.MOUSE_BUTTON_LEFT = 0;

  Bu.MOUSE_BUTTON_MIDDLE = 1;

  Bu.MOUSE_BUTTON_RIGHT = 2;


  /*
   * utility functions
   */

  Bu.average = function() {
    var i, j, len, ns, sum;
    ns = arguments;
    if (typeof arguments[0] === 'object') {
      ns = arguments[0];
    }
    sum = 0;
    for (j = 0, len = ns.length; j < len; j++) {
      i = ns[j];
      sum += i;
    }
    return sum / ns.length;
  };

  Bu.bevel = function(x, y) {
    return Math.sqrt(x * x + y * y);
  };

  Bu.rand = function(from, to) {
    if (to == null) {
      to = from;
      from = 0;
    }
    return Math.random() * (to - from) + from;
  };

  Bu.r2d = function(r) {
    return (r * 180 / Math.PI).toFixed(1);
  };

  Bu.d2r = function(r) {
    return r * Math.PI / 180;
  };

  Bu.now = Bu.global.performance != null ? function() {
    return Bu.global.performance.now();
  } : function() {
    return Date.now();
  };

  Bu.combineOptions = function(args, defaultOptions) {
    var givenOptions, i;
    if (defaultOptions == null) {
      defaultOptions = {};
    }
    givenOptions = args[args.length - 1];
    if (typeof givenOptions === 'object') {
      for (i in givenOptions) {
        defaultOptions[i] = givenOptions[i];
      }
    }
    return defaultOptions;
  };

  Bu.clone = function(target, deep) {
    var clone, i, results, results1;
    if (deep == null) {
      deep = false;
    }
    if (target instanceof Array) {
      clone = [];
      results = [];
      for (i in target) {
        if (!hasProp.call(target, i)) continue;
        results.push(clone[i] = target[i]);
      }
      return results;
    } else if (target instanceof Object) {
      clone = {};
      results1 = [];
      for (i in target) {
        if (!hasProp.call(target, i)) continue;
        results1.push(clone[i] = target[i]);
      }
      return results1;
    }
  };

  Bu.data = function(key, value) {
    if (value != null) {
      return localStorage['Bu.' + key] = JSON.stringify(value);
    } else {
      value = localStorage['Bu.' + key];
      if (value != null) {
        return JSON.parse(value);
      } else {
        return null;
      }
    }
  };


  /*
   * polyfill
   */

  Function.prototype.property = function(prop, desc) {
    return Object.defineProperty(this.prototype, prop, desc);
  };

  Function.prototype.throttle = function(limit) {
    var currTime, lastTime;
    if (limit == null) {
      limit = 0.5;
    }
    currTime = 0;
    lastTime = 0;
    return (function(_this) {
      return function() {
        currTime = Date.now();
        if (currTime - lastTime > limit * 1000) {
          _this.apply(null, arguments);
          return lastTime = currTime;
        }
      };
    })(this);
  };

  Function.prototype.debounce = function(delay) {
    var args, later, timeout;
    if (delay == null) {
      delay = 0.5;
    }
    args = null;
    timeout = null;
    later = (function(_this) {
      return function() {
        return _this.apply(null, args);
      };
    })(this);
    return function() {
      args = arguments;
      clearTimeout(timeout);
      return timeout = setTimeout(later, delay * 1000);
    };
  };

  (base = Array.prototype).each || (base.each = function(fn) {
    var i;
    i = 0;
    while (i < this.length) {
      fn(this[i]);
      i++;
    }
    return this;
  });

  (base1 = Array.prototype).map || (base1.map = function(fn) {
    var arr, i;
    arr = [];
    i = 0;
    while (i < this.length) {
      arr.push(fn(this[i]));
      i++;
    }
    return this;
  });

  lastBootTime = Bu.data('lastInfo');

  currentTime = Date.now();

  if (!((lastBootTime != null) && currentTime - lastBootTime < 60 * 1000)) {
    if (typeof console.info === "function") {
      console.info('Bu.js v' + Bu.VERSION + ' - [https://github.com/jarvisniu/Bu.js]');
    }
    Bu.data('lastInfo', currentTime);
  }

}).call(this);

(function() {
  Bu.Bounds = (function() {
    function Bounds(target) {
      var i, j, len, len1, ref, ref1, v;
      this.target = target;
      this.x1 = this.y1 = this.x2 = this.y2 = 0;
      this.isEmpty = true;
      this.point1 = new Bu.Vector;
      this.point2 = new Bu.Vector;
      this.strokeStyle = Bu.DEFAULT_BOUND_STROKE_STYLE;
      this.dashStyle = Bu.DEFAULT_BOUND_DASH_STYLE;
      this.dashOffset = 0;
      switch (this.target.type) {
        case 'Line':
        case 'Triangle':
        case 'Rectangle':
          ref = this.target.points;
          for (i = 0, len = ref.length; i < len; i++) {
            v = ref[i];
            this.expandByPoint(v);
          }
          break;
        case 'Circle':
        case 'Bow':
        case 'Fan':
          this.expandByCircle(this.target);
          this.target.on('centerChanged', (function(_this) {
            return function() {
              _this.clear();
              return _this.expandByCircle(_this.target);
            };
          })(this));
          this.target.on('radiusChanged', (function(_this) {
            return function() {
              _this.clear();
              return _this.expandByCircle(_this.target);
            };
          })(this));
          break;
        case 'Polyline':
        case 'Polygon':
          ref1 = this.target.vertices;
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            v = ref1[j];
            this.expandByPoint(v);
          }
          break;
        default:
          console.warn('Bounds: not support shape type "' + this.target.type + '"');
      }
    }

    Bounds.prototype.containsPoint = function(p) {
      return this.x1 < p.x && this.x2 > p.x && this.y1 < p.y && this.y2 > p.y;
    };

    Bounds.prototype.clear = function() {
      this.x1 = this.y1 = this.x2 = this.y2 = 0;
      return this.isEmpty = true;
    };

    Bounds.prototype.expandByPoint = function(v) {
      if (this.isEmpty) {
        this.isEmpty = false;
        this.x1 = this.x2 = v.x;
        return this.y1 = this.y2 = v.y;
      } else {
        if (v.x < this.x1) {
          this.x1 = v.x;
        }
        if (v.x > this.x2) {
          this.x2 = v.x;
        }
        if (v.y < this.y1) {
          this.y1 = v.y;
        }
        if (v.y > this.y2) {
          return this.y2 = v.y;
        }
      }
    };

    Bounds.prototype.expandByCircle = function(c) {
      var cp, r;
      cp = c.center;
      r = c.radius;
      if (this.isEmpty) {
        this.isEmpty = false;
        this.x1 = cp.x - r;
        this.x2 = cp.x + r;
        this.y1 = cp.y - r;
        return this.y2 = cp.y + r;
      } else {
        if (cp.x - r < this.x1) {
          this.x1 = cp.x - r;
        }
        if (cp.x + r > this.x2) {
          this.x2 = cp.x + r;
        }
        if (cp.y - r < this.y1) {
          this.y1 = cp.y - r;
        }
        if (cp.y + r > this.y2) {
          return this.y2 = cp.y + r;
        }
      }
    };

    return Bounds;

  })();

}).call(this);

(function() {
  Bu.Size = (function() {
    function Size(width1, height1) {
      this.width = width1;
      this.height = height1;
      this.type = 'Size';
    }

    Size.prototype.set = function(width, height) {
      this.width = width;
      return this.height = height;
    };

    return Size;

  })();

}).call(this);

(function() {
  Bu.Vector = (function() {
    function Vector(x, y) {
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
    }

    Vector.prototype.set = function(x, y) {
      this.x = x;
      this.y = y;
    };

    return Vector;

  })();

}).call(this);

(function() {
  Bu.Colorful = function() {
    this.strokeStyle = Bu.DEFAULT_STROKE_STYLE;
    this.fillStyle = Bu.DEFAULT_FILL_STYLE;
    this.dashStyle = false;
    this.lineWidth = 1;
    this.dashOffset = 0;
    this.stroke = function(v) {
      if (v == null) {
        v = true;
      }
      switch (v) {
        case true:
          this.strokeStyle = Bu.DEFAULT_STROKE_STYLE;
          break;
        case false:
          this.strokeStyle = null;
          break;
        default:
          this.strokeStyle = v;
      }
      return this;
    };
    this.fill = function(v) {
      if (v == null) {
        v = true;
      }
      switch (v) {
        case false:
          this.fillStyle = null;
          break;
        case true:
          this.fillStyle = Bu.DEFAULT_FILL_STYLE;
          break;
        default:
          this.fillStyle = v;
      }
      return this;
    };
    return this.dash = function(v) {
      if (v == null) {
        v = true;
      }
      if (typeof v === 'number') {
        v = [v, v];
      }
      switch (v) {
        case false:
          this.dashStyle = null;
          break;
        case true:
          this.dashStyle = Bu.DEFAULT_DASH_STYLE;
          break;
        default:
          this.dashStyle = v;
      }
      return this;
    };
  };

}).call(this);

(function() {
  Bu.Event = function() {
    var types;
    types = {};
    this.on = function(type, listener) {
      var listeners;
      listeners = types[type] || (types[type] = []);
      if (listeners.indexOf(listener === -1)) {
        return listeners.push(listener);
      }
    };
    this.once = function(type, listener) {
      listener.once = true;
      return this.on(type, listener);
    };
    this.off = function(type, listener) {
      var index, listeners;
      listeners = types[type];
      if (listener != null) {
        if (listeners != null) {
          index = listeners.indexOf(listener);
          if (index > -1) {
            return listeners.splice(index, 1);
          }
        }
      } else {
        if (listeners != null) {
          return listeners.length = 0;
        }
      }
    };
    return this.trigger = function(type, eventData) {
      var j, len, listener, listeners, results;
      listeners = types[type];
      if (listeners != null) {
        eventData || (eventData = {});
        eventData.target = this;
        results = [];
        for (j = 0, len = listeners.length; j < len; j++) {
          listener = listeners[j];
          listener.call(this, eventData);
          if (listener.once) {
            listeners.splice(i, 1);
            results.push(i -= 1);
          } else {
            results.push(void 0);
          }
        }
        return results;
      }
    };
  };

}).call(this);


/*
 * MicroJQuery - A micro version of jQuery
 *
 * Supported features:
 *   $. - static methods
 *     .ready(cb) - call the callback function after the page is loaded
 *     .ajax([url,] options) - perform an ajax request
 *   $(selector) - select element(s)
 *     .on(type, callback) - add an event listener
 *     .off(type, callback) - remove an event listener
 *     .append(tagName) - append a tag
 *     .text(text) - set the inner text
 *     .html(htmlText) - set the inner HTML
 *     .style(name, value) - set style (a css attribute)
 *     #.css(object) - set styles (multiple css attribute)
 *     .hasClass(className) - detect whether a class exists
 *     .addClass(className) - add a class
 *     .removeClass(className) - remove a class
 *     .toggleClass(className) - toggle a class
 *     .attr(name, value) - set an attribute
 *     .hasAttr(name) - detect whether an attribute exists
 *     .removeAttr(name) - remove an attribute
 *   Notes:
 *        # is planned but not implemented
 */

(function() {
  (function(global) {
    var jQuery;
    global.$ = function(selector) {
      var selections;
      selections = [];
      if (typeof selector === 'string') {
        selections = [].slice.call(document.querySelectorAll(selector));
      }
      jQuery.apply(selections);
      return selections;
    };
    jQuery = function() {
      var SVG_TAGS;
      this.on = (function(_this) {
        return function(type, callback) {
          _this.each(function(dom) {
            return dom.addEventListener(type, callback);
          });
          return _this;
        };
      })(this);
      this.off = (function(_this) {
        return function(type, callback) {
          _this.each(function(dom) {
            return dom.removeEventListener(type, callback);
          });
          return _this;
        };
      })(this);
      SVG_TAGS = 'svg line rect circle ellipse polyline polygon path text';
      this.append = (function(_this) {
        return function(tag) {
          _this.each(function(dom, i) {
            var newDom, tagIndex;
            tagIndex = SVG_TAGS.indexOf(tag.toLowerCase());
            if (tagIndex > -1) {
              newDom = document.createElementNS('http://www.w3.org/2000/svg', tag);
            } else {
              newDom = document.createElement(tag);
            }
            return _this[i] = dom.appendChild(newDom);
          });
          return _this;
        };
      })(this);
      this.text = (function(_this) {
        return function(str) {
          _this.each(function(dom) {
            return dom.textContent = str;
          });
          return _this;
        };
      })(this);
      this.html = (function(_this) {
        return function(str) {
          _this.each(function(dom) {
            return dom.innerHTML = str;
          });
          return _this;
        };
      })(this);
      this.style = (function(_this) {
        return function(name, value) {
          _this.each(function(dom) {
            var i, styleText, styles;
            styleText = dom.getAttribute('style');
            styles = {};
            if (styleText) {
              styleText.split(';').each(function(n) {
                var nv;
                nv = n.split(':');
                return styles[nv[0]] = nv[1];
              });
            }
            styles[name] = value;
            styleText = '';
            for (i in styles) {
              styleText += i + ': ' + styles[i] + '; ';
            }
            return dom.setAttribute('style', styleText);
          });
          return _this;
        };
      })(this);
      this.hasClass = (function(_this) {
        return function(name) {
          var classText, classes, i;
          if (_this.length === 0) {
            return false;
          }
          i = 0;
          while (i < _this.length) {
            classText = _this[i].getAttribute('class' || '');
            classes = classText.split(RegExp(' +'));
            if (!classes.contains(name)) {
              return false;
            }
            i++;
          }
          return _this;
        };
      })(this);
      this.addClass = (function(_this) {
        return function(name) {
          _this.each(function(dom) {
            var classText, classes;
            classText = dom.getAttribute('class' || '');
            classes = classText.split(RegExp(' +'));
            if (!classes.contains(name)) {
              classes.push(name);
              return dom.setAttribute('class', classes.join(' '));
            }
          });
          return _this;
        };
      })(this);
      this.removeClass = (function(_this) {
        return function(name) {
          _this.each(function(dom) {
            var classText, classes;
            classText = dom.getAttribute('class') || '';
            classes = classText.split(RegExp(' +'));
            if (classes.contains(name)) {
              classes.remove(name);
              if (classes.length > 0) {
                return dom.setAttribute('class', classes.join(' '));
              } else {
                return dom.removeAttribute('class');
              }
            }
          });
          return _this;
        };
      })(this);
      this.toggleClass = (function(_this) {
        return function(name) {
          _this.each(function(dom) {
            var classText, classes;
            classText = dom.getAttribute('class' || '');
            classes = classText.split(RegExp(' +'));
            if (classes.contains(name)) {
              classes.remove(name);
            } else {
              classes.push(name);
            }
            if (classes.length > 0) {
              return dom.setAttribute('class', classes.join(' '));
            } else {
              return dom.removeAttribute('class');
            }
          });
          return _this;
        };
      })(this);
      this.attr = (function(_this) {
        return function(name, value) {
          if (value != null) {
            _this.each(function(dom) {
              return dom.setAttribute(name, value);
            });
            return _this;
          } else {
            return _this[0].getAttribute(name);
          }
        };
      })(this);
      this.hasAttr = (function(_this) {
        return function(name) {
          var i;
          if (_this.length === 0) {
            return false;
          }
          i = 0;
          while (i < _this.length) {
            if (!_this[i].hasAttribute(name)) {
              return false;
            }
            i++;
          }
          return _this;
        };
      })(this);
      this.removeAttr = (function(_this) {
        return function(name) {
          _this.each(function(dom) {
            return dom.removeAttribute(name);
          });
          return _this;
        };
      })(this);
      return this.val = (function(_this) {
        return function() {
          var ref;
          return (ref = _this[0]) != null ? ref.value : void 0;
        };
      })(this);
    };
    global.$.ready = function(onLoad) {
      return document.addEventListener('DOMContentLoaded', onLoad);
    };

    /* $.ajax()
    		options:
    			url: string
    			====
    			async = true: bool
    			## data: object - query parameters TODO: implement this
    			method = GET: POST, PUT, DELETE, HEAD
    			username: string
    			password: string
    			success: function
    			error: function
    			complete: function
     */
    return global.$.ajax = function(url, ops) {
      var xhr;
      if (!ops) {
        if (typeof url === 'object') {
          ops = url;
          url = ops.url;
        } else {
          ops = {};
        }
      }
      ops.method || (ops.method = 'GET');
      if (ops.async == null) {
        ops.async = true;
      }
      xhr = new XMLHttpRequest;
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            if (ops.success != null) {
              return ops.success(xhr.responseText, xhr.status, xhr);
            }
          } else {
            if (ops.error != null) {
              ops.error(xhr, xhr.status);
            }
            if (ops.complete != null) {
              return ops.complete(xhr, xhr.status);
            }
          }
        }
      };
      xhr.open(ops.method, url, ops.async, ops.username, ops.password);
      return xhr.send(null);
    };
  })(Bu.global);

}).call(this);

(function() {
  var hasProp = {}.hasOwnProperty;

  Bu.Object2D = (function() {
    function Object2D() {
      Bu.Colorful.apply(this);
      Bu.Event.apply(this);
      this.visible = true;
      this.opacity = 1;
      this.translate = new Bu.Vector;
      this.rotation = 0;
      this._scale = new Bu.Vector(1, 1);
      this.skew = new Bu.Vector;
      this.bounds = null;
      this.keyPoints = null;
      this.children = [];
      this.parent = null;
    }

    Object2D.property('scale', {
      get: function() {
        return this._scale;
      },
      set: function(val) {
        if (typeof val === 'number') {
          return this._scale.x = this._scale.y = val;
        } else {
          return this.scale = val;
        }
      }
    });

    Object2D.prototype.animate = function(anim, args) {
      var i, results;
      if (typeof anim === 'string') {
        if (anim in Bu.animations) {
          return Bu.animations[anim].apply(this, args);
        } else {
          return console.warn("Bu.animations[\"" + anim + "\"] doesn't exists.");
        }
      } else if (anim instanceof Array) {
        if (!(args instanceof Array)) {
          args = [args];
        }
        results = [];
        for (i in anim) {
          if (!hasProp.call(anim, i)) continue;
          results.push(this.animate(anim[i], args));
        }
        return results;
      } else {
        return anim.apply(this, args);
      }
    };

    Object2D.prototype.containsPoint = function(p) {
      if ((this.bounds != null) && !this.bounds.containsPoint(p)) {
        return false;
      } else if (this._containsPoint) {
        return this._containsPoint(p);
      } else {
        return false;
      }
    };

    return Object2D;

  })();

}).call(this);

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Bu.Renderer = (function() {
    function Renderer() {
      this.drawShape = bind(this.drawShape, this);
      this.drawShapes = bind(this.drawShapes, this);
      var onResize, options, ref, tick;
      Bu.Event.apply(this);
      this.type = 'Renderer';
      options = Bu.combineOptions(arguments, {
        width: 800,
        height: 600,
        fps: 60,
        fillParent: false,
        showKeyPoints: false,
        border: false
      });
      this.width = options.width;
      this.height = options.height;
      this.fps = options.fps;
      this.container = options.container;
      this.fillParent = options.fillParent;
      this.isShowKeyPoints = options.showKeyPoints;
      this.tickCount = 0;
      this.isRunning = false;
      this.pixelRatio = Bu.global.devicePixelRatio || 1;
      this.dom = document.createElement('canvas');
      this.context = this.dom.getContext('2d');
      this.context.textBaseline = 'top';
      if (typeof ClipMeter !== "undefined" && ClipMeter !== null) {
        this.clipMeter = new ClipMeter();
      }
      this.shapes = [];
      if (!this.fillParent) {
        this.dom.style.width = this.width + 'px';
        this.dom.style.height = this.height + 'px';
        this.dom.width = this.width * this.pixelRatio;
        this.dom.height = this.height * this.pixelRatio;
      }
      if ((options.border != null) && options.border) {
        this.dom.style.border = 'solid 1px gray';
      }
      this.dom.style.cursor = 'crosshair';
      this.dom.style.boxSizing = 'content-box';
      this.dom.style.background = '#eee';
      this.dom.oncontextmenu = function() {
        return false;
      };
      if ((ref = Bu.animationRunner) != null) {
        ref.hookUp(this);
      }
      onResize = (function(_this) {
        return function() {
          var canvasRatio, containerRatio, height, width;
          canvasRatio = _this.dom.height / _this.dom.width;
          containerRatio = _this.container.clientHeight / _this.container.clientWidth;
          if (containerRatio < canvasRatio) {
            height = _this.container.clientHeight;
            width = height / containerRatio;
          } else {
            width = _this.container.clientWidth;
            height = width * containerRatio;
          }
          _this.width = _this.dom.width = width * _this.pixelRatio;
          _this.height = _this.dom.height = height * _this.pixelRatio;
          _this.dom.style.width = width + 'px';
          _this.dom.style.height = height + 'px';
          return _this.render();
        };
      })(this);
      if (this.fillParent) {
        Bu.global.window.addEventListener('resize', onResize);
        this.dom.addEventListener('DOMNodeInserted', onResize);
      }
      tick = (function(_this) {
        return function() {
          if (_this.isRunning) {
            if (_this.clipMeter != null) {
              _this.clipMeter.start();
            }
            _this.render();
            _this.trigger('update', {
              'tickCount': _this.tickCount
            });
            _this.tickCount += 1;
            if (_this.clipMeter != null) {
              _this.clipMeter.tick();
            }
          }
          return requestAnimationFrame(tick);
        };
      })(this);
      tick();
      if (this.container != null) {
        if (typeof this.container === 'string') {
          this.container = document.querySelector(this.container);
        }
        setTimeout((function(_this) {
          return function() {
            return _this.container.appendChild(_this.dom);
          };
        })(this), 100);
      }
      this.isRunning = true;
    }

    Renderer.prototype.pause = function() {
      return this.isRunning = false;
    };

    Renderer.prototype["continue"] = function() {
      return this.isRunning = true;
    };

    Renderer.prototype.toggle = function() {
      return this.isRunning = !this.isRunning;
    };

    Renderer.prototype.append = function(shape) {
      var j, len1, s;
      if (shape instanceof Array) {
        for (j = 0, len1 = shape.length; j < len1; j++) {
          s = shape[j];
          this.shapes.push(s);
        }
      } else {
        this.shapes.push(shape);
      }
      return this;
    };

    Renderer.prototype.render = function() {
      this.context.save();
      this.context.scale(this.pixelRatio, this.pixelRatio);
      this.clearCanvas();
      this.drawShapes(this.shapes);
      this.context.restore();
      return this;
    };

    Renderer.prototype.clearCanvas = function() {
      this.context.clearRect(0, 0, this.width, this.height);
      return this;
    };

    Renderer.prototype.drawShapes = function(shapes) {
      var j, len1, shape;
      if (shapes != null) {
        for (j = 0, len1 = shapes.length; j < len1; j++) {
          shape = shapes[j];
          this.context.save();
          this.drawShape(shape);
          this.context.restore();
        }
      }
      return this;
    };

    Renderer.prototype.drawShape = function(shape) {
      var base, sx, sy;
      if (!shape.visible) {
        return this;
      }
      this.context.translate(shape.translate.x, shape.translate.y);
      this.context.rotate(shape.rotation);
      sx = shape.scale.x;
      sy = shape.scale.y;
      if (sx / sy > 100 || sx / sy < 0.01) {
        if (Math.abs(sx) < 0.02) {
          sx = 0;
        }
        if (Math.abs(sy) < 0.02) {
          sy = 0;
        }
      }
      this.context.scale(sx, sy);
      this.context.globalAlpha *= shape.opacity;
      if (shape.strokeStyle != null) {
        this.context.strokeStyle = shape.strokeStyle;
        this.context.lineWidth = shape.lineWidth;
        if (shape.lineCap != null) {
          this.context.lineCap = shape.lineCap;
        }
        if (shape.lineJoin != null) {
          this.context.lineJoin = shape.lineJoin;
        }
      }
      this.context.beginPath();
      switch (shape.type) {
        case 'Point':
          this.drawPoint(shape);
          break;
        case 'Line':
          this.drawLine(shape);
          break;
        case 'Circle':
          this.drawCircle(shape);
          break;
        case 'Triangle':
          this.drawTriangle(shape);
          break;
        case 'Rectangle':
          this.drawRectangle(shape);
          break;
        case 'Fan':
          this.drawFan(shape);
          break;
        case 'Bow':
          this.drawBow(shape);
          break;
        case 'Polygon':
          this.drawPolygon(shape);
          break;
        case 'Polyline':
          this.drawPolyline(shape);
          break;
        case 'Spline':
          this.drawSpline(shape);
          break;
        case 'PointText':
          this.drawPointText(shape);
          break;
        case 'Image':
          this.drawImage(shape);
          break;
        case 'Bounds':
          this.drawBounds(shape);
          break;
        default:
          console.log('drawShapes(): unknown shape: ', shape);
      }
      if (shape.fillStyle != null) {
        this.context.fillStyle = shape.fillStyle;
        this.context.fill();
      }
      if (shape.dashStyle) {
        this.context.lineDashOffset = shape.dashOffset;
        if (typeof (base = this.context).setLineDash === "function") {
          base.setLineDash(shape.dashStyle);
        }
        this.context.stroke();
        this.context.setLineDash([]);
      } else if (shape.strokeStyle != null) {
        this.context.stroke();
      }
      if (shape.children != null) {
        this.drawShapes(shape.children);
      }
      if (this.isShowKeyPoints) {
        this.drawShapes(shape.keyPoints);
      }
      return this;
    };

    Renderer.prototype.drawPoint = function(shape) {
      this.context.arc(shape.x, shape.y, Bu.POINT_RENDER_SIZE, 0, Math.PI * 2);
      return this;
    };

    Renderer.prototype.drawLine = function(shape) {
      this.context.moveTo(shape.points[0].x, shape.points[0].y);
      this.context.lineTo(shape.points[1].x, shape.points[1].y);
      return this;
    };

    Renderer.prototype.drawCircle = function(shape) {
      this.context.arc(shape.cx, shape.cy, shape.radius, 0, Math.PI * 2);
      return this;
    };

    Renderer.prototype.drawTriangle = function(shape) {
      this.context.lineTo(shape.points[0].x, shape.points[0].y);
      this.context.lineTo(shape.points[1].x, shape.points[1].y);
      this.context.lineTo(shape.points[2].x, shape.points[2].y);
      this.context.closePath();
      return this;
    };

    Renderer.prototype.drawRectangle = function(shape) {
      if (shape.cornerRadius !== 0) {
        return this.drawRoundRectangle(shape);
      }
      this.context.rect(shape.position.x, shape.position.y, shape.size.width, shape.size.height);
      return this;
    };

    Renderer.prototype.drawRoundRectangle = function(shape) {
      var base, r, x1, x2, y1, y2;
      x1 = shape.position.x;
      x2 = shape.pointRB.x;
      y1 = shape.position.y;
      y2 = shape.pointRB.y;
      r = shape.cornerRadius;
      this.context.moveTo(x1, y1 + r);
      this.context.arcTo(x1, y1, x1 + r, y1, r);
      this.context.lineTo(x2 - r, y1);
      this.context.arcTo(x2, y1, x2, y1 + r, r);
      this.context.lineTo(x2, y2 - r);
      this.context.arcTo(x2, y2, x2 - r, y2, r);
      this.context.lineTo(x1 + r, y2);
      this.context.arcTo(x1, y2, x1, y2 - r, r);
      this.context.closePath();
      if ((shape.strokeStyle != null) && shape.dashStyle) {
        if (typeof (base = this.context).setLineDash === "function") {
          base.setLineDash(shape.dashStyle);
        }
      }
      return this;
    };

    Renderer.prototype.drawFan = function(shape) {
      this.context.arc(shape.cx, shape.cy, shape.radius, shape.aFrom, shape.aTo);
      this.context.lineTo(shape.cx, shape.cy);
      this.context.closePath();
      return this;
    };

    Renderer.prototype.drawBow = function(shape) {
      this.context.arc(shape.cx, shape.cy, shape.radius, shape.aFrom, shape.aTo);
      this.context.closePath();
      return this;
    };

    Renderer.prototype.drawPolygon = function(shape) {
      var j, len1, point, ref;
      ref = shape.vertices;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        point = ref[j];
        this.context.lineTo(point.x, point.y);
      }
      this.context.closePath();
      return this;
    };

    Renderer.prototype.drawPolyline = function(shape) {
      var j, len1, point, ref;
      ref = shape.vertices;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        point = ref[j];
        this.context.lineTo(point.x, point.y);
      }
      return this;
    };

    Renderer.prototype.drawSpline = function(shape) {
      var i, j, len, ref;
      if (shape.strokeStyle != null) {
        len = shape.vertices.length;
        if (len === 2) {
          this.context.moveTo(shape.vertices[0].x, shape.vertices[0].y);
          this.context.lineTo(shape.vertices[1].x, shape.vertices[1].y);
        } else if (len > 2) {
          this.context.moveTo(shape.vertices[0].x, shape.vertices[0].y);
          for (i = j = 1, ref = len - 1; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
            this.context.bezierCurveTo(shape.controlPointsBehind[i - 1].x, shape.controlPointsBehind[i - 1].y, shape.controlPointsAhead[i].x, shape.controlPointsAhead[i].y, shape.vertices[i].x, shape.vertices[i].y);
          }
        }
      }
      return this;
    };

    Renderer.prototype.drawPointText = function(shape) {
      this.context.textAlign = shape.textAlign;
      this.context.textBaseline = shape.textBaseline;
      this.context.font = shape.font;
      if (shape.strokeStyle != null) {
        this.context.strokeText(shape.text, shape.x, shape.y);
      }
      if (shape.fillStyle != null) {
        this.context.fillStyle = shape.fillStyle;
        this.context.fillText(shape.text, shape.x, shape.y);
      }
      return this;
    };

    Renderer.prototype.drawImage = function(shape) {
      var dx, dy, h, w;
      if (shape.loaded) {
        w = shape.size.width;
        h = shape.size.height;
        dx = -w * shape.pivot.x;
        dy = -h * shape.pivot.y;
        this.context.drawImage(shape.image, dx, dy, w, h);
      }
      return this;
    };

    Renderer.prototype.drawBounds = function(bounds) {
      this.context.rect(bounds.x1, bounds.y1, bounds.x2 - bounds.x1, bounds.y2 - bounds.y1);
      return this;
    };

    return Renderer;

  })();

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Bow = (function(superClass) {
    extend(Bow, superClass);

    function Bow(cx, cy, radius, aFrom, aTo) {
      var ref;
      this.cx = cx;
      this.cy = cy;
      this.radius = radius;
      this.aFrom = aFrom;
      this.aTo = aTo;
      Bow.__super__.constructor.call(this);
      this.type = 'Bow';
      if (this.aFrom > this.aTo) {
        ref = [this.aTo, this.aFrom], this.aFrom = ref[0], this.aTo = ref[1];
      }
      this.center = new Bu.Point(this.cx, this.cy);
      this.string = new Bu.Line(this.center.arcTo(this.radius, this.aFrom), this.center.arcTo(this.radius, this.aTo));
      this.keyPoints = this.string.points;
    }

    Bow.prototype.clone = function() {
      return new Bu.Bow(this.cx, this.cy, this.radius, this.aFrom, this.aTo);
    };

    Bow.prototype._containsPoint = function(point) {
      var sameSide, smallThanHalfCircle;
      if (Bu.bevel(this.cx - point.x, this.cy - point.y) < this.radius) {
        sameSide = this.string.isTwoPointsSameSide(this.center, point);
        smallThanHalfCircle = this.aTo - this.aFrom < Math.PI;
        return sameSide ^ smallThanHalfCircle;
      } else {
        return false;
      }
    };

    return Bow;

  })(Bu.Object2D);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Circle = (function(superClass) {
    extend(Circle, superClass);

    function Circle(cx, cy, _radius) {
      if (cx == null) {
        cx = 0;
      }
      if (cy == null) {
        cy = 0;
      }
      this._radius = _radius != null ? _radius : 1;
      Circle.__super__.constructor.call(this);
      this.type = 'Circle';
      this._center = new Bu.Point(cx, cy);
      this.bounds = null;
      this.keyPoints = [this._center];
    }

    Circle.prototype.clone = function() {
      return new Bu.Circle(this.cx, this.cy, this.radius);
    };

    Circle.property('cx', {
      get: function() {
        return this._center.x;
      },
      set: function(val) {
        this._center.x = val;
        return this.trigger('centerChanged', this);
      }
    });

    Circle.property('cy', {
      get: function() {
        return this._center.y;
      },
      set: function(val) {
        this._center.y = val;
        return this.trigger('centerChanged', this);
      }
    });

    Circle.property('center', {
      get: function() {
        return this._center;
      },
      set: function(val) {
        this._center = val;
        this.cx = val.x;
        this.cy = val.y;
        this.keyPoints[0] = val;
        return this.trigger('centerChanged', this);
      }
    });

    Circle.property('radius', {
      get: function() {
        return this._radius;
      },
      set: function(val) {
        this._radius = val;
        this.trigger('radiusChanged', this);
        return this;
      }
    });

    Circle.prototype._containsPoint = function(p) {
      var dx, dy;
      dx = p.x - this.cx;
      dy = p.y - this.cy;
      return Bu.bevel(dx, dy) < this.radius;
    };

    return Circle;

  })(Bu.Object2D);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Fan = (function(superClass) {
    extend(Fan, superClass);

    function Fan(cx, cy, radius, aFrom, aTo) {
      this.cx = cx;
      this.cy = cy;
      this.radius = radius;
      this.aFrom = aFrom;
      this.aTo = aTo;
      Fan.__super__.constructor.call(this);
      this.type = 'Fan';
      this.center = new Bu.Point(this.cx, this.cy);
      this.string = new Bu.Line(this.center.arcTo(this.radius, this.aFrom), this.center.arcTo(this.radius, this.aTo));
      this.keyPoints = [this.string.points[0], this.string.points[1], new Bu.Point(this.cx, this.cy)];
    }

    Fan.prototype.clone = function() {
      return new Bu.Fan(this.cx, this.cy, this.radius, this.aFrom, this.aTo);
    };

    Fan.prototype._containsPoint = function(p) {
      var a, dx, dy;
      dx = p.x - this.cx;
      dy = p.y - this.cy;
      a = Math.atan2(p.y - this.cy, p.x - this.cx);
      while (a < this.aFrom) {
        a += Math.PI * 2;
      }
      return Bu.bevel(dx, dy) < this.radius && a > this.aFrom && a < this.aTo;
    };

    return Fan;

  })(Bu.Object2D);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Line = (function(superClass) {
    extend(Line, superClass);

    function Line(p1, p2, p3, p4) {
      Line.__super__.constructor.call(this);
      this.type = 'Line';
      if (arguments.length < 2) {
        this.points = [new Bu.Point(), new Bu.Point()];
      } else if (arguments.length < 4) {
        this.points = [p1.clone(), p2.clone()];
      } else {
        this.points = [new Bu.Point(p1, p2), new Bu.Point(p3, p4)];
      }
      this.length;
      this.midpoint = new Bu.Point();
      this.keyPoints = this.points;
      this.on("pointChange", (function(_this) {
        return function(e) {
          _this.length = _this.points[0].distanceTo(_this.points[1]);
          return _this.midpoint.set((_this.points[0].x + _this.points[1].x) / 2, (_this.points[0].y + _this.points[1].y) / 2);
        };
      })(this));
      this.trigger("pointChange", this);
    }

    Line.prototype.clone = function() {
      return new Bu.Line(this.points[0], this.points[1]);
    };

    Line.prototype.set = function(a1, a2, a3, a4) {
      if (typeof p4 !== "undefined" && p4 !== null) {
        this.points[0].set(a1, a2);
        this.points[1].set(a3, a4);
      } else {
        this.points[0] = a1;
        this.points[1] = a2;
      }
      this.trigger("pointChange", this);
      return this;
    };

    Line.prototype.setPoint1 = function(a1, a2) {
      if (a2 != null) {
        this.points[0].set(a1, a2);
      } else {
        this.points[0].copy(a1);
      }
      this.trigger("pointChange", this);
      return this;
    };

    Line.prototype.setPoint2 = function(a1, a2) {
      if (a2 != null) {
        this.points[1].set(a1, a2);
      } else {
        this.points[1].copy(a1);
      }
      this.trigger("pointChange", this);
      return this;
    };

    Line.prototype.isTwoPointsSameSide = function(p1, p2) {
      var pA, pB, y01, y02;
      pA = this.points[0];
      pB = this.points[1];
      if (pA.x === pB.x) {
        return (p1.x - pA.x) * (p2.x - pA.x) > 0;
      } else {
        y01 = (pA.y - pB.y) * (p1.x - pA.x) / (pA.x - pB.x) + pA.y;
        y02 = (pA.y - pB.y) * (p2.x - pA.x) / (pA.x - pB.x) + pA.y;
        return (p1.y - y01) * (p2.y - y02) > 0;
      }
    };

    Line.prototype.distanceTo = function(point) {
      var a, b, p1, p2;
      p1 = this.points[0];
      p2 = this.points[1];
      a = (p1.y - p2.y) / (p1.x - p2.x);
      b = p1.y - a * p1.x;
      return Math.abs(a * point.x + b - point.y) / Math.sqrt(a * a + 1);
    };

    Line.prototype.distanceTo2 = function(point) {
      var a, b, czX, czY, p1, p2;
      p1 = this.points[0];
      p2 = this.points[1];
      a = (p1.y - p2.y) / (p1.x - p2.x);
      b = p1.y - (p1.y - p2.y) * p1.x / (p1.x - p2.x);
      czX = (point.y + point.x / a - b) / (a + 1 / a);
      czY = a * czX + b;
      return Bu.bevel(czX - point.x, czY - point.y);
    };

    Line.prototype.footPointFrom = function(point, footPoint) {
      var A, B, m, p1, p2, x, y;
      p1 = this.points[0];
      p2 = this.points[1];
      A = (p1.y - p2.y) / (p1.x - p2.x);
      B = p1.y - A * p1.x;
      m = point.x + A * point.y;
      x = (m - A * B) / (A * A + 1);
      y = A * x + B;
      if (footPoint != null) {
        return footPoint.set(x, y);
      } else {
        return new Bu.Point(x, y);
      }
    };

    Line.prototype.getCrossPointWith = function(line) {
      var a1, a2, b1, b2, c1, c2, det, p1, p2, q1, q2;
      p1 = this.points[0];
      p2 = this.points[1];
      q1 = line.points[0];
      q2 = line.points[1];
      a1 = p2.y - p1.y;
      b1 = p1.x - p2.x;
      c1 = (a1 * p1.x) + (b1 * p1.y);
      a2 = q2.y - q1.y;
      b2 = q1.x - q2.x;
      c2 = (a2 * q1.x) + (b2 * q1.y);
      det = (a1 * b2) - (a2 * b1);
      return new Bu.Point(((b2 * c1) - (b1 * c2)) / det, ((a1 * c2) - (a2 * c1)) / det);
    };

    Line.prototype.isCrossWithLine = function(line) {
      var d, x0, x1, x2, x3, x4, y0, y1, y2, y3, y4;
      x1 = this.points[0].x;
      y1 = this.points[0].y;
      x2 = this.points[1].x;
      y2 = this.points[1].y;
      x3 = line.points[0].x;
      y3 = line.points[0].y;
      x4 = line.points[1].x;
      y4 = line.points[1].y;
      d = (y2 - y1) * (x4 - x3) - (y4 - y3) * (x2 - x1);
      if (d === 0) {
        return false;
      } else {
        x0 = ((x2 - x1) * (x4 - x3) * (y3 - y1) + (y2 - y1) * (x4 - x3) * x1 - (y4 - y3) * (x2 - x1) * x3) / d;
        y0 = ((y2 - y1) * (y4 - y3) * (x3 - x1) + (x2 - x1) * (y4 - y3) * y1 - (x4 - x3) * (y2 - y1) * y3) / -d;
      }
      return (x0 - x1) * (x0 - x2) < 0 && (x0 - x3) * (x0 - x4) < 0 && (y0 - y1) * (y0 - y2) < 0 && (y0 - y3) * (y0 - y4) < 0;
    };

    Line.prototype.isCrossWithLine2 = function(line) {
      var da, db, dx, dy, p1, p2, q1, q2, s, t;
      p1 = this.points[0];
      p2 = this.points[1];
      q1 = line.points[0];
      q2 = line.points[1];
      dx = p2.x - p1.x;
      dy = p2.y - p1.y;
      da = q2.x - q1.x;
      db = q2.y - q1.y;
      if (da * dy - db * dx === 0) {
        return false;
      }
      s = (dx * (q1.y - p1.y) + dy * (p1.x - q1.x)) / (da * dy - db * dx);
      t = (da * (p1.y - q1.y) + db * (q1.x - p1.x)) / (db * dx - da * dy);
      return s >= 0 && s <= 1 && t >= 0 && t <= 1;
    };

    return Line;

  })(Bu.Object2D);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Point = (function(superClass) {
    var footPoint;

    extend(Point, superClass);

    function Point(x1, y1) {
      this.x = x1 != null ? x1 : 0;
      this.y = y1 != null ? y1 : 0;
      Point.__super__.constructor.call(this);
      this.type = 'Point';
      this.lineWidth = 0.5;
      this._labelIndex = -1;
    }

    Point.prototype.clone = function() {
      return new Bu.Point(this.x, this.y);
    };

    Point.property('label', {
      get: function() {
        if (this._labelIndex > -1) {
          return this.children[this._labelIndex].text;
        } else {
          return '';
        }
      },
      set: function(val) {
        var pointText;
        if (this._labelIndex === -1) {
          pointText = new Bu.PointText(val, this.x + Bu.POINT_LABEL_OFFSET, this.y, {
            align: '+0'
          });
          this.children.push(pointText);
          return this._labelIndex = this.children.length - 1;
        } else {
          return this.children[this._labelIndex].text = val;
        }
      }
    });

    Point.prototype.arcTo = function(radius, arc) {
      return new Bu.Point(this.x + Math.cos(arc) * radius, this.y + Math.sin(arc) * radius);
    };

    Point.prototype.copy = function(point) {
      this.x = point.x;
      this.y = point.y;
      return this.updateLabel();
    };

    Point.prototype.set = function(x, y) {
      this.x = x;
      this.y = y;
      return this.updateLabel();
    };

    Point.prototype.updateLabel = function() {
      if (this._labelIndex > -1) {
        this.children[this._labelIndex].x = this.x + Bu.POINT_LABEL_OFFSET;
        return this.children[this._labelIndex].y = this.y;
      }
    };

    Point.prototype.distanceTo = function(point) {
      return Bu.bevel(this.x - point.x, this.y - point.y);
    };

    footPoint = null;

    Point.prototype.isNear = function(target, limit) {
      var i, isBetween1, isBetween2, len, line, ref, verticalDist;
      if (limit == null) {
        limit = Bu.DEFAULT_NEAR_DIST;
      }
      switch (target.type) {
        case 'Point':
          return this.distanceTo(target) < limit;
        case 'Line':
          verticalDist = target.distanceTo(this);
          if (footPoint == null) {
            footPoint = new Bu.Point;
          }
          target.footPointFrom(this, footPoint);
          isBetween1 = footPoint.distanceTo(target.points[0]) < target.length + Bu.DEFAULT_NEAR_DIST;
          isBetween2 = footPoint.distanceTo(target.points[1]) < target.length + Bu.DEFAULT_NEAR_DIST;
          return verticalDist < limit && isBetween1 && isBetween2;
        case 'Polyline':
          ref = target.lines;
          for (i = 0, len = ref.length; i < len; i++) {
            line = ref[i];
            if (this.isNear(line)) {
              return true;
            }
          }
          return false;
      }
    };

    return Point;

  })(Bu.Object2D);

  Bu.Point.interpolate = function(p1, p2, k, p3) {
    var x, y;
    x = p1.x + (p2.x - p1.x) * k;
    y = p1.y + (p2.y - p1.y) * k;
    if (p3 != null) {
      return p3.set(x, y);
    } else {
      return new Bu.Point(x, y);
    }
  };

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Polygon = (function(superClass) {
    extend(Polygon, superClass);


    /*
       constructors
       1. Polygon(points)
       2. Polygon(x, y, radius, n, options): to generate regular polygon
       	options: angle - start angle of regular polygon
     */

    function Polygon(points) {
      var i, k, l, n, options, radius, ref, ref1, x, y;
      Polygon.__super__.constructor.call(this);
      this.type = 'Polygon';
      this.vertices = [];
      this.lines = [];
      this.triangles = [];
      options = Bu.combineOptions(arguments, {
        angle: 0
      });
      if (points instanceof Array) {
        if (points != null) {
          this.vertices = points;
        }
      } else {
        if (arguments.length < 4) {
          x = 0;
          y = 0;
          radius = arguments[0];
          n = arguments[1];
        } else {
          x = arguments[0];
          y = arguments[1];
          radius = arguments[2];
          n = arguments[3];
        }
        this.vertices = Bu.Polygon.generateRegularPoints(x, y, radius, n, options);
      }
      if (this.vertices.length > 1) {
        for (i = k = 0, ref = this.vertices.length - 1; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
          this.lines.push(new Bu.Line(this.vertices[i], this.vertices[i + 1]));
        }
        this.lines.push(new Bu.Line(this.vertices[this.vertices.length - 1], this.vertices[0]));
      }
      if (this.vertices.length > 2) {
        for (i = l = 1, ref1 = this.vertices.length - 1; 1 <= ref1 ? l < ref1 : l > ref1; i = 1 <= ref1 ? ++l : --l) {
          this.triangles.push(new Bu.Triangle(this.vertices[0], this.vertices[i], this.vertices[i + 1]));
        }
      }
      this.keyPoints = this.vertices;
    }

    Polygon.prototype.clone = function() {
      return new Bu.Polygon(this.vertices);
    };

    Polygon.prototype.isSimple = function() {
      var i, j, k, l, len, ref, ref1, ref2;
      len = this.lines.length;
      for (i = k = 0, ref = len; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
        for (j = l = ref1 = i + 1, ref2 = len; ref1 <= ref2 ? l < ref2 : l > ref2; j = ref1 <= ref2 ? ++l : --l) {
          if (this.lines[i].isCrossWithLine(this.lines[j])) {
            return false;
          }
        }
      }
      return true;
    };

    Polygon.prototype.addPoint = function(point, insertIndex) {
      if (insertIndex == null) {
        this.vertices.push(point);
        if (this.vertices.length > 1) {
          this.lines[this.lines.length - 1].points[1] = point;
        }
        if (this.vertices.length > 0) {
          this.lines.push(new Bu.Line(this.vertices[this.vertices.length - 1], this.vertices[0]));
        }
        if (this.vertices.length > 2) {
          return this.triangles.push(new Bu.Triangle(this.vertices[0], this.vertices[this.vertices.length - 2], this.vertices[this.vertices.length - 1]));
        }
      } else {
        return this.vertices.splice(insertIndex, 0, point);
      }
    };

    Polygon.prototype._containsPoint = function(p) {
      var k, len1, ref, triangle;
      ref = this.triangles;
      for (k = 0, len1 = ref.length; k < len1; k++) {
        triangle = ref[k];
        if (triangle.containsPoint(p)) {
          return true;
        }
      }
      return false;
    };

    Polygon.generateRegularPoints = function(cx, cy, radius, n, options) {
      var a, angleDelta, angleSection, i, k, points, r, ref, x, y;
      angleDelta = options.angle;
      r = radius;
      points = [];
      angleSection = Math.PI * 2 / n;
      for (i = k = 0, ref = n; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
        a = i * angleSection + angleDelta;
        x = cx + r * Math.cos(a);
        y = cy + r * Math.sin(a);
        points[i] = new Bu.Point(x, y);
      }
      return points;
    };

    return Polygon;

  })(Bu.Object2D);

}).call(this);

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Polyline = (function(superClass) {
    var set;

    extend(Polyline, superClass);

    function Polyline(vertices1) {
      var i, j, ref, vertices;
      this.vertices = vertices1 != null ? vertices1 : [];
      this.calcLength = bind(this.calcLength, this);
      this.updateLines = bind(this.updateLines, this);
      this.clone = bind(this.clone, this);
      Polyline.__super__.constructor.call(this);
      this.type = 'Polyline';
      if (arguments.length > 1) {
        vertices = [];
        for (i = j = 0, ref = arguments.length / 2; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          vertices.push(new Bu.Point(arguments[i * 2], arguments[i * 2 + 1]));
        }
        this.vertices = vertices;
      }
      this.lines = [];
      this.length = 0;
      this.pointNormalizedPos = [];
      this.keyPoints = this.vertices;
      this.fill(false);
      this.on("pointChange", (function(_this) {
        return function() {
          if (_this.vertices.length > 1) {
            _this.updateLines();
            _this.calcLength();
            return _this.calcPointNormalizedPos();
          }
        };
      })(this));
      this.trigger("pointChange", this);
    }

    Polyline.prototype.clone = function() {
      return new Bu.Polyline(this.vertices);
    };

    Polyline.prototype.updateLines = function() {
      var i, j, ref, results;
      results = [];
      for (i = j = 0, ref = this.vertices.length - 1; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        if (this.lines[i] != null) {
          results.push(this.lines[i].set(this.vertices[i], this.vertices[i + 1]));
        } else {
          results.push(this.lines[i] = new Bu.Line(this.vertices[i], this.vertices[i + 1]));
        }
      }
      return results;
    };

    Polyline.prototype.calcLength = function() {
      var i, j, len, ref;
      if (this.vertices.length < 2) {
        return this.length = 0;
      } else {
        len = 0;
        for (i = j = 1, ref = this.vertices.length; 1 <= ref ? j < ref : j > ref; i = 1 <= ref ? ++j : --j) {
          len += this.vertices[i].distanceTo(this.vertices[i - 1]);
        }
        return this.length = len;
      }
    };

    Polyline.prototype.calcPointNormalizedPos = function() {
      var currPos, i, j, ref, results;
      currPos = 0;
      this.pointNormalizedPos[0] = 0;
      results = [];
      for (i = j = 1, ref = this.vertices.length; 1 <= ref ? j < ref : j > ref; i = 1 <= ref ? ++j : --j) {
        currPos += this.vertices[i].distanceTo(this.vertices[i - 1]) / this.length;
        results.push(this.pointNormalizedPos[i] = currPos);
      }
      return results;
    };

    Polyline.prototype.getNormalizedPos = function(index) {
      if (index != null) {
        return this.pointNormalizedPos[index];
      } else {
        return this.pointNormalizedPos;
      }
    };

    Polyline.prototype.compress = function(strength) {
      var compressed, i, obliqueAngle, pA, pB, pM, ref, ref1;
      if (strength == null) {
        strength = 0.8;
      }
      compressed = [];
      ref = this.vertices;
      for (i in ref) {
        if (!hasProp.call(ref, i)) continue;
        if (i < 2) {
          compressed[i] = this.vertices[i];
        } else {
          ref1 = compressed.slice(-2), pA = ref1[0], pM = ref1[1];
          pB = this.vertices[i];
          obliqueAngle = Math.abs(Math.atan2(pA.y - pM.y, pA.x - pM.x) - Math.atan2(pM.y - pB.y, pM.x - pB.x));
          if (obliqueAngle < strength * strength * Math.PI / 2) {
            compressed[compressed.length - 1] = pB;
          } else {
            compressed.push(pB);
          }
        }
      }
      this.vertices = compressed;
      this.keyPoints = this.vertices;
      return this;
    };

    set = function(points) {
      var i, j, ref;
      for (i = j = 0, ref = this.vertices.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        this.vertices[i].copy(points[i]);
      }
      if (this.vertices.length > points.length) {
        this.vertices.splice(points.length);
      }
      return this.trigger("pointChange", this);
    };

    Polyline.prototype.addPoint = function(point, insertIndex) {
      if (insertIndex == null) {
        this.vertices.push(point);
        if (this.vertices.length > 1) {
          this.lines.push(new Bu.Line(this.vertices[this.vertices.length - 2], this.vertices[this.vertices.length - 1]));
        }
      } else {
        this.vertices.splice(insertIndex, 0, point);
      }
      return this.trigger("pointChange", this);
    };

    return Polyline;

  })(Bu.Object2D);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Rectangle = (function(superClass) {
    extend(Rectangle, superClass);

    function Rectangle(x, y, width, height, cornerRadius) {
      if (cornerRadius == null) {
        cornerRadius = 0;
      }
      Rectangle.__super__.constructor.call(this);
      this.type = 'Rectangle';
      this.position = new Bu.Point(x, y);
      this.center = new Bu.Point(x + width / 2, y + height / 2);
      this.size = new Bu.Size(width, height);
      this.pointRT = new Bu.Point(x + width, y);
      this.pointRB = new Bu.Point(x + width, y + height);
      this.pointLB = new Bu.Point(x, y + height);
      this.points = [this.position, this.pointRT, this.pointRB, this.pointLB];
      this.cornerRadius = cornerRadius;
    }

    Rectangle.property('cornerRadius', {
      get: function() {
        return this._cornerRadius;
      },
      set: function(val) {
        this._cornerRadius = val;
        return this.keyPoints = val > 0 ? [] : this.points;
      }
    });

    Rectangle.prototype.clone = function() {
      return new Bu.Rectangle(this.position.x, this.position.y, this.size.width, this.size.height);
    };

    Rectangle.prototype.containsPoint = function(point) {
      return point.x > this.position.x && point.y > this.position.y && point.x < this.position.x + this.size.width && point.y < this.position.y + this.size.height;
    };

    return Rectangle;

  })(Bu.Object2D);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Spline = (function(superClass) {
    var calcControlPoints;

    extend(Spline, superClass);

    function Spline(vertices) {
      var polyline;
      Spline.__super__.constructor.call(this);
      this.type = 'Spline';
      if (vertices instanceof Bu.Polyline) {
        polyline = vertices;
        this.vertices = polyline.vertices;
        polyline.on('pointChange', (function(_this) {
          return function(polyline) {
            _this.vertices = polyline.vertices;
            return calcControlPoints(_this);
          };
        })(this));
      } else {
        this.vertices = Bu.clone(vertices);
      }
      this.keyPoints = this.vertices;
      this.controlPointsAhead = [];
      this.controlPointsBehind = [];
      this.fill(false);
      this.smoothFactor = Bu.DEFAULT_SPLINE_SMOOTH;
      this._smoother = false;
      calcControlPoints(this);
    }

    Spline.property('smoother', {
      get: function() {
        return this._smoother;
      },
      set: function(val) {
        var oldVal;
        oldVal = this._smoother;
        this._smoother = val;
        if (oldVal !== this._smoother) {
          return calcControlPoints(this);
        }
      }
    });

    Spline.prototype.clone = function() {
      return new Bu.Spline(this.vertices);
    };

    Spline.prototype.addPoint = function(point) {
      this.vertices.push(point);
      return calcControlPoints(this);
    };

    calcControlPoints = function(spline) {
      var i, j, len, len1, len2, p, ref, results, theta, theta1, theta2, xA, xB, yA, yB;
      spline.keyPoints = spline.vertices;
      p = spline.vertices;
      len = p.length;
      if (len >= 1) {
        spline.controlPointsBehind[0] = p[0];
      }
      if (len >= 2) {
        spline.controlPointsAhead[len - 1] = p[len - 1];
      }
      if (len >= 3) {
        results = [];
        for (i = j = 1, ref = len - 1; 1 <= ref ? j < ref : j > ref; i = 1 <= ref ? ++j : --j) {
          theta1 = Math.atan2(p[i].y - p[i - 1].y, p[i].x - p[i - 1].x);
          theta2 = Math.atan2(p[i + 1].y - p[i].y, p[i + 1].x - p[i].x);
          len1 = Bu.bevel(p[i].y - p[i - 1].y, p[i].x - p[i - 1].x);
          len2 = Bu.bevel(p[i].y - p[i + 1].y, p[i].x - p[i + 1].x);
          theta = theta1 + (theta2 - theta1) * (spline._smoother ? len1 / (len1 + len2) : 0.5);
          if (Math.abs(theta - theta1) > Math.PI / 2) {
            theta += Math.PI;
          }
          xA = p[i].x - len1 * spline.smoothFactor * Math.cos(theta);
          yA = p[i].y - len1 * spline.smoothFactor * Math.sin(theta);
          xB = p[i].x + len2 * spline.smoothFactor * Math.cos(theta);
          yB = p[i].y + len2 * spline.smoothFactor * Math.sin(theta);
          spline.controlPointsAhead[i] = new Bu.Point(xA, yA);
          results.push(spline.controlPointsBehind[i] = new Bu.Point(xB, yB));
        }
        return results;
      }
    };

    return Spline;

  })(Bu.Object2D);

}).call(this);

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Triangle = (function(superClass) {
    extend(Triangle, superClass);

    function Triangle(p1, p2, p3) {
      this.clone = bind(this.clone, this);
      var x1, x2, x3, y1, y2, y3;
      Triangle.__super__.constructor.call(this);
      this.type = 'Triangle';
      if (arguments.length === 6) {
        x1 = arguments[0], y1 = arguments[1], x2 = arguments[2], y2 = arguments[3], x3 = arguments[4], y3 = arguments[5];
        p1 = new Bu.Point(x1, y1);
        p2 = new Bu.Point(x2, y2);
        p3 = new Bu.Point(x3, y3);
      }
      this.lines = [new Bu.Line(p1, p2), new Bu.Line(p2, p3), new Bu.Line(p3, p1)];
      this.points = [p1, p2, p3];
      this.keyPoints = this.points;
    }

    Triangle.prototype.clone = function() {
      return new Bu.Triangle(this.points[0], this.points[1], this.points[2]);
    };

    Triangle.prototype.area = function() {
      var a, b, c, ref;
      ref = this.points, a = ref[0], b = ref[1], c = ref[2];
      return Math.abs(((b.x - a.x) * (c.y - a.y)) - ((c.x - a.x) * (b.y - a.y))) / 2;
    };

    Triangle.prototype._containsPoint = function(p) {
      return this.lines[0].isTwoPointsSameSide(p, this.points[2]) && this.lines[1].isTwoPointsSameSide(p, this.points[0]) && this.lines[2].isTwoPointsSameSide(p, this.points[1]);
    };

    return Triangle;

  })(Bu.Object2D);

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.Image = (function(superClass) {
    extend(Image, superClass);

    function Image(url, x, y, width, height) {
      this.url = url;
      if (x == null) {
        x = 0;
      }
      if (y == null) {
        y = 0;
      }
      Image.__super__.constructor.call(this);
      this.type = 'Image';
      this.autoSize = true;
      this.size = new Bu.Size(Bu.DEFAULT_IMAGE_SIZE, Bu.DEFAULT_IMAGE_SIZE);
      this.translate = new Bu.Vector(x, y);
      this.center = new Bu.Vector(x + width / 2, y + height / 2);
      if (width != null) {
        this.size.set(width, height);
        this.autoSize = false;
      }
      this.pivot = new Bu.Vector(0.5, 0.5);
      this.image = new Bu.global.Image;
      this.loaded = false;
      this.image.onload = (function(_this) {
        return function(e) {
          if (_this.autoSize) {
            _this.size.set(_this.image.width, _this.image.height);
          }
          return _this.loaded = true;
        };
      })(this);
      this.image.src = this.url;
    }

    return Image;

  })(Bu.Object2D);

}).call(this);

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Bu.PointText = (function(superClass) {
    extend(PointText, superClass);


    /*
    	options.align:
    	----------------------
    	|   --    0-    +-   |
    	|         |↙00      |
    	|   -0  --+->   +0   |
    	|         ↓          |
    	|   -+    0+    ++   |
    	----------------------
    	for example: text is in the right top of the point, then align = "+-"
     */

    function PointText(text, x, y) {
      var options;
      this.text = text;
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.setContextAlign = bind(this.setContextAlign, this);
      PointText.__super__.constructor.call(this);
      this.type = 'PointText';
      this.strokeStyle = null;
      this.fillStyle = Bu.DEFAULT_TEXT_FILL_STYLE;
      options = Bu.combineOptions(arguments, {
        align: '00',
        fontFamily: 'Verdana',
        fontSize: 11
      });
      this.align = options.align;
      this._fontFamily = options.fontFamily;
      this._fontSize = options.fontSize;
      this.font = (this._fontSize + "px " + this._fontFamily) || options.font;
      this.setContextAlign(this.align);
    }

    PointText.property('fontFamily', {
      get: function() {
        return this._fontFamily;
      },
      set: function(val) {
        this._fontFamily = val;
        return this.font = this._fontSize + "px " + this._fontFamily;
      }
    });

    PointText.property('fontSize', {
      get: function() {
        return this._fontSize;
      },
      set: function(val) {
        this._fontSize = val;
        return this.font = this._fontSize + "px " + this._fontFamily;
      }
    });

    PointText.prototype.setContextAlign = function(align) {
      var alignX, alignY;
      if (align.length === 1) {
        align = '' + align + align;
      }
      alignX = align.substring(0, 1);
      alignY = align.substring(1, 2);
      this.textAlign = (function() {
        switch (alignX) {
          case '-':
            return 'right';
          case '0':
            return 'center';
          case '+':
            return 'left';
        }
      })();
      return this.textBaseline = (function() {
        switch (alignY) {
          case '-':
            return 'bottom';
          case '0':
            return 'middle';
          case '+':
            return 'top';
        }
      })();
    };

    return PointText;

  })(Bu.Object2D);

}).call(this);

(function() {
  Bu.Animation = (function() {
    function Animation(options) {
      this.from = options.from;
      this.to = options.to;
      this.data = options.data || {};
      this.duration = options.duration || 0.5;
      this.repeat = options.repeat != null ? options.repeat : false;
      this.init = options.init;
      this.update = options.update;
      this.finish = options.finish;
    }

    Animation.prototype.apply = function(target, args) {
      return Bu.animationRunner.add(this, target, args);
    };

    return Animation;

  })();

  Bu.animations = {
    fadeIn: new Bu.Animation({
      update: function(t) {
        return this.opacity = t;
      }
    }),
    fadeOut: new Bu.Animation({
      update: function(t) {
        return this.opacity = 1 - t;
      }
    }),
    spin: new Bu.Animation({
      update: function(t) {
        return this.rotation = t * Math.PI * 2;
      }
    }),
    spinIn: new Bu.Animation({
      init: function(anim, arg) {
        if (arg == null) {
          arg = 1;
        }
        return anim.data.ds = arg;
      },
      update: function(t, data) {
        this.opacity = t;
        this.rotation = t * Math.PI * 4;
        return this.scale = t * data.ds;
      }
    }),
    spinOut: new Bu.Animation({
      update: function(t) {
        this.opacity = 1 - t;
        this.rotation = t * Math.PI * 4;
        return this.scale = 1 - t;
      }
    }),
    blink: new Bu.Animation({
      duration: 0.2,
      from: 0,
      to: 512,
      update: function(data) {
        data = Math.floor(Math.abs(d - 256));
        return this.fillStyle = "rgb(" + data + ", " + data + ", " + data + ")";
      }
    }),
    shake: new Bu.Animation({
      init: function(anim, arg) {
        anim.data.ox = this.translate.x;
        return anim.data.range = arg || 20;
      },
      update: function(t, data) {
        return this.translate.x = Math.sin(t * Math.PI * 8) * data.range + data.ox;
      }
    }),
    puff: new Bu.Animation({
      duration: 0.15,
      init: function(anim) {
        anim.from = {
          opacity: this.opacity,
          scale: this.scale.x
        };
        return anim.to = {
          opacity: this.opacity === 1 ? 0 : 1,
          scale: this.opacity === 1 ? this.scale.x * 1.5 : this.scale.x / 1.5
        };
      },
      update: function(data) {
        this.opacity = data.opacity;
        return this.scale = data.scale;
      }
    }),
    clip: new Bu.Animation({
      init: function(anim) {
        if (this.scale.y !== 0) {
          anim.from = this.scale.y;
          return anim.to = 0;
        } else {
          anim.from = this.scale.y;
          return anim.to = this.scale.x;
        }
      },
      update: function(data) {
        return this.scale.y = data;
      }
    }),
    flipX: new Bu.Animation({
      init: function(anim) {
        anim.from = this.scale.x;
        return anim.to = -anim.from;
      },
      update: function(data) {
        return this.scale.x = data;
      }
    }),
    flipY: new Bu.Animation({
      init: function(anim) {
        anim.from = this.scale.y;
        return anim.to = -anim.from;
      },
      update: function(data) {
        return this.scale.y = data;
      }
    }),
    moveTo: new Bu.Animation({
      init: function(anim, args) {
        if (args != null) {
          anim.from = this.translate.x;
          return anim.to = args;
        } else {
          return console.error('animation moveTo need an argument');
        }
      },
      update: function(data) {
        return this.translate.x = data;
      }
    }),
    moveBy: new Bu.Animation({
      init: function(anim, args) {
        if (args != null) {
          anim.from = this.translate.x;
          return anim.to = this.translate.x + parseFloat(args);
        } else {
          return console.error('animation moveTo need an argument');
        }
      },
      update: function(data) {
        return this.translate.x = data;
      }
    })
  };

}).call(this);

(function() {
  var hasProp = {}.hasOwnProperty;

  Bu.AnimationRunner = (function() {
    function AnimationRunner() {
      this.runningAnimations = [];
    }

    AnimationRunner.prototype.add = function(animation, target, args) {
      var ref;
      this.runningAnimations.push({
        animation: animation,
        target: target,
        startTime: Bu.now(),
        current: animation.data,
        finished: false
      });
      return (ref = animation.init) != null ? ref.call(target, animation, args) : void 0;
    };

    AnimationRunner.prototype.update = function() {
      var anim, finish, i, key, len, now, ref, ref1, ref2, results, t, task;
      now = Bu.now();
      ref = this.runningAnimations;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        task = ref[i];
        if (task.finished) {
          continue;
        }
        anim = task.animation;
        t = (now - task.startTime) / (anim.duration * 1000);
        if (t > 1) {
          finish = true;
          if (anim.repeat) {
            t = 0;
            task.startTime = Bu.now();
          } else {
            t = 1;
            task.finished = true;
          }
        }
        if (anim.from != null) {
          if (anim.from instanceof Object) {
            ref1 = anim.from;
            for (key in ref1) {
              if (!hasProp.call(ref1, key)) continue;
              if (key in anim.to) {
                task.current[key] = anim.to[key] * t - anim.from[key] * (t - 1);
              }
            }
          } else {
            task.current = anim.to * t - anim.from * (t - 1);
          }
          anim.update.apply(task.target, [task.current, t]);
        } else {
          anim.update.apply(task.target, [t, task.current]);
        }
        if (finish) {
          results.push((ref2 = anim.finish) != null ? ref2.call(task.target, anim) : void 0);
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    AnimationRunner.prototype.hookUp = function(renderer) {
      return renderer.on('update', (function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    return AnimationRunner;

  })();

  Bu.animationRunner = new Bu.AnimationRunner;

}).call(this);

(function() {
  Bu.RandomShapeGenerator = (function() {
    var MARGIN;

    MARGIN = 30;

    function RandomShapeGenerator(bu) {
      this.bu = bu;
    }

    RandomShapeGenerator.prototype.randomX = function() {
      return Bu.rand(MARGIN, this.bu.width - MARGIN * 2);
    };

    RandomShapeGenerator.prototype.randomY = function() {
      return Bu.rand(MARGIN, this.bu.height - MARGIN * 2);
    };

    RandomShapeGenerator.prototype.randomRadius = function() {
      return Bu.rand(5, Math.min(this.bu.width, this.bu.height) / 2);
    };

    RandomShapeGenerator.prototype.generate = function(type) {
      switch (type) {
        case 'circle':
          return this.generateCircle();
        case 'bow':
          return this.generateBow();
        case 'triangle':
          return this.generateTriangle();
        case 'rectangle':
          return this.generateRectangle();
        case 'fan':
          return this.generateFan();
        case 'polygon':
          return this.generatePolygon();
        case 'line':
          return this.generateLine();
        case 'polyline':
          return this.generatePolyline();
        default:
          return console.warn('not support shape: ' + type);
      }
    };

    RandomShapeGenerator.prototype.generateCircle = function() {
      var circle;
      circle = new Bu.Circle(this.randomX(), this.randomY(), this.randomRadius());
      circle.center.label = 'O';
      return circle;
    };

    RandomShapeGenerator.prototype.generateBow = function() {
      var aFrom, aTo, bow;
      aFrom = Bu.rand(Math.PI * 2);
      aTo = aFrom + Bu.rand(Math.PI / 2, Math.PI * 2);
      bow = new Bu.Bow(this.randomX(), this.randomY(), this.randomRadius(), aFrom, aTo);
      bow.string.points[0].label = 'A';
      bow.string.points[1].label = 'B';
      return bow;
    };

    RandomShapeGenerator.prototype.generateTriangle = function() {
      var i, j, points, triangle;
      points = [];
      for (i = j = 0; j <= 2; i = ++j) {
        points[i] = new Bu.Point(this.randomX(), this.randomY());
      }
      triangle = new Bu.Triangle(points[0], points[1], points[2]);
      triangle.points[0].label = 'A';
      triangle.points[1].label = 'B';
      triangle.points[2].label = 'C';
      return triangle;
    };

    RandomShapeGenerator.prototype.generateRectangle = function() {
      return new Bu.Rectangle(Bu.rand(this.bu.width), Bu.rand(this.bu.height), Bu.rand(this.bu.width / 2), Bu.rand(this.bu.height / 2));
    };

    RandomShapeGenerator.prototype.generateFan = function() {
      var aFrom, aTo, fan;
      aFrom = Bu.rand(Math.PI * 2);
      aTo = aFrom + Bu.rand(Math.PI / 2, Math.PI * 2);
      fan = new Bu.Fan(this.randomX(), this.randomY(), this.randomRadius(), aFrom, aTo);
      fan.string.points[0].label = 'A';
      fan.string.points[1].label = 'B';
      return fan;
    };

    RandomShapeGenerator.prototype.generatePolygon = function() {
      var i, j, point, points;
      points = [];
      for (i = j = 0; j <= 3; i = ++j) {
        point = new Bu.Point(this.randomX(), this.randomY());
        point.label = 'P' + i;
        points.push(point);
      }
      return new Bu.Polygon(points);
    };

    RandomShapeGenerator.prototype.generateLine = function() {
      var line;
      line = new Bu.Line(this.randomX(), this.randomY(), this.randomX(), this.randomY());
      line.points[0].label = 'A';
      line.points[1].label = 'B';
      return line;
    };

    RandomShapeGenerator.prototype.generatePolyline = function() {
      var i, j, point, polyline;
      polyline = new Bu.Polyline;
      for (i = j = 0; j <= 3; i = ++j) {
        point = new Bu.Point(this.randomX(), this.randomY());
        point.label = 'P' + i;
        polyline.addPoint(point);
      }
      return polyline;
    };

    return RandomShapeGenerator;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJ1LmNvZmZlZSIsIkJvdW5kcy5jb2ZmZWUiLCJTaXplLmNvZmZlZSIsIlZlY3Rvci5jb2ZmZWUiLCJDb2xvcmZ1bC5jb2ZmZWUiLCJFdmVudC5jb2ZmZWUiLCJNaWNyb0pRdWVyeS5jb2ZmZWUiLCJPYmplY3QyRC5jb2ZmZWUiLCJSZW5kZXJlci5jb2ZmZWUiLCJCb3cuY29mZmVlIiwiQ2lyY2xlLmNvZmZlZSIsIkZhbi5jb2ZmZWUiLCJMaW5lLmNvZmZlZSIsIlBvaW50LmNvZmZlZSIsIlBvbHlnb24uY29mZmVlIiwiUG9seWxpbmUuY29mZmVlIiwiUmVjdGFuZ2xlLmNvZmZlZSIsIlNwbGluZS5jb2ZmZWUiLCJUcmlhbmdsZS5jb2ZmZWUiLCJJbWFnZS5jb2ZmZWUiLCJQb2ludFRleHQuY29mZmVlIiwiQW5pbWF0aW9uLmNvZmZlZSIsIkFuaW1hdGlvblJ1bm5lci5jb2ZmZWUiLCJSYW5kb21TaGFwZUdlbmVyYXRvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0E7QUFBQSxNQUFBLDhEQUFBO0lBQUE7O0VBQUEsY0FBQSxHQUFpQjs7RUFHakIsTUFBQSxHQUFTLE1BQUEsSUFBVTs7RUFHbkIsTUFBTSxDQUFDLEVBQVAsR0FBWSxTQUFBO1dBQVU7Ozs7T0FBQSxFQUFFLENBQUMsUUFBSCxFQUFZLFNBQVo7RUFBVjs7RUFHWixFQUFFLENBQUMsTUFBSCxHQUFZOztFQUdaLE1BQUEsR0FBUzs7O0FBR1Q7Ozs7RUFLQSxFQUFFLENBQUMsT0FBSCxHQUFhOztFQUdiLEVBQUUsQ0FBQyxvQkFBSCxHQUEwQjs7RUFDMUIsRUFBRSxDQUFDLGtCQUFILEdBQXdCOztFQUN4QixFQUFFLENBQUMsa0JBQUgsR0FBd0IsQ0FBQyxDQUFELEVBQUksQ0FBSjs7RUFHeEIsRUFBRSxDQUFDLHFCQUFILEdBQTJCOztFQUczQixFQUFFLENBQUMsMEJBQUgsR0FBZ0M7O0VBQ2hDLEVBQUUsQ0FBQyx3QkFBSCxHQUE4Qjs7RUFHOUIsRUFBRSxDQUFDLHVCQUFI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QU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFmLEdBQXVCO01BQ3ZCLElBQUksQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBZixHQUF1QjtBQUN2QixhQUFPO0lBSk07O21DQU1kLGdCQUFBLEdBQWtCLFNBQUE7QUFDakIsVUFBQTtNQUFBLFFBQUEsR0FBVyxJQUFJLEVBQUUsQ0FBQztBQUNsQixXQUFTLDBCQUFUO1FBQ0MsS0FBQSxHQUFZLElBQUEsRUFBRSxDQUFDLEtBQUgsQ0FBUyxJQUFDLENBQUEsT0FBRCxDQUFBLENBQVQsRUFBcUIsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFyQjtRQUNaLEtBQUssQ0FBQyxLQUFOLEdBQWMsR0FBQSxHQUFNO1FBQ3BCLFFBQVEsQ0FBQyxRQUFULENBQWtCLEtBQWxCO0FBSEQ7QUFJQSxhQUFPO0lBTlU7Ozs7O0FBdEZuQiIsImZpbGUiOiJidS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiMgQnUuY29mZmVlOiBuYW1lc3BhY2UsIGNvbnN0YW50cywgdXRpbGl0eSBmdW5jdGlvbnMgYW5kIHBvbHlmaWxsc1xyXG5cclxuIyBTYXZlIHRoZSBwcmV2aW91cyB2YWx1ZSBvZiBgZ2xvYmFsYCB2YXJpYWJsZS5cclxucHJldmlvdXNHbG9iYWwgPSBnbG9iYWxcclxuXHJcbiMgR2V0IHRoZSByb290IG9iamVjdFxyXG5nbG9iYWwgPSB3aW5kb3cgb3IgQFxyXG5cclxuIyBEZWZpbmUgb3VyIG5hbWVzcGFjZSBgQnVgLiBJdCBpcyBhbHNvIGEgc2hvcnRjdXQgdG8gY2xhc3MgYEJ1LlJlbmRlcmVyYC5cclxuZ2xvYmFsLkJ1ID0gKCkgLT4gbmV3IEJ1LlJlbmRlcmVyIGFyZ3VtZW50cy4uLlxyXG5cclxuIyBTYXZlIHRoZSByb290IG9iamVjdCB0byBvdXIgbmFtZXNwYWNlLlxyXG5CdS5nbG9iYWwgPSBnbG9iYWxcclxuXHJcbiMgUmV0dXJuIGJhY2sgdGhlIHByZXZpb3VzIGdsb2JhbCB2YXJpYWJsZS5cclxuZ2xvYmFsID0gcHJldmlvdXNHbG9iYWxcclxuXHJcblxyXG4jIyNcclxuIyBjb25zdGFudHNcclxuIyMjXHJcblxyXG4jIGxpYnJhcnkgdmVyc2lvblxyXG5CdS5WRVJTSU9OID0gJzAuMy4zJ1xyXG5cclxuIyBzaGFwZXMgcmVsYXRlZFxyXG5CdS5ERUZBVUxUX1NUUk9LRV9TVFlMRSA9ICcjMDQ4J1xyXG5CdS5ERUZBVUxUX0ZJTExfU1RZTEUgPSAncmdiYSg2NCwgMTI4LCAxOTIsIDAuNSknXHJcbkJ1LkRFRkFVTFRfREFTSF9TVFlMRSA9IFs4LCA0XVxyXG5cclxuIyBjdXJ2ZSByZWxhdGVkXHJcbkJ1LkRFRkFVTFRfU1BMSU5FX1NNT09USCA9IDAuMjUgIyByYW5nZSBpbiBbMCB+IDFdXHJcblxyXG4jIGludGVyYWN0aW9uIHJlbGF0ZWRcclxuQnUuREVGQVVMVF9TVFJPS0VfU1RZTEVfSE9WRVIgPSAncmdiYSgyNTUsIDEyOCwgMCwgMC43NSknXHJcbkJ1LkRFRkFVTFRfRklMTF9TVFlMRV9IT1ZFUiA9ICdyZ2JhKDI1NSwgMTI4LCAxMjgsIDAuNSknXHJcblxyXG4jIHRleHRzIHJlbGF0ZWRcclxuQnUuREVGQVVMVF9URVhUX0ZJTExfU1RZTEUgPSAnYmxhY2snXHJcblxyXG4jIGRlZmF1bHQgc2l6ZVxyXG5CdS5ERUZBVUxUX0lNQUdFX1NJWkUgPSAyMFxyXG5CdS5QT0lOVF9SRU5ERVJfU0laRSA9IDIuMjVcclxuQnUuUE9JTlRfTEFCRUxfT0ZGU0VUID0gNVxyXG5cclxuIyBib3VuZHMgcmVsYXRlZFxyXG5CdS5ERUZBVUxUX0JPVU5EX1NUUk9LRV9TVFlMRSA9ICcjNDQ0J1xyXG5CdS5ERUZBVUxUX0JPVU5EX0RBU0hfU1RZTEUgPSBbNiwgNl1cclxuXHJcbiMgY29tcHV0YXRpb24gcmVsYXRlZFxyXG5CdS5ERUZBVUxUX05FQVJfRElTVCA9IDVcclxuXHJcbiMgbW91c2UgaW50ZXJhY3RcclxuQnUuTU9VU0VfQlVUVE9OX05PTkUgPSAtMVxyXG5CdS5NT1VTRV9CVVRUT05fTEVGVCA9IDBcclxuQnUuTU9VU0VfQlVUVE9OX01JRERMRSA9IDFcclxuQnUuTU9VU0VfQlVUVE9OX1JJR0hUID0gMlxyXG5cclxuXHJcbiMjI1xyXG4jIHV0aWxpdHkgZnVuY3Rpb25zXHJcbiMjI1xyXG5cclxuIyBjYWxjdWxhdGUgdGhlIG1lYW4gdmFsdWUgb2Ygc2V2ZXJhbCBudW1iZXJzXHJcbkJ1LmF2ZXJhZ2UgPSAoKS0+XHJcblx0bnMgPSBhcmd1bWVudHNcclxuXHRucyA9IGFyZ3VtZW50c1swXSBpZiB0eXBlb2YgYXJndW1lbnRzWzBdIGlzICdvYmplY3QnXHJcblx0c3VtID0gMFxyXG5cdGZvciBpIGluIG5zXHJcblx0XHRzdW0gKz0gaVxyXG5cdHN1bSAvIG5zLmxlbmd0aFxyXG5cclxuIyBjYWxjdWxhdGUgdGhlIGh5cG90ZW51c2UgZnJvbSB0aGUgY2F0aGV0dXNlc1xyXG5CdS5iZXZlbCA9ICh4LCB5KSAtPlxyXG5cdE1hdGguc3FydCB4ICogeCArIHkgKiB5XHJcblxyXG4jIGdlbmVyYXRlIGEgcmFuZG9tIG51bWJlciBiZXR3ZWVuIHR3byBudW1iZXJzXHJcbkJ1LnJhbmQgPSAoZnJvbSwgdG8pIC0+XHJcblx0aWYgbm90IHRvP1xyXG5cdFx0dG8gPSBmcm9tXHJcblx0XHRmcm9tID0gMFxyXG5cdE1hdGgucmFuZG9tKCkgKiAodG8gLSBmcm9tKSArIGZyb21cclxuXHJcbiMgY29udmVydCBhbiBhbmdsZSBmcm9tIHJhZGlhbiB0byBkZWdcclxuQnUucjJkID0gKHIpIC0+IChyICogMTgwIC8gTWF0aC5QSSkudG9GaXhlZCgxKVxyXG5cclxuIyBjb252ZXJ0IGFuIGFuZ2xlIGZyb20gZGVnIHRvIHJhZGlhblxyXG5CdS5kMnIgPSAocikgLT4gciAqIE1hdGguUEkgLyAxODBcclxuXHJcbiMgZ2V0IGN1cnJlbnQgdGltZVxyXG5CdS5ub3cgPSBpZiBCdS5nbG9iYWwucGVyZm9ybWFuY2U/IHRoZW4gLT4gQnUuZ2xvYmFsLnBlcmZvcm1hbmNlLm5vdygpIGVsc2UgLT4gRGF0ZS5ub3coKVxyXG5cclxuIyBjb21iaW5lIHRoZSBnaXZlbiBvcHRpb25zIChsYXN0IGl0ZW0gb2YgYXJndW1lbnRzKSB3aXRoIHRoZSBkZWZhdWx0IG9wdGlvbnNcclxuQnUuY29tYmluZU9wdGlvbnMgPSAoYXJncywgZGVmYXVsdE9wdGlvbnMpIC0+XHJcblx0ZGVmYXVsdE9wdGlvbnMgPSB7fSBpZiBub3QgZGVmYXVsdE9wdGlvbnM/XHJcblx0Z2l2ZW5PcHRpb25zID0gYXJnc1thcmdzLmxlbmd0aCAtIDFdXHJcblx0aWYgdHlwZW9mIGdpdmVuT3B0aW9ucyBpcyAnb2JqZWN0J1xyXG5cdFx0Zm9yIGkgb2YgZ2l2ZW5PcHRpb25zXHJcblx0XHRcdGRlZmF1bHRPcHRpb25zW2ldID0gZ2l2ZW5PcHRpb25zW2ldXHJcblx0cmV0dXJuIGRlZmF1bHRPcHRpb25zXHJcblxyXG4jIGNsb25lIGFuIE9iamVjdCBvciBBcnJheVxyXG5CdS5jbG9uZSA9ICh0YXJnZXQsIGRlZXAgPSBmYWxzZSkgLT5cclxuXHQjIFRPRE8gZGVhbCB3aXRoIGRlZXBcclxuXHRpZiB0YXJnZXQgaW5zdGFuY2VvZiBBcnJheVxyXG5cdFx0Y2xvbmUgPSBbXVxyXG5cdFx0Y2xvbmVbaV0gPSB0YXJnZXRbaV0gZm9yIG93biBpIG9mIHRhcmdldFxyXG5cdGVsc2UgaWYgdGFyZ2V0IGluc3RhbmNlb2YgT2JqZWN0XHJcblx0XHRjbG9uZSA9IHt9XHJcblx0XHRjbG9uZVtpXSA9IHRhcmdldFtpXSBmb3Igb3duIGkgb2YgdGFyZ2V0XHJcblxyXG4jIHVzZSBsb2NhbFN0b3JhZ2UgdG8gcGVyc2lzdCBkYXRhXHJcbkJ1LmRhdGEgPSAoa2V5LCB2YWx1ZSkgLT5cclxuXHRpZiB2YWx1ZT9cclxuXHRcdGxvY2FsU3RvcmFnZVsnQnUuJyArIGtleV0gPSBKU09OLnN0cmluZ2lmeSB2YWx1ZVxyXG5cdGVsc2VcclxuXHRcdHZhbHVlID0gbG9jYWxTdG9yYWdlWydCdS4nICsga2V5XVxyXG5cdFx0cmV0dXJuIGlmIHZhbHVlPyB0aGVuIEpTT04ucGFyc2UgdmFsdWUgZWxzZSBudWxsXHJcblxyXG4jIyNcclxuIyBwb2x5ZmlsbFxyXG4jIyNcclxuXHJcbiMgU2hvcnRjdXQgdG8gZGVmaW5lIGEgcHJvcGVydHkgZm9yIGEgY2xhc3MuIFRoaXMgaXMgdXNlZCB0byBzb2x2ZSB0aGUgcHJvYmxlbVxyXG4jIHRoYXQgQ29mZmVlU2NyaXB0IGRpZG4ndCBzdXBwb3J0IGdldHRlcnMgYW5kIHNldHRlcnMuXHJcbiMgY2xhc3MgUGVyc29uXHJcbiMgICBAY29uc3RydWN0b3I6IChhZ2UpIC0+XHJcbiMgICAgIEBfYWdlID0gYWdlXHJcbiNcclxuIyAgIEBwcm9wZXJ0eSAnYWdlJyxcclxuIyAgICAgZ2V0OiAtPiBAX2FnZVxyXG4jICAgICBzZXQ6ICh2YWwpIC0+XHJcbiMgICAgICAgQF9hZ2UgPSB2YWxcclxuI1xyXG5GdW5jdGlvbjo6cHJvcGVydHkgPSAocHJvcCwgZGVzYykgLT5cclxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgcHJvcCwgZGVzY1xyXG5cclxuIyBNYWtlIGEgY29weSBvZiB0aGlzIGZ1bmN0aW9uIHdoaWNoIGhhcyBhIGxpbWl0ZWQgc2hvcnRlc3QgZXhlY3V0aW5nIGludGVydmFsLlxyXG5GdW5jdGlvbjo6dGhyb3R0bGUgPSAobGltaXQgPSAwLjUpIC0+XHJcblx0Y3VyclRpbWUgPSAwXHJcblx0bGFzdFRpbWUgPSAwXHJcblxyXG5cdHJldHVybiAoKSA9PlxyXG5cdFx0Y3VyclRpbWUgPSBEYXRlLm5vdygpXHJcblx0XHRpZiBjdXJyVGltZSAtIGxhc3RUaW1lID4gbGltaXQgKiAxMDAwXHJcblx0XHRcdEBhcHBseSBudWxsLCBhcmd1bWVudHNcclxuXHRcdFx0bGFzdFRpbWUgPSBjdXJyVGltZVxyXG5cclxuIyBNYWtlIGEgY29weSBvZiB0aGlzIGZ1bmN0aW9uIHdob3NlIGV4ZWN1dGlvbiB3aWxsIGJlIGNvbnRpbnVvdXNseSBwdXQgb2ZmXHJcbiMgYWZ0ZXIgZXZlcnkgY2FsbGluZyBvZiB0aGlzIGZ1bmN0aW9uLlxyXG5GdW5jdGlvbjo6ZGVib3VuY2UgPSAoZGVsYXkgPSAwLjUpIC0+XHJcblx0YXJncyA9IG51bGxcclxuXHR0aW1lb3V0ID0gbnVsbFxyXG5cclxuXHRsYXRlciA9ID0+XHJcblx0XHRAYXBwbHkgbnVsbCwgYXJnc1xyXG5cclxuXHRyZXR1cm4gKCkgLT5cclxuXHRcdGFyZ3MgPSBhcmd1bWVudHNcclxuXHRcdGNsZWFyVGltZW91dCB0aW1lb3V0XHJcblx0XHR0aW1lb3V0ID0gc2V0VGltZW91dCBsYXRlciwgZGVsYXkgKiAxMDAwXHJcblxyXG5cclxuIyBJdGVyYXRlIHRoaXMgQXJyYXkgYW5kIGRvIHNvbWV0aGluZyB3aXRoIHRoZSBpdGVtcy5cclxuQXJyYXk6OmVhY2ggb3I9IChmbikgLT5cclxuXHRpID0gMFxyXG5cdHdoaWxlIGkgPCBAbGVuZ3RoXHJcblx0XHRmbiBAW2ldXHJcblx0XHRpKytcclxuXHRyZXR1cm4gQFxyXG5cclxuIyBJdGVyYXRlIHRoaXMgQXJyYXkgYW5kIG1hcCB0aGUgaXRlbXMgdG8gYSBuZXcgQXJyYXkuXHJcbkFycmF5OjptYXAgb3I9IChmbikgLT5cclxuXHRhcnIgPSBbXVxyXG5cdGkgPSAwXHJcblx0d2hpbGUgaSA8IEBsZW5ndGhcclxuXHRcdGFyci5wdXNoIGZuKEBbaV0pXHJcblx0XHRpKytcclxuXHRyZXR1cm4gQFxyXG5cclxuIyBEaXNwbGF5IG93biBsaWIgaW5mby4gSXQgd2lsbCBhcHBlYXIgb25lIHRpbWUgcGVyIG1pbnV0ZSBhdCBtb3N0LlxyXG5sYXN0Qm9vdFRpbWUgPSBCdS5kYXRhICdsYXN0SW5mbydcclxuY3VycmVudFRpbWUgPSBEYXRlLm5vdygpXHJcbnVubGVzcyBsYXN0Qm9vdFRpbWU/IGFuZCBjdXJyZW50VGltZSAtIGxhc3RCb290VGltZSA8IDYwICogMTAwMFxyXG5cdGNvbnNvbGUuaW5mbz8gJ0J1LmpzIHYnICsgQnUuVkVSU0lPTiArICcgLSBbaHR0cHM6Ly9naXRodWIuY29tL2phcnZpc25pdS9CdS5qc10nXHJcblx0QnUuZGF0YSAnbGFzdEluZm8nLCBjdXJyZW50VGltZVxyXG4iLCIjIyBheGlzIGFsaWduZWQgYm91bmRpbmcgYm94XHJcblxyXG5jbGFzcyBCdS5Cb3VuZHNcclxuXHJcblx0Y29uc3RydWN0b3I6IChAdGFyZ2V0KSAtPlxyXG5cclxuXHRcdEB4MSA9IEB5MSA9IEB4MiA9IEB5MiA9IDBcclxuXHRcdEBpc0VtcHR5ID0gdHJ1ZVxyXG5cclxuXHRcdEBwb2ludDEgPSBuZXcgQnUuVmVjdG9yXHJcblx0XHRAcG9pbnQyID0gbmV3IEJ1LlZlY3RvclxyXG5cclxuXHRcdEBzdHJva2VTdHlsZSA9IEJ1LkRFRkFVTFRfQk9VTkRfU1RST0tFX1NUWUxFXHJcblx0XHRAZGFzaFN0eWxlID0gQnUuREVGQVVMVF9CT1VORF9EQVNIX1NUWUxFXHJcblx0XHRAZGFzaE9mZnNldCA9IDBcclxuXHJcblx0XHRzd2l0Y2ggQHRhcmdldC50eXBlXHJcblx0XHRcdHdoZW4gJ0xpbmUnLCAnVHJpYW5nbGUnLCAnUmVjdGFuZ2xlJ1xyXG5cdFx0XHRcdGZvciB2IGluIEB0YXJnZXQucG9pbnRzXHJcblx0XHRcdFx0XHRAZXhwYW5kQnlQb2ludCh2KVxyXG5cdFx0XHR3aGVuICdDaXJjbGUnLCAnQm93JywgJ0ZhbidcclxuXHRcdFx0XHRAZXhwYW5kQnlDaXJjbGUoQHRhcmdldClcclxuXHRcdFx0XHRAdGFyZ2V0Lm9uICdjZW50ZXJDaGFuZ2VkJywgPT5cclxuXHRcdFx0XHRcdEBjbGVhcigpXHJcblx0XHRcdFx0XHRAZXhwYW5kQnlDaXJjbGUgQHRhcmdldFxyXG5cdFx0XHRcdEB0YXJnZXQub24gJ3JhZGl1c0NoYW5nZWQnLCA9PlxyXG5cdFx0XHRcdFx0QGNsZWFyKClcclxuXHRcdFx0XHRcdEBleHBhbmRCeUNpcmNsZSBAdGFyZ2V0XHJcblx0XHRcdHdoZW4gJ1BvbHlsaW5lJywgJ1BvbHlnb24nXHJcblx0XHRcdFx0Zm9yIHYgaW4gQHRhcmdldC52ZXJ0aWNlc1xyXG5cdFx0XHRcdFx0QGV4cGFuZEJ5UG9pbnQodilcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdGNvbnNvbGUud2FybiAnQm91bmRzOiBub3Qgc3VwcG9ydCBzaGFwZSB0eXBlIFwiJyArIEB0YXJnZXQudHlwZSArICdcIidcclxuXHJcblx0Y29udGFpbnNQb2ludDogKHApIC0+XHJcblx0XHRAeDEgPCBwLnggJiYgQHgyID4gcC54ICYmIEB5MSA8IHAueSAmJiBAeTIgPiBwLnlcclxuXHJcblx0Y2xlYXI6ICgpIC0+XHJcblx0XHRAeDEgPSBAeTEgPSBAeDIgPSBAeTIgPSAwXHJcblx0XHRAaXNFbXB0eSA9IHRydWVcclxuXHJcblx0ZXhwYW5kQnlQb2ludDogKHYpIC0+XHJcblx0XHRpZiBAaXNFbXB0eVxyXG5cdFx0XHRAaXNFbXB0eSA9IGZhbHNlXHJcblx0XHRcdEB4MSA9IEB4MiA9IHYueFxyXG5cdFx0XHRAeTEgPSBAeTIgPSB2LnlcclxuXHRcdGVsc2VcclxuXHRcdFx0QHgxID0gdi54IGlmIHYueCA8IEB4MVxyXG5cdFx0XHRAeDIgPSB2LnggaWYgdi54ID4gQHgyXHJcblx0XHRcdEB5MSA9IHYueSBpZiB2LnkgPCBAeTFcclxuXHRcdFx0QHkyID0gdi55IGlmIHYueSA+IEB5MlxyXG5cclxuXHRleHBhbmRCeUNpcmNsZTogKGMpIC0+XHJcblx0XHRjcCA9IGMuY2VudGVyXHJcblx0XHRyID0gYy5yYWRpdXNcclxuXHRcdGlmIEBpc0VtcHR5XHJcblx0XHRcdEBpc0VtcHR5ID0gZmFsc2VcclxuXHRcdFx0QHgxID0gY3AueCAtIHJcclxuXHRcdFx0QHgyID0gY3AueCArIHJcclxuXHRcdFx0QHkxID0gY3AueSAtIHJcclxuXHRcdFx0QHkyID0gY3AueSArIHJcclxuXHRcdGVsc2VcclxuXHRcdFx0QHgxID0gY3AueCAtIHIgaWYgY3AueCAtIHIgPCBAeDFcclxuXHRcdFx0QHgyID0gY3AueCArIHIgaWYgY3AueCArIHIgPiBAeDJcclxuXHRcdFx0QHkxID0gY3AueSAtIHIgaWYgY3AueSAtIHIgPCBAeTFcclxuXHRcdFx0QHkyID0gY3AueSArIHIgaWYgY3AueSArIHIgPiBAeTJcclxuIiwiIyB0aGUgc2l6ZSBvZiByZWN0YW5nbGUsIEJvdW5kcyBldGMuXHJcblxyXG5jbGFzcyBCdS5TaXplXHJcblx0Y29uc3RydWN0b3I6IChAd2lkdGgsIEBoZWlnaHQpIC0+XHJcblx0XHRAdHlwZSA9ICdTaXplJ1xyXG5cclxuXHRzZXQ6ICh3aWR0aCwgaGVpZ2h0KSAtPlxyXG5cdFx0QHdpZHRoID0gd2lkdGhcclxuXHRcdEBoZWlnaHQgPSBoZWlnaHRcclxuIiwiIyAyZCB2ZWN0b3JcclxuXHJcbmNsYXNzIEJ1LlZlY3RvclxyXG5cclxuXHRjb25zdHJ1Y3RvcjogKEB4ID0gMCwgQHkgPSAwKSAtPlxyXG5cclxuXHRzZXQ6IChAeCwgQHkpIC0+XHJcbiIsIiMgQWRkIGNvbG9yIHRvIHRoZSBzaGFwZXNcclxuXHJcbkJ1LkNvbG9yZnVsID0gKCkgLT5cclxuXHRAc3Ryb2tlU3R5bGUgPSBCdS5ERUZBVUxUX1NUUk9LRV9TVFlMRVxyXG5cdEBmaWxsU3R5bGUgPSBCdS5ERUZBVUxUX0ZJTExfU1RZTEVcclxuXHRAZGFzaFN0eWxlID0gZmFsc2VcclxuXHJcblx0QGxpbmVXaWR0aCA9IDFcclxuXHRAZGFzaE9mZnNldCA9IDBcclxuXHJcblx0QHN0cm9rZSA9ICh2KSAtPlxyXG5cdFx0diA9IHRydWUgaWYgbm90IHY/XHJcblx0XHRzd2l0Y2ggdlxyXG5cdFx0XHR3aGVuIHRydWUgdGhlbiBAc3Ryb2tlU3R5bGUgPSBCdS5ERUZBVUxUX1NUUk9LRV9TVFlMRVxyXG5cdFx0XHR3aGVuIGZhbHNlIHRoZW4gQHN0cm9rZVN0eWxlID0gbnVsbFxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0QHN0cm9rZVN0eWxlID0gdlxyXG5cdFx0QFxyXG5cclxuXHRAZmlsbCA9ICh2KSAtPlxyXG5cdFx0diA9IHRydWUgaWYgbm90IHY/XHJcblx0XHRzd2l0Y2ggdlxyXG5cdFx0XHR3aGVuIGZhbHNlIHRoZW4gQGZpbGxTdHlsZSA9IG51bGxcclxuXHRcdFx0d2hlbiB0cnVlIHRoZW4gQGZpbGxTdHlsZSA9IEJ1LkRFRkFVTFRfRklMTF9TVFlMRVxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0QGZpbGxTdHlsZSA9IHZcclxuXHRcdEBcclxuXHJcblx0QGRhc2ggPSAodikgLT5cclxuXHRcdHYgPSB0cnVlIGlmIG5vdCB2P1xyXG5cdFx0diA9IFt2LCB2XSBpZiB0eXBlb2YgdiBpcyAnbnVtYmVyJ1xyXG5cdFx0c3dpdGNoIHZcclxuXHRcdFx0d2hlbiBmYWxzZSB0aGVuIEBkYXNoU3R5bGUgPSBudWxsXHJcblx0XHRcdHdoZW4gdHJ1ZSB0aGVuIEBkYXNoU3R5bGUgPSBCdS5ERUZBVUxUX0RBU0hfU1RZTEVcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdEBkYXNoU3R5bGUgPSB2XHJcblx0XHRAXHJcbiIsIiMgYWRkIGV2ZW50IGxpc3RlbmVyIHRvIGN1c3RvbSBvYmplY3RzXHJcbkJ1LkV2ZW50ID0gLT5cclxuXHR0eXBlcyA9IHt9XHJcblxyXG5cdEBvbiA9ICh0eXBlLCBsaXN0ZW5lcikgLT5cclxuXHRcdGxpc3RlbmVycyA9IHR5cGVzW3R5cGVdIG9yPSBbXVxyXG5cdFx0bGlzdGVuZXJzLnB1c2ggbGlzdGVuZXIgaWYgbGlzdGVuZXJzLmluZGV4T2YgbGlzdGVuZXIgPT0gLTFcclxuXHJcblx0QG9uY2UgPSAodHlwZSwgbGlzdGVuZXIpIC0+XHJcblx0XHRsaXN0ZW5lci5vbmNlID0gdHJ1ZVxyXG5cdFx0QG9uIHR5cGUsIGxpc3RlbmVyXHJcblxyXG5cdEBvZmYgPSAodHlwZSwgbGlzdGVuZXIpIC0+XHJcblx0XHRsaXN0ZW5lcnMgPSB0eXBlc1t0eXBlXVxyXG5cdFx0aWYgbGlzdGVuZXI/XHJcblx0XHRcdGlmIGxpc3RlbmVycz9cclxuXHRcdFx0XHRpbmRleCA9IGxpc3RlbmVycy5pbmRleE9mIGxpc3RlbmVyXHJcblx0XHRcdFx0bGlzdGVuZXJzLnNwbGljZSBpbmRleCwgMSBpZiBpbmRleCA+IC0xXHJcblx0XHRlbHNlXHJcblx0XHRcdGxpc3RlbmVycy5sZW5ndGggPSAwIGlmIGxpc3RlbmVycz9cclxuXHJcblx0QHRyaWdnZXIgPSAodHlwZSwgZXZlbnREYXRhKSAtPlxyXG5cdFx0bGlzdGVuZXJzID0gdHlwZXNbdHlwZV1cclxuXHJcblx0XHRpZiBsaXN0ZW5lcnM/XHJcblx0XHRcdGV2ZW50RGF0YSBvcj0ge31cclxuXHRcdFx0ZXZlbnREYXRhLnRhcmdldCA9IEBcclxuXHRcdFx0Zm9yIGxpc3RlbmVyIGluIGxpc3RlbmVyc1xyXG5cdFx0XHRcdGxpc3RlbmVyLmNhbGwgdGhpcywgZXZlbnREYXRhXHJcblx0XHRcdFx0aWYgbGlzdGVuZXIub25jZVxyXG5cdFx0XHRcdFx0bGlzdGVuZXJzLnNwbGljZSBpLCAxXHJcblx0XHRcdFx0XHRpIC09IDFcclxuIiwiIyMjXHJcbiMgTWljcm9KUXVlcnkgLSBBIG1pY3JvIHZlcnNpb24gb2YgalF1ZXJ5XHJcbiNcclxuIyBTdXBwb3J0ZWQgZmVhdHVyZXM6XHJcbiMgICAkLiAtIHN0YXRpYyBtZXRob2RzXHJcbiMgICAgIC5yZWFkeShjYikgLSBjYWxsIHRoZSBjYWxsYmFjayBmdW5jdGlvbiBhZnRlciB0aGUgcGFnZSBpcyBsb2FkZWRcclxuIyAgICAgLmFqYXgoW3VybCxdIG9wdGlvbnMpIC0gcGVyZm9ybSBhbiBhamF4IHJlcXVlc3RcclxuIyAgICQoc2VsZWN0b3IpIC0gc2VsZWN0IGVsZW1lbnQocylcclxuIyAgICAgLm9uKHR5cGUsIGNhbGxiYWNrKSAtIGFkZCBhbiBldmVudCBsaXN0ZW5lclxyXG4jICAgICAub2ZmKHR5cGUsIGNhbGxiYWNrKSAtIHJlbW92ZSBhbiBldmVudCBsaXN0ZW5lclxyXG4jICAgICAuYXBwZW5kKHRhZ05hbWUpIC0gYXBwZW5kIGEgdGFnXHJcbiMgICAgIC50ZXh0KHRleHQpIC0gc2V0IHRoZSBpbm5lciB0ZXh0XHJcbiMgICAgIC5odG1sKGh0bWxUZXh0KSAtIHNldCB0aGUgaW5uZXIgSFRNTFxyXG4jICAgICAuc3R5bGUobmFtZSwgdmFsdWUpIC0gc2V0IHN0eWxlIChhIGNzcyBhdHRyaWJ1dGUpXHJcbiMgICAgICMuY3NzKG9iamVjdCkgLSBzZXQgc3R5bGVzIChtdWx0aXBsZSBjc3MgYXR0cmlidXRlKVxyXG4jICAgICAuaGFzQ2xhc3MoY2xhc3NOYW1lKSAtIGRldGVjdCB3aGV0aGVyIGEgY2xhc3MgZXhpc3RzXHJcbiMgICAgIC5hZGRDbGFzcyhjbGFzc05hbWUpIC0gYWRkIGEgY2xhc3NcclxuIyAgICAgLnJlbW92ZUNsYXNzKGNsYXNzTmFtZSkgLSByZW1vdmUgYSBjbGFzc1xyXG4jICAgICAudG9nZ2xlQ2xhc3MoY2xhc3NOYW1lKSAtIHRvZ2dsZSBhIGNsYXNzXHJcbiMgICAgIC5hdHRyKG5hbWUsIHZhbHVlKSAtIHNldCBhbiBhdHRyaWJ1dGVcclxuIyAgICAgLmhhc0F0dHIobmFtZSkgLSBkZXRlY3Qgd2hldGhlciBhbiBhdHRyaWJ1dGUgZXhpc3RzXHJcbiMgICAgIC5yZW1vdmVBdHRyKG5hbWUpIC0gcmVtb3ZlIGFuIGF0dHJpYnV0ZVxyXG4jICAgTm90ZXM6XHJcbiMgICAgICAgICMgaXMgcGxhbm5lZCBidXQgbm90IGltcGxlbWVudGVkXHJcbiMjI1xyXG5cclxuKChnbG9iYWwpIC0+XHJcblxyXG5cdCMgc2VsZWN0b3JcclxuXHRnbG9iYWwuJCA9IChzZWxlY3RvcikgLT5cclxuXHRcdHNlbGVjdGlvbnMgPSBbXVxyXG5cdFx0aWYgdHlwZW9mIHNlbGVjdG9yID09ICdzdHJpbmcnXHJcblx0XHRcdHNlbGVjdGlvbnMgPSBbXS5zbGljZS5jYWxsIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwgc2VsZWN0b3JcclxuXHRcdGpRdWVyeS5hcHBseSBzZWxlY3Rpb25zXHJcblx0XHRzZWxlY3Rpb25zXHJcblxyXG5cdGpRdWVyeSA9IC0+XHJcblxyXG5cdFx0IyBldmVudFxyXG5cdFx0QG9uID0gKHR5cGUsIGNhbGxiYWNrKSA9PlxyXG5cdFx0XHRAZWFjaCAoZG9tKSAtPlxyXG5cdFx0XHRcdGRvbS5hZGRFdmVudExpc3RlbmVyIHR5cGUsIGNhbGxiYWNrXHJcblx0XHRcdEBcclxuXHJcblx0XHRAb2ZmID0gKHR5cGUsIGNhbGxiYWNrKSA9PlxyXG5cdFx0XHRAZWFjaCAoZG9tKSAtPlxyXG5cdFx0XHRcdGRvbS5yZW1vdmVFdmVudExpc3RlbmVyIHR5cGUsIGNhbGxiYWNrXHJcblx0XHRcdEBcclxuXHJcblx0XHQjIERPTSBNYW5pcHVsYXRpb25cclxuXHJcblx0XHRTVkdfVEFHUyA9ICdzdmcgbGluZSByZWN0IGNpcmNsZSBlbGxpcHNlIHBvbHlsaW5lIHBvbHlnb24gcGF0aCB0ZXh0J1xyXG5cclxuXHRcdEBhcHBlbmQgPSAodGFnKSA9PlxyXG5cdFx0XHRAZWFjaCAoZG9tLCBpKSA9PlxyXG5cdFx0XHRcdHRhZ0luZGV4ID0gU1ZHX1RBR1MuaW5kZXhPZiB0YWcudG9Mb3dlckNhc2UoKVxyXG5cdFx0XHRcdGlmIHRhZ0luZGV4ID4gLTFcclxuXHRcdFx0XHRcdG5ld0RvbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCB0YWdcclxuXHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRuZXdEb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50IHRhZ1xyXG5cdFx0XHRcdEBbaV0gPSBkb20uYXBwZW5kQ2hpbGQgbmV3RG9tXHJcblx0XHRcdEBcclxuXHJcblx0XHRAdGV4dCA9IChzdHIpID0+XHJcblx0XHRcdEBlYWNoIChkb20pIC0+XHJcblx0XHRcdFx0ZG9tLnRleHRDb250ZW50ID0gc3RyXHJcblx0XHRcdEBcclxuXHJcblx0XHRAaHRtbCA9IChzdHIpID0+XHJcblx0XHRcdEBlYWNoIChkb20pIC0+XHJcblx0XHRcdFx0ZG9tLmlubmVySFRNTCA9IHN0clxyXG5cdFx0XHRAXHJcblxyXG5cdFx0QHN0eWxlID0gKG5hbWUsIHZhbHVlKSA9PlxyXG5cdFx0XHRAZWFjaCAoZG9tKSAtPlxyXG5cdFx0XHRcdHN0eWxlVGV4dCA9IGRvbS5nZXRBdHRyaWJ1dGUgJ3N0eWxlJ1xyXG5cdFx0XHRcdHN0eWxlcyA9IHt9XHJcblx0XHRcdFx0aWYgc3R5bGVUZXh0XHJcblx0XHRcdFx0XHRzdHlsZVRleHQuc3BsaXQoJzsnKS5lYWNoIChuKSAtPlxyXG5cdFx0XHRcdFx0XHRudiA9IG4uc3BsaXQgJzonXHJcblx0XHRcdFx0XHRcdHN0eWxlc1tudlswXV0gPSBudlsxXVxyXG5cdFx0XHRcdHN0eWxlc1tuYW1lXSA9IHZhbHVlXHJcblx0XHRcdFx0IyBjb25jYXRcclxuXHRcdFx0XHRzdHlsZVRleHQgPSAnJ1xyXG5cdFx0XHRcdGZvciBpIG9mIHN0eWxlc1xyXG5cdFx0XHRcdFx0c3R5bGVUZXh0ICs9IGkgKyAnOiAnICsgc3R5bGVzW2ldICsgJzsgJ1xyXG5cdFx0XHRcdGRvbS5zZXRBdHRyaWJ1dGUgJ3N0eWxlJywgc3R5bGVUZXh0XHJcblx0XHRcdEBcclxuXHJcblx0XHRAaGFzQ2xhc3MgPSAobmFtZSkgPT5cclxuXHRcdFx0aWYgQGxlbmd0aCA9PSAwXHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlXHJcblx0XHRcdCMgaWYgbXVsdGlwbGUsIGV2ZXJ5IERPTSBzaG91bGQgaGF2ZSB0aGUgY2xhc3NcclxuXHRcdFx0aSA9IDBcclxuXHRcdFx0d2hpbGUgaSA8IEBsZW5ndGhcclxuXHRcdFx0XHRjbGFzc1RleHQgPSBAW2ldLmdldEF0dHJpYnV0ZSAnY2xhc3MnIG9yICcnXHJcblx0XHRcdFx0IyBub3QgdXNlICcgJyB0byBhdm9pZCBtdWx0aXBsZSBzcGFjZXMgbGlrZSAnYSAgIGInXHJcblx0XHRcdFx0Y2xhc3NlcyA9IGNsYXNzVGV4dC5zcGxpdCBSZWdFeHAgJyArJ1xyXG5cdFx0XHRcdGlmICFjbGFzc2VzLmNvbnRhaW5zIG5hbWVcclxuXHRcdFx0XHRcdHJldHVybiBmYWxzZVxyXG5cdFx0XHRcdGkrK1xyXG5cdFx0XHRAXHJcblxyXG5cdFx0QGFkZENsYXNzID0gKG5hbWUpID0+XHJcblx0XHRcdEBlYWNoIChkb20pIC0+XHJcblx0XHRcdFx0Y2xhc3NUZXh0ID0gZG9tLmdldEF0dHJpYnV0ZSAnY2xhc3MnIG9yICcnXHJcblx0XHRcdFx0Y2xhc3NlcyA9IGNsYXNzVGV4dC5zcGxpdCBSZWdFeHAgJyArJ1xyXG5cdFx0XHRcdGlmIG5vdCBjbGFzc2VzLmNvbnRhaW5zIG5hbWVcclxuXHRcdFx0XHRcdGNsYXNzZXMucHVzaCBuYW1lXHJcblx0XHRcdFx0XHRkb20uc2V0QXR0cmlidXRlICdjbGFzcycsIGNsYXNzZXMuam9pbiAnICdcclxuXHRcdFx0QFxyXG5cclxuXHRcdEByZW1vdmVDbGFzcyA9IChuYW1lKSA9PlxyXG5cdFx0XHRAZWFjaCAoZG9tKSAtPlxyXG5cdFx0XHRcdGNsYXNzVGV4dCA9IGRvbS5nZXRBdHRyaWJ1dGUoJ2NsYXNzJykgb3IgJydcclxuXHRcdFx0XHRjbGFzc2VzID0gY2xhc3NUZXh0LnNwbGl0IFJlZ0V4cCAnICsnXHJcblx0XHRcdFx0aWYgY2xhc3Nlcy5jb250YWlucyBuYW1lXHJcblx0XHRcdFx0XHRjbGFzc2VzLnJlbW92ZSBuYW1lXHJcblx0XHRcdFx0XHRpZiBjbGFzc2VzLmxlbmd0aCA+IDBcclxuXHRcdFx0XHRcdFx0ZG9tLnNldEF0dHJpYnV0ZSAnY2xhc3MnLCBjbGFzc2VzLmpvaW4gJyAnXHJcblx0XHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRcdGRvbS5yZW1vdmVBdHRyaWJ1dGUgJ2NsYXNzJ1xyXG5cdFx0XHRAXHJcblxyXG5cdFx0QHRvZ2dsZUNsYXNzID0gKG5hbWUpID0+XHJcblx0XHRcdEBlYWNoIChkb20pIC0+XHJcblx0XHRcdFx0Y2xhc3NUZXh0ID0gZG9tLmdldEF0dHJpYnV0ZSAnY2xhc3MnIG9yICcnXHJcblx0XHRcdFx0Y2xhc3NlcyA9IGNsYXNzVGV4dC5zcGxpdCBSZWdFeHAgJyArJ1xyXG5cdFx0XHRcdGlmIGNsYXNzZXMuY29udGFpbnMgbmFtZVxyXG5cdFx0XHRcdFx0Y2xhc3Nlcy5yZW1vdmUgbmFtZVxyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdGNsYXNzZXMucHVzaCBuYW1lXHJcblx0XHRcdFx0aWYgY2xhc3Nlcy5sZW5ndGggPiAwXHJcblx0XHRcdFx0XHRkb20uc2V0QXR0cmlidXRlICdjbGFzcycsIGNsYXNzZXMuam9pbiAnICdcclxuXHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRkb20ucmVtb3ZlQXR0cmlidXRlICdjbGFzcydcclxuXHRcdFx0QFxyXG5cclxuXHRcdEBhdHRyID0gKG5hbWUsIHZhbHVlKSA9PlxyXG5cdFx0XHRpZiB2YWx1ZT9cclxuXHRcdFx0XHRAZWFjaCAoZG9tKSAtPiBkb20uc2V0QXR0cmlidXRlIG5hbWUsIHZhbHVlXHJcblx0XHRcdFx0cmV0dXJuIEBcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdHJldHVybiBAWzBdLmdldEF0dHJpYnV0ZSBuYW1lXHJcblxyXG5cdFx0QGhhc0F0dHIgPSAobmFtZSkgPT5cclxuXHRcdFx0aWYgQGxlbmd0aCA9PSAwXHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlXHJcblx0XHRcdGkgPSAwXHJcblx0XHRcdHdoaWxlIGkgPCBAbGVuZ3RoXHJcblx0XHRcdFx0aWYgbm90IEBbaV0uaGFzQXR0cmlidXRlIG5hbWVcclxuXHRcdFx0XHRcdHJldHVybiBmYWxzZVxyXG5cdFx0XHRcdGkrK1xyXG5cdFx0XHRAXHJcblxyXG5cdFx0QHJlbW92ZUF0dHIgPSAobmFtZSkgPT5cclxuXHRcdFx0QGVhY2ggKGRvbSkgLT5cclxuXHRcdFx0XHRkb20ucmVtb3ZlQXR0cmlidXRlIG5hbWVcclxuXHRcdFx0QFxyXG5cclxuXHRcdEB2YWwgPSA9PiBAWzBdPy52YWx1ZVxyXG5cclxuXHQjICQucmVhZHkoKVxyXG5cdGdsb2JhbC4kLnJlYWR5ID0gKG9uTG9hZCkgLT5cclxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ0RPTUNvbnRlbnRMb2FkZWQnLCBvbkxvYWRcclxuXHJcblx0IyMjICQuYWpheCgpXHJcblx0XHRvcHRpb25zOlxyXG5cdFx0XHR1cmw6IHN0cmluZ1xyXG5cdFx0XHQ9PT09XHJcblx0XHRcdGFzeW5jID0gdHJ1ZTogYm9vbFxyXG5cdFx0XHQjIyBkYXRhOiBvYmplY3QgLSBxdWVyeSBwYXJhbWV0ZXJzIFRPRE86IGltcGxlbWVudCB0aGlzXHJcblx0XHRcdG1ldGhvZCA9IEdFVDogUE9TVCwgUFVULCBERUxFVEUsIEhFQURcclxuXHRcdFx0dXNlcm5hbWU6IHN0cmluZ1xyXG5cdFx0XHRwYXNzd29yZDogc3RyaW5nXHJcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uXHJcblx0XHRcdGVycm9yOiBmdW5jdGlvblxyXG5cdFx0XHRjb21wbGV0ZTogZnVuY3Rpb25cclxuXHQjIyNcclxuXHRnbG9iYWwuJC5hamF4ID0gKHVybCwgb3BzKSAtPlxyXG5cdFx0aWYgIW9wc1xyXG5cdFx0XHRpZiB0eXBlb2YgdXJsID09ICdvYmplY3QnXHJcblx0XHRcdFx0b3BzID0gdXJsXHJcblx0XHRcdFx0dXJsID0gb3BzLnVybFxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0b3BzID0ge31cclxuXHRcdG9wcy5tZXRob2Qgb3I9ICdHRVQnXHJcblx0XHRvcHMuYXN5bmMgPSB0cnVlIHVubGVzcyBvcHMuYXN5bmM/XHJcblxyXG5cdFx0eGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0XHJcblx0XHR4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cclxuXHRcdFx0aWYgeGhyLnJlYWR5U3RhdGUgPT0gNFxyXG5cdFx0XHRcdGlmIHhoci5zdGF0dXMgPT0gMjAwXHJcblx0XHRcdFx0XHRvcHMuc3VjY2VzcyB4aHIucmVzcG9uc2VUZXh0LCB4aHIuc3RhdHVzLCB4aHIgaWYgb3BzLnN1Y2Nlc3M/XHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0b3BzLmVycm9yIHhociwgeGhyLnN0YXR1cyBpZiBvcHMuZXJyb3I/XHJcblx0XHRcdFx0XHRvcHMuY29tcGxldGUgeGhyLCB4aHIuc3RhdHVzIGlmIG9wcy5jb21wbGV0ZT9cclxuXHJcblx0XHR4aHIub3BlbiBvcHMubWV0aG9kLCB1cmwsIG9wcy5hc3luYywgb3BzLnVzZXJuYW1lLCBvcHMucGFzc3dvcmRcclxuXHRcdHhoci5zZW5kIG51bGwpIEJ1Lmdsb2JhbFxyXG4iLCIjIGhpZXJhcmNoeSBtYW5hZ2VcclxuXHJcbmNsYXNzIEJ1Lk9iamVjdDJEXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoKSAtPlxyXG5cdFx0QnUuQ29sb3JmdWwuYXBwbHkgQFxyXG5cdFx0QnUuRXZlbnQuYXBwbHkgQFxyXG5cclxuXHRcdEB2aXNpYmxlID0geWVzXHJcblx0XHRAb3BhY2l0eSA9IDFcclxuXHJcblx0XHRAdHJhbnNsYXRlID0gbmV3IEJ1LlZlY3RvclxyXG5cdFx0QHJvdGF0aW9uID0gMFxyXG5cdFx0QF9zY2FsZSA9IG5ldyBCdS5WZWN0b3IgMSwgMVxyXG5cdFx0QHNrZXcgPSBuZXcgQnUuVmVjdG9yXHJcblxyXG5cdFx0I0B0b1dvcmxkTWF0cml4ID0gbmV3IEJ1Lk1hdHJpeCgpXHJcblx0XHQjQHVwZGF0ZU1hdHJpeCAtPlxyXG5cclxuXHRcdEBib3VuZHMgPSBudWxsICMgZm9yIGFjY2VsZXJhdGUgY29udGFpbiB0ZXN0XHJcblx0XHRAa2V5UG9pbnRzID0gbnVsbFxyXG5cdFx0QGNoaWxkcmVuID0gW11cclxuXHRcdEBwYXJlbnQgPSBudWxsXHJcblxyXG5cdEBwcm9wZXJ0eSAnc2NhbGUnLFxyXG5cdFx0Z2V0OiAtPiBAX3NjYWxlXHJcblx0XHRzZXQ6ICh2YWwpIC0+XHJcblx0XHRcdGlmIHR5cGVvZiB2YWwgPT0gJ251bWJlcidcclxuXHRcdFx0XHRAX3NjYWxlLnggPSBAX3NjYWxlLnkgPSB2YWxcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdEBzY2FsZSA9IHZhbFxyXG5cclxuXHRhbmltYXRlOiAoYW5pbSwgYXJncykgLT5cclxuXHRcdGlmIHR5cGVvZiBhbmltID09ICdzdHJpbmcnXHJcblx0XHRcdGlmIGFuaW0gb2YgQnUuYW5pbWF0aW9uc1xyXG5cdFx0XHRcdEJ1LmFuaW1hdGlvbnNbYW5pbV0uYXBwbHkgQCwgYXJnc1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0Y29uc29sZS53YXJuIFwiQnUuYW5pbWF0aW9uc1tcXFwiI3sgYW5pbSB9XFxcIl0gZG9lc24ndCBleGlzdHMuXCJcclxuXHRcdGVsc2UgaWYgYW5pbSBpbnN0YW5jZW9mIEFycmF5XHJcblx0XHRcdGFyZ3MgPSBbYXJnc10gdW5sZXNzIGFyZ3MgaW5zdGFuY2VvZiBBcnJheVxyXG5cdFx0XHRAYW5pbWF0ZSBhbmltW2ldLCBhcmdzIGZvciBvd24gaSBvZiBhbmltXHJcblx0XHRlbHNlXHJcblx0XHRcdGFuaW0uYXBwbHkgQCwgYXJnc1xyXG5cclxuXHRjb250YWluc1BvaW50OiAocCkgLT5cclxuXHRcdGlmIEBib3VuZHM/IGFuZCBub3QgQGJvdW5kcy5jb250YWluc1BvaW50IHBcclxuXHRcdFx0cmV0dXJuIG5vXHJcblx0XHRlbHNlIGlmIEBfY29udGFpbnNQb2ludFxyXG5cdFx0XHRyZXR1cm4gQF9jb250YWluc1BvaW50IHBcclxuXHRcdGVsc2VcclxuXHRcdFx0cmV0dXJuIG5vXHJcbiIsIiMgY2FudmFzIHJlbmRlcmVyXHJcblxyXG5jbGFzcyBCdS5SZW5kZXJlclxyXG5cclxuXHRjb25zdHJ1Y3RvcjogKCkgLT5cclxuXHRcdEJ1LkV2ZW50LmFwcGx5IEBcclxuXHRcdEB0eXBlID0gJ1JlbmRlcmVyJ1xyXG5cclxuXHRcdG9wdGlvbnMgPSBCdS5jb21iaW5lT3B0aW9ucyBhcmd1bWVudHMsXHJcblx0XHRcdHdpZHRoOiA4MDBcclxuXHRcdFx0aGVpZ2h0OiA2MDBcclxuXHRcdFx0ZnBzOiA2MFxyXG5cdFx0XHRmaWxsUGFyZW50OiBvZmZcclxuXHRcdFx0c2hvd0tleVBvaW50czogbm9cclxuXHRcdFx0Ym9yZGVyOiBvZmZcclxuXHRcdEB3aWR0aCA9IG9wdGlvbnMud2lkdGhcclxuXHRcdEBoZWlnaHQgPSBvcHRpb25zLmhlaWdodFxyXG5cdFx0QGZwcyA9IG9wdGlvbnMuZnBzXHJcblx0XHRAY29udGFpbmVyID0gb3B0aW9ucy5jb250YWluZXJcclxuXHRcdEBmaWxsUGFyZW50ID0gb3B0aW9ucy5maWxsUGFyZW50XHJcblx0XHRAaXNTaG93S2V5UG9pbnRzID0gb3B0aW9ucy5zaG93S2V5UG9pbnRzXHJcblxyXG5cdFx0QHRpY2tDb3VudCA9IDBcclxuXHRcdEBpc1J1bm5pbmcgPSBub1xyXG5cclxuXHRcdEBwaXhlbFJhdGlvID0gQnUuZ2xvYmFsLmRldmljZVBpeGVsUmF0aW8gb3IgMVxyXG5cclxuXHRcdEBkb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICdjYW52YXMnXHJcblx0XHRAY29udGV4dCA9IEBkb20uZ2V0Q29udGV4dCAnMmQnXHJcblx0XHRAY29udGV4dC50ZXh0QmFzZWxpbmUgPSAndG9wJ1xyXG5cdFx0QGNsaXBNZXRlciA9IG5ldyBDbGlwTWV0ZXIoKSBpZiBDbGlwTWV0ZXI/XHJcblxyXG5cdFx0IyBBUElcclxuXHRcdEBzaGFwZXMgPSBbXVxyXG5cclxuXHRcdGlmIG5vdCBAZmlsbFBhcmVudFxyXG5cdFx0XHRAZG9tLnN0eWxlLndpZHRoID0gQHdpZHRoICsgJ3B4J1xyXG5cdFx0XHRAZG9tLnN0eWxlLmhlaWdodCA9IEBoZWlnaHQgKyAncHgnXHJcblx0XHRcdEBkb20ud2lkdGggPSBAd2lkdGggKiBAcGl4ZWxSYXRpb1xyXG5cdFx0XHRAZG9tLmhlaWdodCA9IEBoZWlnaHQgKiBAcGl4ZWxSYXRpb1xyXG5cdFx0QGRvbS5zdHlsZS5ib3JkZXIgPSAnc29saWQgMXB4IGdyYXknIGlmIG9wdGlvbnMuYm9yZGVyPyBhbmQgb3B0aW9ucy5ib3JkZXJcclxuXHRcdEBkb20uc3R5bGUuY3Vyc29yID0gJ2Nyb3NzaGFpcidcclxuXHRcdEBkb20uc3R5bGUuYm94U2l6aW5nID0gJ2NvbnRlbnQtYm94J1xyXG5cdFx0QGRvbS5zdHlsZS5iYWNrZ3JvdW5kID0gJyNlZWUnXHJcblx0XHRAZG9tLm9uY29udGV4dG1lbnUgPSAtPiBmYWxzZVxyXG5cclxuXHRcdEJ1LmFuaW1hdGlvblJ1bm5lcj8uaG9va1VwIEBcclxuXHJcblx0XHRvblJlc2l6ZSA9ID0+XHJcblx0XHRcdGNhbnZhc1JhdGlvID0gQGRvbS5oZWlnaHQgLyBAZG9tLndpZHRoXHJcblx0XHRcdGNvbnRhaW5lclJhdGlvID0gQGNvbnRhaW5lci5jbGllbnRIZWlnaHQgLyBAY29udGFpbmVyLmNsaWVudFdpZHRoXHJcblx0XHRcdGlmIGNvbnRhaW5lclJhdGlvIDwgY2FudmFzUmF0aW9cclxuXHRcdFx0XHRoZWlnaHQgPSBAY29udGFpbmVyLmNsaWVudEhlaWdodFxyXG5cdFx0XHRcdHdpZHRoID0gaGVpZ2h0IC8gY29udGFpbmVyUmF0aW9cclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdHdpZHRoID0gQGNvbnRhaW5lci5jbGllbnRXaWR0aFxyXG5cdFx0XHRcdGhlaWdodCA9IHdpZHRoICogY29udGFpbmVyUmF0aW9cclxuXHRcdFx0QHdpZHRoID0gQGRvbS53aWR0aCA9IHdpZHRoICogQHBpeGVsUmF0aW9cclxuXHRcdFx0QGhlaWdodCA9IEBkb20uaGVpZ2h0ID0gaGVpZ2h0ICogQHBpeGVsUmF0aW9cclxuXHRcdFx0QGRvbS5zdHlsZS53aWR0aCA9IHdpZHRoICsgJ3B4J1xyXG5cdFx0XHRAZG9tLnN0eWxlLmhlaWdodCA9IGhlaWdodCArICdweCdcclxuXHRcdFx0QHJlbmRlcigpXHJcblxyXG5cdFx0aWYgQGZpbGxQYXJlbnRcclxuXHRcdFx0QnUuZ2xvYmFsLndpbmRvdy5hZGRFdmVudExpc3RlbmVyICdyZXNpemUnLCBvblJlc2l6ZVxyXG5cdFx0XHRAZG9tLmFkZEV2ZW50TGlzdGVuZXIgJ0RPTU5vZGVJbnNlcnRlZCcsIG9uUmVzaXplXHJcblxyXG5cclxuXHRcdHRpY2sgPSA9PlxyXG5cdFx0XHRpZiBAaXNSdW5uaW5nXHJcblx0XHRcdFx0QGNsaXBNZXRlci5zdGFydCgpIGlmIEBjbGlwTWV0ZXI/XHJcblx0XHRcdFx0QHJlbmRlcigpXHJcblx0XHRcdFx0QHRyaWdnZXIgJ3VwZGF0ZScsIHsndGlja0NvdW50JzogQHRpY2tDb3VudH1cclxuXHRcdFx0XHRAdGlja0NvdW50ICs9IDFcclxuXHRcdFx0XHRAY2xpcE1ldGVyLnRpY2soKSBpZiBAY2xpcE1ldGVyP1xyXG5cclxuXHRcdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lIHRpY2tcclxuXHJcblx0XHR0aWNrKClcclxuXHJcblx0XHQjIGluaXRcclxuXHRcdGlmIEBjb250YWluZXI/XHJcblx0XHRcdEBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yIEBjb250YWluZXIgaWYgdHlwZW9mIEBjb250YWluZXIgaXMgJ3N0cmluZydcclxuXHRcdFx0c2V0VGltZW91dCA9PlxyXG5cdFx0XHRcdEBjb250YWluZXIuYXBwZW5kQ2hpbGQgQGRvbVxyXG5cdFx0XHQsIDEwMFxyXG5cdFx0QGlzUnVubmluZyA9IHRydWVcclxuXHJcblxyXG5cdHBhdXNlOiAtPlxyXG5cdFx0QGlzUnVubmluZyA9IGZhbHNlXHJcblxyXG5cdGNvbnRpbnVlOiAtPlxyXG5cdFx0QGlzUnVubmluZyA9IHRydWVcclxuXHJcblx0dG9nZ2xlOiAtPlxyXG5cdFx0QGlzUnVubmluZyA9IG5vdCBAaXNSdW5uaW5nXHJcblxyXG4jXHRwcm9jZXNzQXJnczogKGUpIC0+XHJcbiNcdFx0b2Zmc2V0WDogZS5vZmZzZXRYICogQHBpeGVsUmF0aW9cclxuI1x0XHRvZmZzZXRZOiBlLm9mZnNldFkgKiBAcGl4ZWxSYXRpb1xyXG4jXHRcdGJ1dHRvbjogZS5idXR0b25cclxuXHJcblx0YXBwZW5kOiAoc2hhcGUpIC0+XHJcblx0XHRpZiBzaGFwZSBpbnN0YW5jZW9mIEFycmF5XHJcblx0XHRcdEBzaGFwZXMucHVzaCBzIGZvciBzIGluIHNoYXBlXHJcblx0XHRlbHNlXHJcblx0XHRcdEBzaGFwZXMucHVzaCBzaGFwZVxyXG5cdFx0QFxyXG5cclxuXHJcblx0cmVuZGVyOiAtPlxyXG5cdFx0QGNvbnRleHQuc2F2ZSgpXHJcblx0XHRAY29udGV4dC5zY2FsZSBAcGl4ZWxSYXRpbywgQHBpeGVsUmF0aW9cclxuXHRcdEBjbGVhckNhbnZhcygpXHJcblx0XHRAZHJhd1NoYXBlcyBAc2hhcGVzXHJcblx0XHRAY29udGV4dC5yZXN0b3JlKClcclxuXHRcdEBcclxuXHJcblx0Y2xlYXJDYW52YXM6IC0+XHJcblx0XHRAY29udGV4dC5jbGVhclJlY3QgMCwgMCwgQHdpZHRoLCBAaGVpZ2h0XHJcblx0XHRAXHJcblxyXG5cdGRyYXdTaGFwZXM6IChzaGFwZXMpID0+XHJcblx0XHRpZiBzaGFwZXM/XHJcblx0XHRcdGZvciBzaGFwZSBpbiBzaGFwZXNcclxuXHRcdFx0XHRAY29udGV4dC5zYXZlKClcclxuXHRcdFx0XHRAZHJhd1NoYXBlIHNoYXBlXHJcblx0XHRcdFx0QGNvbnRleHQucmVzdG9yZSgpXHJcblx0XHRAXHJcblxyXG5cdGRyYXdTaGFwZTogKHNoYXBlKSA9PlxyXG5cdFx0cmV0dXJuIEAgdW5sZXNzIHNoYXBlLnZpc2libGVcclxuXHJcblx0XHRAY29udGV4dC50cmFuc2xhdGUgc2hhcGUudHJhbnNsYXRlLngsIHNoYXBlLnRyYW5zbGF0ZS55XHJcblx0XHRAY29udGV4dC5yb3RhdGUgc2hhcGUucm90YXRpb25cclxuXHRcdHN4ID0gc2hhcGUuc2NhbGUueFxyXG5cdFx0c3kgPSBzaGFwZS5zY2FsZS55XHJcblx0XHRpZiBzeCAvIHN5ID4gMTAwIG9yIHN4IC8gc3kgPCAwLjAxXHJcblx0XHRcdHN4ID0gMCBpZiBNYXRoLmFicyhzeCkgPCAwLjAyXHJcblx0XHRcdHN5ID0gMCBpZiBNYXRoLmFicyhzeSkgPCAwLjAyXHJcblx0XHRAY29udGV4dC5zY2FsZSBzeCwgc3lcclxuXHJcblx0XHRAY29udGV4dC5nbG9iYWxBbHBoYSAqPSBzaGFwZS5vcGFjaXR5XHJcblx0XHRpZiBzaGFwZS5zdHJva2VTdHlsZT9cclxuXHRcdFx0QGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBzaGFwZS5zdHJva2VTdHlsZVxyXG5cdFx0XHRAY29udGV4dC5saW5lV2lkdGggPSBzaGFwZS5saW5lV2lkdGhcclxuXHRcdFx0QGNvbnRleHQubGluZUNhcCA9IHNoYXBlLmxpbmVDYXAgaWYgc2hhcGUubGluZUNhcD9cclxuXHRcdFx0QGNvbnRleHQubGluZUpvaW4gPSBzaGFwZS5saW5lSm9pbiBpZiBzaGFwZS5saW5lSm9pbj9cclxuXHJcblx0XHRAY29udGV4dC5iZWdpblBhdGgoKVxyXG5cclxuXHRcdHN3aXRjaCBzaGFwZS50eXBlXHJcblx0XHRcdHdoZW4gJ1BvaW50JyB0aGVuIEBkcmF3UG9pbnQgc2hhcGVcclxuXHRcdFx0d2hlbiAnTGluZScgdGhlbiBAZHJhd0xpbmUgc2hhcGVcclxuXHRcdFx0d2hlbiAnQ2lyY2xlJyB0aGVuIEBkcmF3Q2lyY2xlIHNoYXBlXHJcblx0XHRcdHdoZW4gJ1RyaWFuZ2xlJyB0aGVuIEBkcmF3VHJpYW5nbGUgc2hhcGVcclxuXHRcdFx0d2hlbiAnUmVjdGFuZ2xlJyB0aGVuIEBkcmF3UmVjdGFuZ2xlIHNoYXBlXHJcblx0XHRcdHdoZW4gJ0ZhbicgdGhlbiBAZHJhd0ZhbiBzaGFwZVxyXG5cdFx0XHR3aGVuICdCb3cnIHRoZW4gQGRyYXdCb3cgc2hhcGVcclxuXHRcdFx0d2hlbiAnUG9seWdvbicgdGhlbiBAZHJhd1BvbHlnb24gc2hhcGVcclxuXHRcdFx0d2hlbiAnUG9seWxpbmUnIHRoZW4gQGRyYXdQb2x5bGluZSBzaGFwZVxyXG5cdFx0XHR3aGVuICdTcGxpbmUnIHRoZW4gQGRyYXdTcGxpbmUgc2hhcGVcclxuXHRcdFx0d2hlbiAnUG9pbnRUZXh0JyB0aGVuIEBkcmF3UG9pbnRUZXh0IHNoYXBlXHJcblx0XHRcdHdoZW4gJ0ltYWdlJyB0aGVuIEBkcmF3SW1hZ2Ugc2hhcGVcclxuXHRcdFx0d2hlbiAnQm91bmRzJyB0aGVuIEBkcmF3Qm91bmRzIHNoYXBlXHJcblx0XHRcdGVsc2UgY29uc29sZS5sb2cgJ2RyYXdTaGFwZXMoKTogdW5rbm93biBzaGFwZTogJywgc2hhcGVcclxuXHJcblxyXG5cdFx0aWYgc2hhcGUuZmlsbFN0eWxlP1xyXG5cdFx0XHRAY29udGV4dC5maWxsU3R5bGUgPSBzaGFwZS5maWxsU3R5bGVcclxuXHRcdFx0QGNvbnRleHQuZmlsbCgpXHJcblxyXG5cdFx0aWYgc2hhcGUuZGFzaFN0eWxlIyBhbmQgKHNoYXBlLnR5cGUgPT0gJ1NwbGluZScgb3Igc2hhcGUudHlwZSA9PSAnUmVjdGFuZ2xlJyBhbmQgc2hhcGUuY29ybmVyUmFkaXVzID4gMClcclxuXHRcdFx0QGNvbnRleHQubGluZURhc2hPZmZzZXQgPSBzaGFwZS5kYXNoT2Zmc2V0XHJcblx0XHRcdEBjb250ZXh0LnNldExpbmVEYXNoPyBzaGFwZS5kYXNoU3R5bGVcclxuXHRcdFx0QGNvbnRleHQuc3Ryb2tlKClcclxuXHRcdFx0QGNvbnRleHQuc2V0TGluZURhc2ggW11cclxuXHRcdGVsc2UgaWYgc2hhcGUuc3Ryb2tlU3R5bGU/XHJcblx0XHRcdEBjb250ZXh0LnN0cm9rZSgpXHJcblxyXG5cdFx0QGRyYXdTaGFwZXMgc2hhcGUuY2hpbGRyZW4gaWYgc2hhcGUuY2hpbGRyZW4/XHJcblx0XHRAZHJhd1NoYXBlcyBzaGFwZS5rZXlQb2ludHMgaWYgQGlzU2hvd0tleVBvaW50c1xyXG5cdFx0QFxyXG5cclxuXHJcblx0ZHJhd1BvaW50OiAoc2hhcGUpIC0+XHJcblx0XHRAY29udGV4dC5hcmMgc2hhcGUueCwgc2hhcGUueSwgQnUuUE9JTlRfUkVOREVSX1NJWkUsIDAsIE1hdGguUEkgKiAyXHJcblx0XHRAXHJcblxyXG5cclxuXHRkcmF3TGluZTogKHNoYXBlKSAtPlxyXG5cdFx0QGNvbnRleHQubW92ZVRvIHNoYXBlLnBvaW50c1swXS54LCBzaGFwZS5wb2ludHNbMF0ueVxyXG5cdFx0QGNvbnRleHQubGluZVRvIHNoYXBlLnBvaW50c1sxXS54LCBzaGFwZS5wb2ludHNbMV0ueVxyXG5cdFx0QFxyXG5cclxuXHJcblx0ZHJhd0NpcmNsZTogKHNoYXBlKSAtPlxyXG5cdFx0QGNvbnRleHQuYXJjIHNoYXBlLmN4LCBzaGFwZS5jeSwgc2hhcGUucmFkaXVzLCAwLCBNYXRoLlBJICogMlxyXG5cdFx0QFxyXG5cclxuXHJcblx0ZHJhd1RyaWFuZ2xlOiAoc2hhcGUpIC0+XHJcblx0XHRAY29udGV4dC5saW5lVG8gc2hhcGUucG9pbnRzWzBdLngsIHNoYXBlLnBvaW50c1swXS55XHJcblx0XHRAY29udGV4dC5saW5lVG8gc2hhcGUucG9pbnRzWzFdLngsIHNoYXBlLnBvaW50c1sxXS55XHJcblx0XHRAY29udGV4dC5saW5lVG8gc2hhcGUucG9pbnRzWzJdLngsIHNoYXBlLnBvaW50c1syXS55XHJcblx0XHRAY29udGV4dC5jbG9zZVBhdGgoKVxyXG5cdFx0QFxyXG5cclxuXHJcblx0ZHJhd1JlY3RhbmdsZTogKHNoYXBlKSAtPlxyXG5cdFx0cmV0dXJuIEBkcmF3Um91bmRSZWN0YW5nbGUgc2hhcGUgaWYgc2hhcGUuY29ybmVyUmFkaXVzICE9IDBcclxuXHRcdEBjb250ZXh0LnJlY3Qgc2hhcGUucG9zaXRpb24ueCwgc2hhcGUucG9zaXRpb24ueSwgc2hhcGUuc2l6ZS53aWR0aCwgc2hhcGUuc2l6ZS5oZWlnaHRcclxuXHRcdEBcclxuXHJcblxyXG5cdGRyYXdSb3VuZFJlY3RhbmdsZTogKHNoYXBlKSAtPlxyXG5cdFx0eDEgPSBzaGFwZS5wb3NpdGlvbi54XHJcblx0XHR4MiA9IHNoYXBlLnBvaW50UkIueFxyXG5cdFx0eTEgPSBzaGFwZS5wb3NpdGlvbi55XHJcblx0XHR5MiA9IHNoYXBlLnBvaW50UkIueVxyXG5cdFx0ciA9IHNoYXBlLmNvcm5lclJhZGl1c1xyXG5cclxuXHRcdEBjb250ZXh0Lm1vdmVUbyB4MSwgeTEgKyByXHJcblx0XHRAY29udGV4dC5hcmNUbyB4MSwgeTEsIHgxICsgciwgeTEsIHJcclxuXHRcdEBjb250ZXh0LmxpbmVUbyB4MiAtIHIsIHkxXHJcblx0XHRAY29udGV4dC5hcmNUbyB4MiwgeTEsIHgyLCB5MSArIHIsIHJcclxuXHRcdEBjb250ZXh0LmxpbmVUbyB4MiwgeTIgLSByXHJcblx0XHRAY29udGV4dC5hcmNUbyB4MiwgeTIsIHgyIC0gciwgeTIsIHJcclxuXHRcdEBjb250ZXh0LmxpbmVUbyB4MSArIHIsIHkyXHJcblx0XHRAY29udGV4dC5hcmNUbyB4MSwgeTIsIHgxLCB5MiAtIHIsIHJcclxuXHRcdEBjb250ZXh0LmNsb3NlUGF0aCgpXHJcblxyXG5cdFx0QGNvbnRleHQuc2V0TGluZURhc2g/IHNoYXBlLmRhc2hTdHlsZSBpZiBzaGFwZS5zdHJva2VTdHlsZT8gYW5kIHNoYXBlLmRhc2hTdHlsZVxyXG5cdFx0QFxyXG5cclxuXHJcblx0ZHJhd0ZhbjogKHNoYXBlKSAtPlxyXG5cdFx0QGNvbnRleHQuYXJjIHNoYXBlLmN4LCBzaGFwZS5jeSwgc2hhcGUucmFkaXVzLCBzaGFwZS5hRnJvbSwgc2hhcGUuYVRvXHJcblx0XHRAY29udGV4dC5saW5lVG8gc2hhcGUuY3gsIHNoYXBlLmN5XHJcblx0XHRAY29udGV4dC5jbG9zZVBhdGgoKVxyXG5cdFx0QFxyXG5cclxuXHJcblx0ZHJhd0JvdzogKHNoYXBlKSAtPlxyXG5cdFx0QGNvbnRleHQuYXJjIHNoYXBlLmN4LCBzaGFwZS5jeSwgc2hhcGUucmFkaXVzLCBzaGFwZS5hRnJvbSwgc2hhcGUuYVRvXHJcblx0XHRAY29udGV4dC5jbG9zZVBhdGgoKVxyXG5cdFx0QFxyXG5cclxuXHJcblx0ZHJhd1BvbHlnb246IChzaGFwZSkgLT5cclxuXHRcdGZvciBwb2ludCBpbiBzaGFwZS52ZXJ0aWNlc1xyXG5cdFx0XHRAY29udGV4dC5saW5lVG8gcG9pbnQueCwgcG9pbnQueVxyXG5cdFx0QGNvbnRleHQuY2xvc2VQYXRoKClcclxuXHRcdEBcclxuXHJcblxyXG5cdGRyYXdQb2x5bGluZTogKHNoYXBlKSAtPlxyXG5cdFx0Zm9yIHBvaW50IGluIHNoYXBlLnZlcnRpY2VzXHJcblx0XHRcdEBjb250ZXh0LmxpbmVUbyBwb2ludC54LCBwb2ludC55XHJcblx0XHRAXHJcblxyXG5cclxuXHRkcmF3U3BsaW5lOiAoc2hhcGUpIC0+XHJcblx0XHRpZiBzaGFwZS5zdHJva2VTdHlsZT9cclxuXHRcdFx0bGVuID0gc2hhcGUudmVydGljZXMubGVuZ3RoXHJcblx0XHRcdGlmIGxlbiA9PSAyXHJcblx0XHRcdFx0QGNvbnRleHQubW92ZVRvIHNoYXBlLnZlcnRpY2VzWzBdLngsIHNoYXBlLnZlcnRpY2VzWzBdLnlcclxuXHRcdFx0XHRAY29udGV4dC5saW5lVG8gc2hhcGUudmVydGljZXNbMV0ueCwgc2hhcGUudmVydGljZXNbMV0ueVxyXG5cdFx0XHRlbHNlIGlmIGxlbiA+IDJcclxuXHRcdFx0XHRAY29udGV4dC5tb3ZlVG8gc2hhcGUudmVydGljZXNbMF0ueCwgc2hhcGUudmVydGljZXNbMF0ueVxyXG5cdFx0XHRcdGZvciBpIGluIFsxLi5sZW4gLSAxXVxyXG5cdFx0XHRcdFx0QGNvbnRleHQuYmV6aWVyQ3VydmVUbyhcclxuXHRcdFx0XHRcdFx0c2hhcGUuY29udHJvbFBvaW50c0JlaGluZFtpIC0gMV0ueCxcclxuXHRcdFx0XHRcdFx0c2hhcGUuY29udHJvbFBvaW50c0JlaGluZFtpIC0gMV0ueSxcclxuXHRcdFx0XHRcdFx0c2hhcGUuY29udHJvbFBvaW50c0FoZWFkW2ldLngsXHJcblx0XHRcdFx0XHRcdHNoYXBlLmNvbnRyb2xQb2ludHNBaGVhZFtpXS55LFxyXG5cdFx0XHRcdFx0XHRzaGFwZS52ZXJ0aWNlc1tpXS54LFxyXG5cdFx0XHRcdFx0XHRzaGFwZS52ZXJ0aWNlc1tpXS55XHJcblx0XHRcdFx0XHQpXHJcblx0XHRAXHJcblxyXG5cclxuXHRkcmF3UG9pbnRUZXh0OiAoc2hhcGUpIC0+XHJcblx0XHRAY29udGV4dC50ZXh0QWxpZ24gPSBzaGFwZS50ZXh0QWxpZ25cclxuXHRcdEBjb250ZXh0LnRleHRCYXNlbGluZSA9IHNoYXBlLnRleHRCYXNlbGluZVxyXG5cdFx0QGNvbnRleHQuZm9udCA9IHNoYXBlLmZvbnRcclxuXHJcblx0XHRpZiBzaGFwZS5zdHJva2VTdHlsZT9cclxuXHRcdFx0QGNvbnRleHQuc3Ryb2tlVGV4dCBzaGFwZS50ZXh0LCBzaGFwZS54LCBzaGFwZS55XHJcblx0XHRpZiBzaGFwZS5maWxsU3R5bGU/XHJcblx0XHRcdEBjb250ZXh0LmZpbGxTdHlsZSA9IHNoYXBlLmZpbGxTdHlsZVxyXG5cdFx0XHRAY29udGV4dC5maWxsVGV4dCBzaGFwZS50ZXh0LCBzaGFwZS54LCBzaGFwZS55XHJcblx0XHRAXHJcblxyXG5cclxuXHRkcmF3SW1hZ2U6IChzaGFwZSkgLT5cclxuXHRcdGlmIHNoYXBlLmxvYWRlZFxyXG5cdFx0XHR3ID0gc2hhcGUuc2l6ZS53aWR0aFxyXG5cdFx0XHRoID0gc2hhcGUuc2l6ZS5oZWlnaHRcclxuXHRcdFx0ZHggPSAtdyAqIHNoYXBlLnBpdm90LnhcclxuXHRcdFx0ZHkgPSAtaCAqIHNoYXBlLnBpdm90LnlcclxuXHRcdFx0QGNvbnRleHQuZHJhd0ltYWdlIHNoYXBlLmltYWdlLCBkeCwgZHksIHcsIGhcclxuXHRcdEBcclxuXHJcblxyXG5cdGRyYXdCb3VuZHM6IChib3VuZHMpIC0+XHJcblx0XHRAY29udGV4dC5yZWN0IGJvdW5kcy54MSwgYm91bmRzLnkxLCBib3VuZHMueDIgLSBib3VuZHMueDEsIGJvdW5kcy55MiAtIGJvdW5kcy55MVxyXG5cdFx0QFxyXG4iLCIjIEJvdyBzaGFwZVxyXG5cclxuY2xhc3MgQnUuQm93IGV4dGVuZHMgQnUuT2JqZWN0MkRcclxuXHJcblx0Y29uc3RydWN0b3I6IChAY3gsIEBjeSwgQHJhZGl1cywgQGFGcm9tLCBAYVRvKSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cdFx0QHR5cGUgPSAnQm93J1xyXG5cclxuXHRcdFtAYUZyb20sIEBhVG9dID0gW0BhVG8sIEBhRnJvbV0gaWYgQGFGcm9tID4gQGFUb1xyXG5cclxuXHRcdEBjZW50ZXIgPSBuZXcgQnUuUG9pbnQgQGN4LCBAY3lcclxuXHRcdEBzdHJpbmcgPSBuZXcgQnUuTGluZSBAY2VudGVyLmFyY1RvKEByYWRpdXMsIEBhRnJvbSksXHJcblx0XHRcdFx0QGNlbnRlci5hcmNUbyhAcmFkaXVzLCBAYVRvKVxyXG5cdFx0QGtleVBvaW50cyA9IEBzdHJpbmcucG9pbnRzXHJcblxyXG5cdGNsb25lOiAtPiBuZXcgQnUuQm93IEBjeCwgQGN5LCBAcmFkaXVzLCBAYUZyb20sIEBhVG9cclxuXHJcblx0X2NvbnRhaW5zUG9pbnQ6IChwb2ludCkgLT5cclxuXHRcdGlmIEJ1LmJldmVsKEBjeCAtIHBvaW50LngsIEBjeSAtIHBvaW50LnkpIDwgQHJhZGl1c1xyXG5cdFx0XHRzYW1lU2lkZSA9IEBzdHJpbmcuaXNUd29Qb2ludHNTYW1lU2lkZShAY2VudGVyLCBwb2ludClcclxuXHRcdFx0c21hbGxUaGFuSGFsZkNpcmNsZSA9IEBhVG8gLSBAYUZyb20gPCBNYXRoLlBJXHJcblx0XHRcdHJldHVybiBzYW1lU2lkZSBeIHNtYWxsVGhhbkhhbGZDaXJjbGVcclxuXHRcdGVsc2VcclxuXHRcdFx0cmV0dXJuIGZhbHNlXHJcbiIsIiMgQ2lyY2xlIHNoYXBlXHJcblxyXG5jbGFzcyBCdS5DaXJjbGUgZXh0ZW5kcyBCdS5PYmplY3QyRFxyXG5cclxuXHRjb25zdHJ1Y3RvcjogKGN4ID0gMCwgY3kgPSAwLCBAX3JhZGl1cyA9IDEpIC0+XHJcblx0XHRzdXBlcigpXHJcblx0XHRAdHlwZSA9ICdDaXJjbGUnXHJcblxyXG5cdFx0QF9jZW50ZXIgPSBuZXcgQnUuUG9pbnQoY3gsIGN5KVxyXG5cdFx0QGJvdW5kcyA9IG51bGwgIyBmb3IgYWNjZWxlcmF0ZSBjb250YWluIHRlc3RcclxuXHJcblx0XHRAa2V5UG9pbnRzID0gW0BfY2VudGVyXVxyXG5cclxuXHRjbG9uZTogKCkgLT4gbmV3IEJ1LkNpcmNsZSBAY3gsIEBjeSwgQHJhZGl1c1xyXG5cclxuXHQjIHByb3BlcnR5XHJcblxyXG5cdEBwcm9wZXJ0eSAnY3gnLFxyXG5cdFx0Z2V0OiAtPiBAX2NlbnRlci54XHJcblx0XHRzZXQ6ICh2YWwpIC0+XHJcblx0XHRcdEBfY2VudGVyLnggPSB2YWxcclxuXHRcdFx0QHRyaWdnZXIgJ2NlbnRlckNoYW5nZWQnLCBAXHJcblxyXG5cdEBwcm9wZXJ0eSAnY3knLFxyXG5cdFx0Z2V0OiAtPiBAX2NlbnRlci55XHJcblx0XHRzZXQ6ICh2YWwpIC0+XHJcblx0XHRcdEBfY2VudGVyLnkgPSB2YWxcclxuXHRcdFx0QHRyaWdnZXIgJ2NlbnRlckNoYW5nZWQnLCBAXHJcblxyXG5cdEBwcm9wZXJ0eSAnY2VudGVyJyxcclxuXHRcdGdldDogLT4gQF9jZW50ZXJcclxuXHRcdHNldDogKHZhbCkgLT5cclxuXHRcdFx0QF9jZW50ZXIgPSB2YWxcclxuXHRcdFx0QGN4ID0gdmFsLnhcclxuXHRcdFx0QGN5ID0gdmFsLnlcclxuXHRcdFx0QGtleVBvaW50c1swXSA9IHZhbFxyXG5cdFx0XHRAdHJpZ2dlciAnY2VudGVyQ2hhbmdlZCcsIEBcclxuXHJcblx0QHByb3BlcnR5ICdyYWRpdXMnLFxyXG5cdFx0Z2V0OiAtPiBAX3JhZGl1c1xyXG5cdFx0c2V0OiAodmFsKSAtPlxyXG5cdFx0XHRAX3JhZGl1cyA9IHZhbFxyXG5cdFx0XHRAdHJpZ2dlciAncmFkaXVzQ2hhbmdlZCcsIEBcclxuXHRcdFx0QFxyXG5cclxuXHQjIHBvaW50IHJlbGF0ZWRcclxuXHRfY29udGFpbnNQb2ludDogKHApIC0+XHJcblx0XHRkeCA9IHAueCAtIEBjeFxyXG5cdFx0ZHkgPSBwLnkgLSBAY3lcclxuXHRcdHJldHVybiBCdS5iZXZlbChkeCwgZHkpIDwgQHJhZGl1c1xyXG4iLCIjIEZhbiBzaGFwZVxyXG5cclxuY2xhc3MgQnUuRmFuIGV4dGVuZHMgQnUuT2JqZWN0MkRcclxuXHJcblx0Y29uc3RydWN0b3I6IChAY3gsIEBjeSwgQHJhZGl1cywgQGFGcm9tLCBAYVRvKSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cdFx0QHR5cGUgPSAnRmFuJ1xyXG5cclxuXHRcdEBjZW50ZXIgPSBuZXcgQnUuUG9pbnQgQGN4LCBAY3lcclxuXHRcdEBzdHJpbmcgPSBuZXcgQnUuTGluZShcclxuXHRcdFx0XHRAY2VudGVyLmFyY1RvIEByYWRpdXMsIEBhRnJvbVxyXG5cdFx0XHRcdEBjZW50ZXIuYXJjVG8gQHJhZGl1cywgQGFUb1xyXG5cdFx0KVxyXG5cdFx0QGtleVBvaW50cyA9IFtcclxuXHRcdFx0QHN0cmluZy5wb2ludHNbMF1cclxuXHRcdFx0QHN0cmluZy5wb2ludHNbMV1cclxuXHRcdFx0bmV3IEJ1LlBvaW50IEBjeCwgQGN5XHJcblx0XHRdXHJcblxyXG5cdGNsb25lOiAtPiBuZXcgQnUuRmFuIEBjeCwgQGN5LCBAcmFkaXVzLCBAYUZyb20sIEBhVG9cclxuXHJcblx0X2NvbnRhaW5zUG9pbnQ6IChwKSAtPlxyXG5cdFx0ZHggPSBwLnggLSBAY3hcclxuXHRcdGR5ID0gcC55IC0gQGN5XHJcblx0XHRhID0gTWF0aC5hdGFuMihwLnkgLSBAY3ksIHAueCAtIEBjeClcclxuXHRcdGEgKz0gTWF0aC5QSSAqIDIgd2hpbGUgYSA8IEBhRnJvbVxyXG5cdFx0cmV0dXJuIEJ1LmJldmVsKGR4LCBkeSkgPCBAcmFkaXVzICYmIGEgPiBAYUZyb20gJiYgYSA8IEBhVG9cclxuIiwiIyBsaW5lIHNoYXBlXHJcblxyXG5jbGFzcyBCdS5MaW5lIGV4dGVuZHMgQnUuT2JqZWN0MkRcclxuXHJcblx0Y29uc3RydWN0b3I6IChwMSwgcDIsIHAzLCBwNCkgLT5cclxuXHRcdHN1cGVyKClcclxuXHRcdEB0eXBlID0gJ0xpbmUnXHJcblxyXG5cdFx0aWYgYXJndW1lbnRzLmxlbmd0aCA8IDJcclxuXHRcdFx0QHBvaW50cyA9IFtuZXcgQnUuUG9pbnQoKSwgbmV3IEJ1LlBvaW50KCldXHJcblx0XHRlbHNlIGlmIGFyZ3VtZW50cy5sZW5ndGggPCA0XHJcblx0XHRcdEBwb2ludHMgPSBbcDEuY2xvbmUoKSwgcDIuY2xvbmUoKV1cclxuXHRcdGVsc2UgICMgbGVuID49IDRcclxuXHRcdFx0QHBvaW50cyA9IFtuZXcgQnUuUG9pbnQocDEsIHAyKSwgbmV3IEJ1LlBvaW50KHAzLCBwNCldXHJcblxyXG5cdFx0QGxlbmd0aFxyXG5cdFx0QG1pZHBvaW50ID0gbmV3IEJ1LlBvaW50KClcclxuXHRcdEBrZXlQb2ludHMgPSBAcG9pbnRzXHJcblxyXG5cdFx0QG9uIFwicG9pbnRDaGFuZ2VcIiwgKGUpID0+XHJcblx0XHRcdEBsZW5ndGggPSBAcG9pbnRzWzBdLmRpc3RhbmNlVG8oQHBvaW50c1sxXSlcclxuXHRcdFx0QG1pZHBvaW50LnNldCgoQHBvaW50c1swXS54ICsgQHBvaW50c1sxXS54KSAvIDIsIChAcG9pbnRzWzBdLnkgKyBAcG9pbnRzWzFdLnkpIC8gMilcclxuXHJcblx0XHRAdHJpZ2dlciBcInBvaW50Q2hhbmdlXCIsIEBcclxuXHJcblx0Y2xvbmU6IC0+IG5ldyBCdS5MaW5lIEBwb2ludHNbMF0sIEBwb2ludHNbMV1cclxuXHJcblx0IyBlZGl0XHJcblxyXG5cdHNldDogKGExLCBhMiwgYTMsIGE0KSAtPlxyXG5cdFx0aWYgcDQ/XHJcblx0XHRcdEBwb2ludHNbMF0uc2V0IGExLCBhMlxyXG5cdFx0XHRAcG9pbnRzWzFdLnNldCBhMywgYTRcclxuXHRcdGVsc2VcclxuXHRcdFx0QHBvaW50c1swXSA9IGExXHJcblx0XHRcdEBwb2ludHNbMV0gPSBhMlxyXG5cdFx0QHRyaWdnZXIgXCJwb2ludENoYW5nZVwiLCBAXHJcblx0XHRAXHJcblxyXG5cdHNldFBvaW50MTogKGExLCBhMikgLT5cclxuXHRcdGlmIGEyP1xyXG5cdFx0XHRAcG9pbnRzWzBdLnNldCBhMSwgYTJcclxuXHRcdGVsc2VcclxuXHRcdFx0QHBvaW50c1swXS5jb3B5IGExXHJcblx0XHRAdHJpZ2dlciBcInBvaW50Q2hhbmdlXCIsIEBcclxuXHRcdEBcclxuXHJcblx0c2V0UG9pbnQyOiAoYTEsIGEyKSAtPlxyXG5cdFx0aWYgYTI/XHJcblx0XHRcdEBwb2ludHNbMV0uc2V0IGExLCBhMlxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRAcG9pbnRzWzFdLmNvcHkgYTFcclxuXHRcdEB0cmlnZ2VyIFwicG9pbnRDaGFuZ2VcIiwgQFxyXG5cdFx0QFxyXG5cclxuXHQjIHBvaW50IHJlbGF0ZWRcclxuXHJcblx0aXNUd29Qb2ludHNTYW1lU2lkZTogKHAxLCBwMikgLT5cclxuXHRcdHBBID0gQHBvaW50c1swXVxyXG5cdFx0cEIgPSBAcG9pbnRzWzFdXHJcblx0XHRpZiBwQS54ID09IHBCLnhcclxuXHRcdFx0IyBpZiBib3RoIG9mIHRoZSB0d28gcG9pbnRzIGFyZSBvbiB0aGUgbGluZSB0aGVuIHdlIGNvbnNpZGVyIHRoZXkgYXJlIGluIHRoZSBzYW1lIHNpZGVcclxuXHRcdFx0cmV0dXJuIChwMS54IC0gcEEueCkgKiAocDIueCAtIHBBLngpID4gMFxyXG5cdFx0ZWxzZVxyXG5cdFx0XHR5MDEgPSAocEEueSAtIHBCLnkpICogKHAxLnggLSBwQS54KSAvIChwQS54IC0gcEIueCkgKyBwQS55XHJcblx0XHRcdHkwMiA9IChwQS55IC0gcEIueSkgKiAocDIueCAtIHBBLngpIC8gKHBBLnggLSBwQi54KSArIHBBLnlcclxuXHRcdFx0cmV0dXJuIChwMS55IC0geTAxKSAqIChwMi55IC0geTAyKSA+IDBcclxuXHJcblx0ZGlzdGFuY2VUbzogKHBvaW50KSAtPlxyXG5cdFx0cDEgPSBAcG9pbnRzWzBdXHJcblx0XHRwMiA9IEBwb2ludHNbMV1cclxuXHRcdGEgPSAocDEueSAtIHAyLnkpIC8gKHAxLnggLSBwMi54KVxyXG5cdFx0YiA9IHAxLnkgLSBhICogcDEueFxyXG5cdFx0cmV0dXJuIE1hdGguYWJzKGEgKiBwb2ludC54ICsgYiAtIHBvaW50LnkpIC8gTWF0aC5zcXJ0KGEgKiBhICsgMSlcclxuXHJcblx0IyB0aGlzIG9uZSBpcyBpbmZlcnJlZCBieSBteXNlbGZcclxuXHRkaXN0YW5jZVRvMjogKHBvaW50KSAtPlxyXG5cdFx0cDEgPSBAcG9pbnRzWzBdXHJcblx0XHRwMiA9IEBwb2ludHNbMV1cclxuXHRcdGEgPSAocDEueSAtIHAyLnkpIC8gKHAxLnggLSBwMi54KVxyXG5cdFx0YiA9IHAxLnkgLSAocDEueSAtIHAyLnkpICogcDEueCAvIChwMS54IC0gcDIueClcclxuXHRcdGN6WCA9IChwb2ludC55ICsgcG9pbnQueCAvIGEgLSBiKSAvIChhICsgMSAvIGEpXHJcblx0XHRjelkgPSBhICogY3pYICsgYlxyXG5cdFx0cmV0dXJuIEJ1LmJldmVsKGN6WCAtIHBvaW50LngsIGN6WSAtIHBvaW50LnkpXHJcblxyXG5cdCMgZ2V0IGZvb3QgcG9pbnQgZnJvbSBhIHBvaW50XHJcblx0IyBzYXZlIHRvIGZvb3RQb2ludCBvciBjcmVhdGUgYSBuZXcgcG9pbnRcclxuXHRmb290UG9pbnRGcm9tOiAocG9pbnQsIGZvb3RQb2ludCkgLT5cclxuXHRcdHAxID0gQHBvaW50c1swXVxyXG5cdFx0cDIgPSBAcG9pbnRzWzFdXHJcblx0XHRBID0gKHAxLnkgLSBwMi55KSAvIChwMS54IC0gcDIueClcclxuXHRcdEIgPSAocDEueSAtIEEgKiBwMS54KVxyXG5cdFx0bSA9IHBvaW50LnggKyBBICogcG9pbnQueVxyXG5cdFx0eCA9IChtIC0gQSAqIEIpIC8gKEEgKiBBICsgMSlcclxuXHRcdHkgPSBBICogeCArIEJcclxuXHJcblx0XHRpZiBmb290UG9pbnQ/XHJcblx0XHRcdGZvb3RQb2ludC5zZXQoeCwgeSlcclxuXHRcdGVsc2VcclxuXHRcdFx0cmV0dXJuIG5ldyBCdS5Qb2ludCh4LCB5KVxyXG5cclxuXHQjIGxpbmUgcmVsYXRlZFxyXG5cclxuXHRnZXRDcm9zc1BvaW50V2l0aDogKGxpbmUpIC0+XHJcblx0XHRwMSA9IEBwb2ludHNbMF1cclxuXHRcdHAyID0gQHBvaW50c1sxXVxyXG5cdFx0cTEgPSBsaW5lLnBvaW50c1swXVxyXG5cdFx0cTIgPSBsaW5lLnBvaW50c1sxXVxyXG5cclxuXHRcdGExID0gcDIueSAtIHAxLnlcclxuXHRcdGIxID0gcDEueCAtIHAyLnhcclxuXHRcdGMxID0gKGExICogcDEueCkgKyAoYjEgKiBwMS55KVxyXG5cdFx0YTIgPSBxMi55IC0gcTEueVxyXG5cdFx0YjIgPSBxMS54IC0gcTIueFxyXG5cdFx0YzIgPSAoYTIgKiBxMS54KSArIChiMiAqIHExLnkpXHJcblx0XHRkZXQgPSAoYTEgKiBiMikgLSAoYTIgKiBiMSlcclxuXHJcblx0XHRyZXR1cm4gbmV3IEJ1LlBvaW50ICgoYjIgKiBjMSkgLSAoYjEgKiBjMikpIC8gZGV0LCAoKGExICogYzIpIC0gKGEyICogYzEpKSAvIGRldFxyXG5cclxuXHQjIHdoZXRoZXIgY3Jvc3Mgd2l0aCBhbm90aGVyIGxpbmVcclxuXHRpc0Nyb3NzV2l0aExpbmU6IChsaW5lKSAtPlxyXG5cdFx0eDEgPSBAcG9pbnRzWzBdLnhcclxuXHRcdHkxID0gQHBvaW50c1swXS55XHJcblx0XHR4MiA9IEBwb2ludHNbMV0ueFxyXG5cdFx0eTIgPSBAcG9pbnRzWzFdLnlcclxuXHRcdHgzID0gbGluZS5wb2ludHNbMF0ueFxyXG5cdFx0eTMgPSBsaW5lLnBvaW50c1swXS55XHJcblx0XHR4NCA9IGxpbmUucG9pbnRzWzFdLnhcclxuXHRcdHk0ID0gbGluZS5wb2ludHNbMV0ueVxyXG5cdFx0ZCA9ICh5MiAtIHkxKSAqICh4NCAtIHgzKSAtICh5NCAtIHkzKSAqICh4MiAtIHgxKVxyXG5cdFx0aWYgZCA9PSAwXHJcblx0XHRcdHJldHVybiBmYWxzZVxyXG5cdFx0ZWxzZVxyXG5cdFx0XHR4MCA9ICgoeDIgLSB4MSkgKiAoeDQgLSB4MykgKiAoeTMgLSB5MSkgKyAoeTIgLSB5MSkgKiAoeDQgLSB4MykgKiB4MSAtICh5NCAtIHkzKSAqICh4MiAtIHgxKSAqIHgzKSAvIGRcclxuXHRcdFx0eTAgPSAoKHkyIC0geTEpICogKHk0IC0geTMpICogKHgzIC0geDEpICsgKHgyIC0geDEpICogKHk0IC0geTMpICogeTEgLSAoeDQgLSB4MykgKiAoeTIgLSB5MSkgKiB5MykgLyAtZFxyXG5cdFx0cmV0dXJuICh4MCAtIHgxKSAqICh4MCAtIHgyKSA8IDAgYW5kXHJcblx0XHRcdFx0KHgwIC0geDMpICogKHgwIC0geDQpIDwgMCBhbmRcclxuXHRcdFx0XHQoeTAgLSB5MSkgKiAoeTAgLSB5MikgPCAwIGFuZFxyXG5cdFx0XHRcdCh5MCAtIHkzKSAqICh5MCAtIHk0KSA8IDBcclxuXHJcblx0IyBUT0RPIHRlc3RcclxuXHRpc0Nyb3NzV2l0aExpbmUyOiAobGluZSkgLT5cclxuXHRcdHAxID0gQHBvaW50c1swXVxyXG5cdFx0cDIgPSBAcG9pbnRzWzFdXHJcblx0XHRxMSA9IGxpbmUucG9pbnRzWzBdXHJcblx0XHRxMiA9IGxpbmUucG9pbnRzWzFdXHJcblxyXG5cdFx0ZHggPSBwMi54IC0gcDEueFxyXG5cdFx0ZHkgPSBwMi55IC0gcDEueVxyXG5cdFx0ZGEgPSBxMi54IC0gcTEueFxyXG5cdFx0ZGIgPSBxMi55IC0gcTEueVxyXG5cclxuXHRcdCMgc2VnbWVudHMgYXJlIHBhcmFsbGVsXHJcblx0XHRpZiBkYSAqIGR5IC0gZGIgKiBkeCA9PSAwXHJcblx0XHRcdHJldHVybiBmYWxzZVxyXG5cclxuXHRcdHMgPSAoZHggKiAocTEueSAtIHAxLnkpICsgZHkgKiAocDEueCAtIHExLngpKSAvIChkYSAqIGR5IC0gZGIgKiBkeClcclxuXHRcdHQgPSAoZGEgKiAocDEueSAtIHExLnkpICsgZGIgKiAocTEueCAtIHAxLngpKSAvIChkYiAqIGR4IC0gZGEgKiBkeSlcclxuXHJcblx0XHRyZXR1cm4gcyA+PSAwICYmIHMgPD0gMSBhbmQgdCA+PSAwICYmIHQgPD0gMVxyXG4iLCIjIHBvaW50IHNoYXBlXHJcblxyXG5jbGFzcyBCdS5Qb2ludCBleHRlbmRzIEJ1Lk9iamVjdDJEXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoQHggPSAwLCBAeSA9IDApIC0+XHJcblx0XHRzdXBlcigpXHJcblx0XHRAdHlwZSA9ICdQb2ludCdcclxuXHJcblx0XHRAbGluZVdpZHRoID0gMC41XHJcblx0XHRAX2xhYmVsSW5kZXggPSAtMVxyXG5cclxuXHRjbG9uZTogLT4gbmV3IEJ1LlBvaW50IEB4LCBAeVxyXG5cclxuXHRAcHJvcGVydHkgJ2xhYmVsJyxcclxuXHRcdGdldDogLT4gaWYgQF9sYWJlbEluZGV4ID4gLTEgdGhlbiBAY2hpbGRyZW5bQF9sYWJlbEluZGV4XS50ZXh0IGVsc2UgJydcclxuXHRcdHNldDogKHZhbCkgLT5cclxuXHRcdFx0aWYgQF9sYWJlbEluZGV4ID09IC0xXHJcblx0XHRcdFx0cG9pbnRUZXh0ID0gbmV3IEJ1LlBvaW50VGV4dCB2YWwsIEB4ICsgQnUuUE9JTlRfTEFCRUxfT0ZGU0VULCBAeSwge2FsaWduOiAnKzAnfVxyXG5cdFx0XHRcdEBjaGlsZHJlbi5wdXNoIHBvaW50VGV4dFxyXG5cdFx0XHRcdEBfbGFiZWxJbmRleCA9IEBjaGlsZHJlbi5sZW5ndGggLSAxXHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRAY2hpbGRyZW5bQF9sYWJlbEluZGV4XS50ZXh0ID0gdmFsXHJcblxyXG5cdGFyY1RvOiAocmFkaXVzLCBhcmMpIC0+XHJcblx0XHRyZXR1cm4gbmV3IEJ1LlBvaW50IEB4ICsgTWF0aC5jb3MoYXJjKSAqIHJhZGl1cywgQHkgKyBNYXRoLnNpbihhcmMpICogcmFkaXVzXHJcblxyXG5cclxuXHQjIGNvcHkgdmFsdWUgZnJvbSBvdGhlciBsaW5lXHJcblx0Y29weTogKHBvaW50KSAtPlxyXG5cdFx0QHggPSBwb2ludC54XHJcblx0XHRAeSA9IHBvaW50LnlcclxuXHRcdEB1cGRhdGVMYWJlbCgpXHJcblxyXG5cdCMgc2V0IHZhbHVlIGZyb20geCwgeVxyXG5cdHNldDogKHgsIHkpIC0+XHJcblx0XHRAeCA9IHhcclxuXHRcdEB5ID0geVxyXG5cdFx0QHVwZGF0ZUxhYmVsKClcclxuXHJcblx0dXBkYXRlTGFiZWw6IC0+XHJcblx0XHRpZiBAX2xhYmVsSW5kZXggPiAtMVxyXG5cdFx0XHRAY2hpbGRyZW5bQF9sYWJlbEluZGV4XS54ID0gQHggKyBCdS5QT0lOVF9MQUJFTF9PRkZTRVRcclxuXHRcdFx0QGNoaWxkcmVuW0BfbGFiZWxJbmRleF0ueSA9IEB5XHJcblxyXG5cdCMgcG9pbnQgcmVsYXRlZFxyXG5cclxuXHRkaXN0YW5jZVRvOiAocG9pbnQpIC0+XHJcblx0XHRCdS5iZXZlbChAeCAtIHBvaW50LngsIEB5IC0gcG9pbnQueSlcclxuXHJcblx0Zm9vdFBvaW50ID0gbnVsbFxyXG5cclxuXHRpc05lYXI6ICh0YXJnZXQsIGxpbWl0ID0gQnUuREVGQVVMVF9ORUFSX0RJU1QpIC0+XHJcblx0XHRzd2l0Y2ggdGFyZ2V0LnR5cGVcclxuXHRcdFx0d2hlbiAnUG9pbnQnIHRoZW4gQGRpc3RhbmNlVG8odGFyZ2V0KSA8IGxpbWl0XHJcblx0XHRcdHdoZW4gJ0xpbmUnXHJcblx0XHRcdFx0dmVydGljYWxEaXN0ID0gdGFyZ2V0LmRpc3RhbmNlVG8gQFxyXG5cclxuXHRcdFx0XHRmb290UG9pbnQgPSBuZXcgQnUuUG9pbnQgdW5sZXNzIGZvb3RQb2ludD9cclxuXHRcdFx0XHR0YXJnZXQuZm9vdFBvaW50RnJvbSBALCBmb290UG9pbnRcclxuXHJcblx0XHRcdFx0aXNCZXR3ZWVuMSA9IGZvb3RQb2ludC5kaXN0YW5jZVRvKHRhcmdldC5wb2ludHNbMF0pIDwgdGFyZ2V0Lmxlbmd0aCArIEJ1LkRFRkFVTFRfTkVBUl9ESVNUXHJcblx0XHRcdFx0aXNCZXR3ZWVuMiA9IGZvb3RQb2ludC5kaXN0YW5jZVRvKHRhcmdldC5wb2ludHNbMV0pIDwgdGFyZ2V0Lmxlbmd0aCArIEJ1LkRFRkFVTFRfTkVBUl9ESVNUXHJcblxyXG5cdFx0XHRcdHJldHVybiB2ZXJ0aWNhbERpc3QgPCBsaW1pdCBhbmQgaXNCZXR3ZWVuMSBhbmQgaXNCZXR3ZWVuMlxyXG5cdFx0XHR3aGVuICdQb2x5bGluZSdcclxuXHRcdFx0XHRmb3IgbGluZSBpbiB0YXJnZXQubGluZXNcclxuXHRcdFx0XHRcdHJldHVybiB5ZXMgaWYgQGlzTmVhciBsaW5lXHJcblx0XHRcdFx0cmV0dXJuIG5vXHJcblxyXG5CdS5Qb2ludC5pbnRlcnBvbGF0ZSA9IChwMSwgcDIsIGssIHAzKSAtPlxyXG5cdHggPSBwMS54ICsgKHAyLnggLSBwMS54KSAqIGtcclxuXHR5ID0gcDEueSArIChwMi55IC0gcDEueSkgKiBrXHJcblxyXG5cdGlmIHAzP1xyXG5cdFx0cDMuc2V0IHgsIHlcclxuXHRlbHNlXHJcblx0XHRyZXR1cm4gbmV3IEJ1LlBvaW50IHgsIHlcclxuIiwiIyBwb2x5Z29uIHNoYXBlXHJcblxyXG5jbGFzcyBCdS5Qb2x5Z29uIGV4dGVuZHMgQnUuT2JqZWN0MkRcclxuXHJcblx0IyMjXHJcbiAgICBjb25zdHJ1Y3RvcnNcclxuICAgIDEuIFBvbHlnb24ocG9pbnRzKVxyXG4gICAgMi4gUG9seWdvbih4LCB5LCByYWRpdXMsIG4sIG9wdGlvbnMpOiB0byBnZW5lcmF0ZSByZWd1bGFyIHBvbHlnb25cclxuICAgIFx0b3B0aW9uczogYW5nbGUgLSBzdGFydCBhbmdsZSBvZiByZWd1bGFyIHBvbHlnb25cclxuXHQjIyNcclxuXHRjb25zdHJ1Y3RvcjogKHBvaW50cykgLT5cclxuXHRcdHN1cGVyKClcclxuXHRcdEB0eXBlID0gJ1BvbHlnb24nXHJcblxyXG5cdFx0QHZlcnRpY2VzID0gW11cclxuXHRcdEBsaW5lcyA9IFtdXHJcblx0XHRAdHJpYW5nbGVzID0gW11cclxuXHJcblx0XHRvcHRpb25zID0gQnUuY29tYmluZU9wdGlvbnMgYXJndW1lbnRzLFxyXG5cdFx0XHRhbmdsZTogMFxyXG5cclxuXHRcdGlmIHBvaW50cyBpbnN0YW5jZW9mIEFycmF5XHJcblx0XHRcdEB2ZXJ0aWNlcyA9IHBvaW50cyBpZiBwb2ludHM/XHJcblx0XHRlbHNlXHJcblx0XHRcdGlmIGFyZ3VtZW50cy5sZW5ndGggPCA0XHJcblx0XHRcdFx0eCA9IDBcclxuXHRcdFx0XHR5ID0gMFxyXG5cdFx0XHRcdHJhZGl1cyA9IGFyZ3VtZW50c1swXVxyXG5cdFx0XHRcdG4gPSBhcmd1bWVudHNbMV1cclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdHggPSBhcmd1bWVudHNbMF1cclxuXHRcdFx0XHR5ID0gYXJndW1lbnRzWzFdXHJcblx0XHRcdFx0cmFkaXVzID0gYXJndW1lbnRzWzJdXHJcblx0XHRcdFx0biA9IGFyZ3VtZW50c1szXVxyXG5cdFx0XHRAdmVydGljZXMgPSBCdS5Qb2x5Z29uLmdlbmVyYXRlUmVndWxhclBvaW50cyB4LCB5LCByYWRpdXMsIG4sIG9wdGlvbnNcclxuXHJcblx0XHQjIGluaXQgbGluZXNcclxuXHRcdGlmIEB2ZXJ0aWNlcy5sZW5ndGggPiAxXHJcblx0XHRcdGZvciBpIGluIFswIC4uLiBAdmVydGljZXMubGVuZ3RoIC0gMV1cclxuXHRcdFx0XHRAbGluZXMucHVzaChuZXcgQnUuTGluZShAdmVydGljZXNbaV0sIEB2ZXJ0aWNlc1tpICsgMV0pKVxyXG5cdFx0XHRAbGluZXMucHVzaChuZXcgQnUuTGluZShAdmVydGljZXNbQHZlcnRpY2VzLmxlbmd0aCAtIDFdLCBAdmVydGljZXNbMF0pKVxyXG5cclxuXHRcdCMgaW5pdCB0cmlhbmdsZXNcclxuXHRcdGlmIEB2ZXJ0aWNlcy5sZW5ndGggPiAyXHJcblx0XHRcdGZvciBpIGluIFsxIC4uLiBAdmVydGljZXMubGVuZ3RoIC0gMV1cclxuXHRcdFx0XHRAdHJpYW5nbGVzLnB1c2gobmV3IEJ1LlRyaWFuZ2xlKEB2ZXJ0aWNlc1swXSwgQHZlcnRpY2VzW2ldLCBAdmVydGljZXNbaSArIDFdKSlcclxuXHJcblx0XHRAa2V5UG9pbnRzID0gQHZlcnRpY2VzXHJcblxyXG5cdGNsb25lOiAtPiBuZXcgQnUuUG9seWdvbiBAdmVydGljZXNcclxuXHJcblx0IyBkZXRlY3RcclxuXHJcblx0aXNTaW1wbGU6ICgpIC0+XHJcblx0XHRsZW4gPSBAbGluZXMubGVuZ3RoXHJcblx0XHRmb3IgaSBpbiBbMC4uLmxlbl1cclxuXHRcdFx0Zm9yIGogaW4gW2kgKyAxLi4ubGVuXVxyXG5cdFx0XHRcdGlmIEBsaW5lc1tpXS5pc0Nyb3NzV2l0aExpbmUoQGxpbmVzW2pdKVxyXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlXHJcblx0XHRyZXR1cm4gdHJ1ZVxyXG5cclxuXHQjIGVkaXRcclxuXHJcblx0YWRkUG9pbnQ6IChwb2ludCwgaW5zZXJ0SW5kZXgpIC0+XHJcblx0XHRpZiBub3QgaW5zZXJ0SW5kZXg/XHJcblx0XHRcdCMgYWRkIHBvaW50XHJcblx0XHRcdEB2ZXJ0aWNlcy5wdXNoIHBvaW50XHJcblxyXG5cdFx0XHQjIGFkZCBsaW5lXHJcblx0XHRcdGlmIEB2ZXJ0aWNlcy5sZW5ndGggPiAxXHJcblx0XHRcdFx0QGxpbmVzW0BsaW5lcy5sZW5ndGggLSAxXS5wb2ludHNbMV0gPSBwb2ludFxyXG5cdFx0XHRpZiBAdmVydGljZXMubGVuZ3RoID4gMFxyXG5cdFx0XHRcdEBsaW5lcy5wdXNoKG5ldyBCdS5MaW5lKEB2ZXJ0aWNlc1tAdmVydGljZXMubGVuZ3RoIC0gMV0sIEB2ZXJ0aWNlc1swXSkpXHJcblxyXG5cdFx0XHQjIGFkZCB0cmlhbmdsZVxyXG5cdFx0XHRpZiBAdmVydGljZXMubGVuZ3RoID4gMlxyXG5cdFx0XHRcdEB0cmlhbmdsZXMucHVzaChuZXcgQnUuVHJpYW5nbGUoXHJcblx0XHRcdFx0XHRcdEB2ZXJ0aWNlc1swXVxyXG5cdFx0XHRcdFx0XHRAdmVydGljZXNbQHZlcnRpY2VzLmxlbmd0aCAtIDJdXHJcblx0XHRcdFx0XHRcdEB2ZXJ0aWNlc1tAdmVydGljZXMubGVuZ3RoIC0gMV1cclxuXHRcdFx0XHQpKVxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRAdmVydGljZXMuc3BsaWNlKGluc2VydEluZGV4LCAwLCBwb2ludClcclxuXHQjIFRPRE8gYWRkIGxpbmVzIGFuZCB0cmlhbmdsZXNcclxuXHJcblx0IyBwb2ludCByZWxhdGVkXHJcblxyXG5cdF9jb250YWluc1BvaW50OiAocCkgLT5cclxuXHRcdGZvciB0cmlhbmdsZSBpbiBAdHJpYW5nbGVzXHJcblx0XHRcdGlmIHRyaWFuZ2xlLmNvbnRhaW5zUG9pbnQgcFxyXG5cdFx0XHRcdHJldHVybiB0cnVlXHJcblx0XHRyZXR1cm4gZmFsc2VcclxuXHJcblx0QGdlbmVyYXRlUmVndWxhclBvaW50cyA9IChjeCwgY3ksIHJhZGl1cywgbiwgb3B0aW9ucykgLT5cclxuXHRcdGFuZ2xlRGVsdGEgPSBvcHRpb25zLmFuZ2xlXHJcblx0XHRyID0gcmFkaXVzXHJcblx0XHRwb2ludHMgPSBbXVxyXG5cdFx0YW5nbGVTZWN0aW9uID0gTWF0aC5QSSAqIDIgLyBuXHJcblx0XHRmb3IgaSBpbiBbMCAuLi4gbl1cclxuXHRcdFx0YSA9IGkgKiBhbmdsZVNlY3Rpb24gKyBhbmdsZURlbHRhXHJcblx0XHRcdHggPSBjeCArIHIgKiBNYXRoLmNvcyhhKVxyXG5cdFx0XHR5ID0gY3kgKyByICogTWF0aC5zaW4oYSlcclxuXHRcdFx0cG9pbnRzW2ldID0gbmV3IEJ1LlBvaW50IHgsIHlcclxuXHRcdHJldHVybiBwb2ludHNcclxuIiwiIyBwb2x5bGluZSBzaGFwZVxyXG5cclxuY2xhc3MgQnUuUG9seWxpbmUgZXh0ZW5kcyBCdS5PYmplY3QyRFxyXG5cclxuXHRjb25zdHJ1Y3RvcjogKEB2ZXJ0aWNlcyA9IFtdKSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cdFx0QHR5cGUgPSAnUG9seWxpbmUnXHJcblxyXG5cdFx0aWYgYXJndW1lbnRzLmxlbmd0aCA+IDFcclxuXHRcdFx0dmVydGljZXMgPSBbXVxyXG5cdFx0XHRmb3IgaSBpbiBbMCAuLi4gYXJndW1lbnRzLmxlbmd0aCAvIDJdXHJcblx0XHRcdFx0dmVydGljZXMucHVzaCBuZXcgQnUuUG9pbnQgYXJndW1lbnRzW2kgKiAyXSwgYXJndW1lbnRzW2kgKiAyICsgMV1cclxuXHRcdFx0QHZlcnRpY2VzID0gdmVydGljZXNcclxuXHJcblx0XHRAbGluZXMgPSBbXVxyXG5cdFx0QGxlbmd0aCA9IDBcclxuXHRcdEBwb2ludE5vcm1hbGl6ZWRQb3MgPSBbXVxyXG5cdFx0QGtleVBvaW50cyA9IEB2ZXJ0aWNlc1xyXG5cclxuXHRcdEBmaWxsIG9mZlxyXG5cclxuXHRcdEBvbiBcInBvaW50Q2hhbmdlXCIsID0+XHJcblx0XHRcdGlmIEB2ZXJ0aWNlcy5sZW5ndGggPiAxXHJcblx0XHRcdFx0QHVwZGF0ZUxpbmVzKClcclxuXHRcdFx0XHRAY2FsY0xlbmd0aCgpXHJcblx0XHRcdFx0QGNhbGNQb2ludE5vcm1hbGl6ZWRQb3MoKVxyXG5cdFx0QHRyaWdnZXIgXCJwb2ludENoYW5nZVwiLCBAXHJcblxyXG5cdGNsb25lOiA9PiBuZXcgQnUuUG9seWxpbmUgQHZlcnRpY2VzXHJcblxyXG5cdHVwZGF0ZUxpbmVzOiA9PlxyXG5cdFx0Zm9yIGkgaW4gWzAgLi4uIEB2ZXJ0aWNlcy5sZW5ndGggLSAxXVxyXG5cdFx0XHRpZiBAbGluZXNbaV0/XHJcblx0XHRcdFx0QGxpbmVzW2ldLnNldCBAdmVydGljZXNbaV0sIEB2ZXJ0aWNlc1tpICsgMV1cclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdEBsaW5lc1tpXSA9IG5ldyBCdS5MaW5lIEB2ZXJ0aWNlc1tpXSwgQHZlcnRpY2VzW2kgKyAxXVxyXG5cdCMgVE9ETyByZW1vdmUgdGhlIHJlc3RcclxuXHJcblx0Y2FsY0xlbmd0aDogPT5cclxuXHRcdGlmIEB2ZXJ0aWNlcy5sZW5ndGggPCAyXHJcblx0XHRcdEBsZW5ndGggPSAwXHJcblx0XHRlbHNlXHJcblx0XHRcdGxlbiA9IDBcclxuXHRcdFx0Zm9yIGkgaW4gWzEgLi4uIEB2ZXJ0aWNlcy5sZW5ndGhdXHJcblx0XHRcdFx0bGVuICs9IEB2ZXJ0aWNlc1tpXS5kaXN0YW5jZVRvIEB2ZXJ0aWNlc1tpIC0gMV1cclxuXHRcdFx0QGxlbmd0aCA9IGxlblxyXG5cclxuXHRjYWxjUG9pbnROb3JtYWxpemVkUG9zOiAoKSAtPlxyXG5cdFx0Y3VyclBvcyA9IDBcclxuXHRcdEBwb2ludE5vcm1hbGl6ZWRQb3NbMF0gPSAwXHJcblx0XHRmb3IgaSBpbiBbMSAuLi4gQHZlcnRpY2VzLmxlbmd0aF1cclxuXHRcdFx0Y3VyclBvcyArPSBAdmVydGljZXNbaV0uZGlzdGFuY2VUbyhAdmVydGljZXNbaSAtIDFdKSAvIEBsZW5ndGhcclxuXHRcdFx0QHBvaW50Tm9ybWFsaXplZFBvc1tpXSA9IGN1cnJQb3NcclxuXHJcblx0Z2V0Tm9ybWFsaXplZFBvczogKGluZGV4KSAtPlxyXG5cdFx0aWYgaW5kZXg/XHJcblx0XHRcdHJldHVybiBAcG9pbnROb3JtYWxpemVkUG9zW2luZGV4XVxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRyZXR1cm4gQHBvaW50Tm9ybWFsaXplZFBvc1xyXG5cclxuXHRjb21wcmVzczogKHN0cmVuZ3RoID0gMC44KSAtPlxyXG5cdFx0Y29tcHJlc3NlZCA9IFtdXHJcblx0XHRmb3Igb3duIGkgb2YgQHZlcnRpY2VzXHJcblx0XHRcdGlmIGkgPCAyXHJcblx0XHRcdFx0Y29tcHJlc3NlZFtpXSA9IEB2ZXJ0aWNlc1tpXVxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0W3BBLCBwTV0gPSBjb21wcmVzc2VkWy0yLi4tMV1cclxuXHRcdFx0XHRwQiA9IEB2ZXJ0aWNlc1tpXVxyXG5cdFx0XHRcdG9ibGlxdWVBbmdsZSA9IE1hdGguYWJzKE1hdGguYXRhbjIocEEueSAtIHBNLnksIHBBLnggLSBwTS54KSAtIE1hdGguYXRhbjIocE0ueSAtIHBCLnksIHBNLnggLSBwQi54KSlcclxuXHRcdFx0XHRpZiBvYmxpcXVlQW5nbGUgPCBzdHJlbmd0aCAqIHN0cmVuZ3RoICogTWF0aC5QSSAvIDJcclxuXHRcdFx0XHRcdGNvbXByZXNzZWRbY29tcHJlc3NlZC5sZW5ndGggLSAxXSA9IHBCXHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdFx0Y29tcHJlc3NlZC5wdXNoIHBCXHJcblx0XHRAdmVydGljZXMgPSBjb21wcmVzc2VkXHJcblx0XHRAa2V5UG9pbnRzID0gQHZlcnRpY2VzXHJcblx0XHRAXHJcblxyXG5cdCMgZWRpdFxyXG5cclxuXHRzZXQgPSAocG9pbnRzKSAtPlxyXG5cdFx0IyBwb2ludHNcclxuXHRcdGZvciBpIGluIFswIC4uLiBAdmVydGljZXMubGVuZ3RoXVxyXG5cdFx0XHRAdmVydGljZXNbaV0uY29weSBwb2ludHNbaV1cclxuXHJcblx0XHQjIHJlbW92ZSB0aGUgZXh0cmEgcG9pbnRzXHJcblx0XHRpZiBAdmVydGljZXMubGVuZ3RoID4gcG9pbnRzLmxlbmd0aFxyXG5cdFx0XHRAdmVydGljZXMuc3BsaWNlIHBvaW50cy5sZW5ndGhcclxuXHJcblx0XHRAdHJpZ2dlciBcInBvaW50Q2hhbmdlXCIsIEBcclxuXHJcblx0YWRkUG9pbnQ6IChwb2ludCwgaW5zZXJ0SW5kZXgpIC0+XHJcblx0XHRpZiBub3QgaW5zZXJ0SW5kZXg/XHJcblx0XHRcdCMgYWRkIHBvaW50XHJcblx0XHRcdEB2ZXJ0aWNlcy5wdXNoIHBvaW50XHJcblx0XHRcdCMgYWRkIGxpbmVcclxuXHRcdFx0aWYgQHZlcnRpY2VzLmxlbmd0aCA+IDFcclxuXHRcdFx0XHRAbGluZXMucHVzaCBuZXcgQnUuTGluZSBAdmVydGljZXNbQHZlcnRpY2VzLmxlbmd0aCAtIDJdLCBAdmVydGljZXNbQHZlcnRpY2VzLmxlbmd0aCAtIDFdXHJcblx0XHRlbHNlXHJcblx0XHRcdEB2ZXJ0aWNlcy5zcGxpY2UgaW5zZXJ0SW5kZXgsIDAsIHBvaW50XHJcblx0XHQjIFRPRE8gYWRkIGxpbmVzXHJcblx0XHRAdHJpZ2dlciBcInBvaW50Q2hhbmdlXCIsIEBcclxuIiwiIyByZWN0YW5nbGUgc2hhcGVcclxuXHJcbmNsYXNzIEJ1LlJlY3RhbmdsZSBleHRlbmRzIEJ1Lk9iamVjdDJEXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoeCwgeSwgd2lkdGgsIGhlaWdodCwgY29ybmVyUmFkaXVzID0gMCkgLT5cclxuXHRcdHN1cGVyKClcclxuXHRcdEB0eXBlID0gJ1JlY3RhbmdsZSdcclxuXHJcblx0XHRAcG9zaXRpb24gPSBuZXcgQnUuUG9pbnQoeCwgeSlcclxuXHRcdEBjZW50ZXIgPSBuZXcgQnUuUG9pbnQoeCArIHdpZHRoIC8gMiwgeSArIGhlaWdodCAvIDIpXHJcblx0XHRAc2l6ZSA9IG5ldyBCdS5TaXplKHdpZHRoLCBoZWlnaHQpXHJcblxyXG5cdFx0QHBvaW50UlQgPSBuZXcgQnUuUG9pbnQoeCArIHdpZHRoLCB5KVxyXG5cdFx0QHBvaW50UkIgPSBuZXcgQnUuUG9pbnQoeCArIHdpZHRoLCB5ICsgaGVpZ2h0KVxyXG5cdFx0QHBvaW50TEIgPSBuZXcgQnUuUG9pbnQoeCwgeSArIGhlaWdodClcclxuXHJcblx0XHRAcG9pbnRzID0gW0Bwb3NpdGlvbiwgQHBvaW50UlQsIEBwb2ludFJCLCBAcG9pbnRMQl1cclxuXHJcblx0XHRAY29ybmVyUmFkaXVzID0gY29ybmVyUmFkaXVzXHJcblxyXG5cdEBwcm9wZXJ0eSAnY29ybmVyUmFkaXVzJyxcclxuXHRcdGdldDogLT4gQF9jb3JuZXJSYWRpdXNcclxuXHRcdHNldDogKHZhbCkgLT5cclxuXHRcdFx0QF9jb3JuZXJSYWRpdXMgPSB2YWxcclxuXHRcdFx0QGtleVBvaW50cyA9IGlmIHZhbCA+IDAgdGhlbiBbXSBlbHNlIEBwb2ludHNcclxuXHJcblx0Y2xvbmU6IC0+IG5ldyBCdS5SZWN0YW5nbGUgQHBvc2l0aW9uLngsIEBwb3NpdGlvbi55LCBAc2l6ZS53aWR0aCwgQHNpemUuaGVpZ2h0XHJcblxyXG5cdGNvbnRhaW5zUG9pbnQ6IChwb2ludCkgLT5cclxuXHRcdHJldHVybiBwb2ludC54ID4gQHBvc2l0aW9uLnggYW5kXHJcblx0XHRcdFx0cG9pbnQueSA+IEBwb3NpdGlvbi55IGFuZFxyXG5cdFx0XHRcdHBvaW50LnggPCBAcG9zaXRpb24ueCArIEBzaXplLndpZHRoIGFuZFxyXG5cdFx0XHRcdHBvaW50LnkgPCBAcG9zaXRpb24ueSArIEBzaXplLmhlaWdodFxyXG4iLCIjIHNwbGluZSBzaGFwZVxyXG5cclxuY2xhc3MgQnUuU3BsaW5lIGV4dGVuZHMgQnUuT2JqZWN0MkRcclxuXHJcblx0Y29uc3RydWN0b3I6ICh2ZXJ0aWNlcykgLT5cclxuXHRcdHN1cGVyKClcclxuXHRcdEB0eXBlID0gJ1NwbGluZSdcclxuXHJcblx0XHRpZiB2ZXJ0aWNlcyBpbnN0YW5jZW9mIEJ1LlBvbHlsaW5lXHJcblx0XHRcdHBvbHlsaW5lID0gdmVydGljZXNcclxuXHRcdFx0QHZlcnRpY2VzID0gcG9seWxpbmUudmVydGljZXNcclxuXHRcdFx0cG9seWxpbmUub24gJ3BvaW50Q2hhbmdlJywgKHBvbHlsaW5lKSA9PlxyXG5cdFx0XHRcdEB2ZXJ0aWNlcyA9IHBvbHlsaW5lLnZlcnRpY2VzXHJcblx0XHRcdFx0Y2FsY0NvbnRyb2xQb2ludHMgQFxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRAdmVydGljZXMgPSBCdS5jbG9uZSB2ZXJ0aWNlc1xyXG5cclxuXHRcdEBrZXlQb2ludHMgPSBAdmVydGljZXNcclxuXHRcdEBjb250cm9sUG9pbnRzQWhlYWQgPSBbXVxyXG5cdFx0QGNvbnRyb2xQb2ludHNCZWhpbmQgPSBbXVxyXG5cclxuXHRcdEBmaWxsIG9mZlxyXG5cdFx0QHNtb290aEZhY3RvciA9IEJ1LkRFRkFVTFRfU1BMSU5FX1NNT09USFxyXG5cdFx0QF9zbW9vdGhlciA9IG5vXHJcblxyXG5cdFx0Y2FsY0NvbnRyb2xQb2ludHMgQFxyXG5cclxuXHRAcHJvcGVydHkgJ3Ntb290aGVyJyxcclxuXHRcdGdldDogLT4gQF9zbW9vdGhlclxyXG5cdFx0c2V0OiAodmFsKSAtPlxyXG5cdFx0XHRvbGRWYWwgPSBAX3Ntb290aGVyXHJcblx0XHRcdEBfc21vb3RoZXIgPSB2YWxcclxuXHRcdFx0Y2FsY0NvbnRyb2xQb2ludHMgQCBpZiBvbGRWYWwgIT0gQF9zbW9vdGhlclxyXG5cclxuXHRjbG9uZTogLT4gbmV3IEJ1LlNwbGluZSBAdmVydGljZXNcclxuXHJcblx0YWRkUG9pbnQ6IChwb2ludCkgLT5cclxuXHRcdEB2ZXJ0aWNlcy5wdXNoIHBvaW50XHJcblx0XHRjYWxjQ29udHJvbFBvaW50cyBAXHJcblxyXG5cdGNhbGNDb250cm9sUG9pbnRzID0gKHNwbGluZSkgLT5cclxuXHRcdHNwbGluZS5rZXlQb2ludHMgPSBzcGxpbmUudmVydGljZXNcclxuXHJcblx0XHRwID0gc3BsaW5lLnZlcnRpY2VzXHJcblx0XHRsZW4gPSBwLmxlbmd0aFxyXG5cdFx0aWYgbGVuID49IDFcclxuXHRcdFx0c3BsaW5lLmNvbnRyb2xQb2ludHNCZWhpbmRbMF0gPSBwWzBdXHJcblx0XHRpZiBsZW4gPj0gMlxyXG5cdFx0XHRzcGxpbmUuY29udHJvbFBvaW50c0FoZWFkW2xlbiAtIDFdID0gcFtsZW4gLSAxXVxyXG5cdFx0aWYgbGVuID49IDNcclxuXHRcdFx0Zm9yIGkgaW4gWzEuLi5sZW4gLSAxXVxyXG5cdFx0XHRcdHRoZXRhMSA9IE1hdGguYXRhbjIgcFtpXS55IC0gcFtpIC0gMV0ueSwgcFtpXS54IC0gcFtpIC0gMV0ueFxyXG5cdFx0XHRcdHRoZXRhMiA9IE1hdGguYXRhbjIgcFtpICsgMV0ueSAtIHBbaV0ueSwgcFtpICsgMV0ueCAtIHBbaV0ueFxyXG5cdFx0XHRcdGxlbjEgPSBCdS5iZXZlbCBwW2ldLnkgLSBwW2kgLSAxXS55LCBwW2ldLnggLSBwW2kgLSAxXS54XHJcblx0XHRcdFx0bGVuMiA9IEJ1LmJldmVsIHBbaV0ueSAtIHBbaSArIDFdLnksIHBbaV0ueCAtIHBbaSArIDFdLnhcclxuXHRcdFx0XHR0aGV0YSA9IHRoZXRhMSArICh0aGV0YTIgLSB0aGV0YTEpICogaWYgc3BsaW5lLl9zbW9vdGhlciB0aGVuIGxlbjEgLyAobGVuMSArIGxlbjIpIGVsc2UgMC41XHJcblx0XHRcdFx0dGhldGEgKz0gTWF0aC5QSSBpZiBNYXRoLmFicyh0aGV0YSAtIHRoZXRhMSkgPiBNYXRoLlBJIC8gMlxyXG5cdFx0XHRcdHhBID0gcFtpXS54IC0gbGVuMSAqIHNwbGluZS5zbW9vdGhGYWN0b3IgKiBNYXRoLmNvcyh0aGV0YSlcclxuXHRcdFx0XHR5QSA9IHBbaV0ueSAtIGxlbjEgKiBzcGxpbmUuc21vb3RoRmFjdG9yICogTWF0aC5zaW4odGhldGEpXHJcblx0XHRcdFx0eEIgPSBwW2ldLnggKyBsZW4yICogc3BsaW5lLnNtb290aEZhY3RvciAqIE1hdGguY29zKHRoZXRhKVxyXG5cdFx0XHRcdHlCID0gcFtpXS55ICsgbGVuMiAqIHNwbGluZS5zbW9vdGhGYWN0b3IgKiBNYXRoLnNpbih0aGV0YSlcclxuXHRcdFx0XHRzcGxpbmUuY29udHJvbFBvaW50c0FoZWFkW2ldID0gbmV3IEJ1LlBvaW50IHhBLCB5QVxyXG5cdFx0XHRcdHNwbGluZS5jb250cm9sUG9pbnRzQmVoaW5kW2ldID0gbmV3IEJ1LlBvaW50IHhCLCB5QlxyXG5cclxuXHRcdFx0XHQjIGFkZCBjb250cm9sIGxpbmVzIGZvciBkZWJ1Z2dpbmdcclxuXHRcdFx0XHQjc3BsaW5lLmNoaWxkcmVuW2kgKiAyIC0gMl0gPSBuZXcgQnUuTGluZSBzcGxpbmUudmVydGljZXNbaV0sIHNwbGluZS5jb250cm9sUG9pbnRzQWhlYWRbaV1cclxuXHRcdFx0XHQjc3BsaW5lLmNoaWxkcmVuW2kgKiAyIC0gMV0gPSAgbmV3IEJ1LkxpbmUgc3BsaW5lLnZlcnRpY2VzW2ldLCBzcGxpbmUuY29udHJvbFBvaW50c0JlaGluZFtpXVxyXG4iLCIjIHRyaWFuZ2xlIHNoYXBlXHJcblxyXG5jbGFzcyBCdS5UcmlhbmdsZSBleHRlbmRzIEJ1Lk9iamVjdDJEXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAocDEsIHAyLCBwMykgLT5cclxuXHRcdHN1cGVyKClcclxuXHRcdEB0eXBlID0gJ1RyaWFuZ2xlJ1xyXG5cclxuXHRcdGlmIGFyZ3VtZW50cy5sZW5ndGggPT0gNlxyXG5cdFx0XHRbeDEsIHkxLCB4MiwgeTIsIHgzLCB5M10gPSBhcmd1bWVudHNcclxuXHRcdFx0cDEgPSBuZXcgQnUuUG9pbnQgeDEsIHkxXHJcblx0XHRcdHAyID0gbmV3IEJ1LlBvaW50IHgyLCB5MlxyXG5cdFx0XHRwMyA9IG5ldyBCdS5Qb2ludCB4MywgeTNcclxuXHJcblx0XHRAbGluZXMgPSBbXHJcblx0XHRcdG5ldyBCdS5MaW5lKHAxLCBwMilcclxuXHRcdFx0bmV3IEJ1LkxpbmUocDIsIHAzKVxyXG5cdFx0XHRuZXcgQnUuTGluZShwMywgcDEpXHJcblx0XHRdXHJcblx0XHQjQGNlbnRlciA9IG5ldyBCdS5Qb2ludCBCdS5hdmVyYWdlKHAxLngsIHAyLngsIHAzLngpLCBCdS5hdmVyYWdlKHAxLnksIHAyLnksIHAzLnkpXHJcblx0XHRAcG9pbnRzID0gW3AxLCBwMiwgcDNdXHJcblx0XHRAa2V5UG9pbnRzID0gQHBvaW50c1xyXG5cclxuXHRjbG9uZTogPT4gbmV3IEJ1LlRyaWFuZ2xlIEBwb2ludHNbMF0sIEBwb2ludHNbMV0sIEBwb2ludHNbMl1cclxuXHJcblx0IyBUT0RPIHRlc3RcclxuXHRhcmVhOiAoKSAtPlxyXG5cdFx0W2EsIGIsIGNdID0gQHBvaW50c1xyXG5cdFx0cmV0dXJuIE1hdGguYWJzKCgoYi54IC0gYS54KSAqIChjLnkgLSBhLnkpKSAtICgoYy54IC0gYS54KSAqIChiLnkgLSBhLnkpKSkgLyAyXHJcblxyXG5cdF9jb250YWluc1BvaW50OiAocCkgLT5cclxuXHRcdHJldHVybiBAbGluZXNbMF0uaXNUd29Qb2ludHNTYW1lU2lkZShwLCBAcG9pbnRzWzJdKSBhbmRcclxuXHRcdFx0XHRAbGluZXNbMV0uaXNUd29Qb2ludHNTYW1lU2lkZShwLCBAcG9pbnRzWzBdKSBhbmRcclxuXHRcdFx0XHRAbGluZXNbMl0uaXNUd29Qb2ludHNTYW1lU2lkZShwLCBAcG9pbnRzWzFdKVxyXG4iLCIjIGRyYXcgYml0bWFwXHJcblxyXG5jbGFzcyBCdS5JbWFnZSBleHRlbmRzIEJ1Lk9iamVjdDJEXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoQHVybCwgeCA9IDAsIHkgPSAwLCB3aWR0aCwgaGVpZ2h0KSAtPlxyXG5cdFx0c3VwZXIoKVxyXG5cdFx0QHR5cGUgPSAnSW1hZ2UnXHJcblxyXG5cdFx0QGF1dG9TaXplID0geWVzXHJcblx0XHRAc2l6ZSA9IG5ldyBCdS5TaXplIEJ1LkRFRkFVTFRfSU1BR0VfU0laRSwgQnUuREVGQVVMVF9JTUFHRV9TSVpFXHJcblx0XHRAdHJhbnNsYXRlID0gbmV3IEJ1LlZlY3RvciB4LCB5XHJcblx0XHRAY2VudGVyID0gbmV3IEJ1LlZlY3RvciB4ICsgd2lkdGggLyAyLCB5ICsgaGVpZ2h0IC8gMlxyXG5cdFx0aWYgd2lkdGg/XHJcblx0XHRcdEBzaXplLnNldCB3aWR0aCwgaGVpZ2h0XHJcblx0XHRcdEBhdXRvU2l6ZSA9IG5vXHJcblxyXG5cdFx0QHBpdm90ID0gbmV3IEJ1LlZlY3RvciAwLjUsIDAuNVxyXG5cclxuXHRcdEBpbWFnZSA9IG5ldyBCdS5nbG9iYWwuSW1hZ2VcclxuXHRcdEBsb2FkZWQgPSBmYWxzZVxyXG5cclxuXHRcdEBpbWFnZS5vbmxvYWQgPSAoZSkgPT5cclxuXHRcdFx0aWYgQGF1dG9TaXplXHJcblx0XHRcdFx0QHNpemUuc2V0IEBpbWFnZS53aWR0aCwgQGltYWdlLmhlaWdodFxyXG5cdFx0XHRAbG9hZGVkID0gdHJ1ZVxyXG5cclxuXHRcdEBpbWFnZS5zcmMgPSBAdXJsXHJcbiIsIiMgZHJhdyB0ZXh0IGJ5IGEgcG9pbnRcclxuXHJcbmNsYXNzIEJ1LlBvaW50VGV4dCBleHRlbmRzIEJ1Lk9iamVjdDJEXHJcblxyXG5cdCMjI1xyXG5cdG9wdGlvbnMuYWxpZ246XHJcblx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdHwgICAtLSAgICAwLSAgICArLSAgIHxcclxuXHR8ICAgICAgICAgfOKGmTAwICAgICAgfFxyXG5cdHwgICAtMCAgLS0rLT4gICArMCAgIHxcclxuXHR8ICAgICAgICAg4oaTICAgICAgICAgIHxcclxuXHR8ICAgLSsgICAgMCsgICAgKysgICB8XHJcblx0LS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdGZvciBleGFtcGxlOiB0ZXh0IGlzIGluIHRoZSByaWdodCB0b3Agb2YgdGhlIHBvaW50LCB0aGVuIGFsaWduID0gXCIrLVwiXHJcblx0IyMjXHJcblx0Y29uc3RydWN0b3I6IChAdGV4dCwgQHggPSAwLCBAeSA9IDApIC0+XHJcblx0XHRzdXBlcigpXHJcblx0XHRAdHlwZSA9ICdQb2ludFRleHQnXHJcblx0XHRAc3Ryb2tlU3R5bGUgPSBudWxsICMgbm8gc3Ryb2tlIGJ5IGRlZmF1bHRcclxuXHRcdEBmaWxsU3R5bGUgPSBCdS5ERUZBVUxUX1RFWFRfRklMTF9TVFlMRVxyXG5cclxuXHRcdG9wdGlvbnMgPSBCdS5jb21iaW5lT3B0aW9ucyBhcmd1bWVudHMsXHJcblx0XHRcdGFsaWduOiAnMDAnXHJcblx0XHRcdGZvbnRGYW1pbHk6ICdWZXJkYW5hJ1xyXG5cdFx0XHRmb250U2l6ZTogMTFcclxuXHRcdEBhbGlnbiA9IG9wdGlvbnMuYWxpZ25cclxuXHRcdEBfZm9udEZhbWlseSA9IG9wdGlvbnMuZm9udEZhbWlseVxyXG5cdFx0QF9mb250U2l6ZSA9IG9wdGlvbnMuZm9udFNpemVcclxuXHRcdEBmb250ID0gXCIjeyBAX2ZvbnRTaXplIH1weCAjeyBAX2ZvbnRGYW1pbHkgfVwiIG9yIG9wdGlvbnMuZm9udFxyXG5cclxuXHRcdEBzZXRDb250ZXh0QWxpZ24gQGFsaWduXHJcblxyXG5cdEBwcm9wZXJ0eSAnZm9udEZhbWlseScsXHJcblx0XHRnZXQ6IC0+IEBfZm9udEZhbWlseVxyXG5cdFx0c2V0OiAodmFsKSAtPlxyXG5cdFx0XHRAX2ZvbnRGYW1pbHkgPSB2YWxcclxuXHRcdFx0QGZvbnQgPSBcIiN7IEBfZm9udFNpemUgfXB4ICN7IEBfZm9udEZhbWlseSB9XCJcclxuXHJcblx0QHByb3BlcnR5ICdmb250U2l6ZScsXHJcblx0XHRnZXQ6IC0+IEBfZm9udFNpemVcclxuXHRcdHNldDogKHZhbCkgLT5cclxuXHRcdFx0QF9mb250U2l6ZSA9IHZhbFxyXG5cdFx0XHRAZm9udCA9IFwiI3sgQF9mb250U2l6ZSB9cHggI3sgQF9mb250RmFtaWx5IH1cIlxyXG5cclxuXHRzZXRDb250ZXh0QWxpZ246IChhbGlnbikgPT5cclxuXHRcdGlmIGFsaWduLmxlbmd0aCA9PSAxXHJcblx0XHRcdGFsaWduID0gJycgKyBhbGlnbiArIGFsaWduXHJcblx0XHRhbGlnblggPSBhbGlnbi5zdWJzdHJpbmcoMCwgMSlcclxuXHRcdGFsaWduWSA9IGFsaWduLnN1YnN0cmluZygxLCAyKVxyXG5cdFx0QHRleHRBbGlnbiA9IHN3aXRjaCBhbGlnblhcclxuXHRcdFx0d2hlbiAnLScgdGhlbiAncmlnaHQnXHJcblx0XHRcdHdoZW4gJzAnIHRoZW4gJ2NlbnRlcidcclxuXHRcdFx0d2hlbiAnKycgdGhlbiAnbGVmdCdcclxuXHRcdEB0ZXh0QmFzZWxpbmUgPSBzd2l0Y2ggYWxpZ25ZXHJcblx0XHRcdHdoZW4gJy0nIHRoZW4gJ2JvdHRvbSdcclxuXHRcdFx0d2hlbiAnMCcgdGhlbiAnbWlkZGxlJ1xyXG5cdFx0XHR3aGVuICcrJyB0aGVuICd0b3AnXHJcbiIsIiMgYW5pbWF0aW9uXHJcblxyXG5jbGFzcyBCdS5BbmltYXRpb25cclxuXHJcblx0Y29uc3RydWN0b3I6IChvcHRpb25zKSAtPlxyXG5cdFx0QGZyb20gPSBvcHRpb25zLmZyb21cclxuXHRcdEB0byA9IG9wdGlvbnMudG9cclxuXHRcdEBkYXRhID0gb3B0aW9ucy5kYXRhIG9yIHt9XHJcblx0XHRAZHVyYXRpb24gPSBvcHRpb25zLmR1cmF0aW9uIG9yIDAuNVxyXG5cdFx0QHJlcGVhdCA9IGlmIG9wdGlvbnMucmVwZWF0PyB0aGVuIG9wdGlvbnMucmVwZWF0IGVsc2UgZmFsc2VcclxuXHRcdEBpbml0ID0gb3B0aW9ucy5pbml0XHJcblx0XHRAdXBkYXRlID0gb3B0aW9ucy51cGRhdGVcclxuXHRcdEBmaW5pc2ggPSBvcHRpb25zLmZpbmlzaFxyXG5cclxuXHRhcHBseTogKHRhcmdldCwgYXJncykgLT5cclxuXHRcdEJ1LmFuaW1hdGlvblJ1bm5lci5hZGQgQCwgdGFyZ2V0LCBhcmdzXHJcblxyXG4jIHByZWZhYiBhbmltYXRpb25zXHJcbiMgVGhlIG5hbWVzIGFyZSBhY2NvcmRpbmcgdG8galF1ZXJ5IFVJXHJcbkJ1LmFuaW1hdGlvbnMgPVxyXG5cclxuXHQjIHNpbXBsZVxyXG5cclxuXHRmYWRlSW46IG5ldyBCdS5BbmltYXRpb25cclxuXHRcdHVwZGF0ZTogKHQpIC0+XHJcblx0XHRcdEBvcGFjaXR5ID0gdFxyXG5cclxuXHRmYWRlT3V0OiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHR1cGRhdGU6ICh0KSAtPlxyXG5cdFx0XHRAb3BhY2l0eSA9IDEgLSB0XHJcblxyXG5cdHNwaW46IG5ldyBCdS5BbmltYXRpb25cclxuXHRcdHVwZGF0ZTogKHQpIC0+XHJcblx0XHRcdEByb3RhdGlvbiA9IHQgKiBNYXRoLlBJICogMlxyXG5cclxuXHRzcGluSW46IG5ldyBCdS5BbmltYXRpb25cclxuXHRcdGluaXQ6IChhbmltLCBhcmcgPSAxKSAtPlxyXG5cdFx0XHRhbmltLmRhdGEuZHMgPSBhcmdcclxuXHRcdHVwZGF0ZTogKHQsIGRhdGEpIC0+XHJcblx0XHRcdEBvcGFjaXR5ID0gdFxyXG5cdFx0XHRAcm90YXRpb24gPSB0ICogTWF0aC5QSSAqIDRcclxuXHRcdFx0QHNjYWxlID0gdCAqIGRhdGEuZHNcclxuXHJcblx0c3Bpbk91dDogbmV3IEJ1LkFuaW1hdGlvblxyXG5cdFx0dXBkYXRlOiAodCkgLT5cclxuXHRcdFx0QG9wYWNpdHkgPSAxIC0gdFxyXG5cdFx0XHRAcm90YXRpb24gPSB0ICogTWF0aC5QSSAqIDRcclxuXHRcdFx0QHNjYWxlID0gMSAtIHRcclxuXHJcblx0Ymxpbms6IG5ldyBCdS5BbmltYXRpb25cclxuXHRcdGR1cmF0aW9uOiAwLjJcclxuXHRcdGZyb206IDBcclxuXHRcdHRvOiA1MTJcclxuXHRcdHVwZGF0ZTogKGRhdGEpIC0+XHJcblx0XHRcdGRhdGEgPSBNYXRoLmZsb29yIE1hdGguYWJzKGQgLSAyNTYpXHJcblx0XHRcdEBmaWxsU3R5bGUgPSBcInJnYigjeyBkYXRhIH0sICN7IGRhdGEgfSwgI3sgZGF0YSB9KVwiXHJcblxyXG5cdHNoYWtlOiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHRpbml0OiAoYW5pbSwgYXJnKSAtPlxyXG5cdFx0XHRhbmltLmRhdGEub3ggPSBAdHJhbnNsYXRlLnhcclxuXHRcdFx0YW5pbS5kYXRhLnJhbmdlID0gYXJnIG9yIDIwXHJcblx0XHR1cGRhdGU6ICh0LCBkYXRhKSAtPlxyXG5cdFx0XHRAdHJhbnNsYXRlLnggPSBNYXRoLnNpbih0ICogTWF0aC5QSSAqIDgpICogZGF0YS5yYW5nZSArIGRhdGEub3hcclxuXHJcblx0IyB0b2dnbGU6IGRldGVjdCBhbmQgc2F2ZSBvcmlnaW5hbCBzdGF0dXNcclxuXHJcblx0cHVmZjogbmV3IEJ1LkFuaW1hdGlvblxyXG5cdFx0ZHVyYXRpb246IDAuMTVcclxuXHRcdGluaXQ6IChhbmltKSAtPlxyXG5cdFx0XHRhbmltLmZyb20gPVxyXG5cdFx0XHRcdG9wYWNpdHk6IEBvcGFjaXR5XHJcblx0XHRcdFx0c2NhbGU6IEBzY2FsZS54XHJcblx0XHRcdGFuaW0udG8gPVxyXG5cdFx0XHRcdG9wYWNpdHk6IGlmIEBvcGFjaXR5ID09IDEgdGhlbiAwIGVsc2UgMVxyXG5cdFx0XHRcdHNjYWxlOiBpZiBAb3BhY2l0eSA9PSAxIHRoZW4gQHNjYWxlLnggKiAxLjUgZWxzZSBAc2NhbGUueCAvIDEuNVxyXG5cdFx0dXBkYXRlOiAoZGF0YSkgLT5cclxuXHRcdFx0QG9wYWNpdHkgPSBkYXRhLm9wYWNpdHlcclxuXHRcdFx0QHNjYWxlID0gZGF0YS5zY2FsZVxyXG5cclxuXHRjbGlwOiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHRpbml0OiAoYW5pbSkgLT5cclxuXHRcdFx0aWYgQHNjYWxlLnkgIT0gMFxyXG5cdFx0XHRcdGFuaW0uZnJvbSA9IEBzY2FsZS55XHJcblx0XHRcdFx0YW5pbS50byA9IDBcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdGFuaW0uZnJvbSA9IEBzY2FsZS55XHJcblx0XHRcdFx0YW5pbS50byA9IEBzY2FsZS54XHJcblx0XHR1cGRhdGU6IChkYXRhKSAtPlxyXG5cdFx0XHRAc2NhbGUueSA9IGRhdGFcclxuXHJcblx0ZmxpcFg6IG5ldyBCdS5BbmltYXRpb25cclxuXHRcdGluaXQ6IChhbmltKSAtPlxyXG5cdFx0XHRhbmltLmZyb20gPSBAc2NhbGUueFxyXG5cdFx0XHRhbmltLnRvID0gLWFuaW0uZnJvbVxyXG5cdFx0dXBkYXRlOiAoZGF0YSkgLT5cclxuXHRcdFx0QHNjYWxlLnggPSBkYXRhXHJcblxyXG5cdGZsaXBZOiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHRpbml0OiAoYW5pbSkgLT5cclxuXHRcdFx0YW5pbS5mcm9tID0gQHNjYWxlLnlcclxuXHRcdFx0YW5pbS50byA9IC1hbmltLmZyb21cclxuXHRcdHVwZGF0ZTogKGRhdGEpIC0+XHJcblx0XHRcdEBzY2FsZS55ID0gZGF0YVxyXG5cclxuXHQjIHdpdGggYXJndW1lbnRzXHJcblxyXG5cdG1vdmVUbzogbmV3IEJ1LkFuaW1hdGlvblxyXG5cdFx0aW5pdDogKGFuaW0sIGFyZ3MpIC0+XHJcblx0XHRcdGlmIGFyZ3M/XHJcblx0XHRcdFx0YW5pbS5mcm9tID0gQHRyYW5zbGF0ZS54XHJcblx0XHRcdFx0YW5pbS50byA9IGFyZ3NcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IgJ2FuaW1hdGlvbiBtb3ZlVG8gbmVlZCBhbiBhcmd1bWVudCdcclxuXHRcdHVwZGF0ZTogKGRhdGEpIC0+XHJcblx0XHRcdEB0cmFuc2xhdGUueCA9IGRhdGFcclxuXHJcblx0bW92ZUJ5OiBuZXcgQnUuQW5pbWF0aW9uXHJcblx0XHRpbml0OiAoYW5pbSwgYXJncykgLT5cclxuXHRcdFx0aWYgYXJncz9cclxuXHRcdFx0XHRhbmltLmZyb20gPSBAdHJhbnNsYXRlLnhcclxuXHRcdFx0XHRhbmltLnRvID0gQHRyYW5zbGF0ZS54ICsgcGFyc2VGbG9hdChhcmdzKVxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0Y29uc29sZS5lcnJvciAnYW5pbWF0aW9uIG1vdmVUbyBuZWVkIGFuIGFyZ3VtZW50J1xyXG5cdFx0dXBkYXRlOiAoZGF0YSkgLT5cclxuXHRcdFx0QHRyYW5zbGF0ZS54ID0gZGF0YVxyXG4iLCIjIHJ1biB0aGUgYW5pbWF0aW9uc1xyXG5cclxuY2xhc3MgQnUuQW5pbWF0aW9uUnVubmVyXHJcblxyXG5cdGNvbnN0cnVjdG9yOiAoKSAtPlxyXG5cdFx0QHJ1bm5pbmdBbmltYXRpb25zID0gW11cclxuXHJcblx0YWRkOiAoYW5pbWF0aW9uLCB0YXJnZXQsIGFyZ3MpIC0+XHJcblx0XHRAcnVubmluZ0FuaW1hdGlvbnMucHVzaFxyXG5cdFx0XHRhbmltYXRpb246IGFuaW1hdGlvblxyXG5cdFx0XHR0YXJnZXQ6IHRhcmdldFxyXG5cdFx0XHRzdGFydFRpbWU6IEJ1Lm5vdygpXHJcblx0XHRcdGN1cnJlbnQ6IGFuaW1hdGlvbi5kYXRhXHJcblx0XHRcdGZpbmlzaGVkOiBub1xyXG5cdFx0YW5pbWF0aW9uLmluaXQ/LmNhbGwgdGFyZ2V0LCBhbmltYXRpb24sIGFyZ3NcclxuXHJcblx0dXBkYXRlOiAtPlxyXG5cdFx0bm93ID0gQnUubm93KClcclxuXHRcdGZvciB0YXNrIGluIEBydW5uaW5nQW5pbWF0aW9uc1xyXG5cdFx0XHRjb250aW51ZSBpZiB0YXNrLmZpbmlzaGVkXHJcblxyXG5cdFx0XHRhbmltID0gdGFzay5hbmltYXRpb25cclxuXHRcdFx0dCA9IChub3cgLSB0YXNrLnN0YXJ0VGltZSkgLyAoYW5pbS5kdXJhdGlvbiAqIDEwMDApXHJcblx0XHRcdGlmIHQgPiAxXHJcblx0XHRcdFx0ZmluaXNoID0gdHJ1ZVxyXG5cdFx0XHRcdGlmIGFuaW0ucmVwZWF0XHJcblx0XHRcdFx0XHR0ID0gMFxyXG5cdFx0XHRcdFx0dGFzay5zdGFydFRpbWUgPSBCdS5ub3coKVxyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdCMjIFRPRE8gcmVtb3ZlIG91dCBvZiBhcnJheVxyXG5cdFx0XHRcdFx0dCA9IDFcclxuXHRcdFx0XHRcdHRhc2suZmluaXNoZWQgPSB5ZXNcclxuXHJcblx0XHRcdGlmIGFuaW0uZnJvbT9cclxuXHRcdFx0XHRpZiBhbmltLmZyb20gaW5zdGFuY2VvZiBPYmplY3RcclxuXHRcdFx0XHRcdGZvciBvd24ga2V5IG9mIGFuaW0uZnJvbSB3aGVuIGtleSBvZiBhbmltLnRvXHJcblx0XHRcdFx0XHRcdHRhc2suY3VycmVudFtrZXldID0gYW5pbS50b1trZXldICogdCAtIGFuaW0uZnJvbVtrZXldICogKHQgLSAxKVxyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdHRhc2suY3VycmVudCA9IGFuaW0udG8gKiB0IC0gYW5pbS5mcm9tICogKHQgLSAxKVxyXG5cdFx0XHRcdGFuaW0udXBkYXRlLmFwcGx5IHRhc2sudGFyZ2V0LCBbdGFzay5jdXJyZW50LCB0XVxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0YW5pbS51cGRhdGUuYXBwbHkgdGFzay50YXJnZXQsIFt0LCB0YXNrLmN1cnJlbnRdXHJcblx0XHRcdGlmIGZpbmlzaCB0aGVuIGFuaW0uZmluaXNoPy5jYWxsIHRhc2sudGFyZ2V0LCBhbmltXHJcblxyXG5cdCMgaG9vayB1cCBvbiBhbiByZW5kZXJlciwgcmVtb3ZlIG93biBzZXRJbnRlcm5hbFxyXG5cdGhvb2tVcDogKHJlbmRlcmVyKSAtPlxyXG5cdFx0cmVuZGVyZXIub24gJ3VwZGF0ZScsID0+IEB1cGRhdGUoKVxyXG5cclxuIyBnbG9iYWwgdW5pcXVlIGluc3RhbmNlXHJcbkJ1LmFuaW1hdGlvblJ1bm5lciA9IG5ldyBCdS5BbmltYXRpb25SdW5uZXJcclxuIiwiIyBnZW5lcmF0b3IgcmFuZG9tIHNoYXBlc1xyXG5cclxuY2xhc3MgQnUuUmFuZG9tU2hhcGVHZW5lcmF0b3JcclxuXHJcblx0TUFSR0lOID0gMzBcclxuXHJcblx0Y29uc3RydWN0b3I6IChAYnUpIC0+XHJcblxyXG5cdHJhbmRvbVg6IC0+XHJcblx0XHRyZXR1cm4gQnUucmFuZCBNQVJHSU4sIEBidS53aWR0aCAtIE1BUkdJTiAqIDJcclxuXHJcblx0cmFuZG9tWTogLT5cclxuXHRcdHJldHVybiBCdS5yYW5kIE1BUkdJTiwgQGJ1LmhlaWdodCAtIE1BUkdJTiAqIDJcclxuXHJcblx0cmFuZG9tUmFkaXVzOiAtPlxyXG5cdFx0cmV0dXJuIEJ1LnJhbmQgNSwgTWF0aC5taW4oQGJ1LndpZHRoLCBAYnUuaGVpZ2h0KSAvIDJcclxuXHJcblxyXG5cdGdlbmVyYXRlOiAodHlwZSkgLT5cclxuXHRcdHN3aXRjaCB0eXBlXHJcblx0XHRcdHdoZW4gJ2NpcmNsZScgdGhlbiBAZ2VuZXJhdGVDaXJjbGUoKVxyXG5cdFx0XHR3aGVuICdib3cnIHRoZW4gQGdlbmVyYXRlQm93KClcclxuXHRcdFx0d2hlbiAndHJpYW5nbGUnIHRoZW4gQGdlbmVyYXRlVHJpYW5nbGUoKVxyXG5cdFx0XHR3aGVuICdyZWN0YW5nbGUnIHRoZW4gQGdlbmVyYXRlUmVjdGFuZ2xlKClcclxuXHRcdFx0d2hlbiAnZmFuJyB0aGVuIEBnZW5lcmF0ZUZhbigpXHJcblx0XHRcdHdoZW4gJ3BvbHlnb24nIHRoZW4gQGdlbmVyYXRlUG9seWdvbigpXHJcblx0XHRcdHdoZW4gJ2xpbmUnIHRoZW4gQGdlbmVyYXRlTGluZSgpXHJcblx0XHRcdHdoZW4gJ3BvbHlsaW5lJyB0aGVuIEBnZW5lcmF0ZVBvbHlsaW5lKClcclxuXHRcdFx0ZWxzZSBjb25zb2xlLndhcm4gJ25vdCBzdXBwb3J0IHNoYXBlOiAnICsgdHlwZVxyXG5cclxuXHRnZW5lcmF0ZUNpcmNsZTogLT5cclxuXHRcdGNpcmNsZSA9IG5ldyBCdS5DaXJjbGUgQHJhbmRvbVgoKSwgQHJhbmRvbVkoKSwgQHJhbmRvbVJhZGl1cygpXHJcblx0XHRjaXJjbGUuY2VudGVyLmxhYmVsID0gJ08nXHJcblx0XHRyZXR1cm4gY2lyY2xlXHJcblxyXG5cdGdlbmVyYXRlQm93OiAtPlxyXG5cdFx0YUZyb20gPSBCdS5yYW5kIE1hdGguUEkgKiAyXHJcblx0XHRhVG8gPSBhRnJvbSArIEJ1LnJhbmQgTWF0aC5QSSAvIDIsIE1hdGguUEkgKiAyXHJcblxyXG5cdFx0Ym93ID0gbmV3IEJ1LkJvdyBAcmFuZG9tWCgpLCBAcmFuZG9tWSgpLCBAcmFuZG9tUmFkaXVzKCksIGFGcm9tLCBhVG9cclxuXHRcdGJvdy5zdHJpbmcucG9pbnRzWzBdLmxhYmVsID0gJ0EnXHJcblx0XHRib3cuc3RyaW5nLnBvaW50c1sxXS5sYWJlbCA9ICdCJ1xyXG5cdFx0cmV0dXJuIGJvd1xyXG5cclxuXHRnZW5lcmF0ZVRyaWFuZ2xlOiAtPlxyXG5cdFx0cG9pbnRzID0gW11cclxuXHRcdGZvciBpIGluIFswLi4yXVxyXG5cdFx0XHRwb2ludHNbaV0gPSBuZXcgQnUuUG9pbnQgQHJhbmRvbVgoKSwgQHJhbmRvbVkoKVxyXG5cclxuXHRcdHRyaWFuZ2xlID0gbmV3IEJ1LlRyaWFuZ2xlIHBvaW50c1swXSwgcG9pbnRzWzFdLCBwb2ludHNbMl1cclxuXHRcdHRyaWFuZ2xlLnBvaW50c1swXS5sYWJlbCA9ICdBJ1xyXG5cdFx0dHJpYW5nbGUucG9pbnRzWzFdLmxhYmVsID0gJ0InXHJcblx0XHR0cmlhbmdsZS5wb2ludHNbMl0ubGFiZWwgPSAnQydcclxuXHRcdHJldHVybiB0cmlhbmdsZVxyXG5cclxuXHRnZW5lcmF0ZVJlY3RhbmdsZTogLT5cclxuXHRcdHJldHVybiBuZXcgQnUuUmVjdGFuZ2xlKFxyXG5cdFx0XHRCdS5yYW5kKEBidS53aWR0aClcclxuXHRcdFx0QnUucmFuZChAYnUuaGVpZ2h0KVxyXG5cdFx0XHRCdS5yYW5kKEBidS53aWR0aCAvIDIpXHJcblx0XHRcdEJ1LnJhbmQoQGJ1LmhlaWdodCAvIDIpXHJcblx0XHQpXHJcblxyXG5cdGdlbmVyYXRlRmFuOiAtPlxyXG5cdFx0YUZyb20gPSBCdS5yYW5kIE1hdGguUEkgKiAyXHJcblx0XHRhVG8gPSBhRnJvbSArIEJ1LnJhbmQgTWF0aC5QSSAvIDIsIE1hdGguUEkgKiAyXHJcblxyXG5cdFx0ZmFuID0gbmV3IEJ1LkZhbiBAcmFuZG9tWCgpLCBAcmFuZG9tWSgpLCBAcmFuZG9tUmFkaXVzKCksIGFGcm9tLCBhVG9cclxuXHRcdGZhbi5zdHJpbmcucG9pbnRzWzBdLmxhYmVsID0gJ0EnXHJcblx0XHRmYW4uc3RyaW5nLnBvaW50c1sxXS5sYWJlbCA9ICdCJ1xyXG5cdFx0cmV0dXJuIGZhblxyXG5cclxuXHRnZW5lcmF0ZVBvbHlnb246IC0+XHJcblx0XHRwb2ludHMgPSBbXVxyXG5cclxuXHRcdGZvciBpIGluIFswLi4zXVxyXG5cdFx0XHRwb2ludCA9IG5ldyBCdS5Qb2ludCBAcmFuZG9tWCgpLCBAcmFuZG9tWSgpXHJcblx0XHRcdHBvaW50LmxhYmVsID0gJ1AnICsgaVxyXG5cdFx0XHRwb2ludHMucHVzaCBwb2ludFxyXG5cclxuXHRcdHJldHVybiBuZXcgQnUuUG9seWdvbiBwb2ludHNcclxuXHJcblx0Z2VuZXJhdGVMaW5lOiAtPlxyXG5cdFx0bGluZSA9IG5ldyBCdS5MaW5lIEByYW5kb21YKCksIEByYW5kb21ZKCksIEByYW5kb21YKCksIEByYW5kb21ZKClcclxuXHRcdGxpbmUucG9pbnRzWzBdLmxhYmVsID0gJ0EnXHJcblx0XHRsaW5lLnBvaW50c1sxXS5sYWJlbCA9ICdCJ1xyXG5cdFx0cmV0dXJuIGxpbmVcclxuXHJcblx0Z2VuZXJhdGVQb2x5bGluZTogLT5cclxuXHRcdHBvbHlsaW5lID0gbmV3IEJ1LlBvbHlsaW5lXHJcblx0XHRmb3IgaSBpbiBbMC4uM11cclxuXHRcdFx0cG9pbnQgPSBuZXcgQnUuUG9pbnQgQHJhbmRvbVgoKSwgQHJhbmRvbVkoKVxyXG5cdFx0XHRwb2ludC5sYWJlbCA9ICdQJyArIGlcclxuXHRcdFx0cG9seWxpbmUuYWRkUG9pbnQgcG9pbnRcclxuXHRcdHJldHVybiBwb2x5bGluZVxyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
