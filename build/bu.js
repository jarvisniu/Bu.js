var Bu = (function () {
'use strict';

// Namespace, constants, utility functions and polyfills

  //----------------------------------------------------------------------
  // Namespace
  //----------------------------------------------------------------------
var Bu$2;
var base;
var base1;
var currentTime;
var lastTime;
var hasProp = {}.hasOwnProperty;

Bu$2 = window.Bu = {
  global: window
};

//----------------------------------------------------------------------
// Constants
//----------------------------------------------------------------------

// Version info
Bu$2.version = '0.4.0';

// Browser vendor prefixes, used in experimental features
Bu$2.BROWSER_VENDOR_PREFIXES = ['webkit', 'moz', 'ms'];

// Math
Bu$2.HALF_PI = Math.PI / 2;

Bu$2.TWO_PI = Math.PI * 2;

// Default font for the text
Bu$2.DEFAULT_FONT_FAMILY = 'Verdana';

Bu$2.DEFAULT_FONT_SIZE = 11;

Bu$2.DEFAULT_FONT = '11px Verdana';

// Point is rendered as a small circle on screen. This is the radius of the circle.
Bu$2.POINT_RENDER_SIZE = 2.25;

// Point can have a label attached near it. This is the gap distance between them.
Bu$2.POINT_LABEL_OFFSET = 5;

// Default smooth factor of spline, range in [0, 1] and 1 is the smoothest
Bu$2.DEFAULT_SPLINE_SMOOTH = 0.25;

// How close a point to a line is regarded that the point is **ON** the line.
Bu$2.DEFAULT_NEAR_DIST = 5;

// Enumeration of mouse buttons, used to compare with `e.buttons` of mouse events
Bu$2.MOUSE = {
  NONE: 0,
  LEFT: 1,
  RIGHT: 2,
  MIDDLE: 4
};

//----------------------------------------------------------------------
// Utility functions
//----------------------------------------------------------------------

// Calculate the mean value of numbers
Bu$2.average = function() {
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

// Calculate the hypotenuse from the cathetuses
Bu$2.bevel = function(x, y) {
  return Math.sqrt(x * x + y * y);
};

// Limit a number by minimum value and maximum value
Bu$2.clamp = function(x, min, max) {
  if (x < min) {
    x = min;
  }
  if (x > max) {
    x = max;
  }
  return x;
};

// Generate a random number between two numbers
Bu$2.rand = function(from, to) {
  if (to == null) {
    [from, to] = [0, from];
  }
  return Math.random() * (to - from) + from;
};

// Convert an angle from radian to deg
Bu$2.r2d = function(r) {
  return (r * 180 / Math.PI).toFixed(1);
};

// Convert an angle from deg to radian
Bu$2.d2r = function(r) {
  return r * Math.PI / 180;
};

// Get the current timestamp
Bu$2.now = Bu$2.global.performance != null ? function() {
  return Bu$2.global.performance.now();
} : function() {
  return Date.now();
};

// Combine the given options (last item of arguments) with the default options
Bu$2.combineOptions = function(args, defaultOptions) {
  var givenOptions, i;
  if (defaultOptions == null) {
    defaultOptions = {};
  }
  givenOptions = args[args.length - 1];
  if (Bu$2.isPlainObject(givenOptions)) {
    for (i in givenOptions) {
      if (givenOptions[i] != null) {
        defaultOptions[i] = givenOptions[i];
      }
    }
  }
  return defaultOptions;
};

// Check if an variable is a number
Bu$2.isNumber = function(o) {
  return typeof o === 'number';
};

// Check if an variable is a string
Bu$2.isString = function(o) {
  return typeof o === 'string';
};

// Check if an object is an plain object, not instance of class/function
Bu$2.isPlainObject = function(o) {
  return o instanceof Object && o.constructor.name === 'Object';
};

// Check if an object is a function
Bu$2.isFunction = function(o) {
  return o instanceof Object && o.constructor.name === 'Function';
};

// Check if an object is a Array
Bu$2.isArray = function(o) {
  return o instanceof Array;
};

// Clone an Object or Array
Bu$2.clone = function(target) {
  var clone, i;
  if (typeof target !== 'object' || target === null || Bu$2.isFunction(target)) {
    return target;
  } else {
    if (target.clone != null) {
      return target.clone();
    }
    // FIXME cause stack overflow when its a circular structure
    if (Bu$2.isArray(target)) {
      clone = [];
    } else if (Bu$2.isPlainObject(target)) {
      clone = {}; // instance of class
    } else {
      clone = Object.create(target.constructor.prototype);
    }
    for (i in target) {
      if (!hasProp.call(target, i)) continue;
      clone[i] = Bu$2.clone(target[i]);
    }
    return clone;
  }
};

// Use localStorage to persist data
Bu$2.data = function(key, value) {
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

// Execute a callback function when the document is ready
Bu$2.ready = function(cb, context, args) {
  if (document.readyState === 'complete') {
    return cb.apply(context, args);
  } else {
    return document.addEventListener('DOMContentLoaded', function() {
      return cb.apply(context, args);
    });
  }
};

//----------------------------------------------------------------------
// Polyfills
//----------------------------------------------------------------------

// Shortcut to define a property for a class. This is used to solve the problem
// that CoffeeScript didn't support getters and setters.
// class Person
//   @constructor: (age) ->
//     @_age = age

//   @property 'age',
//     get: -> @_age
//     set: (val) ->
//       @_age = val

Function.prototype.property = function(prop, desc) {
  return Object.defineProperty(this.prototype, prop, desc);
};

// Make a copy of this function which has a limited shortest executing interval.
Function.prototype.throttle = function(limit = 0.5) {
  var currTime, lastTime;
  currTime = 0;
  lastTime = 0;
  return () => {
    currTime = Date.now();
    if (currTime - lastTime > limit * 1000) {
      this.apply(null, arguments);
      return lastTime = currTime;
    }
  };
};

// Make a copy of this function whose execution will be continuously put off
// after every calling of this function.
Function.prototype.debounce = function(delay = 0.5) {
  var args, later, timeout;
  args = null;
  timeout = null;
  later = () => {
    return this.apply(null, args);
  };
  return function() {
    args = arguments;
    clearTimeout(timeout);
    return timeout = setTimeout(later, delay * 1000);
  };
};

// Iterate this Array and do something with the items.
(base = Array.prototype).each || (base.each = function(fn) {
  var i;
  i = 0;
  while (i < this.length) {
    fn(this[i]);
    i++;
  }
  return this;
});

// Iterate this Array and map the items to a new Array.
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

//----------------------------------------------------------------------
// Others
//----------------------------------------------------------------------

// Output version info to the console, at most one time in a minute.
currentTime = Date.now();

lastTime = Bu$2.data('version.timestamp');

if (!((lastTime != null) && currentTime - lastTime < 60 * 1000)) {
  if (typeof console.info === "function") {
    console.info('Bu.js v' + Bu$2.version + ' - [https://github.com/jarvisniu/Bu.js]');
  }
  Bu$2.data('version.timestamp', currentTime);
}

var Bu$3 = Bu$2;

// 2d vector
var Vector;

Vector = class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  clone() {
    return new Vector(this.x, this.y);
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  offset(dx, dy) {
    this.x += dx;
    this.y += dy;
    return this;
  }

  copy(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  multiplyScalar(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  project(obj) {
    var a, len;
    // scale
    this.x *= obj.scale.x;
    this.y *= obj.scale.y;
    // rotation
    len = Bu.bevel(this.x, this.y);
    a = Math.atan2(this.y, this.x) + obj.rotation;
    this.x = len * Math.cos(a);
    this.y = len * Math.sin(a);
    // translate
    this.x += obj.position.x;
    this.y += obj.position.y;
    return this;
  }

  unProject(obj) {
    var a, len;
    // translate
    this.x -= obj.position.x;
    this.y -= obj.position.y;
    // rotation
    len = Bu.bevel(this.x, this.y);
    a = Math.atan2(this.y, this.x) - obj.rotation;
    this.x = len * Math.cos(a);
    this.y = len * Math.sin(a);
    // scale
    this.x /= obj.scale.x;
    this.y /= obj.scale.y;
    return this;
  }

};

var Vector$1 = Vector;

//# axis aligned bounding box
var Bounds;

Bounds = class Bounds {
  constructor(target) {
    this.update = this.update.bind(this);
    this.target = target;
    // TODO use min, max: Vector
    this.x1 = this.y1 = this.x2 = this.y2 = 0;
    this.isEmpty = true;
    this.point1 = new Vector$1;
    this.point2 = new Vector$1;
    this.update();
    this.bindEvent();
  }

  containsPoint(p) {
    return this.x1 < p.x && this.x2 > p.x && this.y1 < p.y && this.y2 > p.y;
  }

  update() {
    var i, j, len, len1, ref, ref1, results, results1, v;
    this.clear();
    switch (this.target.type) {
      case 'Line':
      case 'Triangle':
      case 'Rectangle':
        ref = this.target.points;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          v = ref[i];
          results.push(this.expandByPoint(v));
        }
        return results;
        break;
      case 'Circle':
      case 'Bow':
      case 'Fan':
        return this.expandByCircle(this.target);
      case 'Polyline':
      case 'Polygon':
        ref1 = this.target.vertices;
        results1 = [];
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          v = ref1[j];
          results1.push(this.expandByPoint(v));
        }
        return results1;
        break;
      case 'Ellipse':
        this.x1 = -this.target.radiusX;
        this.x2 = this.target.radiusX;
        this.y1 = -this.target.radiusY;
        return this.y2 = this.target.radiusY;
      default:
        return console.warn(`Bounds: not support shape type ${this.target.type}`);
    }
  }

  bindEvent() {
    switch (this.target.type) {
      case 'Circle':
      case 'Bow':
      case 'Fan':
        this.target.on('centerChanged', this.update);
        return this.target.on('radiusChanged', this.update);
      case 'Ellipse':
        return this.target.on('changed', this.update);
    }
  }

  clear() {
    this.x1 = this.y1 = this.x2 = this.y2 = 0;
    this.isEmpty = true;
    return this;
  }

  expandByPoint(v) {
    if (this.isEmpty) {
      this.isEmpty = false;
      this.x1 = this.x2 = v.x;
      this.y1 = this.y2 = v.y;
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
        this.y2 = v.y;
      }
    }
    return this;
  }

  expandByCircle(c) {
    var cp, r;
    cp = c.center;
    r = c.radius;
    if (this.isEmpty) {
      this.isEmpty = false;
      this.x1 = cp.x - r;
      this.x2 = cp.x + r;
      this.y1 = cp.y - r;
      this.y2 = cp.y + r;
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
        this.y2 = cp.y + r;
      }
    }
    return this;
  }

};

var Bounds$1 = Bounds;

// Parse and serialize color
// TODO Support hsl(0, 100%, 50%) format.
var Color;

Color = (function() {
  var CSS3_COLORS, RE_HEX3, RE_HEX6, RE_HSL, RE_HSLA, RE_RGB, RE_RGBA, RE_RGBA_PER, RE_RGB_PER, clampAlpha, hsl2rgb;

  class Color {
    constructor() {
      var arg;
      this.r = this.g = this.b = 255;
      this.a = 1;
      if (arguments.length === 1) {
        arg = arguments[0];
        if (Bu.isString(arg)) {
          this.parse(arg);
          this.a = clampAlpha(this.a);
        } else if (arg instanceof Color) {
          this.copy(arg); // if arguments.length == 3 or 4
        }
      } else {
        this.r = arguments[0];
        this.g = arguments[1];
        this.b = arguments[2];
        this.a = arguments[3] || 1;
      }
    }

    parse(str) {
      var found, h, hex, l, s;
      if (found = str.match(RE_RGB)) {
        this.r = +found[1];
        this.g = +found[2];
        this.b = +found[3];
        this.a = 1;
      } else if (found = str.match(RE_HSL)) {
        h = +found[1];
        s = +found[2] / 100;
        l = +found[3] / 100;
        [this.r, this.g, this.b] = hsl2rgb(h, s, l);
        this.a = 1;
      } else if (found = str.match(RE_RGBA)) {
        this.r = +found[1];
        this.g = +found[2];
        this.b = +found[3];
        this.a = +found[4];
      } else if (found = str.match(RE_HSLA)) {
        h = +found[1];
        s = +found[2] / 100;
        l = +found[3] / 100;
        [this.r, this.g, this.b] = hsl2rgb(h, s, l);
        this.a = parseFloat(found[4]);
      } else if (found = str.match(RE_RGBA_PER)) {
        this.r = +found[1] * 255 / 100;
        this.g = +found[2] * 255 / 100;
        this.b = +found[3] * 255 / 100;
        this.a = +found[4];
      } else if (found = str.match(RE_RGB_PER)) {
        this.r = +found[1] * 255 / 100;
        this.g = +found[2] * 255 / 100;
        this.b = +found[3] * 255 / 100;
        this.a = 1;
      } else if (found = str.match(RE_HEX3)) {
        hex = found[1];
        this.r = parseInt(hex[0], 16);
        this.r = this.r * 16 + this.r;
        this.g = parseInt(hex[1], 16);
        this.g = this.g * 16 + this.g;
        this.b = parseInt(hex[2], 16);
        this.b = this.b * 16 + this.b;
        this.a = 1;
      } else if (found = str.match(RE_HEX6)) {
        hex = found[1];
        this.r = parseInt(hex.substring(0, 2), 16);
        this.g = parseInt(hex.substring(2, 4), 16);
        this.b = parseInt(hex.substring(4, 6), 16);
        this.a = 1;
      } else if (CSS3_COLORS[str = str.toLowerCase().trim()] != null) {
        this.r = CSS3_COLORS[str][0];
        this.g = CSS3_COLORS[str][1];
        this.b = CSS3_COLORS[str][2];
        this.a = CSS3_COLORS[str][3];
        if (this.a == null) {
          this.a = 1;
        }
      } else {
        console.error(`Color.parse("${str}") error.`);
      }
      return this;
    }

    clone() {
      return (new Color).copy(this);
    }

    copy(color) {
      this.r = color.r;
      this.g = color.g;
      this.b = color.b;
      this.a = color.a;
      return this;
    }

    setRGB(r, g, b) {
      this.r = parseInt(r);
      this.g = parseInt(g);
      this.b = parseInt(b);
      this.a = 1;
      return this;
    }

    setRGBA(r, g, b, a) {
      this.r = parseInt(r);
      this.g = parseInt(g);
      this.b = parseInt(b);
      this.a = clampAlpha(parseFloat(a));
      return this;
    }

    toRGB() {
      return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }

    toRGBA() {
      return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }

  }

  // Private functions
  clampAlpha = function(a) {
    return Bu.clamp(a, 0, 1);
  };

  hsl2rgb = function(h, s, l) {
    var i, j, k, p, q, rgb, t;
    h %= 360;
    h /= 360;
    q = l < 0.5 ? l * (1 + s) : l + s - (l * s);
    p = 2 * l - q;
    t = [h + 1 / 3, h, h - 1 / 3];
    rgb = [];
    for (i = j = 0; j <= 2; i = ++j) {
      if (t[i] < 0) {
        t[i] += 1;
      }
      if (t[i] > 1) {
        t[i] -= 1;
      }
    }
    for (i = k = 0; k <= 2; i = ++k) {
      if (t[i] < 1 / 6) {
        rgb[i] = p + (q - p) * 6 * t[i];
      } else if (t[i] < 0.5) {
        rgb[i] = q;
      } else if (t[i] < 2 / 3) {
        rgb[i] = p + (q - p) * 6 * (2 / 3 - t[i]);
      } else {
        rgb[i] = p;
      }
      rgb[i] = Math.round(rgb[i] * 255);
    }
    return rgb;
  };

  RE_HSL = /hsl\(\s*(\d+),\s*(\d+)%,\s*(\d+)%\s*\)/i;

  RE_HSLA = /hsla\(\s*(\d+),\s*(\d+)%,\s*(\d+)%\s*,\s*([.\d]+)\s*\)/i;

  RE_RGB = /rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/i;

  RE_RGBA = /rgba\(\s*(\d+),\s*(\d+),\s*(\d+)\s*,\s*([.\d]+)\s*\)/i;

  RE_RGB_PER = /rgb\(\s*(\d+)%,\s*(\d+)%,\s*(\d+)%\s*\)/i;

  RE_RGBA_PER = /rgba\(\s*(\d+)%,\s*(\d+)%,\s*(\d+)%\s*,\s*([.\d]+)\s*\)/i;

  RE_HEX3 = /#([0-9A-F]{3})\s*$/i;

  RE_HEX6 = /#([0-9A-F]{6})\s*$/i;

  CSS3_COLORS = {
    transparent: [0, 0, 0, 0],
    aliceblue: [240, 248, 255],
    antiquewhite: [250, 235, 215],
    aqua: [0, 255, 255],
    aquamarine: [127, 255, 212],
    azure: [240, 255, 255],
    beige: [245, 245, 220],
    bisque: [255, 228, 196],
    black: [0, 0, 0],
    blanchedalmond: [255, 235, 205],
    blue: [0, 0, 255],
    blueviolet: [138, 43, 226],
    brown: [165, 42, 42],
    burlywood: [222, 184, 135],
    cadetblue: [95, 158, 160],
    chartreuse: [127, 255, 0],
    chocolate: [210, 105, 30],
    coral: [255, 127, 80],
    cornflowerblue: [100, 149, 237],
    cornsilk: [255, 248, 220],
    crimson: [220, 20, 60],
    cyan: [0, 255, 255],
    darkblue: [0, 0, 139],
    darkcyan: [0, 139, 139],
    darkgoldenrod: [184, 134, 11],
    darkgray: [169, 169, 169],
    darkgreen: [0, 100, 0],
    darkgrey: [169, 169, 169],
    darkkhaki: [189, 183, 107],
    darkmagenta: [139, 0, 139],
    darkolivegreen: [85, 107, 47],
    darkorange: [255, 140, 0],
    darkorchid: [153, 50, 204],
    darkred: [139, 0, 0],
    darksalmon: [233, 150, 122],
    darkseagreen: [143, 188, 143],
    darkslateblue: [72, 61, 139],
    darkslategray: [47, 79, 79],
    darkslategrey: [47, 79, 79],
    darkturquoise: [0, 206, 209],
    darkviolet: [148, 0, 211],
    deeppink: [255, 20, 147],
    deepskyblue: [0, 191, 255],
    dimgray: [105, 105, 105],
    dimgrey: [105, 105, 105],
    dodgerblue: [30, 144, 255],
    firebrick: [178, 34, 34],
    floralwhite: [255, 250, 240],
    forestgreen: [34, 139, 34],
    fuchsia: [255, 0, 255],
    gainsboro: [220, 220, 220],
    ghostwhite: [248, 248, 255],
    gold: [255, 215, 0],
    goldenrod: [218, 165, 32],
    gray: [128, 128, 128],
    green: [0, 128, 0],
    greenyellow: [173, 255, 47],
    grey: [128, 128, 128],
    honeydew: [240, 255, 240],
    hotpink: [255, 105, 180],
    indianred: [205, 92, 92],
    indigo: [75, 0, 130],
    ivory: [255, 255, 240],
    khaki: [240, 230, 140],
    lavender: [230, 230, 250],
    lavenderblush: [255, 240, 245],
    lawngreen: [124, 252, 0],
    lemonchiffon: [255, 250, 205],
    lightblue: [173, 216, 230],
    lightcoral: [240, 128, 128],
    lightcyan: [224, 255, 255],
    lightgoldenrodyellow: [250, 250, 210],
    lightgray: [211, 211, 211],
    lightgreen: [144, 238, 144],
    lightgrey: [211, 211, 211],
    lightpink: [255, 182, 193],
    lightsalmon: [255, 160, 122],
    lightseagreen: [32, 178, 170],
    lightskyblue: [135, 206, 250],
    lightslategray: [119, 136, 153],
    lightslategrey: [119, 136, 153],
    lightsteelblue: [176, 196, 222],
    lightyellow: [255, 255, 224],
    lime: [0, 255, 0],
    limegreen: [50, 205, 50],
    linen: [250, 240, 230],
    magenta: [255, 0, 255],
    maroon: [128, 0, 0],
    mediumaquamarine: [102, 205, 170],
    mediumblue: [0, 0, 205],
    mediumorchid: [186, 85, 211],
    mediumpurple: [147, 112, 219],
    mediumseagreen: [60, 179, 113],
    mediumslateblue: [123, 104, 238],
    mediumspringgreen: [0, 250, 154],
    mediumturquoise: [72, 209, 204],
    mediumvioletred: [199, 21, 133],
    midnightblue: [25, 25, 112],
    mintcream: [245, 255, 250],
    mistyrose: [255, 228, 225],
    moccasin: [255, 228, 181],
    navajowhite: [255, 222, 173],
    navy: [0, 0, 128],
    oldlace: [253, 245, 230],
    olive: [128, 128, 0],
    olivedrab: [107, 142, 35],
    orange: [255, 165, 0],
    orangered: [255, 69, 0],
    orchid: [218, 112, 214],
    palegoldenrod: [238, 232, 170],
    palegreen: [152, 251, 152],
    paleturquoise: [175, 238, 238],
    palevioletred: [219, 112, 147],
    papayawhip: [255, 239, 213],
    peachpuff: [255, 218, 185],
    peru: [205, 133, 63],
    pink: [255, 192, 203],
    plum: [221, 160, 221],
    powderblue: [176, 224, 230],
    purple: [128, 0, 128],
    red: [255, 0, 0],
    rosybrown: [188, 143, 143],
    royalblue: [65, 105, 225],
    saddlebrown: [139, 69, 19],
    salmon: [250, 128, 114],
    sandybrown: [244, 164, 96],
    seagreen: [46, 139, 87],
    seashell: [255, 245, 238],
    sienna: [160, 82, 45],
    silver: [192, 192, 192],
    skyblue: [135, 206, 235],
    slateblue: [106, 90, 205],
    slategray: [112, 128, 144],
    slategrey: [112, 128, 144],
    snow: [255, 250, 250],
    springgreen: [0, 255, 127],
    steelblue: [70, 130, 180],
    tan: [210, 180, 140],
    teal: [0, 128, 128],
    thistle: [216, 191, 216],
    tomato: [255, 99, 71],
    turquoise: [64, 224, 208],
    violet: [238, 130, 238],
    wheat: [245, 222, 179],
    white: [255, 255, 255],
    whitesmoke: [245, 245, 245],
    yellow: [255, 255, 0],
    yellowgreen: [154, 205, 50]
  };

  return Color;

})();

var Color$1 = Color;

// the size of rectangle, Bounds etc.
var Size;

Size = class Size {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.type = 'Size';
  }

  set(width, height) {
    this.width = width;
    this.height = height;
  }

};

var Size$1 = Size;

// Add event listener feature to custom objects
var Event;

Event = function() {
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
    var i, len, listener, listeners, results;
    listeners = types[type];
    if (listeners != null) {
      eventData || (eventData = {});
      eventData.target = this;
      results = [];
      for (i = 0, len = listeners.length; i < len; i++) {
        listener = listeners[i];
        listener.call(this, eventData);
        if (listener.once) {
          results.push(listeners.splice(listeners.indexOf(listener), 1));
        } else {
          results.push(void 0);
        }
      }
      return results;
    }
  };
};

