# bu.js

A HTML5 Canvas graphics library

[![Bu.js Logo](logo.png)](http://jarvisniu.com/bu.js/examples/)

[Demos](http://jarvisniu.com/bu.js/examples/) -
[Guides](https://github.com/jarvisniu/bu.js/wiki/Guides) -
[API](https://github.com/jarvisniu/bu.js/wiki/API) -
[ChangeLog](CHANGELOG.md) -
[Download](https://cdn.rawgit.com/jarvisniu/bu.js/v0.4.0/build/bu.min.js)

## Hello World

``` html
<!DOCTYPE html>
<html>
<body>
  <script src="https://cdn.rawgit.com/jarvisniu/bu.js/v0.4.0/build/bu.min.js"></script>
  <script type="text/javascript">
    var bu = new Bu({
      objects: {
        sun: new Bu.Circle(40).fill("#F40").stroke("#820"),
        earth: new Bu.Circle(20).fill("#06F").stroke("#038"),
        moon: new Bu.Circle(10).fill("#FF0").stroke("#880"),
      },
      scene: {
        sun: {
          earth: {
            moon: {}
          }
        }
      },
      update: function () {
        this.sun.rotation += 0.02
        this.earth.rotation += 0.1
      },
    })
  </script>
</body>
</html>
```

## Features

- Object-oriented and modularization design
- Easy-to-use API
- Rich geometry shapes and algorithms
- High-definition screen supported

## How to Build

1. Download or clone this project;
2. Install [Node](https://nodejs.org/) if has't;
3. Install the dependencies: `npm install` or `yarn`;
4. Build the library: `npm run build`;
5. Open the examples at `examples/index.html`.

## Code Layout

- `build/` - Built library file: `bu.js` and `bu.min.js`
- `examples/` - Examples using this lib
  - `js/` - 3rd lib
  - `lib/` - Extension of this lib used in the examples
  - `assets/` - Asset files used in the examples
  - `index.html` - Homepage of examples
- `src/` - Source code of this lib
  - `core/` - Core components
  - `math/` - Math related stuff like vector and matrix
  - `shapes/` - Shape representation and geometry computation algorithm
  - `drawable/` - Other thing like Image, Text etc. that can be displayed on the screen
  - `anim/` - Animation system
  - `extra/` - Utils components
  - `input/` - Deal with the mouse and keyboard inputs

## License

MIT
