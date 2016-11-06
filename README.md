Bu.js
=====

A JavaScript 2D graphics library based on HTML5 Canvas

[![](logo.png)](http://jarvisniu.com/Bu.js/examples/)

[Demos](http://jarvisniu.com/Bu.js/examples/) -
[Guides](https://github.com/jarvisniu/Bu.js/wiki/Guides) -
[API](https://github.com/jarvisniu/Bu.js/wiki/API) -
[ChangeLog](CHANGELOG.md) - 
[Download](https://cdn.rawgit.com/jarvisniu/Bu.js/v0.3.4/build/bu.min.js)


## Features

- Easy-to-use API
- Include rich geometry shapes and algorithms
- High-definition screen supported
- Modularization design made it easy to customise and extend


## How to use

1. Install [Node](https://nodejs.org/)
2. Install [Gulp](http://gulpjs.com/): `npm install -g gulp`
3. Install the dependencies: `npm install`
4. Build the lib and run the examples: `gulp run`


## Code Layout

- `build/` - Built library file: `bu.js` and `bu.min.js`
- `examples/` - Examples using this lib
    - `js/` - 3rd lib
    - `lib/` - Extension of this lib used in the examples
    - `assets/` - Asset files used in the examples
    - `index.html` - Entry file of examples
- `src/` - Source code of this lib
    - `core/` - Core components
    - `math/` - Math related stuff like vector and matrix
    - `shapes/` - Shape representation and geometry computation algorithm
    - `drawable/` - Other thing like Image, Text etc. that can be displayed on the screen
    - `anim/` - Animation system
    - `extra/` - Utils components


## Credits

- **Three.js** for inspirations and API style
- **CoffeeScript** for providing an elegant way to write JavaScript
- **Gulp** for handy building


## License

MIT