var Event$1 = Event;

// Add color to the shapes
// This object is dedicated to mixed-in the Object2D.
var Styled;

Styled = function() {
  this.strokeStyle = Styled.DEFAULT_STROKE_STYLE;
  this.fillStyle = Styled.DEFAULT_FILL_STYLE;
  this.dashStyle = false;
  this.dashFlowSpeed = 0;
  this.lineWidth = 1;
  this.dashOffset = 0;
  // Set/copy style from other style
  this.style = function(style) {
    var i, k, len, ref;
    if (Bu.isString(style)) {
      style = Bu.styles[style];
      if (style == null) {
        style = Bu.styles.default;
        console.warn(`Styled: Bu.styles.${style} doesn't exists, fell back to default.`);
      }
    } else if (style == null) {
      style = Bu.styles['default'];
    }
    ref = ['strokeStyle', 'fillStyle', 'dashStyle', 'dashFlowSpeed', 'lineWidth'];
    for (i = 0, len = ref.length; i < len; i++) {
      k = ref[i];
      this[k] = style[k];
    }
    return this;
  };
  // Set the stroke style
  this.stroke = function(v) {
    if (v == null) {
      v = true;
    }
    if ((Bu.styles != null) && v in Bu.styles) {
      v = Bu.styles[v].strokeStyle;
    }
    switch (v) {
      case true:
        this.strokeStyle = Styled.DEFAULT_STROKE_STYLE;
        break;
      case false:
        this.strokeStyle = null;
        break;
      default:
        this.strokeStyle = v;
    }
    return this;
  };
  // Set the fill style
  this.fill = function(v) {
    if (v == null) {
      v = true;
    }
    if ((Bu.styles != null) && v in Bu.styles) {
      v = Bu.styles[v].fillStyle;
    }
    switch (v) {
      case false:
        this.fillStyle = null;
        break;
      case true:
        this.fillStyle = Styled.DEFAULT_FILL_STYLE;
        break;
      default:
        this.fillStyle = v;
    }
    return this;
  };
  // Set the dash style
  this.dash = function(v) {
    if (v == null) {
      v = true;
    }
    if ((Bu.styles != null) && v in Bu.styles) {
      v = Bu.styles[v].dashStyle;
    }
    if (Bu.isNumber(v)) {
      v = [v, v];
    }
    switch (v) {
      case false:
        this.dashStyle = null;
        break;
      case true:
        this.dashStyle = Styled.DEFAULT_DASH_STYLE;
        break;
      default:
        this.dashStyle = v;
    }
    return this;
  };
  // Set the dash flowing speed
  this.dashFlow = function(speed) {
    if (speed === true || (speed == null)) {
      speed = 1;
    }
    if (speed === false) {
      speed = 0;
    }
    Bu.dashFlowManager.setSpeed(this, speed);
    return this;
  };
  // Set the lineWidth
  this.setLineWidth = function(w) {
    this.lineWidth = w;
    return this;
  };
  return this;
};

Styled.DEFAULT_STROKE_STYLE = '#048';

Styled.DEFAULT_FILL_STYLE = 'rgba(64, 128, 192, 0.5)';

Styled.DEFAULT_DASH_STYLE = [8, 4];

// TODO move out of here
Bu.styles = {
  default: new Styled().stroke().fill(),
  hover: new Styled().stroke('hsla(0, 100%, 40%, 0.75)').fill('hsla(0, 100%, 75%, 0.5)'),
  text: new Styled().stroke(false).fill('black'),
  line: new Styled().fill(false),
  selected: new Styled().setLineWidth(3),
  dash: new Styled().dash()
};

var Styled$1 = Styled;

// Base class of all shapes and other renderable objects
var Object2D;
var hasProp$1 = {}.hasOwnProperty;

Object2D = (function() {
  class Object2D {
    constructor() {
      Styled$1.apply(this);
      Event$1.apply(this);
      this.visible = true;
      this.opacity = 1;
      this.position = new Vector$1;
      this.rotation = 0;
      this._scale = new Vector$1(1, 1);
      this.skew = new Vector$1;
      //@toWorldMatrix = new Bu.Matrix()
      //@updateMatrix ->

      // geometry related
      this.bounds = null; // used to accelerate the hit testing
      this.keyPoints = null;
      // hierarchy
      this.children = [];
      this.parent = null;
    }

    // Translate an object
    translate(dx, dy) {
      this.position.x += dx;
      this.position.y += dy;
      return this;
    }

    // Rotate an object
    rotate(da) {
      this.rotation += da;
      return this;
    }

    // Scale an object by
    scaleBy(ds) {
      this.scale *= ds;
      return this;
    }

    // Scale an object to
    scaleTo(s) {
      this.scale = s;
      return this;
    }

    // Get the root node of the scene tree
    getScene() {
      var node;
      node = this;
      while (true) {
        if (node instanceof Bu.Scene) { // TODO circular reference
          break;
        }
        node = node.parent;
      }
      return node;
    }

    // Add object(s) to children
    addChild(shape) {
      var j, len, s;
      if (Bu.isArray(shape)) {
        for (j = 0, len = shape.length; j < len; j++) {
          s = shape[j];
          this.children.push(s);
          s.parent = this;
        }
      } else {
        this.children.push(shape);
        shape.parent = this;
      }
      return this;
    }

    // Remove object from children
    removeChild(shape) {
      var index;
      index = this.children.indexOf(shape);
      if (index > -1) {
        this.children.splice(index, 1);
      }
      return this;
    }

    // Apply an animation on this object
    // The type of `anim` may be:
    //     1. Preset animations: the animation name(string type), ie. key in `Bu.animations`
    //     2. Custom animations: the animation object of `Animation` type
    //     3. Multiple animations: An array whose children are above two types
    animate(anim, args) {
      var i;
      if (!Bu.isArray(args)) {
        args = [args];
      }
      if (Bu.isString(anim)) {
        if (anim in Bu.animations) {
          Bu.animations[anim].applyTo(this, args);
        } else {
          console.warn(`Bu.animations["${anim}"] doesn't exists.`);
        }
      } else if (Bu.isArray(anim)) {
        for (i in anim) {
          if (!hasProp$1.call(anim, i)) continue;
          this.animate(anim[i], args);
        }
      } else {
        anim.applyTo(this, args);
      }
      return this;
    }

    // Create Bounds for this object
    createBounds() {
      this.bounds = new Bounds$1(this);
      return this;
    }

    // Hit testing with unprojections
    hitTest(v) {
      var renderer;
      renderer = this.getScene().renderer;
      if (renderer.originAtCenter) {
        v.offset(-renderer.width / 2, -renderer.height / 2);
      }
      v.project(renderer.camera);
      v.unProject(this);
      return this.containsPoint(v);
    }

    // Hit testing in the same coordinate
    containsPoint(p) {
      if ((this.bounds != null) && !this.bounds.containsPoint(p)) {
        return false;
      } else if (this._containsPoint) {
        return this._containsPoint(p);
      } else {
        return false;
      }
    }

  }

  Object2D.prototype.type = 'Object2D';

  Object2D.prototype.fillable = false;

  Object2D.property('scale', {
    get: function() {
      return this._scale;
    },
    set: function(val) {
      if (Bu.isNumber(val)) {
        return this._scale.x = this._scale.y = val;
      } else {
        return this._scale = val;
      }
    }
  });

  return Object2D;

})();

var Object2D$1 = Object2D;

// Camera: change the view range at the scene
var Camera;

Camera = class Camera extends Object2D$1 {
  constructor() {
    super();
    this.type = 'Camera';
  }

};

var Camera$1 = Camera;

// Scene is the root of the object tree
var Scene;

Scene = class Scene extends Object2D$1 {
  constructor() {
    super();
    this.type = 'Scene';
    this.background = Scene.DEFAULT_BACKGROUND;
    this.renderer = null;
  }

};

Scene.DEFAULT_BACKGROUND = '#eee';

var Scene$1 = Scene;

// Used to render all the drawable objects to the canvas
var Renderer;

Renderer = (function() {
  class Renderer {
    constructor() {
      var delayed, domBody, domHtml, j, len1, name, onResize, options, ref, tick;
      // Draw an array of drawables
      this.drawShapes = this.drawShapes.bind(this);
      // Draw an drawable to the canvas
      this.drawShape = this.drawShape.bind(this);
      Event$1.apply(this);
      this.type = 'Renderer';
      // API
      this.scene = new Scene$1(this);
      this.camera = new Camera$1;
      this.tickCount = 0;
      this.isRunning = true;
      this.pixelRatio = Bu.global.devicePixelRatio || 1;
      if (typeof ClipMeter !== "undefined" && ClipMeter !== null) {
        this.clipMeter = new ClipMeter();
      }
      // Receive options
      options = Bu.combineOptions(arguments, {
        container: 'body',
        showKeyPoints: false,
        showBounds: false,
        originAtCenter: false,
        imageSmoothing: true
      });
      ref = ['container', 'width', 'height', 'showKeyPoints', 'showBounds', 'originAtCenter'];
      // Copy options
      for (j = 0, len1 = ref.length; j < len1; j++) {
        name = ref[j];
        this[name] = options[name];
      }
      // If options.width is not given, then fillParent is true
      this.fillParent = !Bu.isNumber(options.width);
      // Convert width and height from dip(device independent pixels) to physical pixels
      this.pixelWidth = this.width * this.pixelRatio;
      this.pixelHeight = this.height * this.pixelRatio;
      // Set canvas dom
      this.dom = document.createElement('canvas');
      this.dom.style.cursor = options.cursor || 'default';
      this.dom.style.boxSizing = 'content-box';
      this.dom.oncontextmenu = function() {
        return false;
      };
      // Set context
      this.context = this.dom.getContext('2d');
      this.context.textBaseline = 'top';
      if (Bu.isString(this.container)) {
        // Set container dom
        this.container = document.querySelector(this.container);
      }
      if (this.fillParent && this.container === document.body) {
        domHtml = document.querySelector('html');
        domBody = document.querySelector('body');
        domBody.style.margin = '0';
        domBody.style.overflow = 'hidden';
        domHtml.style.width = domHtml.style.height = domBody.style.width = domBody.style.height = '100%';
      }
      // Set sizes for renderer property, dom attribute and dom style
      onResize = () => {
        var canvasRatio, containerRatio;
        canvasRatio = this.dom.height / this.dom.width;
        containerRatio = this.container.clientHeight / this.container.clientWidth;
        if (containerRatio < canvasRatio) {
          this.height = this.container.clientHeight;
          this.width = this.height / containerRatio;
        } else {
          this.width = this.container.clientWidth;
          this.height = this.width * containerRatio;
        }
        this.pixelWidth = this.dom.width = this.width * this.pixelRatio;
        this.pixelHeight = this.dom.height = this.height * this.pixelRatio;
        this.dom.style.width = this.width + 'px';
        this.dom.style.height = this.height + 'px';
        return this.render();
      };
      if (!this.fillParent) {
        this.dom.style.width = this.width + 'px';
        this.dom.style.height = this.height + 'px';
        this.dom.width = this.pixelWidth;
        this.dom.height = this.pixelHeight;
      } else {
        this.pixelWidth = this.container.clientWidth;
        this.pixelHeight = this.container.clientHeight;
        this.width = this.pixelWidth / this.pixelRatio;
        this.height = this.pixelHeight / this.pixelRatio;
        Bu.global.window.addEventListener('resize', onResize);
        this.dom.addEventListener('DOMNodeInserted', onResize);
      }
      // Run the loop
      tick = () => {
        if (this.isRunning) {
          if (this.clipMeter != null) {
            this.clipMeter.start();
          }
          this.render();
          this.trigger('update', this);
          this.tickCount += 1;
          if (this.clipMeter != null) {
            this.clipMeter.tick();
          }
        }
        return requestAnimationFrame(tick);
      };
      tick();
      // Append <canvas> dom into the container
      delayed = () => {
        this.container.appendChild(this.dom);
        return this.imageSmoothing = options.imageSmoothing;
      };
      setTimeout(delayed, 1);
      // Hook up with running components
      Bu.animationRunner.hookUp(this);
      Bu.dashFlowManager.hookUp(this);
    }

    // Pause/continue/toggle the rendering loop
    pause() {
      return this.isRunning = false;
    }

    continue() {
      return this.isRunning = true;
    }

    toggle() {
      return this.isRunning = !this.isRunning;
    }

    // Perform the full render process
    render() {
      this.context.save();
      // Clear the canvas
      this.clearCanvas();
      if (this.originAtCenter) {
        // Move center from left-top corner to screen center
        this.context.translate(this.pixelWidth / 2, this.pixelHeight / 2);
      }
      // Zoom the canvas with devicePixelRatio to support high definition screen
      this.context.scale(this.pixelRatio, this.pixelRatio);
      // Transform the camera
      this.context.scale(1 / this.camera.scale.x, 1 / this.camera.scale.y);
      this.context.rotate(-this.camera.rotation);
      this.context.translate(-this.camera.position.x, -this.camera.position.y);
      // Draw the scene tree
      this.drawShape(this.scene);
      this.context.restore();
      return this;
    }

    // Clear the canvas
    clearCanvas() {
      this.context.fillStyle = this.scene.background;
      this.context.fillRect(0, 0, this.pixelWidth, this.pixelHeight);
      return this;
    }

    drawShapes(shapes) {
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
    }

    drawShape(shape) {
      var base, sx, sy;
      if (!shape.visible) {
        return this;
      }
      this.context.translate(shape.position.x, shape.position.y);
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
        case 'Ellipse':
          this.drawEllipse(shape);
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
        case 'Object2D':
        case 'Scene': // then do nothing
          break;
        default:
          console.log('drawShapes(): unknown shape: ', shape.type, shape);
      }
      if ((shape.fillStyle != null) && shape.fillable) {
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
      if (this.showKeyPoints) {
        this.drawShapes(shape.keyPoints);
      }
      if (this.showBounds && (shape.bounds != null)) {
        this.drawBounds(shape.bounds);
      }
      return this;
    }

    drawPoint(shape) {
      this.context.arc(shape.x, shape.y, Bu.POINT_RENDER_SIZE, 0, Bu.TWO_PI);
      return this;
    }

    drawLine(shape) {
      this.context.moveTo(shape.points[0].x, shape.points[0].y);
      this.context.lineTo(shape.points[1].x, shape.points[1].y);
      return this;
    }

    drawCircle(shape) {
      this.context.arc(shape.cx, shape.cy, shape.radius, 0, Bu.TWO_PI);
      return this;
    }

    drawEllipse(shape) {
      this.context.ellipse(0, 0, shape.radiusX, shape.radiusY, 0, Bu.TWO_PI, false);
      return this;
    }

    drawTriangle(shape) {
      this.context.lineTo(shape.points[0].x, shape.points[0].y);
      this.context.lineTo(shape.points[1].x, shape.points[1].y);
      this.context.lineTo(shape.points[2].x, shape.points[2].y);
      this.context.closePath();
      return this;
    }

    drawRectangle(shape) {
      if (shape.cornerRadius !== 0) {
        return this.drawRoundRectangle(shape);
      }
      this.context.rect(shape.pointLT.x, shape.pointLT.y, shape.size.width, shape.size.height);
      return this;
    }

    drawRoundRectangle(shape) {
      var base, r, x1, x2, y1, y2;
      x1 = shape.pointLT.x;
      x2 = shape.pointRB.x;
      y1 = shape.pointLT.y;
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
    }

    drawFan(shape) {
      this.context.arc(shape.cx, shape.cy, shape.radius, shape.aFrom, shape.aTo);
      this.context.lineTo(shape.cx, shape.cy);
      this.context.closePath();
      return this;
    }

    drawBow(shape) {
      this.context.arc(shape.cx, shape.cy, shape.radius, shape.aFrom, shape.aTo);
      this.context.closePath();
      return this;
    }

    drawPolygon(shape) {
      var j, len1, point, ref;
      ref = shape.vertices;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        point = ref[j];
        this.context.lineTo(point.x, point.y);
      }
      this.context.closePath();
      return this;
    }

    drawPolyline(shape) {
      var j, len1, point, ref;
      ref = shape.vertices;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        point = ref[j];
        this.context.lineTo(point.x, point.y);
      }
      return this;
    }

    drawSpline(shape) {
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
    }

    drawPointText(shape) {
      var char, charBitmap, font, i, j, ref, textWidth, xOffset, yOffset;
      font = shape.font || Bu.DEFAULT_FONT;
      if (Bu.isString(font)) {
        this.context.textAlign = shape.textAlign;
        this.context.textBaseline = shape.textBaseline;
        this.context.font = font;
        if (shape.strokeStyle != null) {
          this.context.strokeText(shape.text, shape.x, shape.y);
        }
        if (shape.fillStyle != null) {
          this.context.fillStyle = shape.fillStyle;
          this.context.fillText(shape.text, shape.x, shape.y);
        }
      } else if (font instanceof Bu.SpriteSheet && font.ready) {
        textWidth = font.measureTextWidth(shape.text);
        xOffset = (function() {
          switch (shape.textAlign) {
            case 'left':
              return 0;
            case 'center':
              return -textWidth / 2;
            case 'right':
              return -textWidth;
          }
        })();
        yOffset = (function() {
          switch (shape.textBaseline) {
            case 'top':
              return 0;
            case 'middle':
              return -font.height / 2;
            case 'bottom':
              return -font.height;
          }
        })();
        for (i = j = 0, ref = shape.text.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          char = shape.text[i];
          charBitmap = font.getFrameImage(char);
          if (charBitmap != null) {
            this.context.drawImage(charBitmap, shape.x + xOffset, shape.y + yOffset);
            xOffset += charBitmap.width;
          } else {
            xOffset += 10;
          }
        }
      }
      return this;
    }

    drawImage(shape) {
      var dx, dy, h, w;
      if (shape.ready) {
        w = shape.size.width;
        h = shape.size.height;
        dx = -w * shape.pivot.x;
        dy = -h * shape.pivot.y;
        this.context.drawImage(shape.image, dx, dy, w, h);
      }
      return this;
    }

    drawBounds(bounds) {
      var base;
      this.context.beginPath();
      this.context.strokeStyle = Renderer.BOUNDS_STROKE_STYLE;
      if (typeof (base = this.context).setLineDash === "function") {
        base.setLineDash(Renderer.BOUNDS_DASH_STYLE);
      }
      this.context.rect(bounds.x1, bounds.y1, bounds.x2 - bounds.x1, bounds.y2 - bounds.y1);
      this.context.stroke();
      return this;
    }

  }

  // property
  Renderer.property('imageSmoothing', {
    get: function() {
      return this._imageSmoothing;
    },
    set: function(val) {
      return this._imageSmoothing = this.context.imageSmoothingEnabled = val;
    }
  });

  return Renderer;

})();

//----------------------------------------------------------------------
// Static members
//----------------------------------------------------------------------

// Stroke style of bounds
Renderer.BOUNDS_STROKE_STYLE = 'red';

// Dash style of bounds
Renderer.BOUNDS_DASH_STYLE = [6, 6];

var Renderer$1 = Renderer;

// Manage the user input, like mouse, keyboard, touchscreen etc
var InputManager;

InputManager = (function() {
  class InputManager {
    constructor() {
      this.keyStates = [];
      window.addEventListener('keydown', (e) => {
        return this.keyStates[e.keyCode] = true;
      });
      window.addEventListener('keyup', (e) => {
        return this.keyStates[e.keyCode] = false;
      });
    }

    // To detect whether a key is pressed down
    isKeyDown(key) {
      var keyCode;
      keyCode = this.keyToKeyCode(key);
      return this.keyStates[keyCode];
    }

    // Convert from keyIdentifiers/keyValues to keyCode
    keyToKeyCode(key) {
      var keyCode;
      key = this.keyAliasToKeyMap[key] || key;
      return keyCode = this.keyToKeyCodeMap[key];
    }

    // Recieve and bind the mouse/keyboard events listeners
    handleAppEvents(app, events) {
      var key, keyCode, keydownListeners, keyupListeners, results, type;
      keydownListeners = {};
      keyupListeners = {};
      window.addEventListener('keydown', (e) => {
        var ref;
        return (ref = keydownListeners[e.keyCode]) != null ? ref.call(app, e) : void 0;
      });
      window.addEventListener('keyup', (e) => {
        var ref;
        return (ref = keyupListeners[e.keyCode]) != null ? ref.call(app, e) : void 0;
      });
      results = [];
      for (type in events) {
        if (type === 'mousedown' || type === 'mousemove' || type === 'mouseup' || type === 'mousewheel') {
          results.push(app.$renderer.dom.addEventListener(type, events[type].bind(app)));
        } else if (type === 'keydown' || type === 'keyup') {
          results.push(window.addEventListener(type, events[type].bind(app)));
        } else if (type.indexOf('keydown.') === 0) {
          key = type.substring(8);
          keyCode = this.keyToKeyCode(key);
          results.push(keydownListeners[keyCode] = events[type]);
        } else if (type.indexOf('keyup.') === 0) {
          key = type.substring(6);
          keyCode = this.keyToKeyCode(key);
          results.push(keyupListeners[keyCode] = events[type]);
        } else {
          results.push(void 0);
        }
      }
      return results;
    }

  }

  // Map from keyIdentifiers/keyValues to keyCode
  InputManager.prototype.keyToKeyCodeMap = {
    Backspace: 8,
    Tab: 9,
    Enter: 13,
    Shift: 16,
    Control: 17,
    Alt: 18,
    CapsLock: 20,
    Escape: 27,
    ' ': 32, // Space
    PageUp: 33,
    PageDown: 34,
    End: 35,
    Home: 36,
    ArrowLeft: 37,
    ArrowUp: 38,
    ArrowRight: 39,
    ArrowDown: 40,
    Delete: 46,
    1: 49,
    2: 50,
    3: 51,
    4: 52,
    5: 53,
    6: 54,
    7: 55,
    8: 56,
    9: 57,
    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90,
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    '`': 192,
    '=': 187,
    ',': 188,
    '-': 189,
    '.': 190,
    '/': 191,
    ';': 186,
    "'": 222,
    '[': 219,
    ']': 221,
    '\\': 220
  };

  // Map from not standard, but commonly known keyValues/keyIdentifiers to keyCode
  InputManager.prototype.keyAliasToKeyMap = {
    Ctrl: 'Control', // 17
    Ctl: 'Control', // 17
    Esc: 'Escape', // 27
    Space: ' ', // 32
    PgUp: 'PageUp', // 33
    'Page Up': 'PageUp', // 33
    PgDn: 'PageDown', // 34
    'Page Down': 'PageDown', // 34
    Left: 'ArrowLeft', // 37
    Up: 'ArrowUp', // 38
    Right: 'ArrowRight', // 39
    Down: 'ArrowDown', // 40
    Del: 'Delete' // 46
  };

  return InputManager;

})();

var InputManager$1 = InputManager;

// Declarative framework for Bu.js apps
var App;
var hasProp$2 = {}.hasOwnProperty;

App = class App {
  constructor($options = {}) {
    var base, i, k, len, ref;
    this.$options = $options;
    ref = ["renderer", "data", "objects", "methods", "events"];
    for (i = 0, len = ref.length; i < len; i++) {
      k = ref[i];
      (base = this.$options)[k] || (base[k] = {});
    }
    this.$inputManager = new InputManager$1;
    Bu.ready(this.init, this);
  }

  init() {
    var assembleObjects, k, name, objects, ref, scene;
    // scene
    scene = new Scene$1;
    scene.background = this.$options.background || Scene$1.DEFAULT_BACKGROUND;
    // renderer
    this.$renderer = new Renderer$1(this.$options.renderer);
    this.$renderer.scene = scene;
    scene.renderer = this.$renderer;
    // data
    if (Bu.isFunction(this.$options.data)) {
      this.$options.data = this.$options.data.apply(this);
    }
    for (k in this.$options.data) {
      this[k] = this.$options.data[k];
    }
    for (k in this.$options.methods) {
      // methods
      this[k] = this.$options.methods[k];
    }
    // objects
    objects = Bu.isFunction(this.$options.objects) ? this.$options.objects.apply(this) : this.$options.objects;
    for (name in objects) {
      this[name] = objects[name];
    }
    // create default scene tree
    if (!this.$options.scene) {
      this.$options.scene = {};
      for (name in objects) {
        this.$options.scene[name] = {};
      }
    }
    // assemble scene tree
    // TODO use an algorithm to avoid circular structure
    assembleObjects = (children, parent) => {
      var results;
      results = [];
      for (name in children) {
        if (!hasProp$2.call(children, name)) continue;
        parent.addChild(objects[name]);
        results.push(assembleObjects(children[name], objects[name]));
      }
      return results;
    };
    assembleObjects(this.$options.scene, this.$renderer.scene);
    // init
    if ((ref = this.$options.init) != null) {
      ref.call(this);
    }
    // events
    this.$inputManager.handleAppEvents(this, this.$options.events);
    // update
    if (this.$options.update != null) {
      return this.$renderer.on('update', () => {
        return this.$options.update.apply(this, arguments);
      });
    }
  }

};

var App$1 = App;

// Audio
var Audio;

Audio = class Audio {
  constructor(url) {
    this.audio = document.createElement('audio');
    this.url = '';
    this.ready = false;
    if (url) {
      this.load(url);
    }
  }

  load(url) {
    this.url = url;
    this.audio.addEventListener('canplay', () => {
      return this.ready = true;
    });
    return this.audio.src = url;
  }

  play() {
    if (this.ready) {
      return this.audio.play();
    } else {
      return console.warn(`The audio file ${this.url} hasn't been ready.`);
    }
  }

};

var Audio$1 = Audio;

// Render text around a point
var PointText;

PointText = (function() {
  class PointText extends Object2D$1 {
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
    constructor(text, x = 0, y = 0) {
      var options;
      super();
      this.text = text;
      this.x = x;
      this.y = y;
      this.type = 'PointText';
      this.strokeStyle = null; // no stroke by default
      this.fillStyle = 'black';
      options = Bu.combineOptions(arguments, {
        align: '00'
      });
      this.align = options.align;
      if (options.font != null) {
        this.font = options.font;
      } else if ((options.fontFamily != null) || (options.fontSize != null)) {
        this._fontFamily = options.fontFamily || Bu.DEFAULT_FONT_FAMILY;
        this._fontSize = options.fontSize || Bu.DEFAULT_FONT_SIZE;
        this.font = `${this._fontSize}px ${this._fontFamily}`;
      } else {
        this.font = null;
      }
    }

    setAlign(align) {
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
      this.textBaseline = (function() {
        switch (alignY) {
          case '-':
            return 'bottom';
          case '0':
            return 'middle';
          case '+':
            return 'top';
        }
      })();
      return this;
    }

    setFontFamily(family) {
      this.fontFamily = family;
      return this;
    }

    setFontSize(size) {
      this.fontSize = size;
      return this;
    }

  }

  PointText.property('align', {
    get: function() {
      return this._align;
    },
    set: function(val) {
      this._align = val;
      return this.setAlign(this._align);
    }
  });

  PointText.property('fontFamily', {
    get: function() {
      return this._fontFamily;
    },
    set: function(val) {
      this._fontFamily = val;
      return this.font = `${this._fontSize}px ${this._fontFamily}`;
    }
  });

  PointText.property('fontSize', {
    get: function() {
      return this._fontSize;
    },
    set: function(val) {
      this._fontSize = val;
      return this.font = `${this._fontSize}px ${this._fontFamily}`;
    }
  });

  return PointText;

})();

var PointText$1 = PointText;

// point shape
var Point;

Point = (function() {
  class Point extends Object2D$1 {
    constructor(x1 = 0, y1 = 0) {
      super();
      this.x = x1;
      this.y = y1;
      this.lineWidth = 0.5;
      this._labelIndex = -1;
    }

    clone() {
      return new Point(this.x, this.y);
    }

    arcTo(radius, arc) {
      return new Point(this.x + Math.cos(arc) * radius, this.y + Math.sin(arc) * radius);
    }

    // copy value from other line
    copy(point) {
      this.x = point.x;
      this.y = point.y;
      this.updateLabel();
      return this;
    }

    // set value from x, y
    set(x, y) {
      this.x = x;
      this.y = y;
      this.updateLabel();
      return this;
    }

    // set label text
    setLabel(text) {
      this.label = text;
      this.updateLabel();
      return this;
    }

    updateLabel() {
      if (this._labelIndex > -1) {
        this.children[this._labelIndex].x = this.x + Bu.POINT_LABEL_OFFSET;
        this.children[this._labelIndex].y = this.y;
      }
      return this;
    }

  }

  Point.prototype.type = 'Point';

  Point.prototype.fillable = true;

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
        pointText = new PointText$1(val, this.x + Bu.POINT_LABEL_OFFSET, this.y, {
          align: '+0'
        });
        this.children.push(pointText);
        return this._labelIndex = this.children.length - 1;
      } else {
        return this.children[this._labelIndex].text = val;
      }
    }
  });

  return Point;

})();

var Point$1 = Point;

// line shape
var Line;

Line = (function() {
  class Line extends Object2D$1 {
    constructor(p1, p2, p3, p4) {
      super();
      if (arguments.length < 2) {
        this.points = [new Point$1(), new Point$1()];
      } else if (arguments.length < 4) {
        this.points = [
          p1.clone(),
          p2.clone() // len >= 4
        ];
      } else {
        this.points = [new Point$1(p1, p2), new Point$1(p3, p4)];
      }
      this.length = 0;
      this.midpoint = new Point$1();
      this.keyPoints = this.points;
      this.on("changed", () => {
        this.length = this.points[0].distanceTo(this.points[1]);
        return this.midpoint.set((this.points[0].x + this.points[1].x) / 2, (this.points[0].y + this.points[1].y) / 2);
      });
      this.trigger("changed");
    }

    clone() {
      return new Line(this.points[0], this.points[1]);
    }

    // edit
    set(a1, a2, a3, a4) {
      if (typeof p4 !== "undefined" && p4 !== null) {
        this.points[0].set(a1, a2);
        this.points[1].set(a3, a4);
      } else {
        this.points[0] = a1;
        this.points[1] = a2;
      }
      this.trigger("changed");
      return this;
    }

    setPoint1(a1, a2) {
      if (a2 != null) {
        this.points[0].set(a1, a2);
      } else {
        this.points[0].copy(a1);
      }
      this.trigger("changed");
      return this;
    }

    setPoint2(a1, a2) {
      if (a2 != null) {
        this.points[1].set(a1, a2);
      } else {
        this.points[1].copy(a1);
      }
      this.trigger("changed");
      return this;
    }

  }

  Line.prototype.type = 'Line';

  Line.prototype.fillable = false;

  return Line;

})();

var Line$1 = Line;

// Bow shape
var Bow;

Bow = (function() {
  class Bow extends Object2D$1 {
    constructor(cx, cy, radius, aFrom, aTo) {
      super();
      this.cx = cx;
      this.cy = cy;
      this.radius = radius;
      this.aFrom = aFrom;
      this.aTo = aTo;
      if (this.aFrom > this.aTo) {
        [this.aFrom, this.aTo] = [this.aTo, this.aFrom];
      }
      this.center = new Point$1(this.cx, this.cy);
      this.string = new Line$1(this.center.arcTo(this.radius, this.aFrom), this.center.arcTo(this.radius, this.aTo));
      this.keyPoints = this.string.points;
      this.updateKeyPoints();
      this.on('changed', this.updateKeyPoints);
      this.on('changed', () => {
        var ref;
        return (ref = this.bounds) != null ? ref.update() : void 0;
      });
    }

    clone() {
      return new Bow(this.cx, this.cy, this.radius, this.aFrom, this.aTo);
    }

    updateKeyPoints() {
      this.center.set(this.cx, this.cy);
      this.string.points[0].copy(this.center.arcTo(this.radius, this.aFrom));
      this.string.points[1].copy(this.center.arcTo(this.radius, this.aTo));
      this.keyPoints = this.string.points;
      return this;
    }

  }

  Bow.prototype.type = 'Bow';

  Bow.prototype.fillable = true;

  return Bow;

})();

var Bow$1 = Bow;

// Circle shape
var Circle;

Circle = (function() {
  class Circle extends Object2D$1 {
    constructor(_radius = 1, cx = 0, cy = 0) {
      super();
      this._radius = _radius;
      this._center = new Point$1(cx, cy);
      this.bounds = null; // for accelerate contain test
      this.keyPoints = [this._center];
      this.on('centerChanged', this.updateKeyPoints);
    }

    clone() {
      return new Circle(this.radius, this.cx, this.cy);
    }

    updateKeyPoints() {
      return this.keyPoints[0].set(this.cx, this.cy);
    }

  }

  Circle.prototype.type = 'Circle';

  Circle.prototype.fillable = true;

  // property
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

  return Circle;

})();

var Circle$1 = Circle;

// Ellipse/Oval Shape
var Ellipse;

Ellipse = (function() {
  class Ellipse extends Object2D$1 {
    constructor(_radiusX = 20, _radiusY = 10) {
      super();
      this._radiusX = _radiusX;
      this._radiusY = _radiusY;
    }

  }

  Ellipse.prototype.type = 'Ellipse';

  Ellipse.prototype.fillable = true;

  // property
  Ellipse.property('radiusX', {
    get: function() {
      return this._radiusX;
    },
    set: function(val) {
      this._radiusX = val;
      return this.trigger('changed', this);
    }
  });

  Ellipse.property('radiusY', {
    get: function() {
      return this._radiusY;
    },
    set: function(val) {
      this._radiusY = val;
      return this.trigger('changed', this);
    }
  });

  return Ellipse;

})();

var Ellipse$1 = Ellipse;

// Fan shape
var Fan;

Fan = (function() {
  class Fan extends Object2D$1 {
    constructor(cx, cy, radius, aFrom, aTo) {
      super();
      this.cx = cx;
      this.cy = cy;
      this.radius = radius;
      this.aFrom = aFrom;
      this.aTo = aTo;
      if (this.aFrom > this.aTo) {
        [this.aFrom, this.aTo] = [this.aTo, this.aFrom];
      }
      this.center = new Point$1(this.cx, this.cy);
      this.string = new Line$1(this.center.arcTo(this.radius, this.aFrom), this.center.arcTo(this.radius, this.aTo));
      this.keyPoints = [this.string.points[0], this.string.points[1], this.center];
      this.on('changed', this.updateKeyPoints);
      this.on('changed', () => {
        var ref;
        return (ref = this.bounds) != null ? ref.update() : void 0;
      });
    }

    clone() {
      return new Fan(this.cx, this.cy, this.radius, this.aFrom, this.aTo);
    }

    updateKeyPoints() {
      this.center.set(this.cx, this.cy);
      this.string.points[0].copy(this.center.arcTo(this.radius, this.aFrom));
      this.string.points[1].copy(this.center.arcTo(this.radius, this.aTo));
      return this;
    }

  }

  Fan.prototype.type = 'Fan';

  Fan.prototype.fillable = true;

  return Fan;

})();

var Fan$1 = Fan;

// triangle shape
var Triangle;

Triangle = (function() {
  class Triangle extends Object2D$1 {
    constructor(p1, p2, p3) {
      var x1, x2, x3, y1, y2, y3;
      super();
      if (arguments.length === 6) {
        [x1, y1, x2, y2, x3, y3] = arguments;
        p1 = new Point$1(x1, y1);
        p2 = new Point$1(x2, y2);
        p3 = new Point$1(x3, y3);
      }
      this.lines = [new Line$1(p1, p2), new Line$1(p2, p3), new Line$1(p3, p1)];
      //@center = new Point Bu.average(p1.x, p2.x, p3.x), Bu.average(p1.y, p2.y, p3.y)
      this.points = [p1, p2, p3];
      this.keyPoints = this.points;
      this.on('changed', this.update);
      this.on('changed', () => {
        var ref;
        return (ref = this.bounds) != null ? ref.update() : void 0;
      });
    }

    clone() {
      return new Triangle(this.points[0], this.points[1], this.points[2]);
    }

    update() {
      this.lines[0].points[0].copy(this.points[0]);
      this.lines[0].points[1].copy(this.points[1]);
      this.lines[1].points[0].copy(this.points[1]);
      this.lines[1].points[1].copy(this.points[2]);
      this.lines[2].points[0].copy(this.points[2]);
      return this.lines[2].points[1].copy(this.points[0]);
    }

  }

  Triangle.prototype.type = 'Triangle';

  Triangle.prototype.fillable = true;

  return Triangle;

})();

var Triangle$1 = Triangle;

// polygon shape
var Polygon;

Polygon = (function() {
  class Polygon extends Object2D$1 {
    /*
       constructors
       1. Polygon(points)
       2. Polygon(x, y, radius, n, options): to generate regular polygon
       	options: angle - start angle of regular polygon
    */
    constructor(points) {
      var n, options, radius, x, y;
      super();
      this.vertices = [];
      this.lines = [];
      this.triangles = [];
      options = Bu.combineOptions(arguments, {
        angle: 0
      });
      if (Bu.isArray(points)) {
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
        this.vertices = Polygon.generateRegularPoints(x, y, radius, n, options);
      }
      this.onVerticesChanged();
      this.on('changed', this.onVerticesChanged);
      this.on('changed', () => {
        var ref;
        return (ref = this.bounds) != null ? ref.update() : void 0;
      });
      this.keyPoints = this.vertices;
    }

    clone() {
      return new Polygon(this.vertices);
    }

    onVerticesChanged() {
      var i, k, l, ref, ref1, results;
      this.lines = [];
      this.triangles = [];
      // init lines
      if (this.vertices.length > 1) {
        for (i = k = 0, ref = this.vertices.length - 1; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
          this.lines.push(new Line$1(this.vertices[i], this.vertices[i + 1]));
        }
        this.lines.push(new Line$1(this.vertices[this.vertices.length - 1], this.vertices[0]));
      }
      // init triangles
      if (this.vertices.length > 2) {
        results = [];
        for (i = l = 1, ref1 = this.vertices.length - 1; 1 <= ref1 ? l < ref1 : l > ref1; i = 1 <= ref1 ? ++l : --l) {
          results.push(this.triangles.push(new Triangle$1(this.vertices[0], this.vertices[i], this.vertices[i + 1])));
        }
        return results;
      }
    }

    // detect
    isSimple() {
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
    }

    // edit
    addPoint(point, insertIndex) {
      if (insertIndex == null) {
        // add point
        this.vertices.push(point);
        // add line
        if (this.vertices.length > 1) {
          this.lines[this.lines.length - 1].points[1] = point;
        }
        if (this.vertices.length > 0) {
          this.lines.push(new Line$1(this.vertices[this.vertices.length - 1], this.vertices[0]));
        }
        // add triangle
        if (this.vertices.length > 2) {
          return this.triangles.push(new Triangle$1(this.vertices[0], this.vertices[this.vertices.length - 2], this.vertices[this.vertices.length - 1]));
        }
      } else {
        return this.vertices.splice(insertIndex, 0, point);
      }
    }

    // TODO add lines and triangles
    static generateRegularPoints(cx, cy, radius, n, options) {
      var a, angleDelta, angleSection, i, k, points, r, ref, x, y;
      angleDelta = options.angle;
      r = radius;
      points = [];
      angleSection = Bu.TWO_PI / n;
      for (i = k = 0, ref = n; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
        a = i * angleSection + angleDelta;
        x = cx + r * Math.cos(a);
        y = cy + r * Math.sin(a);
        points[i] = new Point$1(x, y);
      }
      return points;
    }

  }

  Polygon.prototype.type = 'Polygon';

  Polygon.prototype.fillable = true;

  return Polygon;

})();

var Polygon$1 = Polygon;

// polyline shape
var Polyline;

Polyline = (function() {
  class Polyline extends Object2D$1 {
    constructor(vertices1 = []) {
      var i, j, ref, vertices;
      super();
      this.vertices = vertices1;
      if (arguments.length > 1) {
        vertices = [];
        for (i = j = 0, ref = arguments.length / 2; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          vertices.push(new Point$1(arguments[i * 2], arguments[i * 2 + 1]));
        }
        this.vertices = vertices;
      }
      this.lines = [];
      this.keyPoints = this.vertices;
      this.fill(false);
      this.on("changed", () => {
        if (this.vertices.length > 1) {
          this.updateLines();
          if (typeof this.calcLength === "function") {
            this.calcLength();
          }
          return typeof this.calcPointNormalizedPos === "function" ? this.calcPointNormalizedPos() : void 0;
        }
      });
      this.trigger("changed");
    }

    clone() {
      var polyline;
      polyline = new Polyline(this.vertices);
      polyline.strokeStyle = this.strokeStyle;
      polyline.fillStyle = this.fillStyle;
      polyline.dashStyle = this.dashStyle;
      polyline.lineWidth = this.lineWidth;
      polyline.dashOffset = this.dashOffset;
      return polyline;
    }

    updateLines() {
      var i, j, ref;
      for (i = j = 0, ref = this.vertices.length - 1; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        if (this.lines[i] != null) {
          this.lines[i].set(this.vertices[i], this.vertices[i + 1]);
        } else {
          this.lines[i] = new Line$1(this.vertices[i], this.vertices[i + 1]);
        }
      }
      return this;
    }

    addPoint(point, insertIndex) {
      if (insertIndex == null) {
        // add point
        this.vertices.push(point);
        // add line
        if (this.vertices.length > 1) {
          this.lines.push(new Line$1(this.vertices[this.vertices.length - 2], this.vertices[this.vertices.length - 1]));
        }
      } else {
        this.vertices.splice(insertIndex, 0, point);
      }
      // TODO add lines
      this.trigger("changed");
      return this;
    }

  }

  Polyline.prototype.type = 'Polyline';

  Polyline.prototype.fillable = false;

  // edit
  return Polyline;

})();

var Polyline$1 = Polyline;

// rectangle shape
var Rectangle;

Rectangle = (function() {
  class Rectangle extends Object2D$1 {
    constructor(x, y, width, height, cornerRadius = 0) {
      super();
      this.center = new Point$1(x + width / 2, y + height / 2);
      this.size = new Size$1(width, height);
      this.pointLT = new Point$1(x, y);
      this.pointRT = new Point$1(x + width, y);
      this.pointRB = new Point$1(x + width, y + height);
      this.pointLB = new Point$1(x, y + height);
      this.points = [this.pointLT, this.pointRT, this.pointRB, this.pointLB];
      this.cornerRadius = cornerRadius;
      this.on('changed', () => {
        var ref;
        return (ref = this.bounds) != null ? ref.update() : void 0;
      });
    }

    clone() {
      return new Rectangle(this.pointLT.x, this.pointLT.y, this.size.width, this.size.height);
    }

    set(x, y, width, height) {
      this.center.set(x + width / 2, y + height / 2);
      this.size.set(width, height);
      this.pointLT.set(x, y);
      this.pointRT.set(x + width, y);
      this.pointRB.set(x + width, y + height);
      return this.pointLB.set(x, y + height);
    }

  }

  Rectangle.prototype.type = 'Rectangle';

  Rectangle.prototype.fillable = true;

  Rectangle.property('cornerRadius', {
    get: function() {
      return this._cornerRadius;
    },
    set: function(val) {
      this._cornerRadius = val;
      return this.keyPoints = val > 0 ? [] : this.points;
    }
  });

  return Rectangle;

})();

var Rectangle$1 = Rectangle;

// spline shape
var Spline;

Spline = (function() {
  var calcControlPoints;

  class Spline extends Object2D$1 {
    constructor(vertices) {
      var polyline;
      super();
      if (vertices instanceof Polyline$1) {
        polyline = vertices;
        this.vertices = polyline.vertices;
        polyline.on('pointChange', (polyline) => {
          this.vertices = polyline.vertices;
          return calcControlPoints(this);
        });
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

    clone() {
      return new Spline(this.vertices);
    }

    addPoint(point) {
      this.vertices.push(point);
      return calcControlPoints(this);
    }

  }

  Spline.prototype.type = 'Spline';

  Spline.prototype.fillable = false;

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
        if (Math.abs(theta - theta1) > Bu.HALF_PI) {
          theta += Math.PI;
        }
        xA = p[i].x - len1 * spline.smoothFactor * Math.cos(theta);
        yA = p[i].y - len1 * spline.smoothFactor * Math.sin(theta);
        xB = p[i].x + len2 * spline.smoothFactor * Math.cos(theta);
        yB = p[i].y + len2 * spline.smoothFactor * Math.sin(theta);
        spline.controlPointsAhead[i] = new Point$1(xA, yA);
        results.push(spline.controlPointsBehind[i] = new Point$1(xB, yB));
      }
      return results;
    }
  };

  return Spline;

})();

// add control lines for debugging
//spline.children[i * 2 - 2] = new Bu.Line spline.vertices[i], spline.controlPointsAhead[i]
//spline.children[i * 2 - 1] =  new Bu.Line spline.vertices[i], spline.controlPointsBehind[i]
var Spline$1 = Spline;

// Used to render bitmap to the screen
var Image$1;

Image$1 = (function() {
  class Image extends Object2D$1 {
    constructor(url, x = 0, y = 0, width, height) {
      super();
      this.url = url;
      this.type = 'Image';
      this.autoSize = true;
      this.size = new Size$1;
      this.position = new Vector$1(x, y);
      this.center = new Vector$1(x + width / 2, y + height / 2);
      if (width != null) {
        this.size.set(width, height);
        this.autoSize = false;
      }
      this.pivot = new Vector$1(0.5, 0.5);
      this._image = new Bu.global.Image;
      this.ready = false;
      this._image.onload = (e) => {
        if (this.autoSize) {
          this.size.set(this._image.width, this._image.height);
        }
        return this.ready = true;
      };
      if (this.url != null) {
        this._image.src = this.url;
      }
    }

  }

  Image.property('image', {
    get: function() {
      return this._image;
    },
    set: function(val) {
      this._image = val;
      return this.ready = true;
    }
  });

  return Image;

})();

var Image$2 = Image$1;

// AnimationTask is an instance of Animation, run by AnimationRunner
var AnimationTask;
var hasProp$4 = {}.hasOwnProperty;

AnimationTask = (function() {
  var interpolateColor, interpolateNum, interpolateVector;

  class AnimationTask {
    constructor(animation, target, args = []) {
      this.animation = animation;
      this.target = target;
      this.args = args;
      this.startTime = 0;
      this.finished = false;
      this.from = Bu.clone(this.animation.from);
      this.current = Bu.clone(this.animation.from);
      this.to = Bu.clone(this.animation.to);
      this.data = {};
      this.t = 0;
      this.arg = this.args[0];
    }

    init() {
      var ref;
      if ((ref = this.animation.init) != null) {
        ref.call(this.target, this);
      }
      return this.current = Bu.clone(this.from);
    }

    // Change the animation progress to the start
    restart() {
      this.startTime = Bu.now();
      return this.finished = false;
    }

    // Change the animation progress to the end
    end() {
      return this.startTime = Bu.now() - this.animation.duration * 1000;
    }

    // Interpolate `current` according `from`, `to` and `t`
    interpolate() {
      var key, ref, results;
      if (this.from == null) {
        return;
      }
      if (Bu.isNumber(this.from)) {
        return this.current = interpolateNum(this.from, this.to, this.t);
      } else if (this.from instanceof Color$1) {
        return interpolateColor(this.from, this.to, this.t, this.current);
      } else if (this.from instanceof Vector$1) {
        return interpolateVector(this.from, this.to, this.t, this.current);
      } else if (Bu.isPlainObject(this.from)) {
        ref = this.from;
        results = [];
        for (key in ref) {
          if (!hasProp$4.call(ref, key)) continue;
          if (Bu.isNumber(this.from[key])) {
            results.push(this.current[key] = interpolateNum(this.from[key], this.to[key], this.t));
          } else {
            results.push(interpolateObject(this.from[key], this.to[key], this.t, this.current[key]));
          }
        }
        return results;
      } else {
        return console.error("Animation not support interpolate type: ", this.from);
      }
    }

  }

  interpolateNum = function(a, b, t) {
    return b * t - a * (t - 1);
  };

  interpolateColor = function(a, b, t, c) {
    return c.setRGBA(interpolateNum(a.r, b.r, t), interpolateNum(a.g, b.g, t), interpolateNum(a.b, b.b, t), interpolateNum(a.a, b.a, t));
  };

  interpolateVector = function(a, b, t, c) {
    c.x = interpolateNum(a.x, b.x, t);
    return c.y = interpolateNum(a.y, b.y, t);
  };

  return AnimationTask;

})();

var AnimationTask$1 = AnimationTask;

// animation class and preset animations
var Animation;
var hasProp$3 = {}.hasOwnProperty;

Animation = class Animation {
  constructor(options) {
    this.from = options.from;
    this.to = options.to;
    this.duration = options.duration || 0.5;
    this.easing = options.easing || false;
    this.repeat = !!options.repeat;
    this.init = options.init;
    this.update = options.update;
    this.finish = options.finish;
  }

  applyTo(target, args) {
    var task;
    if (!Bu.isArray(args)) {
      args = [args];
    }
    task = new AnimationTask$1(this, target, args);
    Bu.animationRunner.add(task); // TODO use module
    return task;
  }

  isLegal() {
    var key, ref;
    if (!((this.from != null) && (this.to != null))) {
      return true;
    }
    if (Bu.isPlainObject(this.from)) {
      ref = this.from;
      for (key in ref) {
        if (!hasProp$3.call(ref, key)) continue;
        if (this.to[key] == null) {
          return false;
        }
      }
    } else {
      if (this.to == null) {
        return false;
      }
    }
    return true;
  }

};

// Preset Animations
// Some of the animations are consistent with jQuery UI
// TODO remove out of here
Bu.animations = {
  //----------------------------------------------------------------------
  // Simple
  //----------------------------------------------------------------------
  fadeIn: new Animation({
    update: function(anim) {
      return this.opacity = anim.t;
    }
  }),
  fadeOut: new Animation({
    update: function(anim) {
      return this.opacity = 1 - anim.t;
    }
  }),
  spin: new Animation({
    update: function(anim) {
      return this.rotation = anim.t * Math.PI * 2;
    }
  }),
  spinIn: new Animation({
    init: function(anim) {
      return anim.data.desScale = anim.arg || 1;
    },
    update: function(anim) {
      this.opacity = anim.t;
      this.rotation = anim.t * Math.PI * 4;
      return this.scale = anim.t * anim.data.desScale;
    }
  }),
  spinOut: new Animation({
    update: function(anim) {
      this.opacity = 1 - anim.t;
      this.rotation = anim.t * Math.PI * 4;
      return this.scale = 1 - anim.t;
    }
  }),
  blink: new Animation({
    duration: 0.2,
    from: 0,
    to: 512,
    update: function(anim) {
      var d;
      d = Math.floor(Math.abs(anim.current - 256));
      return this.fillStyle = `rgb(${d}, ${d}, ${d})`;
    }
  }),
  shake: new Animation({
    init: function(anim) {
      anim.data.ox = this.position.x;
      return anim.data.range = anim.arg || 20;
    },
    update: function(anim) {
      return this.position.x = Math.sin(anim.t * Math.PI * 8) * anim.data.range + anim.data.ox;
    }
  }),
  jump: new Animation({
    init: function(anim) {
      anim.data.oy = this.position.y;
      return anim.data.height = anim.arg || 100;
    },
    update: function(anim) {
      return this.position.y = -anim.data.height * Math.sin(anim.t * Math.PI) + anim.data.oy;
    }
  }),
  //----------------------------------------------------------------------
  // Toggled: detect and save original status
  //----------------------------------------------------------------------
  puff: new Animation({
    duration: 0.15,
    init: function(anim) {
      anim.from = {
        opacity: this.opacity,
        scale: this.scale.x
      };
      return anim.to = this.opacity === 1 ? {
        opacity: 0,
        scale: this.scale.x * 1.5
      } : {
        opacity: 1,
        scale: this.scale.x / 1.5
      };
    },
    update: function(anim) {
      this.opacity = anim.current.opacity;
      return this.scale = anim.current.scale;
    }
  }),
  clip: new Animation({
    init: function(anim) {
      if (this.scale.y !== 0) {
        anim.from = this.scale.y;
        return anim.to = 0;
      } else {
        anim.from = this.scale.y;
        return anim.to = this.scale.x;
      }
    },
    update: function(anim) {
      return this.scale.y = anim.current;
    }
  }),
  flipX: new Animation({
    init: function(anim) {
      anim.from = this.scale.x;
      return anim.to = -anim.from;
    },
    update: function(anim) {
      return this.scale.x = anim.current;
    }
  }),
  flipY: new Animation({
    init: function(anim) {
      anim.from = this.scale.y;
      return anim.to = -anim.from;
    },
    update: function(anim) {
      return this.scale.y = anim.current;
    }
  }),
  //----------------------------------------------------------------------
  // With Arguments
  //----------------------------------------------------------------------
  moveTo: new Animation({
    init: function(anim) {
      if (anim.arg != null) {
        anim.from = this.position.x;
        return anim.to = parseFloat(anim.arg);
      } else {
        return console.error('Bu.animations.moveTo need an argument');
      }
    },
    update: function(anim) {
      return this.position.x = anim.current;
    }
  }),
  moveBy: new Animation({
    init: function(anim) {
      if (anim.args != null) {
        anim.from = this.position.x;
        return anim.to = this.position.x + parseFloat(anim.args);
      } else {
        return console.error('Bu.animations.moveBy need an argument');
      }
    },
    update: function(anim) {
      return this.position.x = anim.current;
    }
  }),
  discolor: new Animation({
    init: function(anim) {
      var desColor;
      desColor = anim.arg;
      if (Bu.isString(desColor)) {
        desColor = new Color$1(desColor);
      }
      anim.from = new Color$1(this.fillStyle);
      return anim.to = desColor;
    },
    update: function(anim) {
      return this.fillStyle = anim.current.toRGBA();
    }
  })
};

var Animation$1 = Animation;

// Run the animation tasks
var AnimationRunner;

AnimationRunner = (function() {
  var DEFAULT_EASING_FUNCTION, easingFunctions;

  class AnimationRunner {
    constructor() {
      this.runningAnimations = [];
    }

    add(task) {
      task.init();
      if (task.animation.isLegal()) {
        task.startTime = Bu.now();
        return this.runningAnimations.push(task);
      } else {
        return console.error('AnimationRunner: animation setting is illegal: ', task.animation);
      }
    }

    update() {
      var anim, finish, i, len, now, ref, ref1, results, t, task;
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
        if (t >= 1) {
          finish = true;
          if (anim.repeat) {
            t = 0;
            task.startTime = Bu.now();
          } else {
            // TODO remove the finished tasks out
            t = 1;
            task.finished = true;
          }
        }
        if (anim.easing === true) {
          t = easingFunctions[DEFAULT_EASING_FUNCTION](t);
        } else if (easingFunctions[anim.easing] != null) {
          t = easingFunctions[anim.easing](t);
        }
        task.t = t;
        task.interpolate();
        anim.update.call(task.target, task);
        if (finish) {
          results.push((ref1 = anim.finish) != null ? ref1.call(task.target, task) : void 0);
        } else {
          results.push(void 0);
        }
      }
      return results;
    }

    // Hook up on an renderer, remove own setInternal
    hookUp(renderer) {
      return renderer.on('update', () => {
        return this.update();
      });
    }

  }

  //----------------------------------------------------------------------
  // Private variables
  //----------------------------------------------------------------------
  DEFAULT_EASING_FUNCTION = 'quad';

  easingFunctions = {
    quadIn: function(t) {
      return t * t;
    },
    quadOut: function(t) {
      return t * (2 - t);
    },
    quad: function(t) {
      if (t < 0.5) {
        return 2 * t * t;
      } else {
        return -2 * t * t + 4 * t - 1;
      }
    },
    cubicIn: function(t) {
      return Math.pow(t, 3);
    },
    cubicOut: function(t) {
      return Math.pow(t - 1, 3) + 1;
    },
    cubic: function(t) {
      if (t < 0.5) {
        return 4 * Math.pow(t, 3);
      } else {
        return 4 * Math.pow(t - 1, 3) + 1;
      }
    },
    sineIn: function(t) {
      return Math.sin((t - 1) * Bu.HALF_PI) + 1;
    },
    sineOut: function(t) {
      return Math.sin(t * Bu.HALF_PI);
    },
    sine: function(t) {
      if (t < 0.5) {
        return (Math.sin((t * 2 - 1) * Bu.HALF_PI) + 1) / 2;
      } else {
        return Math.sin((t - 0.5) * Math.PI) / 2 + 0.5;
      }
    }
  };

  return AnimationRunner;

})();

// TODO add quart, quint, expo, circ, back, elastic, bounce

// Define the global unique instance of this class
Bu.animationRunner = new AnimationRunner;

var AnimationRunner$1 = AnimationRunner;

// Manage an Object2D list and update its dashOffset
var DashFlowManager;

DashFlowManager = class DashFlowManager {
  constructor() {
    this.flowingObjects = [];
  }

  setSpeed(target, speed) {
    var i;
    target.dashFlowSpeed = speed;
    i = this.flowingObjects.indexOf(target);
    if (speed !== 0) {
      if (i === -1) {
        return this.flowingObjects.push(target);
      }
    } else {
      if (i > -1) {
        return this.flowingObjects.splice(i, 1);
      }
    }
  }

  update() {
    var j, len, o, ref, results;
    ref = this.flowingObjects;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      o = ref[j];
      results.push(o.dashOffset += o.dashFlowSpeed);
    }
    return results;
  }

  // Hook up on an renderer, remove own setInternal
  hookUp(renderer) {
    return renderer.on('update', () => {
      return this.update();
    });
  }

};

// Global unique instance
Bu.dashFlowManager = new DashFlowManager;

var DashFlowManager$1 = DashFlowManager;

// Sprite Sheet
var SpriteSheet;
var ajax;
var hasProp$5 = {}.hasOwnProperty;

//----------------------------------------------------------------------
// jQuery style ajax()
//	options:
//		url: string
//		====
//		async = true: bool
//	data: object - query parameters TODO: implement this
//		method = GET: POST, PUT, DELETE, HEAD
//		username: string
//		password: string
//		success: function
//		error: function
//		complete: function
//----------------------------------------------------------------------
ajax = function(url, ops) {
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

SpriteSheet = (function() {
  var canvas, clipImage, context;

  class SpriteSheet {
    constructor(url1) {
      this.url = url1;
      Event$1.apply(this);
      this.ready = false; // If this sprite sheet is loaded and parsed.
      this.height = 0; // Height of this sprite
      this.data = null; // The JSON data
      this.images = []; // The `Image` list loaded
      this.frameImages = []; // Parsed frame images
      
      // load and trigger parseData()
      ajax(this.url, {
        success: (text) => {
          var baseUrl, countLoaded, i, ref, results;
          this.data = JSON.parse(text);
          if (this.data.images == null) {
            this.data.images = [this.url.substring(this.url.lastIndexOf('/'), this.url.length - 5) + '.png'];
          }
          baseUrl = this.url.substring(0, this.url.lastIndexOf('/') + 1);
          ref = this.data.images;
          results = [];
          for (i in ref) {
            if (!hasProp$5.call(ref, i)) continue;
            this.data.images[i] = baseUrl + this.data.images[i];
            countLoaded = 0;
            this.images[i] = new Image;
            this.images[i].onload = () => {
              countLoaded += 1;
              if (countLoaded === this.data.images.length) {
                return this.parseData();
              }
            };
            results.push(this.images[i].src = this.data.images[i]);
          }
          return results;
        }
      });
    }

    parseData() {
      var frameIndex, frames, h, i, j, k, ref, w, x, y;
      // Clip the image for every frames
      frames = this.data.frames;
      for (i in frames) {
        if (!hasProp$5.call(frames, i)) continue;
        for (j = k = 0; k <= 4; j = ++k) {
          if (frames[i][j] == null) {
            frames[i][j] = ((ref = frames[i - 1]) != null ? ref[j] : void 0) != null ? frames[i - 1][j] : 0;
          }
        }
        x = frames[i][0];
        y = frames[i][1];
        w = frames[i][2];
        h = frames[i][3];
        frameIndex = frames[i][4];
        this.frameImages[i] = clipImage(this.images[frameIndex], x, y, w, h);
        if (this.height === 0) {
          this.height = h;
        }
      }
      this.ready = true;
      return this.trigger('loaded');
    }

    getFrameImage(key, index = 0) {
      var animation;
      if (!this.ready) {
        return null;
      }
      animation = this.data.animations[key];
      if (animation == null) {
        return null;
      }
      return this.frameImages[animation.frames[index]];
    }

    measureTextWidth(text) {
      var char, k, len, width;
      width = 0;
      for (k = 0, len = text.length; k < len; k++) {
        char = text[k];
        width += this.getFrameImage(char).width;
      }
      return width;
    }

  }

  //----------------------------------------------------------------------
  // Private members
  //----------------------------------------------------------------------
  canvas = document.createElement('canvas');

  context = canvas.getContext('2d');

  clipImage = function(image, x, y, w, h) {
    var newImage;
    canvas.width = w;
    canvas.height = h;
    context.drawImage(image, x, y, w, h, 0, 0, w, h);
    newImage = new Image();
    newImage.src = canvas.toDataURL();
    return newImage;
  };

  return SpriteSheet;

})();

var SpriteSheet$1 = SpriteSheet;

// Pan and zoom the camera by the mouse
// Drag left mouse button to pan, wheel up/down to zoom in/out
var MouseControl;

MouseControl = (function() {
  var scaleAnimation, translateAnimation;

  class MouseControl {
    constructor(camera, dom) {
      this.onMouseMove = this.onMouseMove.bind(this);
      this.onMouseWheel = this.onMouseWheel.bind(this);
      this.camera = camera;
      this.zoomScaleAnim = scaleAnimation.applyTo(this.camera);
      this.zoomTransAnim = translateAnimation.applyTo(this.camera);
      this.smoothZooming = true;
      this.desScale = new Vector$1(1, 1);
      dom.addEventListener('mousemove', this.onMouseMove);
      dom.addEventListener('mousewheel', this.onMouseWheel);
    }

    onMouseMove(e) {
      var dx, dy, scale;
      if (e.buttons === Bu.MOUSE.LEFT) {
        scale = this.camera.scale.x;
        dx = -e.movementX * scale;
        dy = -e.movementY * scale;
        return this.camera.translate(dx, dy);
      }
    }

    onMouseWheel(e) {
      var deltaScaleAll, deltaScaleStep, dx, dy, mx, my, targetStyle;
      deltaScaleStep = Math.pow(1.25, -e.wheelDelta / 120);
      this.desScale.multiplyScalar(deltaScaleStep);
      deltaScaleAll = this.desScale.x / this.camera.scale.x;
      targetStyle = getComputedStyle(e.target);
      mx = e.offsetX - parseFloat(targetStyle.width) / 2;
      my = e.offsetY - parseFloat(targetStyle.height) / 2;
      dx = -mx * (deltaScaleAll - 1) * this.camera.scale.x;
      dy = -my * (deltaScaleAll - 1) * this.camera.scale.y;
      if (this.smoothZooming) {
        this.zoomScaleAnim.from.copy(this.camera.scale);
        this.zoomScaleAnim.to.copy(this.desScale);
        this.zoomScaleAnim.restart();
        this.zoomTransAnim.from.copy(this.camera.position);
        this.zoomTransAnim.to.set(this.camera.position.x + dx, this.camera.position.y + dy);
        return this.zoomTransAnim.restart();
      } else {
        this.camera.translate(dx, dy);
        return this.camera.scale.copy(this.desScale);
      }
    }

  }

  scaleAnimation = new Animation$1({
    duration: 0.2,
    init: function(anim) {
      if (anim.arg == null) {
        anim.arg = 1;
      }
      anim.from = this.scale.clone();
      return anim.to = this.scale.clone().multiplyScalar(parseFloat(anim.arg));
    },
    update: function(anim) {
      return this.scale = anim.current;
    }
  });

  translateAnimation = new Animation$1({
    duration: 0.2,
    init: function(anim) {
      if (anim.arg == null) {
        anim.arg = new Vector$1;
      }
      anim.from = this.position.clone();
      return anim.to = this.position.clone().add(anim.arg);
    },
    update: function(anim) {
      return this.position.copy(anim.current);
    }
  });

  return MouseControl;

})();

var MouseControl$1 = MouseControl;

// Geometry Algorithm Collection
var G;
var geometryAlgorithm;
var indexOf = [].indexOf;
var hasProp$6 = {}.hasOwnProperty;

geometryAlgorithm = G = {
  inject: function() {
    return this.injectInto(['point', 'line', 'circle', 'ellipse', 'triangle', 'rectangle', 'fan', 'bow', 'polygon', 'polyline']);
  },
  injectInto: function(shapes) {
    if (Bu.isString(shapes)) {
      shapes = [shapes];
    }
    if (indexOf.call(shapes, 'point') >= 0) {
      Point$1.prototype.inCircle = function(circle) {
        return G.pointInCircle(this, circle);
      };
      Point$1.prototype.distanceTo = function(point) {
        return G.distanceFromPointToPoint(this, point);
      };
      Point$1.prototype.isNear = function(target, limit = Bu.DEFAULT_NEAR_DIST) {
        switch (target.type) {
          case 'Point':
            return G.pointNearPoint(this, target, limit);
          case 'Line':
            return G.pointNearLine(this, target, limit);
          case 'Polyline':
            return G.pointNearPolyline(this, target, limit);
        }
      };
      Point$1.interpolate = G.interpolateBetweenTwoPoints;
    }
    if (indexOf.call(shapes, 'line') >= 0) {
      Line$1.prototype.distanceTo = function(point) {
        return G.distanceFromPointToLine(point, this);
      };
      Line$1.prototype.isTwoPointsSameSide = function(p1, p2) {
        return G.twoPointsSameSideOfLine(p1, p2, this);
      };
      Line$1.prototype.footPointFrom = function(point, saveTo) {
        return G.footPointFromPointToLine(point, this, saveTo);
      };
      Line$1.prototype.getCrossPointWith = function(line) {
        return G.getCrossPointOfTwoLines(line, this);
      };
      Line$1.prototype.isCrossWithLine = function(line) {
        return G.isTwoLinesCross(line, this);
      };
      Rectangle$1.prototype.intersectRect = function(rect) {
        return G.isLineIntersectRect(this, rect);
      };
    }
    if (indexOf.call(shapes, 'circle') >= 0) {
      Circle$1.prototype._containsPoint = function(point) {
        return G.pointInCircle(point, this);
      };
    }
    if (indexOf.call(shapes, 'ellipse') >= 0) {
      Ellipse$1.prototype._containsPoint = function(point) {
        return G.pointInEllipse(point, this);
      };
    }
    if (indexOf.call(shapes, 'triangle') >= 0) {
      Triangle$1.prototype._containsPoint = function(point) {
        return G.pointInTriangle(point, this);
      };
      Triangle$1.prototype.area = function() {
        return G.calcTriangleArea(this);
      };
    }
    if (indexOf.call(shapes, 'rectangle') >= 0) {
      Rectangle$1.prototype.containsPoint = function(point) {
        return G.pointInRectangle(point, this);
      };
      Rectangle$1.prototype.intersectLine = function(line) {
        return G.isLineIntersectRect(line, this);
      };
    }
    if (indexOf.call(shapes, 'fan') >= 0) {
      Fan$1.prototype._containsPoint = function(point) {
        return G.pointInFan(point, this);
      };
    }
    if (indexOf.call(shapes, 'bow') >= 0) {
      Bow$1.prototype._containsPoint = function(point) {
        return G.pointInBow(point, this);
      };
    }
    if (indexOf.call(shapes, 'polygon') >= 0) {
      Polygon$1.prototype._containsPoint = function(point) {
        return G.pointInPolygon(point, this);
      };
    }
    if (indexOf.call(shapes, 'polyline') >= 0) {
      Polyline$1.prototype.length = 0;
      Polyline$1.prototype.pointNormalizedPos = [];
      Polyline$1.prototype.calcLength = function() {
        return this.length = G.calcPolylineLength(this);
      };
      Polyline$1.prototype.calcPointNormalizedPos = function() {
        return G.calcNormalizedVerticesPosOfPolyline(this);
      };
      Polyline$1.prototype.getNormalizedPos = function(index) {
        if (index != null) {
          return this.pointNormalizedPos[index];
        } else {
          return this.pointNormalizedPos;
        }
      };
      return Polyline$1.prototype.compress = function(strength = 0.8) {
        return G.compressPolyline(this, strength);
      };
    }
  },
  // Point in shapes
  pointNearPoint: function(point, target, limit = Bu.DEFAULT_NEAR_DIST) {
    return point.distanceTo(target) < limit;
  },
  pointNearLine: function(point, line, limit = Bu.DEFAULT_NEAR_DIST) {
    var footPoint, isBetween1, isBetween2, verticalDist;
    verticalDist = line.distanceTo(point);
    footPoint = line.footPointFrom(point);
    isBetween1 = footPoint.distanceTo(line.points[0]) < line.length + limit;
    isBetween2 = footPoint.distanceTo(line.points[1]) < line.length + limit;
    return verticalDist < limit && isBetween1 && isBetween2;
  },
  pointNearPolyline: function(point, polyline, limit = Bu.DEFAULT_NEAR_DIST) {
    var j, len1, line, ref;
    ref = polyline.lines;
    for (j = 0, len1 = ref.length; j < len1; j++) {
      line = ref[j];
      if (G.pointNearLine(point, line, limit)) {
        return true;
      }
    }
    return false;
  },
  pointInCircle: function(point, circle) {
    var dx, dy;
    dx = point.x - circle.cx;
    dy = point.y - circle.cy;
    return Bu.bevel(dx, dy) < circle.radius;
  },
  pointInEllipse: function(point, ellipse) {
    return Bu.bevel(point.x / ellipse.radiusX, point.y / ellipse.radiusY) < 1;
  },
  pointInRectangle: function(point, rectangle) {
    return point.x > rectangle.pointLT.x && point.y > rectangle.pointLT.y && point.x < rectangle.pointLT.x + rectangle.size.width && point.y < rectangle.pointLT.y + rectangle.size.height;
  },
  pointInTriangle: function(point, triangle) {
    return G.twoPointsSameSideOfLine(point, triangle.points[2], triangle.lines[0]) && G.twoPointsSameSideOfLine(point, triangle.points[0], triangle.lines[1]) && G.twoPointsSameSideOfLine(point, triangle.points[1], triangle.lines[2]);
  },
  pointInFan: function(point, fan) {
    var a, dx, dy;
    dx = point.x - fan.cx;
    dy = point.y - fan.cy;
    a = Math.atan2(point.y - fan.cy, point.x - fan.cx);
    while (a < fan.aFrom) {
      a += Bu.TWO_PI;
    }
    return Bu.bevel(dx, dy) < fan.radius && a > fan.aFrom && a < fan.aTo;
  },
  pointInBow: function(point, bow) {
    var sameSide, smallThanHalfCircle;
    if (Bu.bevel(bow.cx - point.x, bow.cy - point.y) < bow.radius) {
      sameSide = bow.string.isTwoPointsSameSide(bow.center, point);
      smallThanHalfCircle = bow.aTo - bow.aFrom < Math.PI;
      return sameSide ^ smallThanHalfCircle;
    } else {
      return false;
    }
  },
  pointInPolygon: function(point, polygon) {
    var j, len1, ref, triangle;
    ref = polygon.triangles;
    for (j = 0, len1 = ref.length; j < len1; j++) {
      triangle = ref[j];
      if (triangle.containsPoint(point)) {
        return true;
      }
    }
    return false;
  },
  // Distance
  distanceFromPointToPoint: function(point1, point2) {
    return Bu.bevel(point1.x - point2.x, point1.y - point2.y);
  },
  distanceFromPointToLine: function(point, line) {
    var a, b, p1, p2;
    p1 = line.points[0];
    p2 = line.points[1];
    a = (p1.y - p2.y) / (p1.x - p2.x);
    b = p1.y - a * p1.x;
    return Math.abs(a * point.x + b - point.y) / Math.sqrt(a * a + 1);
  },
  // Point Related
  interpolateBetweenTwoPoints: function(p1, p2, k, p3) {
    var x, y;
    x = p1.x + (p2.x - p1.x) * k;
    y = p1.y + (p2.y - p1.y) * k;
    if (p3 != null) {
      return p3.set(x, y);
    } else {
      return new Point$1(x, y);
    }
  },
  // Point with Line
  twoPointsSameSideOfLine: function(p1, p2, line) {
    var pA, pB, y01, y02;
    pA = line.points[0];
    pB = line.points[1];
    if (pA.x === pB.x) {
      // if both of the two points are on the line then we consider they are in the same side
      return (p1.x - pA.x) * (p2.x - pA.x) > 0;
    } else {
      y01 = (pA.y - pB.y) * (p1.x - pA.x) / (pA.x - pB.x) + pA.y;
      y02 = (pA.y - pB.y) * (p2.x - pA.x) / (pA.x - pB.x) + pA.y;
      return (p1.y - y01) * (p2.y - y02) > 0;
    }
  },
  footPointFromPointToLine: function(point, line, saveTo = new Point$1) {
    var A, B, m, p1, p2, x, y;
    p1 = line.points[0];
    p2 = line.points[1];
    A = (p1.y - p2.y) / (p1.x - p2.x);
    B = p1.y - A * p1.x;
    m = point.x + A * point.y;
    x = (m - A * B) / (A * A + 1);
    y = A * x + B;
    saveTo.set(x, y);
    return saveTo;
  },
  getCrossPointOfTwoLines: function(line1, line2) {
    var a1, a2, b1, b2, c1, c2, det, p1, p2, q1, q2;
    [p1, p2] = line1.points;
    [q1, q2] = line2.points;
    a1 = p2.y - p1.y;
    b1 = p1.x - p2.x;
    c1 = (a1 * p1.x) + (b1 * p1.y);
    a2 = q2.y - q1.y;
    b2 = q1.x - q2.x;
    c2 = (a2 * q1.x) + (b2 * q1.y);
    det = (a1 * b2) - (a2 * b1);
    return new Point$1(((b2 * c1) - (b1 * c2)) / det, ((a1 * c2) - (a2 * c1)) / det);
  },
  isTwoLinesCross: function(line1, line2) {
    var d, x0, x1, x2, x3, x4, y0, y1, y2, y3, y4;
    x1 = line1.points[0].x;
    y1 = line1.points[0].y;
    x2 = line1.points[1].x;
    y2 = line1.points[1].y;
    x3 = line2.points[0].x;
    y3 = line2.points[0].y;
    x4 = line2.points[1].x;
    y4 = line2.points[1].y;
    d = (y2 - y1) * (x4 - x3) - (y4 - y3) * (x2 - x1);
    if (d === 0) {
      return false;
    } else {
      x0 = ((x2 - x1) * (x4 - x3) * (y3 - y1) + (y2 - y1) * (x4 - x3) * x1 - (y4 - y3) * (x2 - x1) * x3) / d;
      y0 = ((y2 - y1) * (y4 - y3) * (x3 - x1) + (x2 - x1) * (y4 - y3) * y1 - (x4 - x3) * (y2 - y1) * y3) / -d;
    }
    return (x0 - x1) * (x0 - x2) <= 0 && (x0 - x3) * (x0 - x4) <= 0 && (y0 - y1) * (y0 - y2) <= 0 && (y0 - y3) * (y0 - y4) <= 0;
  },
  // Line with rectangle
  isLineIntersectRect: function(line, rect) {
    var lines;
    lines = [new Line$1, new Line$1, new Line$1, new Line$1];
    lines[0].set(rect.points[0], rect.points[1]);
    lines[1].set(rect.points[1], rect.points[2]);
    lines[2].set(rect.points[2], rect.points[3]);
    lines[3].set(rect.points[3], rect.points[0]);
    // console.log line.points[0].x, line.points[0].y, rect.points[0].x, rect.points[0].y
    return G.isTwoLinesCross(line, lines[0]) || G.isTwoLinesCross(line, lines[1]) || G.isTwoLinesCross(line, lines[2]) || G.isTwoLinesCross(line, lines[3]);
  },
  // Polyline
  calcPolylineLength: function(polyline) {
    var i, j, len, ref;
    len = 0;
    if (polyline.vertices.length >= 2) {
      for (i = j = 1, ref = polyline.vertices.length; 1 <= ref ? j < ref : j > ref; i = 1 <= ref ? ++j : --j) {
        len += polyline.vertices[i].distanceTo(polyline.vertices[i - 1]);
      }
    }
    return len;
  },
  calcNormalizedVerticesPosOfPolyline: function(polyline) {
    var currPos, i, j, ref, results;
    currPos = 0;
    polyline.pointNormalizedPos[0] = 0;
    results = [];
    for (i = j = 1, ref = polyline.vertices.length; 1 <= ref ? j < ref : j > ref; i = 1 <= ref ? ++j : --j) {
      currPos += polyline.vertices[i].distanceTo(polyline.vertices[i - 1]) / polyline.length;
      results.push(polyline.pointNormalizedPos[i] = currPos);
    }
    return results;
  },
  compressPolyline: function(polyline, strength) {
    var compressed, i, obliqueAngle, pA, pB, pM, ref;
    compressed = [];
    ref = polyline.vertices;
    for (i in ref) {
      if (!hasProp$6.call(ref, i)) continue;
      if (i < 2) {
        compressed[i] = polyline.vertices[i];
      } else {
        [pA, pM] = compressed.slice(-2);
        pB = polyline.vertices[i];
        obliqueAngle = Math.abs(Math.atan2(pA.y - pM.y, pA.x - pM.x) - Math.atan2(pM.y - pB.y, pM.x - pB.x));
        if (obliqueAngle < strength * strength * Bu.HALF_PI) {
          compressed[compressed.length - 1] = pB;
        } else {
          compressed.push(pB);
        }
      }
    }
    polyline.vertices = compressed;
    polyline.keyPoints = polyline.vertices;
    return polyline;
  },
  // Area Calculation
  calcTriangleArea: function(triangle) {
    var a, b, c;
    [a, b, c] = triangle.points;
    return Math.abs(((b.x - a.x) * (c.y - a.y)) - ((c.x - a.x) * (b.y - a.y))) / 2;
  }
};

G.inject();

var geometryAlgorithm$1 = geometryAlgorithm;

// Used to generate random shapes
var ShapeRandomizer;

ShapeRandomizer = (function() {
  var MARGIN;

  class ShapeRandomizer {
    constructor() {}

    randomX() {
      return Bu.rand(this.rangeX + MARGIN, this.rangeX + this.rangeWidth - MARGIN * 2);
    }

    randomY() {
      return Bu.rand(this.rangeY + MARGIN, this.rangeY + this.rangeHeight - MARGIN * 2);
    }

    randomRadius() {
      return Bu.rand(10, Math.min(this.rangeX + this.rangeWidth, this.rangeY + this.rangeHeight) / 2);
    }

    setRange(a, b, c, d) {
      if (c != null) {
        this.rangeX = a;
        this.rangeY = b;
        this.rangeWidth = c;
        this.rangeHeight = d;
      } else {
        this.rangeWidth = a;
        this.rangeHeight = b;
      }
      return this;
    }

    generate(type) {
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
    }

    randomize(shape) {
      var j, len, s;
      if (Bu.isArray(shape)) {
        for (j = 0, len = shape.length; j < len; j++) {
          s = shape[j];
          this.randomize(s);
        }
      } else {
        switch (shape.type) {
          case 'Circle':
            this.randomizeCircle(shape);
            break;
          case 'Ellipse':
            this.randomizeEllipse(shape);
            break;
          case 'Bow':
            this.randomizeBow(shape);
            break;
          case 'Triangle':
            this.randomizeTriangle(shape);
            break;
          case 'Rectangle':
            this.randomizeRectangle(shape);
            break;
          case 'Fan':
            this.randomizeFan(shape);
            break;
          case 'Polygon':
            this.randomizePolygon(shape);
            break;
          case 'Line':
            this.randomizeLine(shape);
            break;
          case 'Polyline':
            this.randomizePolyline(shape);
            break;
          default:
            console.warn('not support shape: ' + shape.type);
        }
      }
      return this;
    }

    randomizePosition(shape) {
      shape.position.x = this.randomX();
      shape.position.y = this.randomY();
      shape.trigger('changed');
      return this;
    }

    generateCircle() {
      var circle;
      circle = new Circle$1(this.randomRadius(), this.randomX(), this.randomY());
      circle.center.label = 'O';
      return circle;
    }

    randomizeCircle(circle) {
      circle.cx = this.randomX();
      circle.cy = this.randomY();
      circle.radius = this.randomRadius();
      return this;
    }

    generateEllipse() {
      var ellipse;
      ellipse = new Ellipse$1(this.randomRadius(), this.randomRadius());
      this.randomizePosition(ellipse);
      return ellipse;
    }

    randomizeEllipse(ellipse) {
      ellipse.radiusX = this.randomRadius();
      ellipse.radiusY = this.randomRadius();
      this.randomizePosition(ellipse);
      return this;
    }

    generateBow() {
      var aFrom, aTo, bow;
      aFrom = Bu.rand(Bu.TWO_PI);
      aTo = aFrom + Bu.rand(Bu.HALF_PI, Bu.TWO_PI);
      bow = new Bow$1(this.randomX(), this.randomY(), this.randomRadius(), aFrom, aTo);
      bow.string.points[0].label = 'A';
      bow.string.points[1].label = 'B';
      return bow;
    }

    randomizeBow(bow) {
      var aFrom, aTo;
      aFrom = Bu.rand(Bu.TWO_PI);
      aTo = aFrom + Bu.rand(Bu.HALF_PI, Bu.TWO_PI);
      bow.cx = this.randomX();
      bow.cy = this.randomY();
      bow.radius = this.randomRadius();
      bow.aFrom = aFrom;
      bow.aTo = aTo;
      bow.trigger('changed');
      return this;
    }

    generateFan() {
      var aFrom, aTo, fan;
      aFrom = Bu.rand(Bu.TWO_PI);
      aTo = aFrom + Bu.rand(Bu.HALF_PI, Bu.TWO_PI);
      fan = new Fan$1(this.randomX(), this.randomY(), this.randomRadius(), aFrom, aTo);
      fan.center.label = 'O';
      fan.string.points[0].label = 'A';
      fan.string.points[1].label = 'B';
      return fan;
    }

    generateTriangle() {
      var i, j, points, triangle;
      points = [];
      for (i = j = 0; j <= 2; i = ++j) {
        points[i] = new Point$1(this.randomX(), this.randomY());
      }
      triangle = new Triangle$1(points[0], points[1], points[2]);
      triangle.points[0].label = 'A';
      triangle.points[1].label = 'B';
      triangle.points[2].label = 'C';
      return triangle;
    }

    randomizeTriangle(triangle) {
      var i, j;
      for (i = j = 0; j <= 2; i = ++j) {
        triangle.points[i].set(this.randomX(), this.randomY());
      }
      triangle.trigger('changed');
      return this;
    }

    generateRectangle() {
      var rect;
      rect = new Rectangle$1(Bu.rand(this.rangeX + this.rangeWidth), Bu.rand(this.rangeY + this.rangeHeight), Bu.rand(this.rangeWidth / 2), Bu.rand(this.rangeHeight / 2));
      rect.pointLT.label = 'A';
      rect.pointRT.label = 'B';
      rect.pointRB.label = 'C';
      rect.pointLB.label = 'D';
      return rect;
    }

    randomizeRectangle(rectangle) {
      rectangle.set(this.randomX(), this.randomY(), this.randomRadius(), this.randomRadius());
      rectangle.trigger('changed');
      return this;
    }

    generatePolygon() {
      var i, j, point, points;
      points = [];
      for (i = j = 0; j <= 3; i = ++j) {
        point = new Point$1(this.randomX(), this.randomY());
        point.label = 'P' + i;
        points.push(point);
      }
      return new Polygon$1(points);
    }

    randomizePolygon(polygon) {
      var j, len, ref, vertex;
      ref = polygon.vertices;
      for (j = 0, len = ref.length; j < len; j++) {
        vertex = ref[j];
        vertex.set(this.randomX(), this.randomY());
      }
      polygon.trigger('changed');
      return this;
    }

    generateLine() {
      var line;
      line = new Line$1(this.randomX(), this.randomY(), this.randomX(), this.randomY());
      line.points[0].label = 'A';
      line.points[1].label = 'B';
      return line;
    }

    randomizeLine(line) {
      var j, len, point, ref;
      ref = line.points;
      for (j = 0, len = ref.length; j < len; j++) {
        point = ref[j];
        point.set(this.randomX(), this.randomY());
      }
      line.trigger('changed');
      return this;
    }

    generatePolyline() {
      var i, j, point, polyline;
      polyline = new Polyline$1;
      for (i = j = 0; j <= 3; i = ++j) {
        point = new Point$1(this.randomX(), this.randomY());
        point.label = 'P' + i;
        polyline.addPoint(point);
      }
      return polyline;
    }

    randomizePolyline(polyline) {
      var j, len, ref, vertex;
      ref = polyline.vertices;
      for (j = 0, len = ref.length; j < len; j++) {
        vertex = ref[j];
        vertex.set(this.randomX(), this.randomY());
      }
      polyline.trigger('changed');
      return this;
    }

  }

  MARGIN = 30;

  ShapeRandomizer.prototype.rangeX = 0;

  ShapeRandomizer.prototype.rangeY = 0;

  ShapeRandomizer.prototype.rangeWidth = 800;

  ShapeRandomizer.prototype.rangeHeight = 450;

  ShapeRandomizer.prototype.randomizeFan = ShapeRandomizer.prototype.randomizeBow;

  return ShapeRandomizer;

})();

var ShapeRandomizer$1 = ShapeRandomizer;

Bu$3.Bounds = Bounds$1;

Bu$3.Color = Color$1;

Bu$3.Size = Size$1;

Bu$3.Vector = Vector$1;

Bu$3.Event = Event$1;

Bu$3.Object2D = Object2D$1;

Bu$3.Styled = Styled$1;

Bu$3.App = App$1;

Bu$3.Audio = Audio$1;

Bu$3.Camera = Camera$1;

Bu$3.Renderer = Renderer$1;

Bu$3.Scene = Scene$1;

Bu$3.Bow = Bow$1;

Bu$3.Circle = Circle$1;

Bu$3.Ellipse = Ellipse$1;

Bu$3.Fan = Fan$1;

Bu$3.Line = Line$1;

Bu$3.Point = Point$1;

Bu$3.Polygon = Polygon$1;

Bu$3.Polyline = Polyline$1;

Bu$3.Rectangle = Rectangle$1;

Bu$3.Spline = Spline$1;

Bu$3.Triangle = Triangle$1;

Bu$3.Image = Image$2;

Bu$3.PointText = PointText$1;

Bu$3.Animation = Animation$1;

Bu$3.AnimationRunner = AnimationRunner$1;

Bu$3.AnimationTask = AnimationTask$1;

Bu$3.DashFlowManager = DashFlowManager$1;

Bu$3.SpriteSheet = SpriteSheet$1;

Bu$3.InputManager = InputManager$1;

Bu$3.MouseControl = MouseControl$1;

Bu$3.geometryAlgorithm = geometryAlgorithm$1;

Bu$3.ShapeRandomizer = ShapeRandomizer$1;

return Bu$3;

}());
//# sourceMappingURL=bu.js.map
